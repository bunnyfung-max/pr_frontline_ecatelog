'use client';
import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import type { Session } from '@/lib/types';
import { api } from '@/lib/client';
import { TEST_LOGIN_ACCOUNTS } from '@/lib/test-login-accounts';

export function Login({ onLogin, initialError }: { onLogin: (s: Session) => void; initialError: string }) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  return (
    <main className="login-shell">
      <div className="login-art">
        <span className="brand">
          <img className="brand-logo" src="/pricerite-logo.svg" alt="Pricerite 實惠" />
          <span>Frontline</span>
        </span>
        <h1>
          每個理想的家，
          <br />
          由一次好對話開始。
        </h1>
        <img src="/demo/login-hero.jpg" alt="門市銷售工具展示" />
      </div>
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setBusy(true);
          const form = new FormData(e.currentTarget);
          try {
            const r = await api<{ session: Session }>('/api/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
            });
            onLogin(r.session);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <span className="eyebrow">WELCOME TO FRONTLINE</span>
        <h2>登入門市銷售工具</h2>
        <p>使用獲授權的員工帳戶，取閱銷售資料。</p>
        <label>
          工作電郵
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="name@company.com"
          />
        </label>
        <label>
          密碼
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? '登入中…' : '登入'}
          <ArrowRight size={18} />
        </button>
        <div className="login-accounts-hint">
          <p className="login-accounts-title">測試帳戶</p>
          <ul>
            {TEST_LOGIN_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <strong>{account.label}</strong>
                <span>{account.email}</span>
                <span>{account.password}</span>
              </li>
            ))}
          </ul>
        </div>
        <small>內部專用 · 正式帳戶請聯絡系統管理員。</small>
      </form>
    </main>
  );
}
