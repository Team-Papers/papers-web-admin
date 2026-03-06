import { NavLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, PenTool, BookOpen, FolderTree, Library, Receipt, MessageSquare, Newspaper, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Modal } from '@/components/molecules/Modal';
import { Button } from '@/components/atoms/Button';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/users', icon: Users, key: 'nav.users' },
  { to: '/authors', icon: PenTool, key: 'nav.authors' },
  { to: '/books', icon: BookOpen, key: 'nav.books' },
  { to: '/categories', icon: FolderTree, key: 'nav.categories' },
  { to: '/collections', icon: Library, key: 'nav.collections' },
  { to: '/blog', icon: Newspaper, key: 'nav.blog' },
  { to: '/reviews', icon: MessageSquare, key: 'nav.reviews' },
  { to: '/transactions', icon: Receipt, key: 'nav.transactions' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className={cn(
        'flex h-screen flex-col border-r border-outline-variant bg-surface transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-outline-variant">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
                <img src="/logo.png" alt="Papers" className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">Papers</span>
                <span className="text-xs text-on-surface-variant">Admin</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                  )}
                  <Icon size={20} className={cn(
                    'flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive && 'drop-shadow-sm'
                  )} />
                  {!collapsed && <span>{t(key)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-outline-variant">
          <button
            onClick={() => setShowLogout(true)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-all duration-200 hover:bg-error-container',
              collapsed && 'justify-center'
            )}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>Se deconnecter</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        title="Se deconnecter"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-container">
              <LogOut size={24} className="text-error" />
            </div>
          </div>
          <p className="text-center text-on-surface-variant">
            Etes-vous sur de vouloir vous deconnecter de l'espace administrateur ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowLogout(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Se deconnecter
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
