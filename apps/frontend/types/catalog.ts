export interface Category {
  id: string;
  slug: string;
  path: string;
  name: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  productCount?: number;
  children?: Category[];
}

export interface CategoryDetail extends Category {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  parent?: Category | null;
  siblings?: Category[];
  breadcrumbs?: Category[];
  availableTags?: ProductTag[];
}

export interface ProductTag {
  id: string;
  slug: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription?: string;
  imageUrl?: string;
  imageAlt?: string;
  isFeatured: boolean;
  publishedAt?: string;
  category?: ProductCategory | null;
  tags?: ProductTag[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ProductQueryParams {
  locale?: string;
  categoryId?: string;
  search?: string;
  tags?: string;
  sort?: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'featured';
  page?: number;
  pageSize?: number;
  featuredOnly?: boolean;
}
