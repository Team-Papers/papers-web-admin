import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getReviews, hideReview, unhideReview, deleteReview } from '@/lib/api/reviews';
import { formatDate } from '@/lib/utils/formatters';
import type { Review } from '@/types/models';
import { ReviewStatus } from '@/types/models';

const statusVariant = {
  [ReviewStatus.VISIBLE]: 'success',
  [ReviewStatus.HIDDEN]: 'neutral',
  [ReviewStatus.REPORTED]: 'warning',
} as const;

export function ReviewsPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFn = useCallback(
    (p: Record<string, unknown>) =>
      getReviews({ ...p, ...(statusFilter ? { status: statusFilter } : {}) } as Parameters<typeof getReviews>[0]),
    [statusFilter],
  );
  const table = useDataTable<Review>(fetchFn);

  const handleHide = async (id: string) => {
    await hideReview(id);
    table.refetch();
  };

  const handleUnhide = async (id: string) => {
    await unhideReview(id);
    table.refetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    await deleteReview(id);
    table.refetch();
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  const columns: Column<Review>[] = [
    {
      key: 'user',
      header: 'Utilisateur',
      render: (r) =>
        r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonyme',
    },
    {
      key: 'book',
      header: 'Livre',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.book?.coverUrl && (
            <img src={r.book.coverUrl} alt="" className="h-8 w-6 rounded object-cover" />
          )}
          <span className="truncate max-w-[200px]">{r.book?.title || '-'}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Note',
      render: (r) => renderStars(r.rating),
    },
    {
      key: 'comment',
      header: 'Commentaire',
      render: (r) => (
        <span className="truncate max-w-[250px] block text-gray-600">
          {r.comment || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (r) => (
        <Badge variant={statusVariant[r.status as ReviewStatus] || 'neutral'}>
          {t(`status.${(r.status || 'visible').toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-1">
          {r.status === ReviewStatus.VISIBLE || r.status === ReviewStatus.REPORTED ? (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<EyeOff size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleHide(r.id);
              }}
            >
              {t('actions.hide')}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Eye size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleUnhide(r.id);
              }}
            >
              {t('actions.unhide')}
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r.id);
            }}
          >
            {t('actions.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title={t('nav.reviews')} />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-72">
            <SearchBar value={table.search} onChange={table.setSearch} />
          </div>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              table.setPage(1);
            }}
          >
            <option value="">Tous les statuts</option>
            {Object.values(ReviewStatus).map((s) => (
              <option key={s} value={s}>
                {t(`status.${s.toLowerCase()}`)}
              </option>
            ))}
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
            keyExtractor={(r) => r.id}
          />
        </div>
      </div>
    </>
  );
}
