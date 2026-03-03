import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import type { PaginatedResponse } from '@/types/api';

interface UseDataTableOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: Record<string, string>;
  initialOrderBy?: string;
  initialDirection?: 'asc' | 'desc';
}

export function useDataTable<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<PaginatedResponse<T>>,
  options: UseDataTableOptions = {},
) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {},
    initialOrderBy,
    initialDirection = 'desc',
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [orderBy, setOrderBy] = useState<string | undefined>(initialOrderBy);
  const [direction, setDirection] = useState<'asc' | 'desc'>(initialDirection);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(search);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit, ...filters };
      if (debouncedSearch) params.q = debouncedSearch;
      if (orderBy) {
        params.orderBy = orderBy;
        params.direction = direction;
      }
      const res = await fetchFn(params);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, limit, debouncedSearch, filters, orderBy, direction]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters, orderBy, direction]);

  const setSort = useCallback((field: string, dir: 'asc' | 'desc') => {
    setOrderBy(field);
    setDirection(dir);
  }, []);

  const toggleSort = useCallback((field: string) => {
    if (orderBy === field) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(field);
      setDirection('desc');
    }
  }, [orderBy]);

  return {
    data, total, totalPages, page, limit, search, filters, orderBy, direction, isLoading,
    setPage, setSearch, setFilters, setSort, toggleSort, refetch: fetchData,
  };
}
