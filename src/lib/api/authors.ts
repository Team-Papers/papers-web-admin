import type { ApiResponse, ApiPaginatedRaw, PaginatedResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { AuthorProfile } from '@/types/models';
import apiClient from './client';

export interface AuthorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function getAuthors(params: AuthorsParams = {}): Promise<PaginatedResponse<AuthorProfile>> {
  const res = await apiClient.get<ApiPaginatedRaw<AuthorProfile>>('/admin/authors', { params });
  return toPaginated(res.data);
}

export async function approveAuthor(id: string): Promise<AuthorProfile> {
  const res = await apiClient.put<ApiResponse<AuthorProfile>>(`/admin/authors/${id}/approve`);
  return res.data.data;
}

export async function rejectAuthor(id: string, reason: string): Promise<AuthorProfile> {
  const res = await apiClient.put<ApiResponse<AuthorProfile>>(`/admin/authors/${id}/reject`, { reason });
  return res.data.data;
}
