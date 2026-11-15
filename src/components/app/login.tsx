'use client';
import { useState } from 'react';
import type { Session } from '@/lib/types';
import { api } from '@/lib/client';

export function Login({ onLogin, initialError }: { onLogin: (s: Session) => void; initialError: string }) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="ecat">
    <main className="shell entry-shell">
      <section className="login-cover" aria-label="門店展示封面">
        <img src="/frontline/demo/bedroom.webp" alt="家居展示空間效果" />
        <img className="storefront-photo" src="/frontline/figma/storefront.png" alt="Pricerite 實惠門店" />
        <span className="cover-badge">
          <i />
          門店專用 · 家居展示
        </span>
        <div className="cover-message">
          <p>EVERY HOME STARTS WITH A CONVERSATION</p>
          <h2>
            每個理想的家
            <br />
            由一次好對話開始
          </h2>
          <span>一起看看，家的每個可能。</span>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="entry-brand">
          <img src="/frontline/demo/logo.webp" alt="Pricerite 實惠" />
          <span>Frontline</span>
        </div>
        <form
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
          <div className="login-content">
          <p className="entry-kicker">WELCOME TO FRONTLINE</p>
          <h1 id="login-title">
            歡迎回來
            <br />
            登入門店銷售工具
          </h1>
          <label className="login-field">
            工作電郵
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="demo@example.com"
            />
          </label>
          <label className="login-field">
            密碼
            <span className="password-wrap">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                <img src="/frontline/icon-eye.svg" alt="" width={20} height={20} />
              </button>
            </span>
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="login-submit" disabled={busy}>
            {busy ? '登入中…' : '登入開啟'}
          </button>
          </div>
        </form>
        <p className="login-footer">內部專用 <i /> 正式帳戶請聯絡系統管理員 <i /> 家居資料展示</p>
      </section>
    </main>
    </div>
  );
}
