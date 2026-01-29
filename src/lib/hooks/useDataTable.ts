import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import type { PaginatedResponse } from '@/types/api';

interface UseDataTableOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: Record<string, string>;
}

export function useDataTable<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<PaginatedResponse<T>>,
  options: UseDataTableOptions = {},
) {
  const { initialPage = 1, initialLimit = 10, initialFilters = {} } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(search);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit, ...filters };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await fetchFn(params);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, limit, debouncedSearch, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  return {
    data, total, totalPages, page, limit, search, filters, isLoading,
    setPage, setSearch, setFilters, refetch: fetchData,
  };
}
