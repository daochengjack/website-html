'use client';

import { useState } from 'react';
import { Product } from '../../../lib/admin/products-api';

interface ProductTranslationTabProps {
  product: Product;
  onSave: (locale: string, data: any) => Promise<void>;
  saving: boolean;
}

export function ProductTranslationTab({ product, onSave, saving }: ProductTranslationTabProps) {
  const [selectedLocale, setSelectedLocale] = useState(product.translations[0]?.locale || 'en');
  const [error, setError] = useState<string | null>(null);

  const translation = product.translations.find((t) => t.locale === selectedLocale);

  const [formData, setFormData] = useState({
    slug: translation?.slug || '',
    name: translation?.name || '',
    shortDescription: translation?.shortDescription || '',
    description: translation?.description || '',
    features: translation?.features || '',
    applications: translation?.applications || '',
    metaTitle: translation?.metaTitle || '',
    metaDescription: translation?.metaDescription || '',
    isPublished: translation?.isPublished || false,
  });

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale);
    const trans = product.translations.find((t) => t.locale === locale);
    setFormData({
      slug: trans?.slug || '',
      name: trans?.name || '',
      shortDescription: trans?.shortDescription || '',
      description: trans?.description || '',
      features: trans?.features || '',
      applications: trans?.applications || '',
      metaTitle: trans?.metaTitle || '',
      metaDescription: trans?.metaDescription || '',
      isPublished: trans?.isPublished || false,
    });
  };

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
      await onSave(selectedLocale, formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      setError(message);
    }
  };

  const locales = ['en', 'es', 'fr', 'de'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 pb-4 border-b">
        {locales.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => handleLocaleChange(locale)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedLocale === locale
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <textarea
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Applications</label>
          <textarea
            value={formData.applications}
            onChange={(e) => setFormData({ ...formData, applications: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
        <input
          type="text"
          value={formData.metaTitle}
          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="SEO title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
        <textarea
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="SEO description"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="w-4 h-4"
        />
        <span className="text-sm text-gray-700">Published</span>
      </label>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Translation'}
      </button>
    </form>
  );
}
