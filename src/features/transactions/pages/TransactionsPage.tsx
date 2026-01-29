import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/organisms/Header';
import { DataTable, type Column } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { useDataTable } from '@/lib/hooks/useDataTable';
import { getTransactions } from '@/lib/api/transactions';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import type { Transaction } from '@/types/models';
import { TransactionType } from '@/types/models';

export function TransactionsPage() {
  const { t } = useTranslation();
  const fetchFn = useCallback((p: Record<string, unknown>) => getTransactions(p as Parameters<typeof getTransactions>[0]), []);
  const table = useDataTable<Transaction>(fetchFn);

  const columns: Column<Transaction>[] = [
    { key: 'type', header: 'Type', render: (tx) => <Badge variant={tx.type === TransactionType.SALE ? 'success' : 'info'}>{tx.type === TransactionType.SALE ? 'Vente' : 'Retrait'}</Badge> },
    { key: 'amount', header: 'Montant', render: (tx) => <span className="font-medium">{formatCurrency(tx.amount)}</span> },
    { key: 'user', header: 'Utilisateur', render: (tx) => tx.user ? `${tx.user.firstName} ${tx.user.lastName}` : tx.userId },
    { key: 'book', header: 'Livre', render: (tx) => tx.book?.title || '-' },
    { key: 'createdAt', header: 'Date', render: (tx) => formatDateTime(tx.createdAt) },
  ];

  return (
    <>
      <Header title={t('nav.transactions')} />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={table.filters.type || ''}
            onChange={(e) => table.setFilters({ ...table.filters, type: e.target.value })}
          >
            <option value="">Tous les types</option>
            <option value="SALE">Vente</option>
            <option value="WITHDRAWAL">Retrait</option>
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white">
          <DataTable columns={columns} data={table.data} isLoading={table.isLoading} page={table.page} totalPages={table.totalPages} total={table.total} limit={table.limit} onPageChange={table.setPage} keyExtractor={(tx) => tx.id} />
        </div>
      </div>
    </>
  );
}
