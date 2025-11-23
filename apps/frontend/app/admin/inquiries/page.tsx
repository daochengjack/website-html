'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Button, 
  Table, 
  Badge, 
  Modal, 
  Textarea,
  LoadingSpinner,
  Select 
} from '@repo/ui';
import { inquiriesApi } from '../../lib/api';

type Inquiry = {
  id: string;
  refNumber: string;
  status: {
    id: string;
    slug: string;
    name: string;
    color?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  subject: string;
  initialMessage: string;
  priority: number;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  product?: {
    id: string;
    sku: string;
    translations: Array<{
      name: string;
      locale: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
};

type InquiryStatus = {
  id: string;
  slug: string;
  name: string;
  color?: string;
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statuses, setStatuses] = useState<InquiryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInquiries();
    loadStatuses();
  }, [filters]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiriesApi.findAll(filters);
      setInquiries(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    // This would typically come from an API endpoint
    // For now, using hardcoded statuses based on the schema
    setStatuses([
      { id: '1', slug: 'new', name: 'New', color: 'blue' },
      { id: '2', slug: 'acknowledged', name: 'Acknowledged', color: 'yellow' },
      { id: '3', slug: 'resolved', name: 'Resolved', color: 'green' },
      { id: '4', slug: 'spam', name: 'Spam', color: 'red' },
    ]);
  };

  const handleViewDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailModalOpen(true);
  };

  const handleChangeStatus = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status.slug);
    setIsStatusModalOpen(true);
  };

  const handleAddNote = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setInternalNote('');
    setIsNoteModalOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedInquiry) return;
    
    try {
      await inquiriesApi.updateStatus(selectedInquiry.id, { statusId: newStatus });
      setIsStatusModalOpen(false);
      loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleNoteSubmit = async () => {
    if (!selectedInquiry || !internalNote.trim()) return;
    
    try {
      await inquiriesApi.addMessage(selectedInquiry.id, {
        message: internalNote,
        isInternal: true,
        senderName: 'Admin',
      });
      setIsNoteModalOpen(false);
      loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const handleMarkAsSpam = async (inquiry: Inquiry) => {
    if (!confirm('Mark this inquiry as spam?')) return;
    
    try {
      await inquiriesApi.markAsSpam(inquiry.id);
      loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as spam');
    }
  };

  const exportToCSV = () => {
    const headers = ['Ref #', 'Customer', 'Email', 'Subject', 'Status', 'Priority', 'Created'];
    const csvData = inquiries.map(inquiry => [
      inquiry.refNumber,
      inquiry.customerName,
      inquiry.customerEmail,
      inquiry.subject,
      inquiry.status.name,
      inquiry.priority,
      format(new Date(inquiry.createdAt), 'yyyy-MM-dd HH:mm'),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeVariant = (slug: string) => {
    switch (slug) {
      case 'new': return 'primary';
      case 'acknowledged': return 'warning';
      case 'resolved': return 'success';
      case 'spam': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: number) => {
    if (priority >= 3) return 'danger';
    if (priority >= 2) return 'warning';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={exportToCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: '', label: 'All Statuses' },
              ...statuses.map(status => ({ value: status.slug, label: status.name })),
            ]}
          />
          
          <Select
            label="Priority"
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            options={[
              { value: '', label: 'All Priorities' },
              { value: '3', label: 'High' },
              { value: '2', label: 'Medium' },
              { value: '1', label: 'Low' },
              { value: '0', label: 'Normal' },
            ]}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name, email, or subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <Table
        columns={[
          { key: 'refNumber', label: 'Ref #' },
          { key: 'customerName', label: 'Customer' },
          { key: 'customerEmail', label: 'Email' },
          { key: 'subject', label: 'Subject' },
          { key: 'status', label: 'Status', render: (status: InquiryStatus) => (
            <Badge variant={getStatusBadgeVariant(status.slug)}>
              {status.name}
            </Badge>
          )},
          { key: 'priority', label: 'Priority', render: (priority: number) => (
            <Badge variant={getPriorityBadgeVariant(priority)}>
              {priority === 3 ? 'High' : priority === 2 ? 'Medium' : priority === 1 ? 'Low' : 'Normal'}
            </Badge>
          )},
          { key: 'createdAt', label: 'Created', render: (date: string) => format(new Date(date), 'MMM dd, yyyy HH:mm') },
          { key: 'actions', label: 'Actions', render: (_, inquiry: Inquiry) => (
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleViewDetail(inquiry)}>View</Button>
              <Button size="sm" variant="secondary" onClick={() => handleChangeStatus(inquiry)}>
                Change Status
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleAddNote(inquiry)}>
                Add Note
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleMarkAsSpam(inquiry)}>
                Spam
              </Button>
            </div>
          )},
        ]}
        data={inquiries}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Inquiry ${selectedInquiry?.refNumber}`}
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="text-gray-900">{selectedInquiry.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedInquiry.customerEmail}</p>
              </div>
              {selectedInquiry.customerPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedInquiry.customerPhone}</p>
                </div>
              )}
              {selectedInquiry.companyName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="text-gray-900">{selectedInquiry.companyName}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <p className="text-gray-900">{selectedInquiry.subject}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <div className="bg-gray-50 p-3 rounded-md text-gray-900 whitespace-pre-wrap">
                {selectedInquiry.initialMessage}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsDetailModalOpen(false);
                handleChangeStatus(selectedInquiry);
              }}>
                Change Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Change Status"
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={statuses.map(status => ({ value: status.slug, label: status.name }))}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusSubmit}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Add Internal Note"
      >
        <div className="space-y-4">
          <Textarea
            label="Note"
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={4}
            placeholder="Enter internal note..."
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNoteSubmit} disabled={!internalNote.trim()}>
              Add Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
