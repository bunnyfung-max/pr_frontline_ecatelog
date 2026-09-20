import type { Catalog, Content, Folder, Offer, Scene } from './types';
import { searchCatalogEnhanced } from './catalog-search';

export interface SearchResults {
  contents: Content[];
  folders: Folder[];
  scenes: Scene[];
}

export type {
  EnhancedSearchResults,
  ParsedSearchQuery,
  Scored,
  SearchCategory,
  SearchFacets,
  SearchMatchReason,
  SearchVocabulary,
} from './catalog-search';
export {
  EMPTY_SEARCH_FACETS,
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABEL,
  buildSearchVocabulary,
  hasActiveFacets,
  parseSearchQuery,
  searchCatalogEnhanced,
  searchScopeSummary,
  suggestForCategory,
  vocabularyForCategory,
} from './catalog-search';
export const folderLabel = (folder: Folder) =>
  folder.id === 'housing' && folder.name === 'New Housing' ? '新屋入伙' : folder.name;
export function descendants(folders: Folder[], id: string): Set<string> {
  const found = new Set<string>();
  if (!folders.some((f) => f.id === id)) return found;
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    if (found.has(current)) continue;
    found.add(current);
    queue.push(...folders.filter((f) => f.parentId === current).map((f) => f.id));
  }
  return found;
}
export function trail(folders: Folder[], id: string): Folder[] {
  const path: Folder[] = [];
  const seen = new Set<string>();
  let folder = folders.find((f) => f.id === id);
  while (folder && !seen.has(folder.id)) {
    seen.add(folder.id);
    path.unshift(folder);
    folder = folders.find((f) => f.id === folder!.parentId);
  }
  return path;
}
export const byOrder = <T extends { order: number; name?: string }>(a: T, b: T) =>
  a.order - b.order || (a.name || '').localeCompare(b.name || '', 'zh-HK');

export function contentLinkedProductLabels(data: Catalog, content: Content): string[] {
  const labels: string[] = [];
  for (const link of content.eshopProducts ?? []) {
    labels.push(link.title?.trim() || [link.brand, link.sku].filter(Boolean).join(' '));
  }
  for (const product of data.products.filter((item) => content.productIds.includes(item.id))) {
    labels.push(product.name?.trim() || product.code);
  }
  return [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
}
export const rootFolders = (data: Catalog) =>
  data.folders.filter((f) => !f.parentId).sort(byOrder);
export function folderDeleteBlockers(data: Catalog, id: string): string[] {
  const folder = data.folders.find((f) => f.id === id);
  if (!folder) return ['找不到此資料夾。'];
  const blockers: string[] = [];
  if (data.folders.some((f) => f.parentId === id)) blockers.push('仍有子資料夾');
  if (data.contents.some((c) => c.folderId === id)) blockers.push('仍有展示內容');
  if (folder.id === 'scenes' && data.scenes.length > 0) blockers.push('仍有場景推介');
  return blockers;
}
export function searchCatalog(
  data: Catalog,
  folderId: string | null,
  query: string,
  includeDrafts = false,
): SearchResults {
  const results = searchCatalogEnhanced(data, folderId, query, { includeDrafts });
  return {
    contents: results.contents.map((entry) => entry.item),
    folders: results.folders.map((entry) => entry.item),
    scenes: results.scenes.map((entry) => entry.item),
  };
}
export function activeOffer(offer: Offer, now = new Date()): boolean {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return (
    offer.active &&
    (!offer.startDate || offer.startDate <= today) &&
    (!offer.endDate || offer.endDate >= today)
  );
}
export function publicCatalog(data: Catalog): Catalog {
  const contents = data.contents.filter((c) => c.status === 'published');
  const linked = new Set(contents.flatMap((c) => c.productIds));
  return {
    ...data,
    contents,
    products: data.products.filter((p) => linked.has(p.id)),
    scenes: data.scenes.filter((s) => s.active),
    offers: data.offers.filter((o) => activeOffer(o)),
  };
}
export function visiblePages(current: number, total: number, landscape: boolean): number[] {
  const page = Math.max(1, Math.min(current, total));
  return landscape && page < total ? [page, page + 1] : [page];
}
export function contentAssets(c: Content): string[] {
  return [...c.files, c.cover].filter(Boolean);
}
export function catalogAssetRefs(data: Catalog): string[] {
  return [
    ...new Set(
      [
        ...data.contents.flatMap((content) => contentAssets(content)),
        ...data.products.map((product) => product.image),
        ...data.scenes.map((scene) => scene.image),
        ...data.offers.map((offer) => offer.image),
      ].filter((ref) => ref && ref.startsWith('asset:')),
    ),
  ];
}
export function allowedAssetRefs(data: Catalog, cmsUnlocked: boolean): string[] {
  const source = cmsUnlocked ? data : publicCatalog(data);
  return catalogAssetRefs(source);
}
export function cacheableAssetRefs(c: Content): string[] {
  return [
    ...new Set(
      contentAssets(c).filter(
        (ref) => ref && !/^https?:\/\//i.test(ref) && !ref.startsWith('/demo/'),
      ),
    ),
  ];
}
export function folderPublishedContents(data: Catalog, folderId: string): Content[] {
  const scope = descendants(data.folders, folderId);
  return data.contents
    .filter((content) => content.status === 'published' && scope.has(content.folderId))
    .sort(byOrder);
}
export function folderHasBrowseableContent(
  data: Catalog,
  folderId: string,
  includeDrafts = false,
): boolean {
  const scope = descendants(data.folders, folderId);
  if (
    data.contents.some(
      (content) =>
        scope.has(content.folderId) && (includeDrafts || content.status === 'published'),
    )
  ) {
    return true;
  }
  return (
    folderId === 'scenes' &&
    data.scenes.some((scene) => includeDrafts || scene.active)
  );
}
export function publishedContents(data: Catalog): Content[] {
  return data.contents.filter((content) => content.status === 'published').sort(byOrder);
}
