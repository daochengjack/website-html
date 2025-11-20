import Link from 'next/link';
import type { Product } from '../../types/catalog';

interface ProductCardProps {
  product: Product;
  view: 'grid' | 'list';
}

export default function ProductCard({ product, view }: ProductCardProps) {
  const cardClass = view === 'grid' ? 'product-card-grid' : 'product-card-list';

  return (
    <Link href={`/products/${product.slug}`} className={`product-card ${cardClass}`}>
      {product.imageUrl && (
        <div className="product-image">
          <img
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            loading="lazy"
          />
          {product.isFeatured && (
            <span className="featured-badge">Featured</span>
          )}
        </div>
      )}
      
      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        
        {product.category && (
          <div className="product-category">{product.category.name}</div>
        )}
        
        {product.shortDescription && (
          <p className="product-description">{product.shortDescription}</p>
        )}
        
        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.map(tag => (
              <span key={tag.id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .product-card-grid {
          flex-direction: column;
        }

        .product-card-list {
          flex-direction: row;
          align-items: stretch;
        }

        .product-image {
          position: relative;
          background-color: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-card-grid .product-image {
          width: 100%;
          height: 200px;
        }

        .product-card-list .product-image {
          width: 200px;
          flex-shrink: 0;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .featured-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .product-content {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .product-name {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .product-category {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .product-description {
          margin: 0;
          font-size: 0.9375rem;
          color: #4b5563;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .product-card-list .product-description {
          -webkit-line-clamp: 4;
        }

        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: #4b5563;
        }
      `}</style>
    </Link>
  );
}
