import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { Avatar } from '@/components/atoms/Avatar';
import { Modal } from '@/components/molecules/Modal';
import { getBookById, approveBook, suspendBook, getBookDownloadLink } from '@/lib/api/books';
import { RejectBookModal } from '../components/RejectBookModal';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Book, Category } from '@/types/models';
import { BookStatus } from '@/types/models';

const statusVariant = {
  [BookStatus.DRAFT]: 'neutral',
  [BookStatus.PENDING]: 'warning',
  [BookStatus.APPROVED]: 'success',
  [BookStatus.REJECTED]: 'error',
  [BookStatus.PUBLISHED]: 'info',
} as const;

const statusLabels: Record<BookStatus, string> = {
  [BookStatus.DRAFT]: 'Brouillon',
  [BookStatus.PENDING]: 'En attente',
  [BookStatus.APPROVED]: 'Approuvé',
  [BookStatus.REJECTED]: 'Rejeté',
  [BookStatus.PUBLISHED]: 'Publié',
};

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const fetchBook = () => {
    if (!id) return;
    setLoading(true);
    getBookById(id)
      .then(setBook)
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Livre introuvable</p>
      </div>
    );
  }

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveBook(book.id);
      fetchBook();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await suspendBook(book.id);
      fetchBook();
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenFile = async () => {
    if (!book.fileUrl) return;
    setFileLoading(true);
    try {
      const { downloadUrl } = await getBookDownloadLink(book.id);
      // downloadUrl is like /api/v1/files/download?token=..., so use base URL without /api/v1
      const baseUrl = apiBaseUrl.replace('/api/v1', '');
      // Add inline=true for PDF preview in browser
      const fullUrl = `${baseUrl}${downloadUrl}&inline=true`;
      setFileUrl(fullUrl);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Failed to get download link:', error);
    } finally {
      setFileLoading(false);
    }
  };

  // Extract categories
  const categories: Category[] = (book.categories || []).map((c: Category | { category: Category }) =>
    'category' in c ? c.category : c
  );

  // Get author info
  const author = book.author;
  const authorUser = author?.user;

  // Build cover URL
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const coverUrl = book.coverUrl?.startsWith('http')
    ? book.coverUrl
    : book.coverUrl
      ? `${apiBaseUrl.replace('/api/v1', '')}${book.coverUrl}`
      : null;

  return (
    <>
      <Header title="Détails du livre" />
      <div className="p-6 space-y-6">
        {/* Book Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="flex-shrink-0">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="h-64 w-48 rounded-lg object-cover shadow-md cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(coverUrl, '_blank')}
                />
              ) : (
                <div className="h-64 w-48 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Pas de couverture</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
                  {book.slug && <p className="text-sm text-gray-500">/{book.slug}</p>}
                </div>
                <Badge variant={statusVariant[book.status]}>{statusLabels[book.status]}</Badge>
              </div>

              {book.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800">Motif du rejet :</p>
                  <p className="text-sm text-red-700">{book.rejectionReason}</p>
                </div>
              )}

              {/* Rejection History */}
              {book.rejectionHistory && book.rejectionHistory.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 mb-2">Historique des rejets ({book.rejectionHistory.length})</p>
                  <div className="space-y-2">
                    {book.rejectionHistory.map((rejection, index) => (
                      <div key={index} className="text-sm border-l-2 border-amber-300 pl-3">
                        <p className="text-amber-700">{rejection.reason}</p>
                        <p className="text-xs text-amber-600">{formatDate(rejection.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-600 whitespace-pre-line">{book.description || 'Pas de description'}</p>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {cat.icon} {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Prix</p>
                  <p className="font-semibold text-lg">{formatCurrency(book.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ventes</p>
                  <p className="font-semibold text-lg">{book._count?.purchases ?? book.totalSales ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avis</p>
                  <p className="font-semibold text-lg">{book._count?.reviews ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Format</p>
                  <p className="font-semibold text-lg uppercase">{book.fileFormat || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pages</p>
                  <p className="font-semibold">{book.pageCount || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Langue</p>
                  <p className="font-semibold uppercase">{book.language || 'FR'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-semibold">{book.isbn || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Créé le</p>
                  <p className="font-semibold">{formatDate(book.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {book.fileUrl && (
                  <Button variant="secondary" onClick={handleOpenFile} disabled={fileLoading}>
                    {fileLoading ? 'Chargement...' : 'Voir le fichier'}
                  </Button>
                )}
                {book.status === BookStatus.PENDING && (
                  <>
                    <Button variant="primary" onClick={handleApprove} disabled={actionLoading}>
                      {actionLoading ? 'Chargement...' : t('actions.approve')}
                    </Button>
                    <Button variant="danger" onClick={() => setRejectOpen(true)} disabled={actionLoading}>
                      {t('actions.reject')}
                    </Button>
                  </>
                )}
                {(book.status === BookStatus.APPROVED || book.status === BookStatus.PUBLISHED) && (
                  <Button variant="secondary" onClick={handleSuspend} disabled={actionLoading}>
                    {actionLoading ? 'Chargement...' : t('actions.suspend')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Author Info Card */}
        {author && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Informations sur l'auteur</h3>
            <div className="flex items-start gap-4">
              <Avatar
                src={author.photoUrl || authorUser?.avatarUrl}
                name={author.penName || `${authorUser?.firstName} ${authorUser?.lastName}`}
                size="lg"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-lg">
                    {author.penName || `${authorUser?.firstName} ${authorUser?.lastName}`}
                  </p>
                  {authorUser && (
                    <p className="text-sm text-gray-500">
                      {authorUser.firstName} {authorUser.lastName} • {authorUser.email}
                    </p>
                  )}
                </div>
                {author.bio && <p className="text-gray-600 text-sm">{author.bio}</p>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-500">Statut</p>
                    <Badge
                      variant={
                        author.status === 'APPROVED' ? 'success' : author.status === 'PENDING' ? 'warning' : 'error'
                      }
                    >
                      {author.status}
                    </Badge>
                  </div>
                  {author.balance !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Solde</p>
                      <p className="font-semibold">{formatCurrency(Number(author.balance))}</p>
                    </div>
                  )}
                  {author.mtnNumber && (
                    <div>
                      <p className="text-xs text-gray-500">MTN</p>
                      <p className="font-semibold">{author.mtnNumber}</p>
                    </div>
                  )}
                  {author.omNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Orange</p>
                      <p className="font-semibold">{author.omNumber}</p>
                    </div>
                  )}
                </div>
                {authorUser && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/users/${authorUser.id}`)}
                    className="mt-2"
                  >
                    Voir le profil utilisateur
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {book.reviews && book.reviews.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">Derniers avis ({book.reviews.length})</h3>
            <div className="space-y-4">
              {book.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src={review.user?.avatarUrl}
                      name={`${review.user?.firstName} ${review.user?.lastName}`}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      {'*'.repeat(review.rating)}
                      <span className="text-sm text-gray-500">({review.rating}/5)</span>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectBookModal
        bookId={rejectOpen ? book.id : null}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => {
          setRejectOpen(false);
          fetchBook();
        }}
      />

      {/* File Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => { setPreviewOpen(false); setFileUrl(null); }}
        title={`Apercu: ${book.title}`}
        size="xl"
      >
        <div className="flex flex-col h-[75vh]">
          {/* Check if PDF by format field or by file extension */}
          {(book.fileFormat?.toLowerCase() === 'pdf' || book.fileUrl?.toLowerCase().endsWith('.pdf')) && fileUrl ? (
            <>
              <iframe
                src={fileUrl}
                className="w-full flex-1 rounded border"
                title="PDF Preview"
              />
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => window.open(fileUrl.replace('&inline=true', ''), '_blank')}>
                  Telecharger le PDF
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  Apercu non disponible pour ce format ({book.fileFormat || book.fileUrl?.split('.').pop() || 'inconnu'})
                </p>
                {fileUrl && (
                  <Button variant="primary" onClick={() => window.open(fileUrl.replace('&inline=true', ''), '_blank')}>
                    Telecharger le fichier
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
