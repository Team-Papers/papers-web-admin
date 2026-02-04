import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, PenTool, BookOpen, FolderTree, Receipt, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/users', icon: Users, key: 'nav.users' },
  { to: '/authors', icon: PenTool, key: 'nav.authors' },
  { to: '/books', icon: BookOpen, key: 'nav.books' },
  { to: '/categories', icon: FolderTree, key: 'nav.categories' },
  { to: '/transactions', icon: Receipt, key: 'nav.transactions' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn('flex h-screen flex-col border-r border-gray-200 bg-white transition-all', collapsed ? 'w-16' : 'w-60')}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && <img src="/logo.png" alt="Papers" className="h-8" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-gray-600">
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{t(key)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
