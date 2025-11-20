'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '../../../lib/admin/products-api';
import { useToast } from '../../../contexts/toast/ToastContext';
import { ProductList } from '../../../components/admin/products/ProductList';
import { CreateProductModal } from '../../../components/admin/products/CreateProductModal';
import { Product } from '../../../lib/admin/products-api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      setProducts(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load products';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductCreated = () => {
    setShowCreateModal(false);
    loadProducts();
    addToast('Product created successfully', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Product
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <ProductList products={products} onRefresh={loadProducts} />

      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProductCreated}
        />
      )}
    </div>
  );
}
