'use client';

import { Check, Download, Loader2 } from 'lucide-react';
import { useFolderAssetCache } from '@/hooks/use-content-cache';
import type { Content } from '@/lib/types';

export function FolderCacheButton({ contents }: { contents: Content[] }) {
  const cache = useFolderAssetCache(contents);
  if (!cache.hasAssets) return null;
  return (
    <div className="folder-cache-control">
      <button
        type="button"
        className={`cache-toggle ${cache.status === 'ready' ? 'selected' : ''}`}
        onClick={() => void cache.download()}
        disabled={cache.status === 'downloading' || cache.status === 'checking'}
        aria-busy={cache.status === 'downloading'}
        title={
          cache.status === 'ready'
            ? '此目錄內容已緩存到本機，可離線展示'
            : '下載此目錄及下層所有圖片、PDF 及影片到本機'
        }
      >
        {cache.status === 'downloading' ? (
          <Loader2 size={18} className="spin" aria-hidden="true" />
        ) : cache.status === 'ready' ? (
          <Check size={18} aria-hidden="true" />
        ) : (
          <Download size={18} aria-hidden="true" />
        )}
        <span>
          {cache.status === 'downloading'
            ? `下載中 ${cache.progress.done}/${cache.progress.total}`
            : cache.status === 'ready'
              ? '已緩存'
              : cache.status === 'partial'
                ? `已緩存 ${cache.progress.done}/${cache.progress.total}`
                : '下載緩存'}
        </span>
      </button>
      {cache.error && <p className="folder-cache-error" role="alert">{cache.error}</p>}
    </div>
  );
}
