'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Button, 
  Table, 
  Badge, 
  Modal, 
  Input, 
  Select, 
  Textarea,
  LoadingSpinner 
} from '@repo/ui';
import { contentApi } from '../../../lib/api';
import { FileUpload } from '../../../components/FileUpload';
import { ApiError } from '../../../lib/api';

type Banner = {
  id: string;
  locale: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  position: number;
  isPublished: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};

const locales = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    locale: 'en',
    title: '',
    subtitle: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    linkText: '',
    position: 0,
    isPublished: true,
    startsAt: '',
    endsAt: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await contentApi.banners.findAll();
      setBanners(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      locale: 'en',
      title: '',
      subtitle: '',
      imageUrl: '',
      mobileImageUrl: '',
      linkUrl: '',
      linkText: '',
      position: 0,
      isPublished: true,
      startsAt: '',
      endsAt: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      locale: banner.locale,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      mobileImageUrl: banner.mobileImageUrl || '',
      linkUrl: banner.linkUrl || '',
      linkText: banner.linkText || '',
      position: banner.position,
      isPublished: banner.isPublished,
      startsAt: banner.startsAt ? format(new Date(banner.startsAt), "yyyy-MM-dd'T'HH:mm") : '',
      endsAt: banner.endsAt ? format(new Date(banner.endsAt), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
      };

      if (editingBanner) {
        await contentApi.banners.update(editingBanner.id, submitData);
      } else {
        await contentApi.banners.create(submitData);
      }
      
      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await contentApi.banners.remove(id);
      loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await contentApi.banners.publish(id);
      } else {
        await contentApi.banners.unpublish(id);
      }
      loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update banner status');
    }
  };

  const handleImageUpload = async (files: File[]) => {
    // For now, just set a placeholder URL
    // In a real implementation, you'd upload to a file storage service
    const file = files[0];
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleMobileImageUpload = async (files: File[]) => {
    const file = files[0];
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, mobileImageUrl: url }));
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
        <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
        <Button onClick={handleCreate}>Create Banner</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Table
        columns={[
          { key: 'locale', label: 'Locale' },
          { key: 'title', label: 'Title' },
          { key: 'imageUrl', label: 'Image', render: (url: string) => (
            <img src={url} alt="Banner" className="w-16 h-12 object-cover rounded" />
          )},
          { key: 'position', label: 'Position' },
          { key: 'isPublished', label: 'Status', render: (isPublished: boolean) => (
            <Badge variant={isPublished ? 'success' : 'secondary'}>
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
          )},
          { key: 'createdAt', label: 'Created', render: (date: string) => format(new Date(date), 'MMM dd, yyyy') },
          { key: 'actions', label: 'Actions', render: (_, banner: Banner) => (
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleEdit(banner)}>Edit</Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => handleTogglePublish(banner.id, !banner.isPublished)}
              >
                {banner.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(banner.id)}>Delete</Button>
            </div>
          )},
        ]}
        data={banners}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create Banner'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Locale"
            value={formData.locale}
            onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
            options={locales}
          />
          
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Banner title"
          />
          
          <Input
            label="Subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            placeholder="Banner subtitle"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
            <FileUpload
              accept="image/*"
              onUpload={handleImageUpload}
              className="mb-4"
            />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Banner preview" className="w-full h-32 object-cover rounded" />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Image (Optional)</label>
            <FileUpload
              accept="image/*"
              onUpload={handleMobileImageUpload}
              className="mb-4"
            />
            {formData.mobileImageUrl && (
              <img src={formData.mobileImageUrl} alt="Mobile banner preview" className="w-full h-32 object-cover rounded" />
            )}
          </div>
          
          <Input
            label="Link URL"
            value={formData.linkUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
            placeholder="https://example.com"
            type="url"
          />
          
          <Input
            label="Link Text"
            value={formData.linkText}
            onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
            placeholder="Learn More"
          />
          
          <Input
            label="Position"
            type="number"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
            min="0"
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
              Published
            </label>
          </div>
          
          <Input
            label="Start Date (Optional)"
            type="datetime-local"
            value={formData.startsAt}
            onChange={(e) => setFormData(prev => ({ ...prev, startsAt: e.target.value }))}
          />
          
          <Input
            label="End Date (Optional)"
            type="datetime-local"
            value={formData.endsAt}
            onChange={(e) => setFormData(prev => ({ ...prev, endsAt: e.target.value }))}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingBanner ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}