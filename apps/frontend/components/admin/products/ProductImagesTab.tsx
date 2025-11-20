'use client';

import { useState } from 'react';
import { Product, uploadImage as uploadImageApi, deleteImage } from '../../../lib/admin/products-api';
import { uploadImage as uploadImageAsset } from '../../../lib/admin/assets-api';
import { useToast } from '../../../contexts/toast/ToastContext';

interface ProductImagesTabProps {
  product: Product;
  onRefresh: () => void;
}

export function ProductImagesTab({ product, onRefresh }: ProductImagesTabProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageUrl.trim()) {
      setError('Image URL is required');
      return;
    }

    try {
      setUploading(true);
      await uploadImageAsset({
        productId: product.id,
        url: imageUrl.trim(),
        altText: altText || undefined,
        isPrimary,
      });
      addToast('Image uploaded successfully', 'success');
      setImageUrl('');
      setAltText('');
      setIsPrimary(false);
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      setError(message);
      addToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      await deleteImage(imageId);
      addToast('Image deleted successfully', 'success');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete image';
      addToast(message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleUploadImage} className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Upload Image</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Image description"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Set as primary image</span>
          </label>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </form>

      {product.images.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Images</h3>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image) => (
              <div key={image.id} className="bg-gray-50 p-4 rounded-lg">
                <img
                  src={image.url}
                  alt={image.altText || 'Product image'}
                  className="w-full h-24 object-cover rounded mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                  }}
                />
                <div className="space-y-2 text-xs">
                  {image.isPrimary && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">Primary</span>}
                  <p className="text-gray-600 truncate">{image.altText || 'No alt text'}</p>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="w-full px-2 py-1 text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
