import { Outlet } from 'react-router';
import { Sidebar } from '@/components/organisms/Sidebar';
import { CommandPalette } from '@/components/organisms/CommandPalette';

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
