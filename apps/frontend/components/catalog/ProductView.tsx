'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import ProductFilters from './ProductFilters';
import type { Product, Pagination, ProductTag } from '../../types/catalog';

interface ProductViewProps {
  products: Product[];
  pagination: Pagination;
  availableTags?: ProductTag[];
  filters: {
    search?: string;
    sort: string;
    pageSize: number;
    page: number;
    tags: string[];
    view: 'grid' | 'list';
  };
}

type ViewType = 'grid' | 'list';

export default function ProductView({ products, pagination, availableTags = [], filters }: ProductViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [sortValue, setSortValue] = useState(filters.sort);
  const [pageSizeValue, setPageSizeValue] = useState(filters.pageSize);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  const [viewValue, setViewValue] = useState<ViewType>(filters.view);

  useEffect(() => {
    setSearchValue(filters.search || '');
    setSortValue(filters.sort);
    setPageSizeValue(filters.pageSize);
    setSelectedTags(filters.tags || []);
    setViewValue(filters.view);
  }, [filters]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedView = window.localStorage.getItem('catalog:view');
    if (!filters.view && storedView && (storedView === 'grid' || storedView === 'list')) {
      updateQuery({ view: storedView });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const target = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(target, { scroll: false });
    });
  };

  const handleSearchSubmit = () => {
    updateQuery({ search: searchValue ? searchValue.trim() : null, page: '1' });
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    updateQuery({ sort: value, page: '1' });
  };

  const handlePageSizeChange = (value: number) => {
    setPageSizeValue(value);
    updateQuery({ pageSize: String(value), page: '1' });
  };

  const handleTagToggle = (tagSlug: string) => {
    setSelectedTags(prev => {
      const exists = prev.includes(tagSlug);
      const next = exists ? prev.filter(tag => tag !== tagSlug) : [...prev, tagSlug];
      updateQuery({ tags: next.length ? next.join(',') : null, page: '1' });
      return next;
    });
  };

  const handleViewChange = (view: ViewType) => {
    setViewValue(view);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('catalog:view', view);
    }
    updateQuery({ view });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page: String(page) });
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setSelectedTags([]);
    setSortValue('newest');
    setPageSizeValue(12);
    updateQuery({ search: null, tags: null, sort: null, pageSize: null, page: '1' });
  };

  const hasActiveFilters = Boolean(
    searchValue || selectedTags.length > 0 || sortValue !== 'newest' || pageSizeValue !== 12,
  );

  const renderProducts = () => {
    if (isPending) {
      return (
        <div className={`products ${viewValue === 'grid' ? 'products-grid' : 'products-list'}`}>
          {Array.from({ length: pageSizeValue }).map((_, index) => (
            <ProductSkeleton key={index} view={viewValue} />
          ))}
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="empty-icon">
            <circle cx="32" cy="32" r="30" stroke="#e5e7eb" strokeWidth="4" />
            <path d="M32 20v24M20 32h24" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="clear-filters-cta">
              Clear all filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={`products ${viewValue === 'grid' ? 'products-grid' : 'products-list'}`}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} view={viewValue} />
        ))}
      </div>
    );
  };

  return (
    <div className="product-view">
      <ProductFilters
        search={searchValue}
        sort={sortValue}
        pageSize={pageSizeValue}
        selectedTags={selectedTags}
        availableTags={availableTags}
        view={viewValue}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onSortChange={handleSortChange}
        onPageSizeChange={handlePageSizeChange}
        onTagToggle={handleTagToggle}
        onViewChange={handleViewChange}
        onClearFilters={handleClearFilters}
      />

      <div className="results-info">
        Showing{' '}
        {products.length === 0
          ? 0
          : (pagination.page - 1) * pagination.pageSize + 1}{' '}
        - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} products
      </div>

      {renderProducts()}

      {pagination.totalPages > 1 && (
        <div className="pagination" role="navigation" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
            aria-label="Previous page"
          >
            Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map(page => {
              if (
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.page) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-page ${page === pagination.page ? 'active' : ''}`}
                    aria-current={page === pagination.page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              }

              if (page === pagination.page - 2 || page === pagination.page + 2) {
                return (
                  <span key={page} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }

              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .product-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .results-info {
          color: #6b7280;
          font-size: 0.9375rem;
        }

        .products {
          display: grid;
          gap: 1.5rem;
        }

        .products-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .products-list {
          grid-template-columns: 1fr;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-icon {
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
          color: #6b7280;
        }

        .clear-filters-cta {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          cursor: pointer;
        }

        .clear-filters-cta:hover {
          background: #2563eb;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.9375rem;
          cursor: pointer;
          color: #374151;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 0.25rem;
        }

        .pagination-page {
          min-width: 2.5rem;
          height: 2.5rem;
          padding: 0.5rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.9375rem;
          cursor: pointer;
          color: #374151;
        }

        .pagination-page.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .pagination-ellipsis {
          display: flex;
          align-items: center;
          padding: 0 0.5rem;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
