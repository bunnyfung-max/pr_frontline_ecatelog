'use client';
import { useState } from 'react';
import type { Folder } from '@/lib/types';
import { save } from '@/lib/client';
import { Modal } from '../ui';

export function FolderForm({
  parentId,
  folder,
  close,
  saved,
}: {
  parentId?: string;
  folder?: Folder;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = !!folder;
  return (
    <Modal title={editing ? '編輯資料夾' : '新增子資料夾'} close={close}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await save('folder', {
              id: folder?.id ?? crypto.randomUUID(),
              parentId: folder?.parentId ?? parentId ?? null,
              name: f.get('name'),
              subtitle: f.get('subtitle') || '',
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
          <input name="name" required maxLength={200} defaultValue={folder?.name} />
        </label>
        <label>
          簡短說明
          <input name="subtitle" maxLength={500} defaultValue={folder?.subtitle || ''} />
        </label>
        <label>
          排列次序
          <input
            name="order"
            type="number"
            min={0}
            max={99999}
            defaultValue={folder?.order ?? 0}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {editing ? '儲存資料夾' : '建立資料夾'}
        </button>
      </form>
    </Modal>
  );
}
