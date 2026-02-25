import type { ApiPaginatedRaw, PaginatedResponse, ApiResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { Transaction } from '@/types/models';
import apiClient from './client';

export interface TransactionsParams {
  page?: number;
  limit?: number;
  type?: string;
}

export async function getTransactions(params: TransactionsParams = {}): Promise<PaginatedResponse<Transaction>> {
  const res = await apiClient.get<ApiPaginatedRaw<Transaction>>('/admin/transactions', { params });
  return toPaginated(res.data);
}

export async function getTransactionById(id: string): Promise<Transaction> {
  const res = await apiClient.get<ApiResponse<Transaction>>(`/admin/transactions/${id}`);
  return res.data.data;
}
