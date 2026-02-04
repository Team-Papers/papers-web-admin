import type { ApiResponse, ApiPaginatedRaw, PaginatedResponse } from '@/types/api';
import { toPaginated } from '@/types/api';
import type { User } from '@/types/models';
import apiClient from './client';

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function getUsers(params: UsersParams = {}): Promise<PaginatedResponse<User>> {
  const res = await apiClient.get<ApiPaginatedRaw<User>>('/admin/users', { params });
  return toPaginated(res.data);
}

export async function getUserById(id: string): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
  return res.data.data;
}

export async function suspendUser(id: string): Promise<User> {
  const res = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/suspend`);
  return res.data.data;
}

export async function banUser(id: string): Promise<User> {
  const res = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/ban`);
  return res.data.data;
}

export async function activateUser(id: string): Promise<User> {
  const res = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/activate`);
  return res.data.data;
}

export async function promoteToAdmin(id: string): Promise<User> {
  const res = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/promote`);
  return res.data.data;
}

export async function demoteFromAdmin(id: string): Promise<User> {
  const res = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/demote`);
  return res.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createAdmin(data: CreateAdminData): Promise<User> {
  const res = await apiClient.post<ApiResponse<User>>('/admin/users/create-admin', data);
  return res.data.data;
}
