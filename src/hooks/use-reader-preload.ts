'use client';

import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  collectReaderPreloadTargets,
  runReaderPreload,
} from '@/lib/reader-preload';
import type { ReaderLeaf } from '@/lib/sales-kit';

export function useReaderPreload({
  leaves,
  visiblePages,
  resolveAssetUrl,
  pdfs,
  resetKey,
}: {
  leaves: ReaderLeaf[];
  visiblePages: number[];
  resolveAssetUrl: (ref: string) => string;
  pdfs: Record<string, PDFDocumentProxy>;
  resetKey: string;
}) {
  const loaded = useRef(new Set<string>());

  useEffect(() => {
    loaded.current.clear();
  }, [resetKey]);

  useEffect(() => {
    const targets = collectReaderPreloadTargets(leaves, visiblePages, resolveAssetUrl, pdfs);
    runReaderPreload(targets, loaded.current);
  }, [leaves, visiblePages, resolveAssetUrl, pdfs]);
}
