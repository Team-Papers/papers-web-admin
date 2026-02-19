import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Trash2, Heart, Calendar, Tag } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Modal } from '@/components/molecules/Modal';
import { Spinner } from '@/components/atoms/Spinner';
import { getArticleById, deleteArticle } from '@/lib/api/blog';
import { BlogModal } from '../components/BlogModal';
import { formatDateTime } from '@/lib/utils/formatters';
import type { Article } from '@/types/models';
import { ArticleStatus } from '@/types/models';

const statusVariant = {
  [ArticleStatus.DRAFT]: 'neutral',
  [ArticleStatus.PUBLISHED]: 'success',
  [ArticleStatus.ARCHIVED]: 'warning',
} as const;

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchArticle = () => {
    if (!id) return;
    setLoading(true);
    getArticleById(id)
      .then(setArticle)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArticle(); }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteArticle(id);
      navigate('/blog');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Article" />
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Header title="Article" />
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <p className="text-gray-500">Article non trouvé</p>
          <Button variant="secondary" onClick={() => navigate('/blog')}>Retour</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={article.title} />
      <div className="p-6 space-y-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/blog')}>
            Retour
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<Edit2 size={16} />} onClick={() => setShowEdit(true)}>
              {t('actions.edit')}
            </Button>
            <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => setShowDelete(true)}>
              {t('actions.delete')}
            </Button>
          </div>
        </div>

        {/* Article card */}
        <div className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
          {article.coverUrl && (
            <img src={article.coverUrl} alt={article.title} className="h-64 w-full object-cover" />
          )}
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusVariant[article.status]}>
                {t(`status.${article.status.toLowerCase()}`)}
              </Badge>
              {article.category && (
                <span className="flex items-center gap-1 text-sm text-primary-500">
                  <Tag size={14} />
                  {article.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Heart size={14} />
                {article.likesCount} likes
              </span>
            </div>

            <h1 className="text-2xl font-bold text-on-surface">{article.title}</h1>

            {article.excerpt && (
              <p className="text-sm text-on-surface-variant italic">{article.excerpt}</p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Créé le {formatDateTime(article.createdAt)}
              </span>
              {article.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Publié le {formatDateTime(article.publishedAt)}
                </span>
              )}
            </div>

            <hr className="border-outline-variant" />

            <div className="prose prose-sm max-w-none text-on-surface whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </div>
      </div>

      <BlogModal
        isOpen={showEdit}
        article={article}
        onClose={() => setShowEdit(false)}
        onSuccess={() => { setShowEdit(false); fetchArticle(); }}
      />

      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer l'article ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>{t('actions.cancel')}</Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>{t('actions.delete')}</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Cette action est irréversible. L'article sera définitivement supprimé.</p>
      </Modal>
    </>
  );
}
