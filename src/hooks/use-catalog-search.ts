'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Catalog } from '@/lib/types';
import {
  EMPTY_SEARCH_FACETS,
  buildSearchVocabulary,
  hasActiveFacets,
  searchCatalogEnhanced,
  searchScopeSummary,
  type EnhancedSearchResults,
  type SearchCategory,
  type SearchFacets,
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
  const [facets, setFacets] = useState<SearchFacets>(EMPTY_SEARCH_FACETS);
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
  const active = !!debouncedQuery.trim() || hasActiveFacets(facets);
  const results: EnhancedSearchResults | null = useMemo(() => {
    if (!active) return null;
    return searchCatalogEnhanced(data, folderId, debouncedQuery, { includeDrafts, facets });
  }, [active, data, debouncedQuery, facets, folderId, includeDrafts]);

  const resetFacets = useCallback(() => setFacets(EMPTY_SEARCH_FACETS), []);

  const toggleFacetSpace = useCallback((space: string) => {
    setFacets((current) => ({
      ...current,
      spaces: current.spaces.includes(space)
        ? current.spaces.filter((item) => item !== space)
        : [...current.spaces, space],
    }));
  }, []);

  const toggleFacetBrand = useCallback((brand: string) => {
    setFacets((current) => ({
      ...current,
      brands: current.brands.includes(brand)
        ? current.brands.filter((item) => item !== brand)
        : [...current.brands, brand],
    }));
  }, []);

  const toggleFacetEshop = useCallback(() => {
    setFacets((current) => ({ ...current, hasEshop: !current.hasEshop }));
  }, []);

  return {
    results,
    facets,
    setFacets,
    resetFacets,
    toggleFacetSpace,
    toggleFacetBrand,
    toggleFacetEshop,
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
