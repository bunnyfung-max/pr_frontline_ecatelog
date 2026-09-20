'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Catalog } from '@/lib/types';
import {
  buildSearchVocabulary,
  parseSearchQuery,
  SEARCH_CATEGORY_LABEL,
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
  const label = SEARCH_CATEGORY_LABEL[category];
  return term ? `${label} ${term}` : label;
}

export function composeSearchQuery(category: SearchCategory | null, term: string) {
  const trimmed = term.trim();
  if (!trimmed) return '';
  if (!category) return trimmed;
  return formatCategoryQuery(category, trimmed);
}

export function splitSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return { category: null as SearchCategory | null, term: '' };
  for (const category of Object.keys(SEARCH_CATEGORY_LABEL) as SearchCategory[]) {
    const label = SEARCH_CATEGORY_LABEL[category];
    const prefix = `${label} `;
    if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
      return { category, term: trimmed.slice(prefix.length).trim() };
    }
    const colon = `${label}:`;
    if (trimmed.toLowerCase().startsWith(colon.toLowerCase())) {
      return { category, term: trimmed.slice(colon.length).trim() };
    }
  }
  return { category: null, term: trimmed };
}

export function searchDisplayLabel(category: SearchCategory | null, term: string) {
  const trimmed = term.trim();
  if (!trimmed) return '';
  if (!category) return trimmed;
  return `${SEARCH_CATEGORY_LABEL[category]} ${trimmed}`;
}

export type { SearchVocabulary };
