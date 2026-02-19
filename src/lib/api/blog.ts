import type { ApiResponse, ApiPaginatedRaw, PaginatedResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { Article } from '@/types/models';
import apiClient from './client';

export interface BlogParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ArticlePayload {
  title: string;
  content: string;
  excerpt?: string;
  coverUrl?: string;
  category?: string;
  status?: string;
}

export async function getArticles(params: BlogParams = {}): Promise<PaginatedResponse<Article>> {
  const { search, ...rest } = params;
  const query = { ...rest, ...(search ? { q: search } : {}) };
  const res = await apiClient.get<ApiPaginatedRaw<Article>>('/blog/admin', { params: query });
  return toPaginated(res.data);
}

export async function getArticleById(id: string): Promise<Article> {
  const res = await apiClient.get<ApiResponse<Article>>(`/blog/admin/${id}`);
  return res.data.data;
}

export async function createArticle(data: ArticlePayload): Promise<Article> {
  const res = await apiClient.post<ApiResponse<Article>>('/blog/admin', data);
  return res.data.data;
}

export async function updateArticle(id: string, data: Partial<ArticlePayload>): Promise<Article> {
  const res = await apiClient.patch<ApiResponse<Article>>(`/blog/admin/${id}`, data);
  return res.data.data;
}

export async function deleteArticle(id: string): Promise<void> {
  await apiClient.delete(`/blog/admin/${id}`);
}
