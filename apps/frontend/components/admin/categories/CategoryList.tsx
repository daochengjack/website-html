'use client';

import { useState } from 'react';
import { Category, deleteCategory } from '../../../lib/admin/categories-api';
import { useToast } from '../../../contexts/toast/ToastContext';
import { CategoryTreeItem } from './CategoryTreeItem';

interface CategoryListProps {
  categories: Category[];
  onRefresh: () => void;
}

export function CategoryList({ categories, onRefresh }: CategoryListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategory(id);
      addToast('Category deleted successfully', 'success');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      addToast(message, 'error');
    }
  };

  const rootCategories = categories.filter((cat) => !cat.parentId);

  if (rootCategories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No categories yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <ul className="divide-y">
        {rootCategories.map((category) => (
          <CategoryTreeItem
            key={category.id}
            category={category}
            isExpanded={expandedIds.has(category.id)}
            onToggleExpand={toggleExpanded}
            onDelete={handleDelete}
            onRefresh={onRefresh}
            level={0}
          />
        ))}
      </ul>
    </div>
  );
}
