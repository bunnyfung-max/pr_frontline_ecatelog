import { buildDesiredManifest, desiredContentIds } from './cache-manifest';
import { diffCache } from './cache-diff';
import {
  deleteCachedAssets,
  downloadDesiredAssets,
  listCachedAssets,
  type CacheTransferResult,
} from './content-cache';
import type { Content } from './types';

export type CacheSyncScope = 'published-all' | 'folder';

export type CacheSyncProgress = {
  phase: 'download' | 'remove';
  done: number;
  total: number;
};

export type CacheSyncResult = {
  download: CacheTransferResult;
  remove: CacheTransferResult;
};

export async function syncCatalogCache(
  contents: Content[],
  scope: CacheSyncScope,
  onProgress?: (progress: CacheSyncProgress) => void,
): Promise<CacheSyncResult> {
  const desired = buildDesiredManifest(contents);
  const local = await listCachedAssets();
  const diff = diffCache(
    desired,
    local,
    scope === 'folder' ? { removeContentIds: desiredContentIds(contents) } : undefined,
  );

  const download =
    diff.download.length > 0
      ? await downloadDesiredAssets(diff.download, (done, total) => {
          onProgress?.({ phase: 'download', done, total });
        })
      : { succeeded: 0, failed: 0 };

  const remove =
    diff.remove.length > 0
      ? await deleteCachedAssets(
          diff.remove.map((item) => item.ref),
        ).then((result) => {
          onProgress?.({ phase: 'remove', done: result.succeeded + result.failed, total: diff.remove.length });
          return result;
        })
      : { succeeded: 0, failed: 0 };

  return { download, remove };
}
