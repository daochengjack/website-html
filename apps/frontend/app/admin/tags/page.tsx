'use client';

import { useEffect, useState } from 'react';
import { getTags } from '../../../lib/admin/tags-api';
import { useToast } from '../../../contexts/toast/ToastContext';
import { TagList } from '../../../components/admin/tags/TagList';
import { CreateTagModal } from '../../../components/admin/tags/CreateTagModal';
import { Tag } from '../../../lib/admin/tags-api';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tags';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTagCreated = () => {
    setShowCreateModal(false);
    loadTags();
    addToast('Tag created successfully', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Tag
        </button>
      </div>

      <TagList tags={tags} onRefresh={loadTags} />

      {showCreateModal && (
        <CreateTagModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTagCreated}
        />
      )}
    </div>
  );
}
