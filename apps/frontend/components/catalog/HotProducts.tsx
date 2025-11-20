import Link from 'next/link';
import type { Product } from '../../types/catalog';

interface HotProductsProps {
  products: Product[];
}

export default function HotProducts({ products }: HotProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <aside className="hot-products-widget">
      <h3 className="widget-title">Hot Products</h3>
      <div className="products-list">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="product-card"
          >
            {product.imageUrl && (
              <div className="product-image">
                <img
                  src={product.imageUrl}
                  alt={product.imageAlt || product.name}
                  loading="lazy"
                />
              </div>
            )}
            <div className="product-info">
              <h4 className="product-name">{product.name}</h4>
              {product.shortDescription && (
                <p className="product-description">{product.shortDescription}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .hot-products-widget {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .widget-title {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #3b82f6;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-card {
          display: flex;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
          padding: 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .product-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .product-image {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 0.25rem;
          overflow: hidden;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-name {
          margin: 0 0 0.25rem 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-description {
          margin: 0;
          font-size: 0.8125rem;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </aside>
  );
}
