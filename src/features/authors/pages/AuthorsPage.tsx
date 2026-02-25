import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getAuthors, approveAuthor } from '@/lib/api/authors';
import { RejectAuthorModal } from '../components/RejectAuthorModal';
import { formatDate } from '@/lib/utils/formatters';
import type { AuthorProfile } from '@/types/models';
import { AuthorStatus } from '@/types/models';

const statusVariant = { [AuthorStatus.PENDING]: 'warning', [AuthorStatus.APPROVED]: 'success', [AuthorStatus.REJECTED]: 'error' } as const;
type Tab = 'PENDING' | 'ALL';

export function AuthorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('ALL');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const fetchFn = useCallback(
    (p: Record<string, unknown>) => getAuthors({ ...p, ...(tab === 'PENDING' ? { status: 'PENDING' } : {}) } as Parameters<typeof getAuthors>[0]),
    [tab],
  );
  const table = useDataTable<AuthorProfile>(fetchFn);

  const handleApprove = async (id: string) => {
    await approveAuthor(id);
    table.refetch();
  };

  const columns: Column<AuthorProfile>[] = [
    {
      key: 'user', header: 'Auteur', render: (a) => {
        const name = a.user ? `${a.user.firstName} ${a.user.lastName}` : a.userId;
        return (
          <div className="flex items-center gap-2">
            {a.photoUrl ? (
              <img src={a.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-primary">
                {(a.penName || name).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{a.penName || name}</p>
              {a.user?.email && <p className="truncate text-xs text-on-surface-variant">{a.user.email}</p>}
            </div>
          </div>
        );
      },
    },
    { key: 'bio', header: 'Bio', render: (a) => <span className="max-w-xs truncate block text-on-surface-variant">{a.bio || '—'}</span> },
    { key: 'status', header: 'Statut', render: (a) => <Badge variant={statusVariant[a.status]}>{t(`status.${a.status.toLowerCase()}`)}</Badge> },
    { key: 'createdAt', header: 'Date', render: (a) => formatDate(a.createdAt) },
    {
      key: 'actions', header: 'Actions', render: (a) =>
        a.status === AuthorStatus.PENDING ? (
          <div className="flex gap-1">
            <Button size="sm" variant="primary" leftIcon={<Check size={14} />} onClick={(e) => { e.stopPropagation(); handleApprove(a.id); }}>
              {t('actions.approve')}
            </Button>
            <Button size="sm" variant="danger" leftIcon={<X size={14} />} onClick={(e) => { e.stopPropagation(); setRejectId(a.id); }}>
              {t('actions.reject')}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <Header title={t('nav.authors')} />
      <div className="p-6 space-y-4">
        <div className="flex gap-4 border-b border-outline-variant">
          {(['PENDING', 'ALL'] as Tab[]).map((t2) => (
            <button
              key={t2}
              onClick={() => setTab(t2)}
              className={`pb-2 text-sm font-medium transition-colors ${tab === t2 ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {t2 === 'PENDING' ? 'En attente' : 'Tous'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-72"><SearchBar value={table.search} onChange={table.setSearch} /></div>
          {tab === 'ALL' && (
            <select
              className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
              value={table.filters.status || ''}
              onChange={(e) => table.setFilters({ ...table.filters, status: e.target.value })}
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Rejeté</option>
            </select>
          )}
        </div>
        <DataTable
          columns={columns} data={table.data} isLoading={table.isLoading}
          page={table.page} totalPages={table.totalPages} total={table.total} limit={table.limit}
          onPageChange={table.setPage} onRowClick={(a) => navigate(`/authors/${a.id}`)} keyExtractor={(a) => a.id}
        />
      </div>
      <RejectAuthorModal authorId={rejectId} onClose={() => setRejectId(null)} onSuccess={() => { setRejectId(null); table.refetch(); }} />
    </>
  );
}
