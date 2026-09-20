import { cacheableAssetRefs } from './catalog';
import type { Content } from './types';

export type DesiredAsset = {
  ref: string;
  contentId: string;
  contentUpdatedAt: string;
};

export function buildDesiredManifest(contents: Content[]): DesiredAsset[] {
  const seen = new Set<string>();
  const items: DesiredAsset[] = [];
  for (const content of contents) {
    for (const ref of cacheableAssetRefs(content)) {
      if (seen.has(ref)) continue;
      seen.add(ref);
      items.push({
        ref,
        contentId: content.id,
        contentUpdatedAt: content.updatedAt,
      });
    }
  }
  return items;
}

export function desiredContentIds(contents: Content[]): Set<string> {
  return new Set(contents.map((content) => content.id));
}
