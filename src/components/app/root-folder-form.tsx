'use client';
import { useState } from 'react';
import { save } from '@/lib/client';
import { Modal } from '../ui';

export function RootFolderForm({
  order,
  close,
  saved,
}: {
  order: number;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="新增主目錄" close={close}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await save('folder', {
              id: crypto.randomUUID(),
              parentId: null,
              name: f.get('name'),
              subtitle: f.get('subtitle') || '',
              order: Number(f.get('order')),
            });
            saved();
            close();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          主目錄名稱
          <input name="name" required maxLength={200} placeholder="例如：VIP 專區" />
        </label>
        <label>
          簡短說明
          <input name="subtitle" maxLength={500} placeholder="顯示於主目錄卡片下方" />
        </label>
        <label>
          排列次序
          <input name="order" type="number" min={0} max={99999} defaultValue={order} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          建立主目錄
        </button>
      </form>
    </Modal>
  );
}
