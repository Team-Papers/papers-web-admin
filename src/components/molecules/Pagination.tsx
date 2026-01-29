import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm text-gray-500">
        {t('pagination.showing', { from, to, total })}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={16} /> {t('pagination.previous')}
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          {t('pagination.next')} <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
