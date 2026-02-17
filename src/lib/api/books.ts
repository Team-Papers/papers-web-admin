import type { ApiResponse, ApiPaginatedRaw, PaginatedResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { Book } from '@/types/models';
import apiClient from './client';

export interface BooksParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function getBooks(params: BooksParams = {}): Promise<PaginatedResponse<Book>> {
  const { search, ...rest } = params;
  const query = { ...rest, ...(search ? { q: search } : {}) };
  const res = await apiClient.get<ApiPaginatedRaw<Book>>('/admin/books', { params: query });
  return toPaginated(res.data);
}

export async function getBookById(id: string): Promise<Book> {
  const res = await apiClient.get<ApiResponse<Book>>(`/admin/books/${id}`);
  return res.data.data;
}

export async function approveBook(id: string): Promise<Book> {
  const res = await apiClient.put<ApiResponse<Book>>(`/admin/books/${id}/approve`);
  return res.data.data;
}

export async function rejectBook(id: string, reason: string): Promise<Book> {
  const res = await apiClient.put<ApiResponse<Book>>(`/admin/books/${id}/reject`, { reason });
  return res.data.data;
}

export async function suspendBook(id: string): Promise<Book> {
  const res = await apiClient.put<ApiResponse<Book>>(`/admin/books/${id}/suspend`);
  return res.data.data;
}

export interface DownloadLinkResponse {
  downloadUrl: string;
  expiresAt: string;
}

export async function getBookDownloadLink(id: string): Promise<DownloadLinkResponse> {
  const res = await apiClient.get<ApiResponse<DownloadLinkResponse>>(`/admin/books/${id}/download-link`);
  return res.data.data;
}
