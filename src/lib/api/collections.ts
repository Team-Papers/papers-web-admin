import type { ApiResponse } from '@/types/api';
import type { Collection } from '@/types/models';
import apiClient from './client';

export interface CollectionPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export async function getCollections(): Promise<Collection[]> {
  const res = await apiClient.get<ApiResponse<Collection[]>>('/admin/collections');
  return res.data.data;
}

export async function createCollection(data: CollectionPayload): Promise<Collection> {
  const res = await apiClient.post<ApiResponse<Collection>>('/admin/collections', data);
  return res.data.data;
}

export async function updateCollection(id: string, data: Partial<CollectionPayload>): Promise<Collection> {
  const res = await apiClient.put<ApiResponse<Collection>>(`/admin/collections/${id}`, data);
  return res.data.data;
}

export async function deleteCollection(id: string): Promise<void> {
  await apiClient.delete(`/admin/collections/${id}`);
}

export async function addBookToCollection(collectionId: string, bookId: string, orderIndex: number = 0): Promise<void> {
  await apiClient.post(`/admin/collections/${collectionId}/books`, { bookId, orderIndex });
}

export async function removeBookFromCollection(collectionId: string, bookId: string): Promise<void> {
  await apiClient.delete(`/admin/collections/${collectionId}/books/${bookId}`);
}

export async function uploadCoverImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post<ApiResponse<{ url: string }>>('/upload/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url;
}
