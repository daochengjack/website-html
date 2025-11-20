'use client';

import { useState } from 'react';
import { Product } from '../../../lib/admin/products-api';

interface ProductGeneralTabProps {
  product: Product;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export function ProductGeneralTab({ product, onSave, saving }: ProductGeneralTabProps) {
  const [formData, setFormData] = useState({
    sku: product.sku,
    isFeatured: product.isFeatured,
    position: product.position,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.sku.trim()) {
      setError('SKU is required');
      return;
    }

    try {
      await onSave({
        sku: formData.sku.trim(),
        isFeatured: formData.isFeatured,
        position: formData.position,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
        <input
          type="text"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <input
            type="number"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
