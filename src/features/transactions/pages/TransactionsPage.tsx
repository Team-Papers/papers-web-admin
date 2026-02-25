import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, User, DollarSign, CreditCard,
  TrendingUp, TrendingDown, FileText, Copy, Check,
} from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Modal } from '@/components/molecules/Modal';
import { Spinner } from '@/components/atoms/Spinner';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getTransactions, getTransactionById } from '@/lib/api/transactions';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import type { Transaction } from '@/types/models';
import { TransactionType } from '@/types/models';

function CopyableId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const short = value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;

  const copy = () => {
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

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-on-surface">
        {icon}
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{children}</span>
    </div>
  );
}

function PersonCard({ avatarUrl, name, email, role }: { avatarUrl?: string | null; name: string; email: string; role?: string }) {
  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-on-surface">{name}</p>
        <p className="truncate text-xs text-on-surface-variant">{email}</p>
        {role && <Badge variant="neutral" className="mt-0.5">{role}</Badge>}
      </div>
    </div>
  );
}

export function TransactionsPage() {
  const { t } = useTranslation();
  const fetchFn = useCallback((p: Record<string, unknown>) => getTransactions(p as Parameters<typeof getTransactions>[0]), []);
  const table = useDataTable<Transaction>(fetchFn);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetail = async (tx: Transaction) => {
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const full = await getTransactionById(tx.id);
      setSelectedTx(full);
    } catch {
      setSelectedTx(tx);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTx(null);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (tx) => (
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.type === TransactionType.SALE ? 'bg-success-container' : 'bg-error-container'}`}>
            {tx.type === TransactionType.SALE ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-error" />}
          </div>
          <Badge variant={tx.type === TransactionType.SALE ? 'success' : 'info'}>
            {tx.type === TransactionType.SALE ? 'Vente' : 'Retrait'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Montant',
      render: (tx) => (
        <span className={`font-semibold ${tx.type === TransactionType.SALE ? 'text-success' : 'text-error'}`}>
          {tx.type === TransactionType.SALE ? '+' : '-'}{formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: 'buyer',
      header: 'Acheteur',
      render: (tx) => {
        const buyer = tx.purchase?.user;
        if (!buyer) return <span className="text-on-surface-variant">—</span>;
        return (
          <div className="flex items-center gap-2">
            {buyer.avatarUrl ? (
              <img src={buyer.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-primary">
                {buyer.firstName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{buyer.firstName} {buyer.lastName}</p>
              <p className="truncate text-xs text-on-surface-variant">{buyer.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'author',
      header: 'Auteur',
      render: (tx) => {
        const author = tx.author;
        if (!author) return <span className="text-on-surface-variant">—</span>;
        const name = author.penName || `${author.user.firstName} ${author.user.lastName}`;
        return (
          <div className="flex items-center gap-2">
            {author.photoUrl ? (
              <img src={author.photoUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success-container text-xs font-bold text-success">
                {name.charAt(0)}
              </div>
            )}
            <span className="truncate text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      key: 'book',
      header: 'Livre',
      render: (tx) => {
        if (!tx.book) return <span className="text-on-surface-variant">—</span>;
        return (
          <div className="flex items-center gap-2">
            {tx.book.coverUrl ? (
              <img src={tx.book.coverUrl} alt="" className="h-8 w-6 rounded object-cover" />
            ) : (
              <div className="flex h-8 w-6 items-center justify-center rounded bg-surface-container">
                <BookOpen size={10} className="text-on-surface-variant" />
              </div>
            )}
            <span className="truncate text-sm">{tx.book.title}</span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (tx) => <span className="text-sm text-on-surface-variant">{formatDateTime(tx.createdAt)}</span>,
    },
  ];

  return (
    <>
      <Header title={t('nav.transactions')} />
      <div className="space-y-4 p-6">
        <div className="flex gap-3">
          <select
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            value={table.filters.type || ''}
            onChange={(e) => table.setFilters({ ...table.filters, type: e.target.value })}
          >
            <option value="">Tous les types</option>
            <option value="SALE">Ventes</option>
            <option value="WITHDRAWAL">Retraits</option>
          </select>
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
          onRowClick={openDetail}
          keyExtractor={(tx) => tx.id}
        />
      </div>

      {/* Transaction Detail Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Détails de la transaction" size="xl">
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : selectedTx ? (
          <div className="space-y-4">
            {/* Header summary */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedTx.type === TransactionType.SALE ? 'bg-success-container' : 'bg-error-container'}`}>
                  {selectedTx.type === TransactionType.SALE ? <TrendingUp size={20} className="text-success" /> : <TrendingDown size={20} className="text-error" />}
                </div>
                <div>
                  <p className="text-lg font-bold text-on-surface">
                    {selectedTx.type === TransactionType.SALE ? 'Vente' : 'Retrait'}
                  </p>
                  <p className="text-xs text-on-surface-variant">{formatDateTime(selectedTx.createdAt)}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${selectedTx.type === TransactionType.SALE ? 'text-success' : 'text-error'}`}>
                {selectedTx.type === TransactionType.SALE ? '+' : '-'}{formatCurrency(selectedTx.amount)}
              </p>
            </div>

            {/* Transaction Info */}
            <DetailSection icon={<FileText size={16} className="text-primary" />} title="Informations de la transaction">
              <DetailRow label="ID Transaction"><CopyableId value={selectedTx.id} /></DetailRow>
              {selectedTx.reference && <DetailRow label="Référence"><CopyableId value={selectedTx.reference} /></DetailRow>}
              {selectedTx.status && (
                <DetailRow label="Statut">
                  <Badge variant={selectedTx.status === 'COMPLETED' ? 'success' : selectedTx.status === 'PENDING' ? 'warning' : 'neutral'}>
                    {selectedTx.status}
                  </Badge>
                </DetailRow>
              )}
              <DetailRow label="Montant brut">{formatCurrency(selectedTx.amount)}</DetailRow>
              {selectedTx.commission != null && (
                <DetailRow label="Commission">{formatCurrency(selectedTx.commission)}</DetailRow>
              )}
              {selectedTx.netAmount != null && (
                <DetailRow label="Montant net">
                  <span className="font-bold text-success">{formatCurrency(selectedTx.netAmount)}</span>
                </DetailRow>
              )}
              <DetailRow label="Date">{formatDateTime(selectedTx.createdAt)}</DetailRow>
            </DetailSection>

            {/* Buyer (from purchase) */}
            {selectedTx.purchase && (
              <DetailSection icon={<User size={16} className="text-primary" />} title="Acheteur">
                <PersonCard
                  avatarUrl={selectedTx.purchase.user.avatarUrl}
                  name={`${selectedTx.purchase.user.firstName} ${selectedTx.purchase.user.lastName}`}
                  email={selectedTx.purchase.user.email}
                  role={selectedTx.purchase.user.role}
                />
                <div className="mt-2 space-y-2 border-t border-outline-variant pt-2">
                  <DetailRow label="ID Achat"><CopyableId value={selectedTx.purchase.id} /></DetailRow>
                  <DetailRow label="Montant payé">{formatCurrency(selectedTx.purchase.amount)}</DetailRow>
                  {selectedTx.purchase.paymentMethod && (
                    <DetailRow label="Moyen de paiement">
                      <div className="flex items-center gap-1">
                        <CreditCard size={12} />
                        {selectedTx.purchase.paymentMethod}
                      </div>
                    </DetailRow>
                  )}
                  {selectedTx.purchase.paymentRef && (
                    <DetailRow label="Réf. paiement"><CopyableId value={selectedTx.purchase.paymentRef} /></DetailRow>
                  )}
                  <DetailRow label="Statut achat">
                    <Badge variant={selectedTx.purchase.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {selectedTx.purchase.status}
                    </Badge>
                  </DetailRow>
                </div>
              </DetailSection>
            )}

            {/* Author */}
            {selectedTx.author && (
              <DetailSection icon={<DollarSign size={16} className="text-success" />} title="Auteur (bénéficiaire)">
                <PersonCard
                  avatarUrl={selectedTx.author.photoUrl}
                  name={selectedTx.author.penName || `${selectedTx.author.user.firstName} ${selectedTx.author.user.lastName}`}
                  email={selectedTx.author.user.email}
                />
                <div className="mt-2 space-y-2 border-t border-outline-variant pt-2">
                  <DetailRow label="ID Auteur"><CopyableId value={selectedTx.author.id} /></DetailRow>
                </div>
              </DetailSection>
            )}

            {/* Book */}
            {selectedTx.book && (
              <DetailSection icon={<BookOpen size={16} className="text-warning" />} title="Livre">
                <div className="flex items-center gap-3">
                  {selectedTx.book.coverUrl ? (
                    <img src={selectedTx.book.coverUrl} alt="" className="h-16 w-12 rounded-lg object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-surface-container">
                      <BookOpen size={16} className="text-on-surface-variant" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-on-surface">{selectedTx.book.title}</p>
                    {selectedTx.book.price != null && (
                      <p className="text-sm text-on-surface-variant">Prix: {formatCurrency(selectedTx.book.price)}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-2 border-t border-outline-variant pt-2">
                  <DetailRow label="ID Livre"><CopyableId value={selectedTx.book.id} /></DetailRow>
                </div>
              </DetailSection>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
