import { create } from 'zustand';
import type { User } from '@/types/models';
import { Role } from '@/types/models';
import * as authApi from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.user.role !== Role.ADMIN) {
      throw new Error('Accès réservé aux administrateurs');
    }
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.me();
      if (user.role !== Role.ADMIN) {
        throw new Error('Not admin');
      }
      set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
