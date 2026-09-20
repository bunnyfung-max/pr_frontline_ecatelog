import type { DesiredAsset } from './cache-manifest';

export type LocalAsset = {
  ref: string;
  contentId: string;
  size: number;
  cachedAt: string;
  contentUpdatedAt?: string;
};

export type CacheDiff = {
  keep: DesiredAsset[];
  download: DesiredAsset[];
  remove: LocalAsset[];
};

export function diffCache(
  desired: DesiredAsset[],
  local: LocalAsset[],
  options?: { removeContentIds?: Set<string> },
): CacheDiff {
  const desiredByRef = new Map(desired.map((item) => [item.ref, item]));
  const localByRef = new Map(local.map((item) => [item.ref, item]));
  const keep: DesiredAsset[] = [];
  const download: DesiredAsset[] = [];

  for (const item of desired) {
    if (localByRef.has(item.ref)) keep.push(item);
    else download.push(item);
  }

  const remove = local.filter((item) => {
    if (desiredByRef.has(item.ref)) return false;
    if (!options?.removeContentIds) return true;
    return options.removeContentIds.has(item.contentId);
  });

  return { keep, download, remove };
}
