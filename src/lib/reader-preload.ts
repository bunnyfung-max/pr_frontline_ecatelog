import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ContentType } from './types';
import type { ReaderLeaf } from './sales-kit';

export type ReaderPreloadTarget = {
  key: string;
  kind: ContentType;
  url: string;
  pdf?: PDFDocumentProxy;
  pdfPage?: number;
};

export function collectReaderPreloadTargets(
  leaves: ReaderLeaf[],
  visiblePages: number[],
  resolveAssetUrl: (ref: string) => string,
  pdfs: Record<string, PDFDocumentProxy>,
): ReaderPreloadTarget[] {
  if (!leaves.length || !visiblePages.length) return [];
  const start = Math.max(...visiblePages);
  const targets: ReaderPreloadTarget[] = [];
  for (let page = start + 1; page <= leaves.length; page++) {
    const leaf = leaves[page - 1];
    if (!leaf || leaf.pending || leaf.failed) continue;
    if (leaf.kind === 'image' || leaf.kind === 'video') {
      targets.push({
        key: `${leaf.kind}:${leaf.ref}`,
        kind: leaf.kind,
        url: resolveAssetUrl(leaf.ref),
      });
      continue;
    }
    if (leaf.kind === 'pdf' && leaf.pdfPage && pdfs[leaf.ref]) {
      targets.push({
        key: `pdf:${leaf.ref}:${leaf.pdfPage}`,
        kind: 'pdf',
        url: resolveAssetUrl(leaf.ref),
        pdf: pdfs[leaf.ref],
        pdfPage: leaf.pdfPage,
      });
    }
  }
  return targets;
}

export function runReaderPreload(
  targets: ReaderPreloadTarget[],
  loaded: Set<string>,
): void {
  if (typeof window === 'undefined') return;
  for (const target of targets) {
    if (loaded.has(target.key)) continue;
    loaded.add(target.key);
    if (target.kind === 'image') {
      const img = new Image();
      img.decoding = 'async';
      img.src = target.url;
      continue;
    }
    if (target.kind === 'video') {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = target.url;
      video.load();
      continue;
    }
    if (target.kind === 'pdf' && target.pdf && target.pdfPage) {
      void target.pdf.getPage(target.pdfPage).catch(() => {});
    }
  }
}
