'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Folder, Trash2 } from 'lucide-react';

export function CmsFolderCard({
  name,
  description,
  meta,
  index,
  icon: Icon = Folder,
  tone = 0,
  onOpen,
  onDelete,
  deleteBlocked,
  deleteTitle,
}: {
  name: string;
  description?: string;
  meta?: string;
  index?: number;
  icon?: LucideIcon;
  tone?: number;
  onOpen: () => void;
  onDelete: () => void;
  deleteBlocked?: boolean;
  deleteTitle?: string;
}) {
  return (
    <div className="tool-card tool-card-managed cms-folder-card">
      <button type="button" className="tool-card-open" onClick={onOpen}>
        <div className={`tool-icon tone-${tone % 3}`}>
          <Icon size={26} strokeWidth={1.5} />
        </div>
        {index !== undefined && (
          <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
        )}
        <h3>{name}</h3>
        <p>{description || meta}</p>
      </button>
      <div className="tool-card-footer">
        <button type="button" className="tool-card-footer-main" onClick={onOpen}>
          <span>管理內容</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <div className="tool-card-footer-actions">
          <button
            type="button"
            className="icon-btn tool-card-delete"
            aria-label={`刪除 ${name}`}
            title={deleteTitle || (deleteBlocked ? '請先清空子目錄及內容' : `刪除 ${name}`)}
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
