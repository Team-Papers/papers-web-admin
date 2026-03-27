import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check, X, Ban, ShieldOff, RotateCcw, Trash2, UserX } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { useDataTable } from '@/lib/hooks/useDataTable';
import {
  getAuthors,
  approveAuthor,
  suspendAuthorUser,
  banAuthorUser,
  activateAuthorUser,
  deleteAuthorUser,
} from '@/lib/api/authors';
import { RejectAuthorModal } from '../components/RejectAuthorModal';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { formatDate } from '@/lib/utils/formatters';
import type { AuthorProfile } from '@/types/models';
import { AuthorStatus, UserStatus } from '@/types/models';

const statusVariant = {
  [AuthorStatus.PENDING]: 'warning',
  [AuthorStatus.APPROVED]: 'success',
  [AuthorStatus.REJECTED]: 'error',
} as const;

const userStatusVariant = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.SUSPENDED]: 'warning',
  [UserStatus.BANNED]: 'error',
} as const;

const userStatusLabel = {
  [UserStatus.ACTIVE]: 'Actif',
  [UserStatus.SUSPENDED]: 'Suspendu',
  [UserStatus.BANNED]: 'Banni',
} as const;

type Tab = 'PENDING' | 'ALL';

interface ConfirmAction {
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'danger' | 'primary';
  action: () => Promise<void>;
}

