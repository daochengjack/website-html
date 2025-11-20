'use client';

import { useState } from 'react';
import { Product, deleteProduct, updateProductStatus } from '../../../lib/admin/products-api';
import { useToast } from '../../../contexts/toast/ToastContext';
import { EditProductModal } from './EditProductModal';

interface ProductListProps {
  products: Product[];
  onRefresh: () => void;
}

export function ProductList({ products, onRefresh }: ProductListProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(id);
      addToast('Product deleted successfully', 'success');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      addToast(message, 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateProductStatus(id, { status: newStatus as any });
      addToast('Status updated successfully', 'success');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      addToast(message, 'error');
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No products yet. Create one to get started.</p>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Featured</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const translation = product.translations[0];
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{translation?.name || 'Untitled'}</div>
                    {product.tagAssignments.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {product.tagAssignments.map((tag) => tag.tag.slug).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${
                        product.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'ARCHIVED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <input
                      type="checkbox"
                      checked={product.isFeatured}
                      disabled
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => setSelectedProductId(product.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
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

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
          onSuccess={() => {
            setSelectedProductId(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
