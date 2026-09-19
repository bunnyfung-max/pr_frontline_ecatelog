import type { Content, ContentType } from './types';

export const KIT_SLOTS = [
  '平面圖 Floor Plan',
  '效果圖',
  '產品列表（一）',
  '產品列表（二）',
  '補充圖片',
] as const;
export const KIT_PREVIEW_LABELS = [
  '平面圖',
  '效果圖1',
  '效果圖2',
  '產品圖1',
  '產品圖2',
] as const;
export const KIT_RESERVED = KIT_SLOTS.length;
export const KIT_REQUIRED = 1;
export const MAX_KIT_FILES = 40;
export { IMAGE_MIMES, KIT_MIMES } from './upload-policy';

// Empty reserved positions are intentional. Never compact before storing a kit.
export function kitFiles(files: string[]): string[] {
  return [
    ...Array.from({ length: KIT_RESERVED }, (_, i) => files[i] || ''),
    ...files.slice(KIT_RESERVED),
  ];
}
export function setKitSlot(files: string[], index: number, ref: string): string[] {
  if (index < 0 || index >= KIT_RESERVED) throw new Error('Invalid kit slot');
  const result = kitFiles(files);
  result[index] = ref;
  return result;
}
export function moveKitExtra(files: string[], index: number, direction: -1 | 1): string[] {
  const target = index + direction;
  if (
    index < KIT_RESERVED ||
    target < KIT_RESERVED ||
    index >= files.length ||
    target >= files.length
  )
    return files;
  const result = [...files];
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}
export function kitComplete(files: string[]): boolean {
  return Array.from({ length: KIT_REQUIRED }, (_, i) => !!files[i]).every(Boolean);
}
export function fileKind(ref: string): ContentType {
  if (/^https?:\/\//i.test(ref)) return 'link';
  if (/\.pdf$/i.test(ref)) return 'pdf';
  if (/\.(mp4|webm)$/i.test(ref)) return 'video';
  return 'image';
}
export interface ReaderAsset {
  ref: string;
  kind: ContentType;
  label: string;
}
export function readerAssets(content: Content): ReaderAsset[] {
  return content.files.flatMap((ref, i) =>
    !ref
      ? []
      : [
          {
            ref,
            kind: content.type === 'link' ? 'link' : fileKind(ref),
            label: content.salesKit
              ? KIT_SLOTS[i] || `額外檔案 ${i - KIT_RESERVED + 1}`
              : `第 ${i + 1} 份`,
          },
        ],
  );
}
export interface ReaderLeaf extends ReaderAsset {
  pdfPage?: number;
  failed?: boolean;
}
// A PDF expands in place, never after later images/videos. Failed PDFs keep their position.
export function readerLeaves(
  assets: ReaderAsset[],
  pdfCounts: Record<string, number>,
): ReaderLeaf[] {
  return assets.flatMap((asset) =>
    asset.kind !== 'pdf'
      ? [asset]
      : pdfCounts[asset.ref]
        ? Array.from({ length: pdfCounts[asset.ref] }, (_, i) => ({ ...asset, pdfPage: i + 1 }))
        : [{ ...asset, failed: true }],
  );
}
const pairable = (page?: ReaderLeaf) =>
  page && !page.failed && (page.kind === 'image' || page.kind === 'pdf');
export function readerSpread(leaves: ReaderLeaf[], current: number, landscape: boolean): number[] {
  if (!leaves.length) return [];
  const page = Math.max(1, Math.min(current, leaves.length));
  return landscape && pairable(leaves[page - 1]) && pairable(leaves[page])
    ? [page, page + 1]
    : [page];
}
export function previousReaderPage(
  leaves: ReaderLeaf[],
  current: number,
  landscape: boolean,
): number {
  // Walk the same spreads as Next; this also keeps videos on their own page.
  let start = 1;
  while (start < current) {
    const next = readerSpread(leaves, start, landscape).at(-1)! + 1;
    if (next >= current) return start;
    start = next;
  }
  return 1;
}
