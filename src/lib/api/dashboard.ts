import type { Transaction } from '@/types/models';
import apiClient from './client';

export interface DashboardStats {
  totalUsers: number;
  totalAuthors: number;
  totalBooks: number;
  totalRevenue: number;
  pendingAuthors: number;
  pendingBooks: number;
  salesChart: { date: string; amount: number }[];
  recentTransactions: Transaction[];
}

interface ApiDashboardResponse {
  usersCount: number;
  authorsCount: number;
  booksCount: number;
  totalRevenue: number;
  pendingAuthors: number;
  pendingBooks: number;
}

export async function getStats(): Promise<DashboardStats> {
  const res = await apiClient.get<{ success: boolean; data: ApiDashboardResponse }>('/admin/dashboard');
  const d = res.data.data;
  return {
    totalUsers: d.usersCount,
    totalAuthors: d.authorsCount,
    totalBooks: d.booksCount,
    totalRevenue: d.totalRevenue,
    pendingAuthors: d.pendingAuthors,
    pendingBooks: d.pendingBooks,
    salesChart: [],
    recentTransactions: [],
  };
}
