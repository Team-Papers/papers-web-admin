import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, X, BookOpen, Ban, RotateCcw, BookX, Trash2 } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getBooks, approveBook, unsuspendBook, unpublishBook, deleteBook } from '@/lib/api/books';
import { RejectBookModal } from '../components/RejectBookModal';
import { SuspendBookModal } from '../components/SuspendBookModal';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Book } from '@/types/models';
import { BookStatus } from '@/types/models';

const statusVariant = {
  [BookStatus.DRAFT]: 'neutral', [BookStatus.PENDING]: 'warning',
  [BookStatus.APPROVED]: 'success', [BookStatus.REJECTED]: 'error', [BookStatus.PUBLISHED]: 'info',
  [BookStatus.SUSPENDED]: 'error',
} as const;
type Tab = 'PENDING' | 'ALL';

export function BooksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('ALL');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFn = useCallback(
    (p: Record<string, unknown>) => getBooks({ ...p, ...(tab === 'PENDING' ? { status: 'PENDING' } : {}) } as Parameters<typeof getBooks>[0]),
    [tab],
  );
  const table = useDataTable<Book>(fetchFn);

  const handleApprove = async (id: string) => {
    await approveBook(id);
    table.refetch();
  };

  const handleUnsuspend = async (id: string) => {
    await unsuspendBook(id);
    table.refetch();
  };

  const handleUnpublish = async () => {
    if (!unpublishTarget) return;
    setActionLoading(true);
    try {
      await unpublishBook(unpublishTarget.id);
      setUnpublishTarget(null);
      table.refetch();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteBook(deleteTarget.id);
      setDeleteTarget(null);
      table.refetch();
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Book>[] = [
    {
      key: 'cover', header: '', render: (b) =>
        b.coverUrl ? (
          <img src={b.coverUrl} alt="" className="h-12 w-9 rounded object-cover" />
        ) : (
          <div className="flex h-12 w-9 items-center justify-center rounded bg-surface-container">
            <BookOpen size={12} className="text-on-surface-variant" />
          </div>
        ),
    },
    {
      key: 'title', header: 'Titre', sortable: true, render: (b) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{b.title}</p>
          {b.author && <p className="truncate text-xs text-on-surface-variant">{b.author.penName || ''}</p>}
        </div>
      ),
    },
    { key: 'price', header: 'Prix', sortable: true, render: (b) => formatCurrency(b.price) },
    { key: 'status', header: 'Statut', render: (b) => <Badge variant={statusVariant[b.status]}>{t(`status.${b.status.toLowerCase()}`)}</Badge> },
    { key: 'totalSales', header: 'Ventes', render: (b) => <span className="font-medium">{b._count?.purchases ?? 0}</span> },
    {
      key: 'actions', header: 'Actions', render: (b) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {b.status === BookStatus.PENDING && (
            <>
              <button onClick={() => handleApprove(b.id)} className="rounded-lg p-1.5 text-success hover:bg-success-container transition-colors" title="Approuver">
                <Check size={16} />
              </button>
              <button onClick={() => setRejectId(b.id)} className="rounded-lg p-1.5 text-error hover:bg-error-container transition-colors" title="Rejeter">
                <X size={16} />
              </button>
            </>
          )}
          {(b.status === BookStatus.PUBLISHED || b.status === BookStatus.APPROVED) && (
            <button onClick={() => setSuspendId(b.id)} className="rounded-lg p-1.5 text-warning hover:bg-warning-container transition-colors" title="Suspendre">
              <Ban size={16} />
            </button>
          )}
          {b.status === BookStatus.PUBLISHED && (
            <button onClick={() => setUnpublishTarget(b)} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors" title="Retirer en ligne">
              <BookX size={16} />
            </button>
          )}
          {b.status === BookStatus.SUSPENDED && (
            <button onClick={() => handleUnsuspend(b.id)} className="rounded-lg p-1.5 text-primary hover:bg-primary-container transition-colors" title="Reactiver">
              <RotateCcw size={16} />
            </button>
          )}
          <button onClick={() => setDeleteTarget(b)} className="rounded-lg p-1.5 text-error hover:bg-error-container transition-colors" title="Supprimer">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title={t('nav.books')} />
      <div className="p-6 space-y-4">
        <div className="flex gap-4 border-b border-outline-variant">
          {(['PENDING', 'ALL'] as Tab[]).map((t2) => (
            <button key={t2} onClick={() => setTab(t2)} className={`pb-2 text-sm font-medium transition-colors ${tab === t2 ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {t2 === 'PENDING' ? 'À modérer' : 'Tous'}
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
              <option value="DRAFT">Brouillon</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Rejeté</option>
              <option value="PUBLISHED">Publié</option>
              <option value="SUSPENDED">Suspendu</option>
            </select>
          )}
        </div>
        <DataTable columns={columns} data={table.data} isLoading={table.isLoading} page={table.page} totalPages={table.totalPages} total={table.total} limit={table.limit} onPageChange={table.setPage} onRowClick={(b) => navigate(`/books/${b.id}`)} keyExtractor={(b) => b.id} orderBy={table.orderBy} direction={table.direction} onSort={table.toggleSort} />
      </div>

      {/* Reject Modal */}
      <RejectBookModal bookId={rejectId} onClose={() => setRejectId(null)} onSuccess={() => { setRejectId(null); table.refetch(); }} />

      {/* Suspend Modal */}
      <SuspendBookModal bookId={suspendId} onClose={() => setSuspendId(null)} onSuccess={() => { setSuspendId(null); table.refetch(); }} />

      {/* Unpublish Modal */}
      <Modal
        isOpen={!!unpublishTarget}
        onClose={() => setUnpublishTarget(null)}
        title="Retirer le livre en ligne"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-on-surface-variant">
            Etes-vous sur de vouloir retirer <strong>{unpublishTarget?.title}</strong> de la publication ?
            Le livre repassera en brouillon.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setUnpublishTarget(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleUnpublish} isLoading={actionLoading}>Retirer en ligne</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le livre"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-on-surface-variant">
            Etes-vous sur de vouloir supprimer definitivement <strong>{deleteTarget?.title}</strong> ?
            Cette action est irreversible.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={actionLoading}>Supprimer definitivement</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
