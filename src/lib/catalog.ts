import type { Catalog, Content, Folder, Offer, Scene } from './types';
export interface SearchResults {
  contents: Content[];
  folders: Folder[];
  scenes: Scene[];
}
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
export function searchCatalog(
  data: Catalog,
  folderId: string | null,
  query: string,
  includeDrafts = false,
): SearchResults {
  // Only an explicitly absent folder means home/global search. Invalid IDs fail closed.
  const scope =
    folderId === null
      ? new Set(data.folders.map((f) => f.id))
      : descendants(data.folders, folderId);
  const terms = query.trim().normalize('NFKC').toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const match = (parts: string[]) => {
    const text = parts.join(' ').normalize('NFKC').toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  };
  const contents = data.contents
    .filter((c) => {
      if (!scope.has(c.folderId) || (!includeDrafts && c.status !== 'published')) return false;
      const attributes = data.products
        .filter((p) => c.productIds.includes(p.id))
        .flatMap((p) => [p.name, p.code, p.brand, p.colour, p.style, p.keywords]);
      // Only this content's folder path and linked products contribute to a match.
      return match([
        c.name,
        c.fileName,
        c.keywords,
        ...trail(data.folders, c.folderId).flatMap((f) => [f.name, folderLabel(f)]),
        ...attributes,
      ]);
    })
    .sort(byOrder);
  const folders = data.folders
    .filter(
      (f) =>
        f.id !== folderId &&
        scope.has(f.id) &&
        match([
          f.name,
          f.subtitle,
          ...trail(data.folders, f.id).flatMap((p) => [p.name, folderLabel(p)]),
        ]),
    )
    .sort(byOrder);
  const scenes = scope.has('scenes')
    ? data.scenes
        .filter((s) => (includeDrafts || s.active) && match([s.name, '場景推介']))
        .sort(byOrder)
    : [];
  return { contents, folders, scenes };
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
