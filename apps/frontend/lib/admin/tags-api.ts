import { get, post, patch, del } from '../api-client';

export interface TagTranslation {
  id: string;
  tagId: string;
  locale: string;
  name: string;
  isPublished: boolean;
}

export interface Tag {
  id: string;
  slug: string;
  isPublished: boolean;
  translations: TagTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagPayload {
  slug: string;
  isPublished?: boolean;
  translation: {
    locale: string;
    name: string;
    isPublished?: boolean;
  };
}

export interface UpdateTagPayload {
  slug?: string;
  isPublished?: boolean;
}

export interface UpdateTagTranslationPayload {
  locale: string;
  name?: string;
  isPublished?: boolean;
}

export async function getTags(): Promise<Tag[]> {
  return get<Tag[]>('/admin/tags');
}

export async function getTag(id: string): Promise<Tag> {
  return get<Tag>(`/admin/tags/${id}`);
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  return post<Tag>('/admin/tags', payload);
}

export async function updateTag(id: string, payload: UpdateTagPayload): Promise<Tag> {
  return patch<Tag>(`/admin/tags/${id}`, payload);
}

export async function updateTagTranslation(
  id: string,
  payload: UpdateTagTranslationPayload,
): Promise<TagTranslation> {
  return patch<TagTranslation>(`/admin/tags/${id}/translations`, payload);
}

export async function deleteTag(id: string): Promise<{ message: string }> {
  return del(`/admin/tags/${id}`);
}
