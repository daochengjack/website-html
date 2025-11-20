'use client';

import { useState } from 'react';
import { Tag, deleteTag } from '../../../lib/admin/tags-api';
import { useToast } from '../../../contexts/toast/ToastContext';
import { EditTagModal } from './EditTagModal';

interface TagListProps {
  tags: Tag[];
  onRefresh: () => void;
}

export function TagList({ tags, onRefresh }: TagListProps) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    try {
      await deleteTag(id);
      addToast('Tag deleted successfully', 'success');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tag';
      addToast(message, 'error');
    }
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No tags yet. Create one to get started.</p>
      </div>
    );
  }

  const selectedTag = tags.find((t) => t.id === selectedTagId);

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Languages</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tags.map((tag) => {
              const translation = tag.translations[0];
              return (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{tag.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{translation?.name || 'Untitled'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tag.translations.length}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tag.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => setSelectedTagId(tag.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedTag && (
        <EditTagModal
          tag={selectedTag}
          onClose={() => setSelectedTagId(null)}
          onSuccess={() => {
            setSelectedTagId(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
