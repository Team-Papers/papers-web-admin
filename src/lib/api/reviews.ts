import type { ApiResponse, ApiPaginatedRaw, PaginatedResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { Review } from '@/types/models';
import apiClient from './client';

export interface ReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  bookId?: string;
  userId?: string;
}

export async function getReviews(params: ReviewsParams = {}): Promise<PaginatedResponse<Review>> {
  const { search, ...rest } = params;
  const query = { ...rest, ...(search ? { q: search } : {}) };
  const res = await apiClient.get<ApiPaginatedRaw<Review>>('/admin/reviews', { params: query });
  return toPaginated(res.data);
}

export async function hideReview(id: string): Promise<Review> {
  const res = await apiClient.put<ApiResponse<Review>>(`/admin/reviews/${id}/hide`);
  return res.data.data;
}

export async function unhideReview(id: string): Promise<Review> {
  const res = await apiClient.put<ApiResponse<Review>>(`/admin/reviews/${id}/unhide`);
  return res.data.data;
}

export async function deleteReview(id: string): Promise<void> {
  await apiClient.delete(`/admin/reviews/${id}`);
}
