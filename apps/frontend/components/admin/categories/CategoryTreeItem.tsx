'use client';

import { useState } from 'react';
import { Category } from '../../../lib/admin/categories-api';
import { EditCategoryModal } from './EditCategoryModal';

interface CategoryTreeItemProps {
  category: Category;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  level: number;
}

export function CategoryTreeItem({
  category,
  isExpanded,
  onToggleExpand,
  onDelete,
  onRefresh,
  level,
}: CategoryTreeItemProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const name = category.translations[0]?.name || category.slug;

  return (
    <>
      <li>
        <div className="flex items-center px-6 py-4 gap-4">
          {hasChildren && (
            <button
              onClick={() => onToggleExpand(category.id)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="w-6"></span>}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-mono">{category.slug}</span>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              {!category.isPublished && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Draft</span>
              )}
            </div>
            {category.translations.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">{category.translations.length} languages</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <ul className="border-l-2 border-gray-200">
            {category.children!.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                isExpanded={false}
                onToggleExpand={onToggleExpand}
                onDelete={onDelete}
                onRefresh={onRefresh}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>

      {showEditModal && (
        <EditCategoryModal
          category={category}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
