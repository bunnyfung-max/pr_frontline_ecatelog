import { cacheableAssetRefs } from './catalog';
import type { DesiredAsset } from './cache-manifest';
import type { LocalAsset } from './cache-diff';
import type { Content } from './types';
import { assetUrl } from './client';

export { cacheableAssetRefs };

const DB_NAME = 'pricerite-content-cache';
const STORE = 'assets';
const DB_VERSION = 1;

type CachedRecord = {
  ref: string;
  contentId: string;
  blob: Blob;
  cachedAt: string;
  size: number;
  contentUpdatedAt?: string;
};

export type CacheTransferResult = {
  succeeded: number;
  failed: number;
};

function isQuotaError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'QuotaExceededError') ||
    (error instanceof Error && error.name === 'QuotaExceededError')
  );
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('此瀏覽器未支援本機緩存。'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'ref' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('無法開啟本機緩存。'));
  });
}

function idb<T>(run: (db: IDBDatabase) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('緩存操作失敗。'));
      }),
  );
}

function toLocalAsset(record: CachedRecord): LocalAsset {
  return {
    ref: record.ref,
    contentId: record.contentId,
    size: record.size,
    cachedAt: record.cachedAt,
    contentUpdatedAt: record.contentUpdatedAt,
  };
}

export async function getCachedAsset(ref: string): Promise<Blob | null> {
  try {
    const record = await idb<CachedRecord | undefined>((db) =>
      db.transaction(STORE, 'readonly').objectStore(STORE).get(ref),
    );
    return record?.blob ?? null;
  } catch {
    return null;
  }
}

export async function listCachedAssets(): Promise<LocalAsset[]> {
  try {
    const records = await idb<CachedRecord[]>((db) =>
      db.transaction(STORE, 'readonly').objectStore(STORE).getAll(),
    );
    return records.map(toLocalAsset);
  } catch {
    return [];
  }
}

export async function countCachedAssets(content: Content): Promise<{ cached: number; total: number }> {
  const refs = cacheableAssetRefs(content);
  if (!refs.length) return { cached: 0, total: 0 };
  let cached = 0;
  for (const ref of refs) {
    if (await getCachedAsset(ref)) cached += 1;
  }
  return { cached, total: refs.length };
}

async function putCachedAsset(
  ref: string,
  contentId: string,
  blob: Blob,
  contentUpdatedAt?: string,
): Promise<void> {
  await idb((db) =>
    db.transaction(STORE, 'readwrite').objectStore(STORE).put({
      ref,
      contentId,
      blob,
      cachedAt: new Date().toISOString(),
      size: blob.size,
      contentUpdatedAt,
    } satisfies CachedRecord),
  );
}

export async function deleteCachedAssets(refs: string[]): Promise<CacheTransferResult> {
  if (!refs.length) return { succeeded: 0, failed: 0 };
  let succeeded = 0;
  let failed = 0;
  for (const ref of refs) {
    try {
      await idb((db) => db.transaction(STORE, 'readwrite').objectStore(STORE).delete(ref));
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }
  return { succeeded, failed };
}

export async function downloadDesiredAssets(
  items: DesiredAsset[],
  onProgress?: (done: number, total: number) => void,
): Promise<CacheTransferResult> {
  if (!items.length) return { succeeded: 0, failed: 0 };
  let succeeded = 0;
  let failed = 0;
  onProgress?.(0, items.length);
  for (const item of items) {
    try {
      const response = await fetch(assetUrl(item.ref), { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) {
        failed += 1;
        onProgress?.(succeeded + failed, items.length);
        continue;
      }
      const blob = await response.blob();
      await putCachedAsset(item.ref, item.contentId, blob, item.contentUpdatedAt);
      succeeded += 1;
    } catch (error) {
      if (isQuotaError(error)) break;
      failed += 1;
    }
    onProgress?.(succeeded + failed, items.length);
  }
  return { succeeded, failed };
}

function catalogAssetRefs(contents: Content[]): DesiredAsset[] {
  const seen = new Set<string>();
  const items: DesiredAsset[] = [];
  for (const content of contents) {
    for (const ref of cacheableAssetRefs(content)) {
      if (seen.has(ref)) continue;
      seen.add(ref);
      items.push({ ref, contentId: content.id, contentUpdatedAt: content.updatedAt });
    }
  }
  return items;
}

export async function downloadCatalogAssets(
  contents: Content[],
  onProgress?: (done: number, total: number) => void,
): Promise<CacheTransferResult> {
  const items = catalogAssetRefs(contents);
  const local = new Set((await listCachedAssets()).map((item) => item.ref));
  const missing = items.filter((item) => !local.has(item.ref));
  return downloadDesiredAssets(missing, onProgress);
}

export async function downloadContentAssets(
  content: Content,
  onProgress?: (done: number, total: number) => void,
): Promise<CacheTransferResult> {
  return downloadCatalogAssets([content], onProgress);
}

export async function clearContentCache(contentId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const cursor = store.openCursor();
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) return;
      if ((current.value as CachedRecord).contentId === contentId) current.delete();
      current.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('無法清除緩存。'));
  });
}
