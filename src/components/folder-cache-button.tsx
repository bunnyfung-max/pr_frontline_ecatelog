'use client';

import { Check, Download, Loader2 } from 'lucide-react';
import { useFolderAssetCache } from '@/hooks/use-content-cache';
import type { CacheSyncScope } from '@/lib/cache-sync';
import type { Content } from '@/lib/types';

const MEDIA_OFFLINE_NOTE = '文字及產品資料仍需連線；只緩存圖片、PDF 及影片。';

export function FolderCacheButton({
  contents,
  syncScope = 'folder',
  label = '下載多媒體',
  readyLabel = '多媒體已離線',
  idleTitle = `下載此目錄及下層的圖片、PDF 及影片到本機。${MEDIA_OFFLINE_NOTE}`,
  readyTitle = `多媒體已緩存到本機。${MEDIA_OFFLINE_NOTE}`,
  className = '',
}: {
  contents: Content[];
  syncScope?: CacheSyncScope;
  label?: string;
  readyLabel?: string;
  idleTitle?: string;
  readyTitle?: string;
  className?: string;
}) {
  const cache = useFolderAssetCache(contents, syncScope);
  if (!cache.hasAssets) return null;
  const title = cache.status === 'ready' || cache.status === 'partial' ? readyTitle : idleTitle;
  return (
    <div className={`folder-cache-control ${className}`.trim()}>
      <button
        type="button"
        className={`cache-toggle subtle ${cache.status === 'ready' ? 'selected' : ''}`}
        onClick={() => void cache.download()}
        disabled={cache.status === 'downloading' || cache.status === 'checking'}
        aria-busy={cache.status === 'downloading'}
        title={title}
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
            ? cache.progress.phase === 'remove'
              ? `清理中 ${cache.progress.done}/${cache.progress.total}`
              : `下載中 ${cache.progress.done}/${cache.progress.total}`
            : cache.status === 'ready'
              ? readyLabel
              : cache.status === 'partial'
                ? `${readyLabel} ${cache.progress.done}/${cache.progress.total}`
                : label}
        </span>
      </button>
    </div>
  );
}
