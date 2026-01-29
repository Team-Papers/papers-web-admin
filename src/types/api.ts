export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiPaginatedRaw<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toPaginated<T>(raw: ApiPaginatedRaw<T>): PaginatedResponse<T> {
  return {
    data: raw.data,
    total: raw.pagination.total,
    page: raw.pagination.page,
    limit: raw.pagination.limit,
    totalPages: raw.pagination.totalPages,
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: import('./models').User;
}
