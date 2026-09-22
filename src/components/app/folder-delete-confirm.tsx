'use client';

import { Modal } from '../ui';

export function FolderDeleteConfirm({
  name,
  root,
  warnings,
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  name: string;
  root: boolean;
  warnings: string[];
  deleting: boolean;
  error: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const label = root ? '主目錄' : '資料夾';
  return (
    <Modal title={`刪除${label}`} close={deleting ? () => {} : onCancel}>
      <div className="form-body confirm-body">
        <p>
          確認刪除{label}「<strong>{name}</strong>」？
        </p>
        {warnings.length > 0 && (
          <p className="confirm-warning">此操作會同時刪除：{warnings.join('、')}。</p>
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
