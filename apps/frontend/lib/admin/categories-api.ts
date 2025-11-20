import { get, post, patch, del } from '../api-client';

export interface CategoryTranslation {
  id: string;
  categoryId: string;
  locale: string;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPublished: boolean;
}

export interface Category {
  id: string;
  slug: string;
  parentId?: string;
  path: string;
  position: number;
  isPublished: boolean;
  showInMenu: boolean;
  iconUrl?: string;
  imageUrl?: string;
  translations: CategoryTranslation[];
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  slug: string;
  parentId?: string;
  position?: number;
  isPublished?: boolean;
  showInMenu?: boolean;
  iconUrl?: string;
  imageUrl?: string;
  locale: string;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface UpdateCategoryPayload {
  slug?: string;
  parentId?: string;
  position?: number;
  isPublished?: boolean;
  showInMenu?: boolean;
  iconUrl?: string;
  imageUrl?: string;
  locale?: string;
  name?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface UpdateCategoryTranslationPayload {
  locale: string;
  name?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPublished?: boolean;
}

export interface ReorderCategoriesPayload {
  items: Array<{
    id: string;
    position: number;
  }>;
}

export async function getCategories(): Promise<Category[]> {
  return get<Category[]>('/admin/categories');
}

export async function getCategory(id: string): Promise<Category> {
  return get<Category>(`/admin/categories/${id}`);
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  return post<Category>('/admin/categories', payload);
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
  return patch<Category>(`/admin/categories/${id}`, payload);
}

export async function updateCategoryTranslation(
  id: string,
  payload: UpdateCategoryTranslationPayload,
): Promise<CategoryTranslation> {
  return patch<CategoryTranslation>(`/admin/categories/${id}/translations`, payload);
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return del(`/admin/categories/${id}`);
}

export async function reorderCategories(payload: ReorderCategoriesPayload): Promise<{
  success: boolean;
  message: string;
}> {
  return post('/admin/categories/reorder', payload);
}
