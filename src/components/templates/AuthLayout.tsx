import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dim">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Papers" className="mx-auto h-12" />
          <p className="mt-2 text-on-surface-variant">Administration</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
