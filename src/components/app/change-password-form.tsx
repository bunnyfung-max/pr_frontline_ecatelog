'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import { Modal } from '../ui';

export function ChangePasswordForm({
  email,
  close,
  saved,
}: {
  email: string;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="更改密碼" close={close}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          const form = new FormData(e.currentTarget);
          const currentPassword = String(form.get('currentPassword') || '');
          const newPassword = String(form.get('newPassword') || '');
          const confirmPassword = String(form.get('confirmPassword') || '');
          if (newPassword !== confirmPassword) {
            setError('兩次輸入的新密碼不相同。');
            return;
          }
          if (newPassword === currentPassword) {
            setError('新密碼不可與現有密碼相同。');
            return;
          }
          setBusy(true);
          try {
            await api('/api/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'change-password',
                currentPassword,
                newPassword,
                confirmPassword,
              }),
            });
            saved();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="password-form-note">輸入現有密碼，並將新密碼輸入兩次。</p>
        <input type="hidden" name="username" autoComplete="username" value={email} readOnly />
        <label>
          現有密碼
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={500}
          />
        </label>
        <label>
          新密碼
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={500}
          />
          <small>至少 8 個字元。</small>
        </label>
        <label>
          再次輸入新密碼
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={500}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? '更新中…' : '更新密碼'}
        </button>
      </form>
    </Modal>
  );
}
