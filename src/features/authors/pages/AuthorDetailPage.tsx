import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { getAuthors } from '@/lib/api/authors';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import type { AuthorProfile } from '@/types/models';
import { AuthorStatus } from '@/types/models';

const statusVariant = { [AuthorStatus.PENDING]: 'warning', [AuthorStatus.APPROVED]: 'success', [AuthorStatus.REJECTED]: 'error' } as const;

export function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getAuthors({ limit: 100 })
        .then((res) => {
          const found = res.data.find((a) => a.id === id);
          setAuthor(found || null);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  if (!author) return <div className="flex h-full items-center justify-center"><p className="text-gray-500">Auteur introuvable</p></div>;

  const raw = author as unknown as Record<string, unknown>;
  const booksCount = raw._count
    ? (raw._count as Record<string, number>).books
    : author.totalBooks ?? 0;

  return (
    <>
      <Header title={author.user ? `${author.user.firstName} ${author.user.lastName}` : 'Auteur'} />
      <div className="p-6 space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{author.user ? `${author.user.firstName} ${author.user.lastName}` : 'Auteur'}</h2>
            <Badge variant={statusVariant[author.status]}>{t(`status.${author.status.toLowerCase()}`)}</Badge>
          </div>
          <p className="text-gray-600">{author.bio}</p>
          {author.rejectionReason && <p className="text-sm text-error">Motif de rejet : {author.rejectionReason}</p>}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div><p className="text-sm text-gray-500">Livres</p><p className="text-lg font-semibold">{booksCount}</p></div>
            <div><p className="text-sm text-gray-500">Solde</p><p className="text-lg font-semibold">{formatCurrency(Number(author.totalRevenue ?? 0))}</p></div>
            <div><p className="text-sm text-gray-500">Inscrit le</p><p className="text-lg font-semibold">{formatDate(author.createdAt)}</p></div>
          </div>
        </div>
      </div>
    </>
  );
}
