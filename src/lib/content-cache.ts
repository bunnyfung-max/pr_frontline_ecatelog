import { cacheableAssetRefs } from './catalog';
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
};

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

export async function countCachedAssets(content: Content): Promise<{ cached: number; total: number }> {
  const refs = cacheableAssetRefs(content);
  if (!refs.length) return { cached: 0, total: 0 };
  let cached = 0;
  for (const ref of refs) {
    if (await getCachedAsset(ref)) cached += 1;
  }
  return { cached, total: refs.length };
}

async function putCachedAsset(ref: string, contentId: string, blob: Blob): Promise<void> {
  await idb((db) =>
    db.transaction(STORE, 'readwrite').objectStore(STORE).put({
      ref,
      contentId,
      blob,
      cachedAt: new Date().toISOString(),
      size: blob.size,
    } satisfies CachedRecord),
  );
}

function catalogAssetRefs(contents: Content[]): { ref: string; contentId: string }[] {
  const seen = new Set<string>();
  const items: { ref: string; contentId: string }[] = [];
  for (const content of contents) {
    for (const ref of cacheableAssetRefs(content)) {
      if (seen.has(ref)) continue;
      seen.add(ref);
      items.push({ ref, contentId: content.id });
    }
  }
  return items;
}

export async function downloadCatalogAssets(
  contents: Content[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const items = catalogAssetRefs(contents);
  if (!items.length) return;
  let done = 0;
  onProgress?.(done, items.length);
  for (const { ref, contentId } of items) {
    if (await getCachedAsset(ref)) {
      done += 1;
      onProgress?.(done, items.length);
      continue;
    }
    const response = await fetch(assetUrl(ref), { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('部分檔案未能下載，請檢查網絡後重試。');
    const blob = await response.blob();
    await putCachedAsset(ref, contentId, blob);
    done += 1;
    onProgress?.(done, items.length);
  }
}

export async function downloadContentAssets(
  content: Content,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  await downloadCatalogAssets([content], onProgress);
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
