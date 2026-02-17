import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-on-surface-variant">
        <span className="font-medium text-on-surface">{from}</span>
        {' - '}
        <span className="font-medium text-on-surface">{to}</span>
        {' sur '}
        <span className="font-medium text-on-surface">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Page precedente"
        >
          <ChevronLeft size={16} />
        </Button>

        {totalPages <= 7 ? (
          // Show all page numbers if 7 or fewer
          getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-8 px-2 rounded-lg text-sm font-medium transition-all ${
                  p === page
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-on-surface-variant">
                {p}
              </span>
            )
          )
        ) : (
          // Show condensed view for many pages
          <span className="px-3 text-sm text-on-surface-variant">
            Page <span className="font-medium text-on-surface">{page}</span> / {totalPages}
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
