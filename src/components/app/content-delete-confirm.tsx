'use client';

import type { Content } from '@/lib/types';
import { Modal } from '../ui';

export function ContentDeleteConfirm({
  items,
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  items: Content[];
  deleting: boolean;
  error: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const count = items.length;
  const title = count === 1 ? '刪除內容' : `刪除 ${count} 項內容`;
  return (
    <Modal title={title} close={deleting ? () => {} : onCancel}>
      <div className="form-body confirm-body">
        {count === 1 ? (
          <p>
            確認刪除內容「<strong>{items[0].name}</strong>」？
          </p>
        ) : (
          <>
            <p>
              確認刪除以下 <strong>{count}</strong> 項內容？
            </p>
            <ul className="confirm-item-list">
              {items.slice(0, 5).map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
              {count > 5 && <li>…及其他 {count - 5} 項</li>}
            </ul>
          </>
        )}
        <p className="confirm-note">此操作不可復原。</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="modal-actions">
        <span />
        <button type="button" className="secondary" onClick={onCancel} disabled={deleting}>
          取消
        </button>
        <button type="button" className="danger" onClick={onConfirm} disabled={deleting}>
          {deleting ? '刪除中…' : '確認刪除'}
        </button>
      </div>
    </Modal>
  );
}
