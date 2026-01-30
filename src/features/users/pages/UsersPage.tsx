import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getUsers } from '@/lib/api/users';
import { formatDate } from '@/lib/utils/formatters';
import type { User } from '@/types/models';
import { UserStatus, Role } from '@/types/models';

const statusVariant = { [UserStatus.ACTIVE]: 'success', [UserStatus.SUSPENDED]: 'warning', [UserStatus.BANNED]: 'error' } as const;

export function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fetchFn = useCallback((p: Record<string, unknown>) => getUsers(p as Parameters<typeof getUsers>[0]), []);
  const table = useDataTable<User>(fetchFn);

  const columns: Column<User>[] = [
    { key: 'name', header: 'Nom', render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', header: 'E-mail' },
    { key: 'role', header: 'Rôle', render: (u) => <Badge variant="info">{u.role}</Badge> },
    { key: 'status', header: 'Statut', render: (u) => <Badge variant={statusVariant[u.status]}>{t(`status.${u.status.toLowerCase()}`)}</Badge> },
    { key: 'createdAt', header: 'Inscription', render: (u) => formatDate(u.createdAt) },
  ];

  return (
    <>
      <Header title={t('nav.users')} />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate('/users/create-admin')}>{t('actions.createAdmin')}</Button>
          <div className="w-72">
            <SearchBar value={table.search} onChange={table.setSearch} />
          </div>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={table.filters.role || ''}
            onChange={(e) => table.setFilters({ ...table.filters, role: e.target.value })}
          >
            <option value="">Tous les rôles</option>
            {Object.values(Role).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={table.filters.status || ''}
            onChange={(e) => table.setFilters({ ...table.filters, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            {Object.values(UserStatus).map((s) => <option key={s} value={s}>{t(`status.${s.toLowerCase()}`)}</option>)}
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white">
          <DataTable
            columns={columns}
            data={table.data}
            isLoading={table.isLoading}
            page={table.page}
            totalPages={table.totalPages}
            total={table.total}
            limit={table.limit}
            onPageChange={table.setPage}
            onRowClick={(u) => navigate(`/users/${u.id}`)}
            keyExtractor={(u) => u.id}
          />
        </div>
      </div>
    </>
  );
}
