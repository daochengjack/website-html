'use client';

interface ProductFiltersProps {
  search: string;
  sort: string;
  pageSize: number;
  selectedTags: string[];
  availableTags: Array<{ id: string; slug: string; name: string }>;
  view: 'grid' | 'list';
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSortChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
  onTagToggle: (tagSlug: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  search,
  sort,
  pageSize,
  selectedTags,
  availableTags,
  view,
  hasActiveFilters,
  onSearchChange,
  onSearchSubmit,
  onSortChange,
  onPageSizeChange,
  onTagToggle,
  onViewChange,
  onClearFilters,
}: ProductFiltersProps) {
  return (
    <div className="filters-container">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="search-form"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="search-input"
              aria-label="Search products"
            />
            <button type="submit" className="search-button" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <div className="filters">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="filter-select"
              aria-label="Sort products"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="featured">Featured</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
              className="filter-select"
              aria-label="Items per page"
            >
              <option value="6">6 per page</option>
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="48">48 per page</option>
            </select>

            {hasActiveFilters && (
              <button onClick={onClearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <div className="view-toggle" role="group" aria-label="View options">
            <button
              onClick={() => onViewChange('grid')}
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="11" y="2" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="2" y="11" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="11" y="11" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              aria-label="List view"
              aria-pressed={view === 'list'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="2" />
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" />
                <line x1="2" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className="tag-filters">
          <span className="tag-filters-label">Filter by tags:</span>
          <div className="tag-chips">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.slug)}
                className={`tag-chip ${selectedTags.includes(tag.slug) ? 'active' : ''}`}
                aria-pressed={selectedTags.includes(tag.slug)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .filters-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .toolbar-left {
          display: flex;
          gap: 1rem;
          flex: 1;
          flex-wrap: wrap;
        }

        .toolbar-right {
          display: flex;
          gap: 1rem;
        }

        .search-form {
          display: flex;
          gap: 0.5rem;
          max-width: 300px;
          flex: 1;
        }

        .search-input {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.9375rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-button:hover {
          background: #2563eb;
        }

        .filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.9375rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-filters-btn {
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.9375rem;
          cursor: pointer;
        }

        .clear-filters-btn:hover {
          background: #dc2626;
        }

        .view-toggle {
          display: flex;
          gap: 0.25rem;
          background: white;
          padding: 0.25rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
        }

        .view-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .view-btn.active {
          background: #3b82f6;
          color: white;
        }

        .tag-filters {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .tag-filters-label {
          font-weight: 600;
          color: #374151;
        }

        .tag-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag-chip {
          padding: 0.375rem 0.875rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          font-size: 0.875rem;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tag-chip:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .tag-chip.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        @media (max-width: 768px) {
          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .toolbar-left,
          .toolbar-right {
            width: 100%;
          }

          .search-form {
            max-width: none;
          }

          .view-toggle {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
