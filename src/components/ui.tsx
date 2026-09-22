'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, ArrowUpRight, ChevronRight, Home, FolderOpen } from 'lucide-react';
import type { Folder } from '@/lib/types';
import { assetUrl } from '@/lib/client';
import { trail, folderLabel } from '@/lib/catalog';
export function Thumb({
  src,
  alt = '',
  className = '',
  fallbackLabel = '內容預覽',
}: {
  src: string;
  alt?: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (!src) {
    return (
      <div className={`placeholder ${className}`}>
        <ImageIcon size={34} strokeWidth={1.2} />
        <span>{fallbackLabel}</span>
      </div>
    );
  }
  if (failed) {
    return (
      <div className={`thumb thumb-fallback ${className}`}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }
  return (
    <div className={`thumb ${className}`}>
      <img src={assetUrl(src)} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
export function Empty({
  title = '此目錄暫未有內容',
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <FolderOpen size={44} strokeWidth={1.1} />
      <h3>{title}</h3>
      <p>{children || '請選擇其他資料夾，或稍後再來查看。'}</p>
    </div>
  );
}
export function External({
  url,
  children,
  className = '',
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return url ? (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
      {children}
      <ArrowUpRight size={17} />
    </a>
  ) : (
    <span className={`${className} disabled`} aria-disabled="true">
      {children}
      <small>連結待設定</small>
    </span>
  );
}
export function Breadcrumb({
  folders,
  id,
  navigate,
  cms = false,
}: {
  folders: Folder[];
  id: string;
  navigate: (id: string, admin?: boolean) => void;
  cms?: boolean;
}) {
  return (
    <nav className="breadcrumb" aria-label="目前路徑">
      <button onClick={() => navigate('', cms)} aria-label="首頁">
        <Home size={16} />
        <span className="breadcrumb-home-label">首頁</span>
      </button>
      {trail(folders, id).map((f, i, all) => (
        <span key={f.id}>
          <ChevronRight size={13} />
          <button
            onClick={() => navigate(f.id, cms)}
            aria-current={i === all.length - 1 ? 'page' : undefined}
          >
            {folderLabel(f)}
          </button>
        </span>
      ))}
    </nav>
  );
}
export function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'wide' : ''}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-btn" aria-label="關閉" onClick={close}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
