'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@/lib/types';
import { api } from '@/lib/client';

export function useCatalogSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [cmsUnlocked, setCmsUnlocked] = useState(false);
  const [setup, setSetup] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const lockCms = useCallback(async () => {
    try {
      await api('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lock-cms' }),
      });
    } catch {
      /* ignore */
    }
    setCmsUnlocked(false);
  }, []);

  useEffect(() => {
    api<{ setup?: boolean; session?: Session; cmsUnlocked?: boolean }>('/api/session')
      .then((r) => {
        setSetup(!!r.setup);
        setSession(r.session || null);
        setCmsUnlocked(!!r.cmsUnlocked);
      })
      .catch((e) => {
        if (!e.message.includes('請先登入')) setError(e.message);
      })
      .finally(() => setReady(true));
  }, []);

  return {
    session,
    setSession,
    cmsUnlocked,
    setCmsUnlocked,
    setup,
    ready,
    error,
    setError,
    lockCms,
  };
}
