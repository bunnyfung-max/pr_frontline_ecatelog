'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Catalog } from '@/lib/types';
import {
  buildSearchVocabulary,
  searchCatalogEnhanced,
  searchScopeSummary,
  type EnhancedSearchResults,
  type SearchCategory,
  type SearchVocabulary,
} from '@/lib/catalog-search';

export function useCatalogSearch(
  data: Catalog,
  folderId: string | null,
  query: string,
  options: { includeDrafts?: boolean; debounceMs?: number } = {},
) {
  const includeDrafts = options.includeDrafts ?? false;
  const debounceMs = options.debounceMs ?? 280;
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => setDebouncedQuery(query), [query]);
  useEffect(() => {
    if (query === debouncedQuery) return;
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debouncedQuery, debounceMs]);

  const vocabulary = useMemo(
    () => buildSearchVocabulary(data, folderId, includeDrafts),
    [data, folderId, includeDrafts],
  );
  const scope = useMemo(
    () => searchScopeSummary(data, folderId, includeDrafts),
    [data, folderId, includeDrafts],
  );
  const active = !!debouncedQuery.trim();
  const results: EnhancedSearchResults | null = useMemo(() => {
    if (!active) return null;
    return searchCatalogEnhanced(data, folderId, debouncedQuery, { includeDrafts });
  }, [active, data, debouncedQuery, folderId, includeDrafts]);

  return {
    results,
    vocabulary,
    scope,
    pending: query !== debouncedQuery,
    active,
  };
}

export function formatCategoryQuery(category: SearchCategory, term: string) {
  const label = { product: '產品', brand: '品牌', colour: '顏色', style: '風格', estate: '屋苑' }[
    category
  ];
  return term ? `${label} ${term}` : label;
}

export type { SearchVocabulary };
