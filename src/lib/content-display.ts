import type { Content, ContentType } from './types';
import { TYPE_LABEL } from './types';
import {
  FILE_KIND_LABEL,
  fileKind,
  readerAssets,
  type ReaderAsset,
} from './sales-kit';

export { FILE_KIND_LABEL };

export function contentPreviewRef(content: Content): string {
  if (content.cover) return content.cover;
  return content.files.find((ref) => ref && fileKind(ref) === 'image') || '';
}

export function contentPreviewKind(content: Content): ContentType | null {
  const ref = contentPreviewRef(content) || content.files.find(Boolean);
  if (!ref) return null;
  return content.type === 'link' ? 'link' : fileKind(ref);
}

export function contentReaderSubtitle(
  content: Content,
  assets: ReaderAsset[],
  horizontal: boolean,
): string {
  const mode = horizontal ? '橫向雙頁' : '直向單頁';
  if (content.salesKit) return `Sales Kit · ${mode}`;
  if (content.type === 'link') return `${TYPE_LABEL.link} · ${mode}`;
  const kinds = new Set(assets.map((asset) => asset.kind));
  if (assets.length > 1 || kinds.size > 1) {
    return `圖文影片 · ${assets.length} 項 · ${mode}`;
  }
  const kind = assets[0]?.kind ?? content.type;
  return `${FILE_KIND_LABEL[kind] ?? TYPE_LABEL[content.type]} · ${mode}`;
}

export function contentAssetCount(content: Content): number {
  return readerAssets(content).length;
}
