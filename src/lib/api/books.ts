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
  const res = await apiClient.get<ApiPaginatedRaw<Book>>('/admin/books', { params });
  return toPaginated(res.data);
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
