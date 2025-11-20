'use client';

import { useState } from 'react';
import { createCategory, Category, CreateCategoryPayload } from '../../../lib/admin/categories-api';
import { useToast } from '../../../contexts/toast/ToastContext';

interface CreateCategoryModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCategoryModal({
  categories,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    parentId: '',
    name: '',
    description: '',
    locale: 'en',
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
    showInMenu: true,
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

      const payload: CreateCategoryPayload = {
        slug: formData.slug.trim(),
        parentId: formData.parentId || undefined,
        name: formData.name.trim(),
        description: formData.description || undefined,
        locale: formData.locale,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        isPublished: formData.isPublished,
        showInMenu: formData.showInMenu,
      };

      await createCategory(payload);
      addToast('Category created successfully', 'success');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
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
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Category</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ceramics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (Root)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.translations[0]?.name || cat.slug}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ceramics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                placeholder="Category description"
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
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
