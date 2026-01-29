import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Paper's" className="mx-auto h-12" />
          <p className="mt-2 text-gray-500">Administration</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
