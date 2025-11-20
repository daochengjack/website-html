import { post, del } from '../api-client';

export interface UploadAssetPayload {
  productId: string;
  type: string;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  title?: string;
  locale?: string;
  position?: number;
}

export interface UploadImagePayload {
  productId: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  position?: number;
}

export interface UploadAssetResponse {
  id: string;
  productId: string;
  type: string;
  url: string;
  fileName: string;
}

export interface UploadImageResponse {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  position: number;
}

export interface AssetListResponse {
  images: UploadImageResponse[];
  assets: UploadAssetResponse[];
}

export async function uploadAsset(payload: UploadAssetPayload): Promise<UploadAssetResponse> {
  return post<UploadAssetResponse>('/admin/assets/upload', payload);
}

export async function uploadImage(payload: UploadImagePayload): Promise<UploadImageResponse> {
  return post<UploadImageResponse>('/admin/assets/images/upload', payload);
}

export async function deleteAsset(assetId: string): Promise<{ message: string }> {
  return del(`/admin/assets/assets/${assetId}`);
}

export async function deleteImage(imageId: string): Promise<{ message: string }> {
  return del(`/admin/assets/images/${imageId}`);
}

export async function updateImageOrder(
  productId: string,
  imageIds: string[],
): Promise<{ success: boolean; message: string }> {
  return post(`/admin/assets/images/${productId}/reorder`, { imageIds });
}

export async function updateAssetOrder(
  productId: string,
  assetIds: string[],
): Promise<{ success: boolean; message: string }> {
  return post(`/admin/assets/assets/${productId}/reorder`, { assetIds });
}
