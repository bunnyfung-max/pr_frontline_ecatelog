import { assetUrl } from './client';
import { contentPreviewRef } from './content-display';
import { fileKind, readerAssets } from './sales-kit';
import { preloadPdfJs } from './pdfjs-preload';
import type { Content } from './types';

const prefetched = new Set<string>();

function prefetchUrl(url: string) {
  if (!url || prefetched.has(url) || typeof document === 'undefined') return;
  prefetched.add(url);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = url.includes('.pdf') ? 'fetch' : 'image';
  link.href = url;
  document.head.appendChild(link);
}

export function prefetchAsset(ref: string) {
  if (!ref || prefetched.has(ref) || /^https?:\/\//i.test(ref)) return;
  const url = assetUrl(ref);
  const kind = fileKind(ref);
  if (kind === 'image') {
    prefetched.add(ref);
    const img = new Image();
    img.src = url;
    return;
  }
  prefetchUrl(url);
}

/** Warm likely assets before the viewer opens. */
export function prefetchContent(content: Content) {
  preloadPdfJs();
  const preview = contentPreviewRef(content);
  if (preview) prefetchAsset(preview);
  for (const asset of readerAssets(content).slice(0, 4)) {
    prefetchAsset(asset.ref);
  }
}
