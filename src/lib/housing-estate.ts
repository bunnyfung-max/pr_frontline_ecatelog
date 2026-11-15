import type { Folder } from './types';

/**
 * Catalog folders have no estate type. Restrict candidate names to housing,
 * omitting known category, district and unit labels; unknown naming remains a
 * conservative heuristic which should be replaced by explicit CMS metadata.
 */
export function estateNamesForFolder(folders: Folder[], folderId: string): string[] {
  const path: Folder[] = [];
  const seen = new Set<string>();
  let folder = folders.find((item) => item.id === folderId);
  while (folder && !seen.has(folder.id)) {
    seen.add(folder.id);
    path.unshift(folder);
    folder = folders.find((item) => item.id === folder!.parentId);
  }
  if (!path.some((item) => item.id === 'housing')) return [];
  const ignoredNames = /^(香港|香港島|九龍|新界|港島|離島|全港|港九新界|中西區|灣仔區?|東區|南區|油尖旺區?|深水埗區?|九龍城區?|黃大仙區?|觀塘區?|荃灣區?|屯門區?|元朗區?|北區|大埔區?|西貢區?|沙田區?|葵青區?|離島區|東涌)$/i;
  const unitName = /(?:\d\s*(?:[–—~-]\s*\d+\s*)?(?:呎|尺|平方|sq\.?\s*ft)|\d\s*[–—~-]?\s*\d*\s*人|^(?:type|unit|flat)\s*[a-z0-9]|(?:平面圖|效果圖|樓層|座數)|^[a-z\d一二三四五六七八九十]+\s*(?:座|樓|期|翼)$)/i;
  return path
    .filter((item) => item.id !== 'housing' && !['private', 'public', 'simple'].includes(item.id) && !/^(私人屋苑|私樓|公居屋|公屋|簡約公屋)$/i.test(item.name.trim()))
    .map((item) => item.name.trim())
    .filter((name) => name && !ignoredNames.test(name) && !unitName.test(name));
}
