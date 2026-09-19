'use client';
import { useState } from 'react';
import { save } from '@/lib/client';
import { Modal } from '../ui';

export function FolderForm({
  parentId,
  close,
  saved,
}: {
  parentId: string;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="新增子資料夾" close={close}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await save('folder', {
              id: crypto.randomUUID(),
              parentId,
              name: f.get('name'),
              subtitle: '',
              order: Number(f.get('order')),
            });
            saved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          資料夾名稱
          <input name="name" required maxLength={200} />
        </label>
        <label>
          排列次序
          <input name="order" type="number" min={0} max={99999} defaultValue={0} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          建立資料夾
        </button>
      </form>
    </Modal>
  );
}
