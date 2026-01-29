import type { ApiResponse, LoginRequest, LoginResponse } from '@/types/api';
import type { User } from '@/types/models';
import apiClient from './client';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return res.data.data;
}

export async function me(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
}

export async function refresh(refreshToken: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  await apiClient.post('/auth/logout', { refreshToken });
}
