import type {
  Category,
  CategoryDetail,
  Product,
  ProductsResponse,
  ProductQueryParams,
} from '../../types/catalog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch category tree for navigation
 */
export async function fetchCategoryTree(locale = 'en'): Promise<Category[]> {
  const url = `${API_URL}/catalog/categories?locale=${locale}`;
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch category detail by slug
 */
export async function fetchCategoryBySlug(
  slug: string,
  locale = 'en',
): Promise<CategoryDetail> {
  const url = `${API_URL}/catalog/categories/${slug}?locale=${locale}`;
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch products with filters and pagination
 */
export async function fetchProducts(
  params: ProductQueryParams = {},
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const url = `${API_URL}/catalog/products?${searchParams.toString()}`;
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch hot/featured products
 */
export async function fetchHotProducts(
  locale = 'en',
  limit = 5,
): Promise<Product[]> {
  const url = `${API_URL}/catalog/products/hot?locale=${locale}&limit=${limit}`;
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch hot products: ${response.statusText}`);
  }
  
  return response.json();
}
