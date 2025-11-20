'use client';

import { useState } from 'react';
import { updateTag, Tag, UpdateTagPayload } from '../../../lib/admin/tags-api';
import { useToast } from '../../../contexts/toast/ToastContext';

interface EditTagModalProps {
  tag: Tag;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTagModal({ tag, onClose, onSuccess }: EditTagModalProps) {
  const [loading, setLoading] = useState(false);
  const translation = tag.translations[0];
  const [formData, setFormData] = useState({
    slug: tag.slug,
    isPublished: tag.isPublished,
  });
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.slug.trim()) {
      setError('Slug is required');
      return;
    }

    try {
      setLoading(true);

      const payload: UpdateTagPayload = {
        slug: formData.slug.trim(),
        isPublished: formData.isPublished,
      };

      await updateTag(tag.id, payload);
      addToast('Tag updated successfully', 'success');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tag';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Tag</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Name (translations)</p>
              <div className="space-y-2">
                {tag.translations.map((trans) => (
                  <div key={trans.id} className="px-3 py-2 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600">{trans.locale.toUpperCase()}: {trans.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Published</span>
            </label>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
