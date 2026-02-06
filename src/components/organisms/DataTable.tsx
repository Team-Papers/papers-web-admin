import { Inbox } from 'lucide-react';
import { Spinner } from '@/components/atoms/Spinner';
import { Pagination } from '@/components/molecules/Pagination';
import { useTranslation } from 'react-i18next';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({
  columns, data, isLoading, page, totalPages, total, limit, onPageChange, onRowClick, keyExtractor,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container mb-4">
          <Inbox className="h-7 w-7 text-on-surface-variant" />
        </div>
        <p className="text-sm font-medium text-on-surface">{t('table.noData')}</p>
        <p className="text-xs text-on-surface-variant mt-1">Aucune donnee a afficher</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`table-row transition-colors animate-fade-up ${
                  onRowClick ? 'cursor-pointer hover:bg-primary-container/10' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-5 py-4 text-on-surface ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="border-t border-outline-variant px-5 py-3 bg-surface-container/30">
          <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
