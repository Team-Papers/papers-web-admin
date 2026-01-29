import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AppRoutes } from '@/routes';
import '@/locales/i18n';

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <AppRoutes />;
}
