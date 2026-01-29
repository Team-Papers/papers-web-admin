import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { getBooks, approveBook, suspendBook } from '@/lib/api/books';
import { RejectBookModal } from '../components/RejectBookModal';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { Book } from '@/types/models';
import { BookStatus } from '@/types/models';

const statusVariant = {
  [BookStatus.DRAFT]: 'neutral', [BookStatus.PENDING]: 'warning',
  [BookStatus.APPROVED]: 'success', [BookStatus.REJECTED]: 'error', [BookStatus.PUBLISHED]: 'info',
} as const;

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(false);

  const fetchBook = () => {
    if (!id) return;
    setLoading(true);
    getBooks({ limit: 100 })
      .then((res) => setBook(res.data.find((b) => b.id === id) || null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBook(); }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  if (!book) return <div className="flex h-full items-center justify-center"><p className="text-gray-500">Livre introuvable</p></div>;

  const handleApprove = async () => { await approveBook(book.id); fetchBook(); };
  const handleSuspend = async () => { await suspendBook(book.id); fetchBook(); };

  return (
    <>
      <Header title={book.title} />
      <div className="p-6 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex gap-6">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-48 w-36 rounded-lg object-cover" />
            ) : (
              <div className="h-48 w-36 rounded-lg bg-gray-200" />
            )}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{book.title}</h2>
                <Badge variant={statusVariant[book.status]}>{t(`status.${book.status.toLowerCase()}`)}</Badge>
              </div>
              <p className="text-gray-600">{book.description}</p>
              {book.rejectionReason && <p className="text-sm text-error">Motif : {book.rejectionReason}</p>}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div><p className="text-sm text-gray-500">Prix</p><p className="font-semibold">{formatCurrency(book.price)}</p></div>
                <div><p className="text-sm text-gray-500">Ventes</p><p className="font-semibold">{book.totalSales ?? 0}</p></div>
                <div><p className="text-sm text-gray-500">Publié le</p><p className="font-semibold">{formatDate(book.createdAt)}</p></div>
              </div>
              <div className="flex gap-2 pt-4">
                {book.status === BookStatus.PENDING && (
                  <>
                    <Button variant="primary" onClick={handleApprove}>{t('actions.approve')}</Button>
                    <Button variant="danger" onClick={() => setRejectOpen(true)}>{t('actions.reject')}</Button>
                  </>
                )}
                {(book.status === BookStatus.APPROVED || book.status === BookStatus.PUBLISHED) && (
                  <Button variant="secondary" onClick={handleSuspend}>{t('actions.suspend')}</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RejectBookModal bookId={rejectOpen ? book.id : null} onClose={() => setRejectOpen(false)} onSuccess={() => { setRejectOpen(false); fetchBook(); }} />
    </>
  );
}
