import apiClient from './client';

export interface TopBook {
  id: string;
  title: string;
  coverUrl: string | null;
  price: number;
  authorName: string;
  salesCount: number;
}

export interface TopAuthor {
  id: string;
  penName: string;
  photoUrl: string | null;
  totalRevenue: number;
  totalBooks: number;
}

export interface RecentTransaction {
  id: string;
  type: 'SALE' | 'WITHDRAWAL';
  amount: number;
  createdAt: string;
  authorName: string;
  bookTitle: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalAuthors: number;
  totalBooks: number;
  totalRevenue: number;
  totalPurchases: number;
  avgRating: number;
  totalReviews: number;
  pendingAuthors: number;
  pendingBooks: number;
  salesChart: { date: string; amount: number }[];
  recentTransactions: RecentTransaction[];
  topBooks: TopBook[];
  topAuthors: TopAuthor[];
  categoryDistribution: { name: string; count: number }[];
  newUsersChart: { date: string; count: number }[];
}

export async function getStats(): Promise<DashboardStats> {
  const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard');
  return res.data.data;
}