export function AuthorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('ALL');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFn = useCallback(
    (p: Record<string, unknown>) => getAuthors({ ...p, ...(tab === 'PENDING' ? { status: 'PENDING' } : {}) } as Parameters<typeof getAuthors>[0]),
    [tab],
  );
  const table = useDataTable<AuthorProfile>(fetchFn);

  const withLoading = async (id: string, fn: () => Promise<void>) => {
    setActionLoading(id);
    try { await fn(); table.refetch(); } finally { setActionLoading(null); }
  };

  const handleApprove = (a: AuthorProfile) =>
    withLoading(a.id, () => approveAuthor(a.id));

  const handleSuspend = (a: AuthorProfile) => {
    if (!a.userId) return;
    setConfirmAction({
      title: 'Suspendre le compte',
      description: `Voulez-vous suspendre le compte de "${a.penName || a.user?.firstName || 'cet auteur'}" ? L'auteur ne pourra plus se connecter ni accéder à ses livres tant que son compte sera suspendu.`,
      confirmLabel: 'Suspendre',
      variant: 'danger',
      action: async () => { await suspendAuthorUser(a.userId); table.refetch(); },
    });
  };

  const handleBan = (a: AuthorProfile) => {
    if (!a.userId) return;
    setConfirmAction({
      title: 'Bannir le compte',
      description: `Voulez-vous bannir définitivement "${a.penName || a.user?.firstName || 'cet auteur'}" ? Cette action bloque l'accès de façon permanente. Les livres publiés resteront visibles mais l'auteur ne pourra plus se connecter.`,
      confirmLabel: 'Bannir',
      variant: 'danger',
      action: async () => { await banAuthorUser(a.userId); table.refetch(); },
    });
  };

  const handleActivate = (a: AuthorProfile) => {
    if (!a.userId) return;
    setConfirmAction({
      title: 'Réactiver le compte',
      description: `Voulez-vous réactiver le compte de "${a.penName || a.user?.firstName || 'cet auteur'}" ? L'auteur pourra à nouveau se connecter et gérer ses livres.`,
      confirmLabel: 'Réactiver',
      variant: 'primary',
      action: async () => { await activateAuthorUser(a.userId); table.refetch(); },
    });
  };

  const handleDelete = (a: AuthorProfile) => {
    if (!a.userId) return;
    setConfirmAction({
      title: 'Supprimer le compte',
      description: `Voulez-vous supprimer définitivement le compte de "${a.penName || a.user?.firstName || 'cet auteur'}" ? Cette action est irréversible. Toutes les données, livres et transactions seront supprimés.`,
      confirmLabel: 'Supprimer définitivement',
      variant: 'danger',
      action: async () => { await deleteAuthorUser(a.userId); table.refetch(); },
    });
  };

  const renderActions = (a: AuthorProfile) => {
    const isLoading = actionLoading === a.id;
    const userStatus = a.user?.status;
    const buttons: React.ReactNode[] = [];

    // User account suspended or banned → show reactivate
    if (userStatus === UserStatus.SUSPENDED || userStatus === UserStatus.BANNED) {
      buttons.push(
        <Button key="activate" size="sm" variant="primary" leftIcon={<RotateCcw size={14} />}
          disabled={isLoading} onClick={(e) => { e.stopPropagation(); handleActivate(a); }}>
          Réactiver
        </Button>
      );
      return <div className="flex flex-wrap gap-1">{buttons}</div>;
    }

    // Author status actions
    if (a.status === AuthorStatus.PENDING) {
      buttons.push(
        <Button key="approve" size="sm" variant="primary" leftIcon={<Check size={14} />}
          isLoading={isLoading} onClick={(e) => { e.stopPropagation(); handleApprove(a); }}>
          {t('actions.approve')}
        </Button>,
        <Button key="reject" size="sm" variant="danger" leftIcon={<X size={14} />}
          disabled={isLoading} onClick={(e) => { e.stopPropagation(); setRejectId(a.id); }}>
          {t('actions.reject')}
        </Button>
      );
    } else if (a.status === AuthorStatus.APPROVED) {
      buttons.push(
        <Button key="revoke" size="sm" variant="outline" leftIcon={<ShieldOff size={14} />}
          disabled={isLoading} onClick={(e) => { e.stopPropagation(); setRejectId(a.id); }}
          title="Révoquer le statut d'auteur">
          Révoquer
        </Button>,
        <Button key="suspend" size="sm" variant="ghost" leftIcon={<UserX size={14} />}
          disabled={isLoading} onClick={(e) => { e.stopPropagation(); handleSuspend(a); }}
          title="Suspendre le compte utilisateur">
          Suspendre
        </Button>,
        <Button key="ban" size="sm" variant="danger" leftIcon={<Ban size={14} />}
          disabled={isLoading} onClick={(e) => { e.stopPropagation(); handleBan(a); }}
          title="Bannir définitivement">
          Bannir
        </Button>
      );
    } else if (a.status === AuthorStatus.REJECTED) {
      buttons.push(
        <Button key="reapprove" size="sm" variant="primary" leftIcon={<Check size={14} />}
          isLoading={isLoading} onClick={(e) => { e.stopPropagation(); handleApprove(a); }}>
          Ré-approuver
        </Button>,
        <Button key="delete" size="sm" variant="danger" leftIcon={<Trash2 size={14} />}
          disabled={isLoading} onClick={(e) => { e.stopPropagation(); handleDelete(a); }}
          title="Supprimer le compte définitivement">
          Supprimer
        </Button>
      );
    }

    return buttons.length > 0 ? <div className="flex flex-wrap gap-1">{buttons}</div> : null;
  };

  const columns: Column<AuthorProfile>[] = [
    {
      key: 'penName', header: 'Auteur', sortable: true, render: (a) => {
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
    {
      key: 'status', header: 'Statut', render: (a) => (
        <div className="flex flex-col gap-1">
          <Badge variant={statusVariant[a.status]}>{t(`status.${a.status.toLowerCase()}`)}</Badge>
          {a.user && a.user.status !== UserStatus.ACTIVE && (
            <Badge variant={userStatusVariant[a.user.status]}>
              {userStatusLabel[a.user.status]}
            </Badge>
          )}
        </div>
      ),
    },
    { key: 'createdAt', header: 'Date', sortable: true, render: (a) => formatDate(a.createdAt) },
    { key: 'actions', header: 'Actions', render: renderActions },
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
          orderBy={table.orderBy} direction={table.direction} onSort={table.toggleSort}
        />
      </div>
      <RejectAuthorModal authorId={rejectId} onClose={() => setRejectId(null)} onSuccess={() => { setRejectId(null); table.refetch(); }} />
      <ConfirmActionModal
        isOpen={!!confirmAction}
        title={confirmAction?.title ?? ''}
        description={confirmAction?.description ?? ''}
        confirmLabel={confirmAction?.confirmLabel ?? ''}
        variant={confirmAction?.variant ?? 'danger'}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.action ?? (async () => {})}
      />
    </>
  );
}
