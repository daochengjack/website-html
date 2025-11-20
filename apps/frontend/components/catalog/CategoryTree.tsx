'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { Category } from '../../types/catalog';

interface CategoryTreeProps {
  categories: Category[];
  activePath?: string;
  activeSlug?: string;
}

interface CategoryNodeProps {
  category: Category;
  level: number;
  activePath?: string;
  activeSlug?: string;
}

function CategoryNode({ category, level, activePath, activeSlug }: CategoryNodeProps) {
  const isActive = activeSlug === category.slug;
  const hasActiveChild = activePath?.startsWith(`${category.path}/`);
  const hasChildren = category.children && category.children.length > 0;

  const [isExpanded, setIsExpanded] = useState(
    isActive || hasActiveChild,
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <li className="category-node">
      <div
        className={`category-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${level * 1}rem` }}
      >
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="expand-btn"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M4 2L8 6L4 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        
        <Link href={`/${category.slug}`} className="category-link">
          {category.name}
          {category.productCount !== undefined && category.productCount > 0 && (
            <span className="product-count">({category.productCount})</span>
          )}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <ul className="category-children">
          {category.children!.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              activePath={activePath}
              activeSlug={activeSlug}
            />
          ))}
        </ul>
      )}

      <style jsx>{`
        .category-node {
          list-style: none;
        }

        .category-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0;
          gap: 0.5rem;
        }

        .category-item.active .category-link {
          font-weight: 600;
          color: #3b82f6;
        }

        .expand-btn {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          min-width: 20px;
        }

        .expand-btn:hover {
          color: #111827;
        }

        .category-link {
          text-decoration: none;
          color: #374151;
          flex: 1;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .category-link:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }

        .product-count {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .category-children {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </li>
  );
}

function flattenCategories(categories: Category[], depth = 0): Array<{
  id: string;
  slug: string;
  name: string;
  depth: number;
  path: string;
}> {
  return categories.flatMap(category => [
    {
      id: category.id,
      slug: category.slug,
      name: category.name,
      depth,
      path: category.path,
    },
    ...(category.children ? flattenCategories(category.children, depth + 1) : []),
  ]);
}

export default function CategoryTree({ categories, activePath, activeSlug }: CategoryTreeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const flattened = useMemo(() => flattenCategories(categories), [categories]);
  const [mobileSelection, setMobileSelection] = useState(activeSlug || '');

  useEffect(() => {
    setMobileSelection(activeSlug || '');
  }, [activeSlug]);

  const handleMobileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = event.target.value;
    setMobileSelection(slug);
    if (slug) {
      router.push(`/${slug}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <div className="category-tree-wrapper">
      <div className="mobile-category-select">
        <label htmlFor="category-select" className="sr-only">
          Choose a category
        </label>
        <select
          id="category-select"
          value={mobileSelection}
          onChange={handleMobileChange}
          className="select"
        >
          <option value="">Browse categories...</option>
          {flattened.map(item => (
            <option key={item.id} value={item.slug}>
              {`${' '.repeat(item.depth)}${item.depth > 0 ? '• ' : ''}${item.name}`}
            </option>
          ))}
        </select>
      </div>

      <nav className="desktop-category-tree" aria-label="Category navigation">
        <ul className="category-list">
          {categories.map(category => (
            <CategoryNode
              key={category.id}
              category={category}
              level={0}
              activePath={activePath}
              activeSlug={activeSlug}
            />
          ))}
        </ul>
      </nav>

      <style jsx>{`
        .category-tree-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-category-select {
          display: none;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .select {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: white;
          font-size: 0.9375rem;
        }

        .desktop-category-tree {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .category-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        @media (max-width: 1024px) {
          .mobile-category-select {
            display: block;
          }

          .desktop-category-tree {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
