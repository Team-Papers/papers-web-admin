import type { ApiResponse } from '@/types/api';
import type { Category } from '@/types/models';
import apiClient from './client';

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  orderIndex?: number;
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
  return res.data.data;
}

export async function createCategory(data: CategoryPayload): Promise<Category> {
  const res = await apiClient.post<ApiResponse<Category>>('/admin/categories', data);
  return res.data.data;
}

export async function updateCategory(id: string, data: CategoryPayload): Promise<Category> {
  const res = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}
