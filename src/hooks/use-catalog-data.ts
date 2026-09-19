'use client';
import { useEffect, useState } from 'react';
import type { Catalog, Session } from '@/lib/types';
import { api } from '@/lib/client';

export function useCatalogData(
  session: Session | null,
  cmsMode: boolean,
  cmsUnlocked: boolean,
  refreshKey: number,
) {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setData(null);
    setError('');
    api<Catalog>(`/api/catalog${cmsMode && cmsUnlocked ? '?cms=1' : ''}`)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [session, cmsMode, cmsUnlocked, refreshKey]);

  return { data, setData, error, setError };
}
