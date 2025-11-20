import { get, post, patch, del } from '../api-client';

export interface ProductTranslation {
  id: string;
  productId: string;
  locale: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  features?: string;
  applications?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductAsset {
  id: string;
  productId: string;
  locale?: string;
  type: string;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  title?: string;
  position: number;
}

export interface ProductTag {
  id: string;
  slug: string;
  translations: Array<{
    id: string;
    tagId: string;
    locale: string;
    name: string;
  }>;
}

export interface ProductTagAssignment {
  id: string;
  productId: string;
  tagId: string;
  tag: ProductTag;
}

export interface Product {
  id: string;
  sku: string;
  categoryId?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  position: number;
  publishedAt?: string;
  archivedAt?: string;
  translations: ProductTranslation[];
  images: ProductImage[];
  assets: ProductAsset[];
  tagAssignments: ProductTagAssignment[];
  category?: {
    id: string;
    slug: string;
    translations: Array<{ name: string }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  sku: string;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured?: boolean;
  position?: number;
  translation: {
    locale: string;
    slug: string;
    name: string;
    shortDescription?: string;
    description?: string;
    features?: string;
    applications?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    isPublished?: boolean;
  };
}

export interface UpdateProductPayload {
  sku?: string;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured?: boolean;
  position?: number;
}

export interface UpdateProductTranslationPayload {
  locale: string;
  slug?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  features?: string;
  applications?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPublished?: boolean;
}

export interface UpdateProductStatusPayload {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface ManageProductTagsPayload {
  tagIds: string[];
}

export async function getProducts(filters?: {
  status?: string;
  categoryId?: string;
  search?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.categoryId) params.append('categoryId', filters.categoryId);
  if (filters?.search) params.append('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return get<Product[]>(`/admin/products${query}`);
}

export async function getProduct(id: string): Promise<Product> {
  return get<Product>(`/admin/products/${id}`);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return post<Product>('/admin/products', payload);
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  return patch<Product>(`/admin/products/${id}`, payload);
}

export async function updateProductTranslation(
  id: string,
  payload: UpdateProductTranslationPayload,
): Promise<ProductTranslation> {
  return patch<ProductTranslation>(`/admin/products/${id}/translations`, payload);
}

export async function updateProductStatus(
  id: string,
  payload: UpdateProductStatusPayload,
): Promise<Product> {
  return patch<Product>(`/admin/products/${id}/status`, payload);
}

export async function manageProductTags(
  id: string,
  payload: ManageProductTagsPayload,
): Promise<Product> {
  return patch<Product>(`/admin/products/${id}/tags`, payload);
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return del(`/admin/products/${id}`);
}
