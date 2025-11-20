'use client';

import { useState } from 'react';
import { updateCategory, Category, UpdateCategoryDto } from '../../../lib/admin/categories-api';
import { useToast } from '../../../contexts/toast/ToastContext';

interface EditCategoryModalProps {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCategoryModal({
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const translation = category.translations[0];
  const [formData, setFormData] = useState({
    slug: category.slug,
    name: translation?.name || '',
    description: translation?.description || '',
    metaTitle: translation?.metaTitle || '',
    metaDescription: translation?.metaDescription || '',
    isPublished: category.isPublished,
    showInMenu: category.showInMenu,
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

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);

      const payload: UpdateCategoryDto = {
        slug: formData.slug.trim(),
        name: formData.name.trim(),
        description: formData.description || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        isPublished: formData.isPublished,
        showInMenu: formData.showInMenu,
        locale: translation?.locale || 'en',
      };

      await updateCategory(category.id, payload);
      addToast('Category updated successfully', 'success');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
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
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Category</h2>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showInMenu}
                  onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Show in Menu</span>
              </label>
            </div>

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
