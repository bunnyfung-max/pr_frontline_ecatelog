'use client';

import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { api } from '@/lib/client';
import { DEMO_CMS_PASSWORD_DEFAULT } from '@/lib/cms-password';
import type { Session } from '@/lib/types';

export function CmsAccessGate({
  demo,
  onUnlock,
  onCancel,
}: {
  demo: boolean;
  onUnlock: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <main className="cms-access-shell">
      <form
        className="login-card cms-access-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setBusy(true);
          const form = new FormData(e.currentTarget);
          try {
            await api<{ cmsUnlocked: boolean; session: Session }>('/api/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'unlock-cms', password: form.get('password') }),
            });
            onUnlock();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <LockKeyhole size={32} aria-hidden="true" />
        <span className="eyebrow">CONTENT MANAGEMENT</span>
        <h2>進入內容管理</h2>
        <p>
          {demo
            ? '請輸入內容管理密碼。離開內容管理後，再次進入需要重新驗證。'
            : '請再次輸入管理員密碼以進入內容管理。離開後再次進入需要重新驗證。'}
        </p>
        <label>
          內容管理密碼
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        {demo && (
          <p className="cms-access-hint">示例密碼：{DEMO_CMS_PASSWORD_DEFAULT}</p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="cms-access-actions">
          <button className="primary" disabled={busy}>
            {busy ? '驗證中…' : '進入內容管理'}
            <ArrowRight size={18} />
          </button>
          <button type="button" className="secondary" onClick={onCancel} disabled={busy}>
            返回展示
          </button>
        </div>
      </form>
    </main>
  );
}
