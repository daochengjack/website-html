'use client';

import { useState } from 'react';
import { Product, updateProduct, updateProductTranslation } from '../../../lib/admin/products-api';
import { useToast } from '../../../contexts/toast/ToastContext';
import { ProductGeneralTab } from './ProductGeneralTab';
import { ProductTranslationTab } from './ProductTranslationTab';
import { ProductImagesTab } from './ProductImagesTab';
import { ProductTagsTab } from './ProductTagsTab';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'translations' | 'images' | 'tags'>(
    'general',
  );
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'translations', label: 'Translations' },
    { id: 'images', label: 'Images' },
    { id: 'tags', label: 'Tags' },
  ];

  const handleGeneralSave = async (data: any) => {
    try {
      setSaving(true);
      await updateProduct(product.id, data);
      addToast('Product updated successfully', 'success');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTranslationSave = async (locale: string, data: any) => {
    try {
      setSaving(true);
      await updateProductTranslation(product.id, { locale, ...data });
      addToast('Translation updated successfully', 'success');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update translation';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Product: {product.sku}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="flex gap-4 mt-4 border-b -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <ProductGeneralTab product={product} onSave={handleGeneralSave} saving={saving} />
          )}
          {activeTab === 'translations' && (
            <ProductTranslationTab
              product={product}
              onSave={handleTranslationSave}
              saving={saving}
            />
          )}
          {activeTab === 'images' && <ProductImagesTab product={product} onRefresh={onSuccess} />}
          {activeTab === 'tags' && <ProductTagsTab product={product} onRefresh={onSuccess} />}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
