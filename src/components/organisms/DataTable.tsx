import { Spinner } from '@/components/atoms/Spinner';
import { Pagination } from '@/components/molecules/Pagination';
import { useTranslation } from 'react-i18next';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
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
    return <p className="py-12 text-center text-sm text-gray-500">{t('table.noData')}</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-gray-100 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={onPageChange} />
      )}
    </div>
  );
}
