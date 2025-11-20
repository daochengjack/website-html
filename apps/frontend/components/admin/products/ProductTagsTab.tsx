'use client';

import { useState, useEffect } from 'react';
import { Product, manageProductTags } from '../../../lib/admin/products-api';
import { getTags, Tag } from '../../../lib/admin/tags-api';
import { useToast } from '../../../contexts/toast/ToastContext';

interface ProductTagsTabProps {
  product: Product;
  onRefresh: () => void;
}

export function ProductTagsTab({ product, onRefresh }: ProductTagsTabProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    product.tagAssignments.map((t) => t.tag.id),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setAllTags(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tags';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTags = async () => {
    try {
      setSaving(true);
      await manageProductTags(product.id, { tagIds: selectedTagIds });
      addToast('Tags updated successfully', 'success');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tags';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading tags...</div>;
  }

  if (allTags.length === 0) {
    return <div className="text-center py-8 text-gray-600">No tags available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {allTags.map((tag) => {
          const tagName = tag.translations[0]?.name || tag.slug;
          return (
            <label key={tag.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{tagName}</p>
                <p className="text-xs text-gray-500">{tag.slug}</p>
              </div>
            </label>
          );
        })}
      </div>

      <button
        onClick={handleSaveTags}
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Tags'}
      </button>
    </div>
  );
}
