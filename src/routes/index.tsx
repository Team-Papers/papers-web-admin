import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { UserDetailPage } from '@/features/users/pages/UserDetailPage';
import { CreateAdminPage } from '@/features/users/pages/CreateAdminPage';
import { AuthorsPage } from '@/features/authors/pages/AuthorsPage';
import { AuthorDetailPage } from '@/features/authors/pages/AuthorDetailPage';
import { BooksPage } from '@/features/books/pages/BooksPage';
import { BookDetailPage } from '@/features/books/pages/BookDetailPage';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';
import { CollectionsPage } from '@/features/collections/pages/CollectionsPage';
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/create-admin" element={<CreateAdminPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/authors/:id" element={<AuthorDetailPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
