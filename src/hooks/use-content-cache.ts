'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assetUrl } from '@/lib/client';
import { cacheableAssetRefs } from '@/lib/catalog';
import { syncCatalogCache, type CacheSyncScope } from '@/lib/cache-sync';
import { getCachedAsset } from '@/lib/content-cache';
import type { Content } from '@/lib/types';

export type ContentCacheStatus = 'checking' | 'none' | 'partial' | 'ready' | 'downloading';

function collectRefs(contents: Content[]): string[] {
  return [...new Set(contents.flatMap((content) => cacheableAssetRefs(content)))];
}

function useAssetCacheScope(contents: Content[], syncScope: CacheSyncScope = 'folder') {
  const refsKey = collectRefs(contents).join('\0');
  const refs = useMemo(() => (refsKey ? refsKey.split('\0') : []), [refsKey]);
  const [status, setStatus] = useState<ContentCacheStatus>('checking');
  const [progress, setProgress] = useState({ done: 0, total: 0, phase: 'download' as 'remove' | 'download' });
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [cacheReady, setCacheReady] = useState(false);
  const blobUrlsRef = useRef(blobUrls);
  blobUrlsRef.current = blobUrls;
  const generationRef = useRef(0);

  useEffect(() => {
    const urls = Object.values(blobUrls);
    return () => {
      const live = new Set(Object.values(blobUrlsRef.current));
      for (const url of urls) if (!live.has(url)) URL.revokeObjectURL(url);
    };
  }, [blobUrls]);

  useEffect(
    () => () => {
      for (const url of Object.values(blobUrlsRef.current)) URL.revokeObjectURL(url);
      blobUrlsRef.current = {};
    },
    [],
  );

  const hydrateFromCache = useCallback(async () => {
    const generation = ++generationRef.current;
    setCacheReady(false);
    if (!refs.length) {
      setBlobUrls({});
      setStatus('ready');
      setProgress({ done: 0, total: 0, phase: 'download' });
      setCacheReady(true);
      return;
    }
    setStatus('checking');
    const entries = await Promise.all(
      refs.map(async (ref) => ({ ref, blob: await getCachedAsset(ref) })),
    );
    if (generation !== generationRef.current) return;
    // Asset refs are immutable, so a blob URL already made for a ref stays valid.
    const previous = blobUrlsRef.current;
    const nextUrls: Record<string, string> = {};
    let cached = 0;
    for (const { ref, blob } of entries) {
      if (!blob) continue;
      nextUrls[ref] = previous[ref] ?? URL.createObjectURL(blob);
      cached += 1;
    }
    setBlobUrls(nextUrls);
    setProgress({ done: cached, total: refs.length, phase: 'download' });
    setStatus(cached === 0 ? 'none' : cached === refs.length ? 'ready' : 'partial');
    setCacheReady(true);
  }, [refs]);

  useEffect(() => {
    void hydrateFromCache();
  }, [hydrateFromCache]);

  const resolveAssetUrl = useCallback((ref: string) => blobUrlsRef.current[ref] ?? assetUrl(ref), []);

  const download = useCallback(async () => {
    if (!refs.length || status === 'downloading') return;
    setStatus('downloading');
    setProgress({ done: 0, total: 0, phase: 'download' });
    await syncCatalogCache(contents, syncScope, ({ phase, done, total }) => {
      setProgress({ done, total, phase });
    });
    await hydrateFromCache();
  }, [contents, hydrateFromCache, refs.length, status, syncScope]);

  return {
    status,
    progress,
    resolveAssetUrl,
    download,
    hasAssets: refs.length > 0,
    cacheReady,
  };
}

export function useContentAssetCache(content: Content) {
  return useAssetCacheScope([content], 'folder');
}

export function useFolderAssetCache(contents: Content[], syncScope: CacheSyncScope = 'folder') {
  return useAssetCacheScope(contents, syncScope);
}
