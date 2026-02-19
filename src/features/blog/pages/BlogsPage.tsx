import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Heart, Image } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getArticles, deleteArticle } from '@/lib/api/blog';
import { formatDate } from '@/lib/utils/formatters';
import { BlogModal } from '../components/BlogModal';
import type { Article } from '@/types/models';
import { ArticleStatus } from '@/types/models';

const statusVariant = {
  [ArticleStatus.DRAFT]: 'neutral',
  [ArticleStatus.PUBLISHED]: 'success',
  [ArticleStatus.ARCHIVED]: 'warning',
} as const;

export function BlogsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFn = useCallback(
    (p: Record<string, unknown>) =>
      getArticles({ ...p, ...(statusFilter ? { status: statusFilter } : {}) } as Parameters<typeof getArticles>[0]),
    [statusFilter],
  );
  const table = useDataTable<Article>(fetchFn);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteArticle(deleteId);
      table.refetch();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Article>[] = [
    {
      key: 'cover',
      header: 'Image',
      render: (a) =>
        a.coverUrl ? (
          <img src={a.coverUrl} alt={a.title} className="h-12 w-20 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            <Image size={20} />
          </div>
        ),
    },
    {
      key: 'title',
      header: 'Titre',
      render: (a) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-[300px]">{a.title}</p>
          {a.category && <p className="text-xs text-primary-500">{a.category}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (a) => (
        <Badge variant={statusVariant[a.status]}>
          {t(`status.${a.status.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      key: 'likes',
      header: 'Likes',
      render: (a) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Heart size={14} />
          <span>{a.likesCount}</span>
        </div>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Publié le',
      render: (a) => a.publishedAt ? formatDate(a.publishedAt) : '-',
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      render: (a) => formatDate(a.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setEditArticle(a);
            }}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(a.id);
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title={t('nav.blog')} />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
              {Object.values(ArticleStatus).map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
            Nouvel article
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={table.data}
          isLoading={table.isLoading}
          page={table.page}
          totalPages={table.totalPages}
          total={table.total}
          limit={table.limit}
          onPageChange={table.setPage}
          onRowClick={(a) => navigate(`/blog/${a.id}`)}
          keyExtractor={(a) => a.id}
        />
      </div>

      <BlogModal
        isOpen={showCreate || !!editArticle}
        article={editArticle}
        onClose={() => { setShowCreate(false); setEditArticle(null); }}
        onSuccess={() => { setShowCreate(false); setEditArticle(null); table.refetch(); }}
      />

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer l'article ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>{t('actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>{t('actions.delete')}</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Cette action est irréversible. L'article sera définitivement supprimé.</p>
      </Modal>
    </>
  );
}
