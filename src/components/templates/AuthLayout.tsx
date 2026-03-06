import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dim px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="Papers" className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-on-surface">Papers</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Espace administrateur</p>
        </div>
        <div className="rounded-2xl border border-outline bg-surface p-8 shadow-lg">
          <Outlet />
        </div>
        <p className="mt-6 text-center text-xs text-on-surface-muted">
          &copy; {new Date().getFullYear()} Papers. Tous droits reserves.
        </p>
      </div>
    </div>
  );
}
