'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assetUrl } from '@/lib/client';
import { cacheableAssetRefs } from '@/lib/catalog';
import { downloadCatalogAssets, getCachedAsset } from '@/lib/content-cache';
import type { Content } from '@/lib/types';

export type ContentCacheStatus = 'checking' | 'none' | 'partial' | 'ready' | 'downloading' | 'error';

function collectRefs(contents: Content[]): string[] {
  return [...new Set(contents.flatMap((content) => cacheableAssetRefs(content)))];
}

function useAssetCacheScope(contents: Content[]) {
  const refs = useMemo(() => collectRefs(contents), [contents]);
  const scopeKey = useMemo(() => contents.map((content) => content.id).join('\0'), [contents]);
  const [status, setStatus] = useState<ContentCacheStatus>('checking');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef<string[]>([]);

  const revokeUrls = useCallback(() => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  const hydrateFromCache = useCallback(async () => {
    if (!refs.length) {
      revokeUrls();
      setBlobUrls({});
      setStatus('ready');
      setProgress({ done: 0, total: 0 });
      return;
    }
    setStatus('checking');
    const nextUrls: Record<string, string> = {};
    const created: string[] = [];
    let cached = 0;
    for (const ref of refs) {
      const blob = await getCachedAsset(ref);
      if (blob) {
        const url = URL.createObjectURL(blob);
        nextUrls[ref] = url;
        created.push(url);
        cached += 1;
      }
    }
    revokeUrls();
    urlsRef.current = created;
    setBlobUrls(nextUrls);
    setProgress({ done: cached, total: refs.length });
    setStatus(cached === 0 ? 'none' : cached === refs.length ? 'ready' : 'partial');
  }, [refs, revokeUrls]);

  useEffect(() => {
    void hydrateFromCache();
    return () => revokeUrls();
  }, [scopeKey, hydrateFromCache, revokeUrls]);

  const resolveAssetUrl = useCallback(
    (ref: string) => blobUrls[ref] ?? assetUrl(ref),
    [blobUrls],
  );

  const download = useCallback(async () => {
    if (!refs.length || status === 'downloading') return;
    setError('');
    setStatus('downloading');
    setProgress({ done: 0, total: refs.length });
    try {
      await downloadCatalogAssets(contents, (done, total) => setProgress({ done, total }));
      await hydrateFromCache();
    } catch (e) {
      setError(e instanceof Error ? e.message : '下載緩存失敗。');
      setStatus('error');
      await hydrateFromCache();
    }
  }, [contents, hydrateFromCache, refs.length, status]);

  return {
    status,
    progress,
    error,
    resolveAssetUrl,
    download,
    hasAssets: refs.length > 0,
  };
}

export function useContentAssetCache(content: Content) {
  return useAssetCacheScope([content]);
}

export function useFolderAssetCache(contents: Content[]) {
  return useAssetCacheScope(contents);
}
