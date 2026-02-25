import type { ApiResponse, ApiPaginatedRaw, PaginatedResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { AuthorProfile, AuthorDetail } from '@/types/models';
import apiClient from './client';

export interface AuthorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function getAuthors(params: AuthorsParams = {}): Promise<PaginatedResponse<AuthorProfile>> {
  const { search, ...rest } = params;
  const query = { ...rest, ...(search ? { q: search } : {}) };
  const res = await apiClient.get<ApiPaginatedRaw<AuthorProfile>>('/admin/authors', { params: query });
  return toPaginated(res.data);
}

export async function getAuthorById(id: string): Promise<AuthorDetail> {
  const res = await apiClient.get<ApiResponse<AuthorDetail>>(`/admin/authors/${id}`);
  return res.data.data;
}

export async function approveAuthor(id: string): Promise<AuthorProfile> {
  const res = await apiClient.put<ApiResponse<AuthorProfile>>(`/admin/authors/${id}/approve`);
  return res.data.data;
}

export async function rejectAuthor(id: string, reason: string): Promise<AuthorProfile> {
  const res = await apiClient.put<ApiResponse<AuthorProfile>>(`/admin/authors/${id}/reject`, { reason });
  return res.data.data;
}
