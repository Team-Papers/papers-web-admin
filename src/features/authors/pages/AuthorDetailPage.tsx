import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, BookOpen, DollarSign, TrendingUp, TrendingDown,
  Users, Globe, Mail, Phone, Calendar,
  Copy, Check, ExternalLink,
} from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { getAuthorById } from '@/lib/api/authors';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils/formatters';
import type { AuthorDetail } from '@/types/models';
import { AuthorStatus, BookStatus } from '@/types/models';

const statusVariant = {
  [AuthorStatus.PENDING]: 'warning',
  [AuthorStatus.APPROVED]: 'success',
  [AuthorStatus.REJECTED]: 'error',
} as const;

const bookStatusVariant = {
  [BookStatus.DRAFT]: 'neutral',
  [BookStatus.PENDING]: 'warning',
  [BookStatus.APPROVED]: 'success',
  [BookStatus.REJECTED]: 'error',
  [BookStatus.PUBLISHED]: 'info',
} as const;

function CopyableId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const short = value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors"
      title={value}
    >
      {short}
      {copied ? <Check size={10} className="text-success" /> : <Copy size={10} />}
    </button>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{children}</span>
    </div>
  );
}

export function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(false);
      getAuthorById(id)
        .then(setAuthor)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !author) {
    return (
      <>
        <Header title="Auteur" />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
            <Users size={24} className="text-error" />
          </div>
          <p className="text-lg font-medium text-on-surface">Auteur introuvable</p>
          <p className="text-sm text-on-surface-variant">Cet auteur n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate('/authors')}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux auteurs
          </button>
        </div>
      </>
    );
  }

  const fullName = author.user
    ? `${author.user.firstName} ${author.user.lastName}`
    : 'Auteur';
  const displayName = author.penName || fullName;
  const books = author.books ?? [];
  const transactions = author.transactions ?? [];
  const publishedBooks = books.filter((b) => b.status === BookStatus.PUBLISHED);
  const totalBookSales = books.reduce((acc, b) => acc + (b._count?.purchases ?? 0), 0);

  return (
    <>
      <Header title={displayName} />
      <div className="space-y-6 p-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/authors')}
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux auteurs
        </button>

        {/* Hero card */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="shrink-0">
              {author.photoUrl ? (
                <img
                  src={author.photoUrl}
                  alt={displayName}
                  className="h-24 w-24 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-container text-3xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-on-surface">{displayName}</h1>
                <Badge variant={statusVariant[author.status]}>
                  {t(`status.${author.status.toLowerCase()}`)}
                </Badge>
              </div>

              {author.penName && (
                <p className="text-sm text-on-surface-variant">
                  Nom réel : {fullName}
                </p>
              )}

              {author.bio && (
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {author.bio}
                </p>
              )}

              {author.rejectionReason && (
                <div className="rounded-lg bg-error-container/30 border border-error/20 px-3 py-2">
                  <p className="text-sm text-error">
                    <span className="font-medium">Motif de rejet :</span> {author.rejectionReason}
                  </p>
                </div>
              )}

              {/* Social links */}
              <div className="flex flex-wrap gap-3 pt-1">
                {author.user?.email && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Mail size={12} />
                    {author.user.email}
                  </span>
                )}
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Globe size={12} />
                    Site web
                    <ExternalLink size={10} />
                  </a>
                )}
                {author.twitter && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                    𝕏 {author.twitter}
                  </span>
                )}
                {author.facebook && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                    Facebook: {author.facebook}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm animate-fade-up">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Revenus totaux</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(author.totalRevenue ?? 0)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-container">
                <DollarSign size={18} className="text-success" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm animate-fade-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Solde actuel</p>
                <p className="mt-1 text-2xl font-bold text-success">{formatCurrency(Number(author.balance ?? 0))}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
                <DollarSign size={18} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Ventes complétées</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{author.totalSales ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
                <TrendingUp size={18} className="text-accent-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Retraits</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{formatCurrency(author.totalWithdrawals ?? 0)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-container">
                <TrendingDown size={18} className="text-warning" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Livres</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{books.length}</p>
                <p className="text-xs text-on-surface-variant">{publishedBooks.length} publiés</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-container">
                <BookOpen size={18} className="text-warning" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm animate-fade-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant">Followers</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">{author._count?.followers ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
                <Users size={18} className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Two columns: Author info + Payment info */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Author info */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2 className="mb-4 text-base font-semibold text-on-surface flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Informations de l'auteur
            </h2>
            <div className="divide-y divide-outline-variant">
              <InfoRow label="ID Auteur"><CopyableId value={author.id} /></InfoRow>
              <InfoRow label="Nom d'utilisateur">{fullName}</InfoRow>
              {author.penName && <InfoRow label="Nom de plume">{author.penName}</InfoRow>}
              {author.user?.email && <InfoRow label="Email">{author.user.email}</InfoRow>}
              {author.user && (
                <InfoRow label="Rôle">
                  <Badge variant={author.user.role === 'ADMIN' ? 'error' : author.user.role === 'AUTHOR' ? 'info' : 'neutral'}>
                    {author.user.role}
                  </Badge>
                </InfoRow>
              )}
              {author.user && (
                <InfoRow label="Statut compte">
                  <Badge variant={author.user.status === 'ACTIVE' ? 'success' : author.user.status === 'SUSPENDED' ? 'warning' : 'error'}>
                    {author.user.status}
                  </Badge>
                </InfoRow>
              )}
              <InfoRow label="Statut auteur">
                <Badge variant={statusVariant[author.status]}>
                  {t(`status.${author.status.toLowerCase()}`)}
                </Badge>
              </InfoRow>
              <InfoRow label="Inscrit le">{formatDate(author.createdAt)}</InfoRow>
              {author.user?.createdAt && (
                <InfoRow label="Compte créé le">{formatDate(author.user.createdAt)}</InfoRow>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '150ms' }}>
            <h2 className="mb-4 text-base font-semibold text-on-surface flex items-center gap-2">
              <Phone size={16} className="text-success" />
              Informations de paiement
            </h2>
            <div className="divide-y divide-outline-variant">
              <InfoRow label="Solde actuel">
                <span className="text-lg font-bold text-success">{formatCurrency(Number(author.balance ?? 0))}</span>
              </InfoRow>
              <InfoRow label="Revenus totaux">{formatCurrency(author.totalRevenue ?? 0)}</InfoRow>
              <InfoRow label="Total retiré">{formatCurrency(author.totalWithdrawals ?? 0)}</InfoRow>
              <InfoRow label="Nombre de ventes">{author.totalSales ?? 0}</InfoRow>
              <InfoRow label="MTN Mobile Money">
                {author.mtnNumber ? (
                  <span className="font-mono text-sm">{author.mtnNumber}</span>
                ) : (
                  <span className="text-on-surface-variant">Non renseigné</span>
                )}
              </InfoRow>
              <InfoRow label="Orange Money">
                {author.omNumber ? (
                  <span className="font-mono text-sm">{author.omNumber}</span>
                ) : (
                  <span className="text-on-surface-variant">Non renseigné</span>
                )}
              </InfoRow>
              {author.website && (
                <InfoRow label="Site web">
                  <a href={author.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    {author.website.replace(/^https?:\/\//, '')}
                    <ExternalLink size={10} />
                  </a>
                </InfoRow>
              )}
            </div>
          </div>
        </div>

        {/* Books list */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
              <BookOpen size={16} className="text-warning" />
              Livres ({books.length})
            </h2>
            <span className="text-xs text-on-surface-variant">{totalBookSales} ventes au total</span>
          </div>
          {books.length > 0 ? (
            <div className="space-y-2">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="flex cursor-pointer items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-surface-container"
                >
                  {/* Cover */}
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="" className="h-14 w-10 shrink-0 rounded-lg object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                      <BookOpen size={14} className="text-on-surface-variant" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{book.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={bookStatusVariant[book.status]}>
                        {t(`status.${book.status.toLowerCase()}`)}
                      </Badge>
                      <span className="text-xs text-on-surface-variant">{formatCurrency(book.price)}</span>
                      {book.publishedAt && (
                        <span className="text-xs text-on-surface-variant">
                          <Calendar size={10} className="mr-0.5 inline" />
                          {formatDate(book.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{book._count?.purchases ?? 0}</p>
                        <p className="text-xs text-on-surface-variant">ventes</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{book._count?.reviews ?? 0}</p>
                        <p className="text-xs text-on-surface-variant">avis</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant">Aucun livre</p>
          )}
        </div>

        {/* Recent transactions */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
              <DollarSign size={16} className="text-success" />
              Transactions récentes
            </h2>
            <span className="text-xs text-on-surface-variant">{transactions.length} dernières</span>
          </div>
          {transactions.length > 0 ? (
            <div className="space-y-1">
              {transactions.map((tx) => {
                const isSale = tx.type === 'SALE';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-surface-container"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isSale ? 'bg-success-container' : 'bg-error-container'}`}>
                        {isSale ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-error" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {isSale ? 'Vente' : 'Retrait'}
                          {tx.book && <span className="text-on-surface-variant"> — {tx.book.title}</span>}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">{formatDateTime(tx.createdAt)}</span>
                          <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'error'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isSale ? 'text-success' : 'text-error'}`}>
                      {isSale ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant">Aucune transaction</p>
          )}
        </div>
      </div>
    </>
  );
}
