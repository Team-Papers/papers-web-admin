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
import { getBooks, approveBook } from '@/lib/api/books';
import { RejectBookModal } from '../components/RejectBookModal';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Book } from '@/types/models';
import { BookStatus } from '@/types/models';

const statusVariant = {
  [BookStatus.DRAFT]: 'neutral', [BookStatus.PENDING]: 'warning',
  [BookStatus.APPROVED]: 'success', [BookStatus.REJECTED]: 'error', [BookStatus.PUBLISHED]: 'info',
} as const;
type Tab = 'PENDING' | 'ALL';

export function BooksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('PENDING');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const fetchFn = useCallback(
    (p: Record<string, unknown>) => getBooks({ ...p, ...(tab === 'PENDING' ? { status: 'PENDING' } : {}) } as Parameters<typeof getBooks>[0]),
    [tab],
  );
  const table = useDataTable<Book>(fetchFn);

  const handleApprove = async (id: string) => {
    await approveBook(id);
    table.refetch();
  };

  const columns: Column<Book>[] = [
    {
      key: 'cover', header: '', render: (b) =>
        b.coverUrl ? <img src={b.coverUrl} alt="" className="h-12 w-9 rounded object-cover" /> : <div className="h-12 w-9 rounded bg-gray-200" />,
    },
    { key: 'title', header: 'Titre' },
    { key: 'price', header: 'Prix', render: (b) => formatCurrency(b.price) },
    { key: 'status', header: 'Statut', render: (b) => <Badge variant={statusVariant[b.status]}>{t(`status.${b.status.toLowerCase()}`)}</Badge> },
    { key: 'totalSales', header: 'Ventes' },
    {
      key: 'actions', header: 'Actions', render: (b) =>
        b.status === BookStatus.PENDING ? (
          <div className="flex gap-1">
            <Button size="sm" variant="primary" leftIcon={<Check size={14} />} onClick={(e) => { e.stopPropagation(); handleApprove(b.id); }}>{t('actions.approve')}</Button>
            <Button size="sm" variant="danger" leftIcon={<X size={14} />} onClick={(e) => { e.stopPropagation(); setRejectId(b.id); }}>{t('actions.reject')}</Button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <Header title={t('nav.books')} />
      <div className="p-6 space-y-4">
        <div className="flex gap-4 border-b border-gray-200">
          {(['PENDING', 'ALL'] as Tab[]).map((t2) => (
            <button key={t2} onClick={() => setTab(t2)} className={`pb-2 text-sm font-medium ${tab === t2 ? 'border-b-2 border-primary-400 text-primary-400' : 'text-gray-500 hover:text-gray-700'}`}>
              {t2 === 'PENDING' ? 'À modérer' : 'Tous'}
            </button>
          ))}
        </div>
        <div className="w-72"><SearchBar value={table.search} onChange={table.setSearch} /></div>
        <div className="rounded-lg border border-gray-200 bg-white">
          <DataTable columns={columns} data={table.data} isLoading={table.isLoading} page={table.page} totalPages={table.totalPages} total={table.total} limit={table.limit} onPageChange={table.setPage} onRowClick={(b) => navigate(`/books/${b.id}`)} keyExtractor={(b) => b.id} />
        </div>
      </div>
      <RejectBookModal bookId={rejectId} onClose={() => setRejectId(null)} onSuccess={() => { setRejectId(null); table.refetch(); }} />
    </>
  );
}
