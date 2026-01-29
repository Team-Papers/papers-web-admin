import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2">
          <Avatar name={user ? `${user.firstName} ${user.lastName}` : 'A'} src={user?.avatarUrl} size="sm" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={16} /> {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
