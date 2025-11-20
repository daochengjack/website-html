import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchCategoryBySlug,
  fetchCategoryTree,
  fetchProducts,
  fetchHotProducts,
} from '../../lib/catalog/api';
import CategoryTree from '../../components/catalog/CategoryTree';
import HotProducts from '../../components/catalog/HotProducts';
import ProductView from '../../components/catalog/ProductView';

interface CategoryPageProps {
  params: {
    categorySlug: string;
  };
  searchParams: {
    page?: string;
    pageSize?: string;
    sort?: string;
    search?: string;
    tags?: string;
    view?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const category = await fetchCategoryBySlug(params.categorySlug);

    return {
      title: category.metaTitle || `${category.name} | Products`,
      description: category.metaDescription || category.description,
      openGraph: {
        title: category.metaTitle || category.name,
        description: category.metaDescription || category.description,
        images: category.ogImage ? [category.ogImage] : [],
      },
    };
  } catch {
    return {
      title: 'Category Not Found',
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  try {
    const [category, categoryTree, hotProducts] = await Promise.all([
      fetchCategoryBySlug(params.categorySlug),
      fetchCategoryTree(),
      fetchHotProducts(),
    ]);

    const productsData = await fetchProducts({
      categoryId: category.id,
      page: parseInt(searchParams.page || '1', 10),
      pageSize: parseInt(searchParams.pageSize || '12', 10),
      sort: (searchParams.sort as any) || 'newest',
      search: searchParams.search,
      tags: searchParams.tags,
    });

    const filters = {
      search: searchParams.search,
      sort: searchParams.sort || 'newest',
      pageSize: parseInt(searchParams.pageSize || '12', 10),
      page: parseInt(searchParams.page || '1', 10),
      tags: searchParams.tags?.split(',').filter(Boolean) || [],
      view: searchParams.view === 'list' ? 'list' : 'grid',
    } as const;

    return (
      <div className="category-page">
        {/* Breadcrumbs */}
        {category.breadcrumbs && category.breadcrumbs.length > 0 && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              <li>
                <a href="/">Home</a>
              </li>
              {category.breadcrumbs.map((crumb, index) => (
                <li key={crumb.id}>
                  <span className="separator">/</span>
                  {index === category.breadcrumbs!.length - 1 ? (
                    <span aria-current="page">{crumb.name}</span>
                  ) : (
                    <a href={`/${crumb.slug}`}>{crumb.name}</a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header */}
        <header className="category-header">
          <h1>{category.name}</h1>
          {category.description && <p className="description">{category.description}</p>}
        </header>

        <div className="category-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <h2 className="sidebar-title">Categories</h2>
              <CategoryTree
                categories={categoryTree}
                activePath={category.path}
                activeSlug={category.slug}
              />
            </div>

            {hotProducts.length > 0 && (
              <div className="sidebar-section">
                <HotProducts products={hotProducts} />
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <ProductView
              products={productsData.products}
              pagination={productsData.pagination}
              filters={filters}
              availableTags={category.availableTags || []}
            />
          </main>
        </div>

        <style jsx>{`
          .category-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .breadcrumbs {
            margin-bottom: 1.5rem;
          }

          .breadcrumb-list {
            display: flex;
            flex-wrap: wrap;
            list-style: none;
            padding: 0;
            margin: 0;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
          }

          .breadcrumb-list li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .breadcrumb-list a {
            color: #3b82f6;
            text-decoration: none;
          }

          .breadcrumb-list a:hover {
            text-decoration: underline;
          }

          .separator {
            color: #d1d5db;
          }

          .category-header {
            margin-bottom: 2rem;
          }

          .category-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
          }

          .description {
            margin: 0;
            font-size: 1.125rem;
            color: #6b7280;
            line-height: 1.6;
          }

          .category-layout {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2rem;
          }

          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .sidebar-section {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .sidebar-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
          }

          .main-content {
            min-width: 0;
          }

          @media (max-width: 1024px) {
            .category-layout {
              grid-template-columns: 1fr;
            }

            .sidebar {
              order: 2;
            }

            .main-content {
              order: 1;
            }
          }

          @media (max-width: 768px) {
            .category-page {
              padding: 1rem 0.5rem;
            }

            .category-header h1 {
              font-size: 1.5rem;
            }

            .description {
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    notFound();
  }
}
