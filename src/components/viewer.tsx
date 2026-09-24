'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  X,
  ExternalLink,
} from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Catalog, Content } from '@/lib/types';
import { activeOffer, byOrder } from '@/lib/catalog';
import { contentPreviewRef, contentReaderSubtitle } from '@/lib/content-display';
import {
  FILE_KIND_LABEL,
  readerAssets,
  readerLeaves,
  readerSpread,
  previousReaderPage,
  type ReaderLeaf,
} from '@/lib/sales-kit';
import { useContentAssetCache } from '@/hooks/use-content-cache';
import { useReaderPreload } from '@/hooks/use-reader-preload';
import { usePinchZoom } from '@/hooks/use-pinch-zoom';
import { preloadPdfJs } from '@/lib/pdfjs-preload';
import { External, Thumb } from './ui';
import { ContentShoppingLinks } from './shopping-links';
import { EshopQrCode } from './eshop-qr-code';
export function Viewer({
  content,
  data,
  close,
  previewOrientation,
}: {
  content: Content;
  data: Catalog;
  close: () => void;
  previewOrientation?: 'landscape' | 'portrait';
}) {
  const [landscape, setLandscape] = useState(true);
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState(false);
  const [pdfs, setPdfs] = useState<Record<string, PDFDocumentProxy>>({});
  const [pdfCounts, setPdfCounts] = useState<Record<string, number>>({});
  const [reload, setReload] = useState(0);
  const closeRef = useRef(close);
  closeRef.current = close;
  const assets = useMemo(
    () => readerAssets(content),
    [content.files, content.type, content.salesKit],
  );
  const { resolveAssetUrl } = useContentAssetCache(content);
  const previewRef = useMemo(() => contentPreviewRef(content), [content]);
  const pdfRefs = useMemo(() => {
    const seen = new Set<string>();
    const refs: string[] = [];
    for (const asset of assets) {
      if (asset.kind !== 'pdf' || seen.has(asset.ref)) continue;
      seen.add(asset.ref);
      refs.push(asset.ref);
    }
    return refs;
  }, [assets]);
  useEffect(() => {
    const media = matchMedia('(orientation: landscape)');
    const update = () => setLandscape(media.matches);
    update();
    media.addEventListener('change', update);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => {
    setPage(1);
  }, [assets]);
  useEffect(() => {
    let cancelled = false;
    const tasks: ReturnType<(typeof import('pdfjs-dist'))['getDocument']>[] = [];
    setPdfs({});
    setPdfCounts({});
    if (!pdfRefs.length) return;
    void (async () => {
      try {
        const lib = await import('pdfjs-dist');
        if (cancelled) return;
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        await Promise.all(
          pdfRefs.map(async (ref) => {
            try {
              const task = lib.getDocument({ url: resolveAssetUrl(ref) });
              tasks.push(task);
              const doc = await task.promise;
              if (cancelled) return;
              setPdfs((current) => ({ ...current, [ref]: doc }));
              setPdfCounts((current) => ({ ...current, [ref]: doc.numPages }));
            } catch {
              if (!cancelled) setPdfCounts((current) => ({ ...current, [ref]: 0 }));
            }
          }),
        );
      } catch {
        /* A worker/import failure is shown at each PDF's position. */
      }
    })();
    return () => {
      cancelled = true;
      tasks.forEach((task) => {
        void task.destroy().catch(() => {});
      });
    };
  }, [assets, reload, pdfRefs, resolveAssetUrl]);
  const horizontal = previewOrientation ? previewOrientation === 'landscape' : landscape;
  const leaves = useMemo(() => readerLeaves(assets, pdfCounts), [assets, pdfCounts]);
  const total = leaves.length;
  const pages = readerSpread(leaves, page, horizontal);
  const current = leaves[pages[0] - 1];
  const pageLoading = Boolean(current?.pending);
  useReaderPreload({
    leaves,
    visiblePages: pages,
    resolveAssetUrl,
    pdfs,
    resetKey: `${content.id}:${reload}:${assets.map((asset) => asset.ref).join('\0')}`,
  });
  const { scale, targetRef: pinchRef } = usePinchZoom(page);
  const navigate = (next: number) => {
    setPage(next);
  };
  const handleClose = () => {
    closeRef.current();
  };
  const markup = (
    <div
      role="dialog"
      aria-modal="true"
      className={`viewer ${horizontal ? 'landscape' : 'portrait'} ${panel ? 'panel-open' : ''} ${previewOrientation ? 'is-preview' : ''}`}
      aria-label={`${content.name} 閱讀器`}
    >
      <header className="viewer-top">
        <button
          type="button"
          className="subtle viewer-back"
          onClick={handleClose}
          aria-label="返回目錄"
        >
          <ArrowLeft size={17} />
          <span className="viewer-back-label">返回</span>
        </button>
        <div className="viewer-title">
          <strong>{content.name}</strong>
          <small>
            {previewOrientation
              ? `預覽 · ${horizontal ? '橫向雙頁' : '直向單頁'}`
              : contentReaderSubtitle(content, assets, horizontal)}
          </small>
        </div>
        <button
          type="button"
          className={`shopping-toggle viewer-shop ${panel ? 'selected' : ''}`}
          onClick={() => setPanel(!panel)}
          aria-expanded={panel}
          aria-controls="shopping-panel"
          aria-label="購物功能列"
        >
          <ShoppingBag size={17} />
        </button>
      </header>
      <div className="viewer-body">
        <section className="reader-area" aria-label="展示內容">
          <div className="reader-scroll reader-pinch" ref={pinchRef}>
            {current && current.kind !== 'link' ? (
              <div
                className={`page-spread-host${scale > 1 ? ' is-zoomed' : ''}`}
                style={scale > 1 ? { width: `${scale * 100}%`, minWidth: '100%' } : undefined}
              >
                <div className="page-spread" data-testid="page-spread">
                  {pages.map((n) => {
                    const leaf = leaves[n - 1];
                    return (
                      <div
                        className={`paper${leaf.pending ? ' is-loading' : ''}`}
                        key={`${n}-${reload}`}
                        data-page={n}
                        data-file-kind={leaf.kind}
                        data-file-label={leaf.label}
                      >
                        <ReaderPageMedia
                          contentName={content.name}
                          leaf={leaf}
                          page={n}
                          pdf={leaf.kind === 'pdf' ? pdfs[leaf.ref] : undefined}
                          reload={reload}
                          heroSrc={previewRef ? resolveAssetUrl(previewRef) : ''}
                          resolveAssetUrl={resolveAssetUrl}
                          onRetry={() => setReload((k) => k + 1)}
                        />
                        <span className="paper-type-badge">{FILE_KIND_LABEL[leaf.kind]}</span>
                        <span className="paper-number">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : current?.kind === 'link' ? (
              <div className="link-preview">
                <ExternalLink size={44} />
                <h2>{content.name}</h2>
                <p>此內容將在新的分頁開啟。</p>
                <External className="primary" url={current.ref}>
                  開啟連結
                </External>
              </div>
            ) : (
              <div className="empty">尚未上載檔案。</div>
            )}
          </div>
          <div className="reader-toolbar">
            <div className="page-controls">
              <button
                className="icon-btn"
                aria-label="上一頁"
                disabled={page <= 1 || pageLoading}
                onClick={() => navigate(previousReaderPage(leaves, page, horizontal))}
              >
                <ChevronLeft size={18} />
              </button>
              <span aria-live="polite">
                {pageLoading ? '載入中' : `${pages.join('–') || '0'} / ${total}`}
              </span>
              <button
                className="icon-btn"
                aria-label="下一頁"
                disabled={!total || pages.at(-1)! >= total || pageLoading}
                onClick={() => navigate(Math.min(total, pages.at(-1)! + 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
        {panel && (
          <aside className="shopping-panel" id="shopping-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">SHOP THE IDEAS</span>
                <h2>把靈感，帶回家。</h2>
              </div>
              <button
                className="icon-btn"
                aria-label="收起購物功能列"
                onClick={() => setPanel(false)}
              >
                <X size={21} />
              </button>
            </div>
            <ContentShoppingLinks content={content} products={data.products} />
            <div className="list-title">
              <h3>eShop Bundle Offer</h3>
              <span>組合推介</span>
            </div>
            {data.offers
              .filter((o) => activeOffer(o))
              .sort(byOrder)
              .map((o) => (
                <article className="offer-card" key={o.id}>
                  <div className="offer-image">
                    <Thumb src={o.image} />
                  </div>
                  <div>
                    <h3>{o.name}</h3>
                    <p>{o.summary}</p>
                    <EshopQrCode url={o.url} />
                    <External url={o.url} className="text-link">
                      查看組合優惠
                    </External>
                  </div>
                </article>
              ))}
            {!data.offers.some((o) => activeOffer(o)) && content.eshopUrl?.trim() && (
              <article className="offer-card offer-card--content-link">
                <div>
                  <EshopQrCode url={content.eshopUrl} />
                  <External url={content.eshopUrl} className="text-link">
                    前往 eShop
                  </External>
                </div>
              </article>
            )}
            {!data.offers.some((o) => activeOffer(o)) && !content.eshopUrl?.trim() && (
              <p className="muted">暫時沒有已啟用的組合優惠。</p>
            )}
            <p className="panel-footnote">優惠由內容團隊更新，實際詳情以 eShop 為準。</p>
          </aside>
        )}
      </div>
    </div>
  );
  if (typeof document === 'undefined') return null;
  return createPortal(markup, document.body);
}
function ReaderPageMedia({
  contentName,
  leaf,
  page,
  pdf,
  reload,
  heroSrc,
  resolveAssetUrl,
  onRetry,
}: {
  contentName: string;
  leaf: ReaderLeaf;
  page: number;
  pdf?: PDFDocumentProxy;
  reload: number;
  heroSrc: string;
  resolveAssetUrl: (ref: string) => string;
  onRetry: () => void;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [leaf.ref, leaf.kind, reload]);
  if (leaf.pending) {
    return (
      <div className="reader-page-loading" role="status">
        {heroSrc ? (
          <div className="reader-hero-placeholder" aria-hidden="true">
            <img src={heroSrc} alt="" />
          </div>
        ) : (
          <div className="reader-paper-skeleton" aria-hidden="true" />
        )}
        <span className="loading-spinner" aria-hidden="true" />
        <span>正在載入 PDF…</span>
      </div>
    );
  }
  if (leaf.failed || (leaf.kind === 'pdf' && !pdf)) {
    return (
      <div className="reader-page-error">
        <p role="alert">{leaf.label}：PDF 未能載入，可重試或翻到下一頁。</p>
        <button type="button" className="secondary" onClick={onRetry}>重新載入</button>
      </div>
    );
  }
  if (leaf.kind === 'pdf' && pdf) {
    return <PdfPage pdf={pdf} page={leaf.pdfPage!} />;
  }
  if (leaf.kind === 'video') {
    if (failed) {
      return (
        <div className="reader-page-error">
          <p role="alert">{leaf.label}：影片未能載入，請檢查檔案或網絡連線。</p>
          <button type="button" className="secondary" onClick={onRetry}>重新載入</button>
        </div>
      );
    }
    return (
      <video
        className="reader-video"
        key={`${leaf.ref}-${page}-${reload}`}
        src={resolveAssetUrl(leaf.ref)}
        aria-label={leaf.label}
        controls
        playsInline
        preload="auto"
        onError={() => setFailed(true)}
      />
    );
  }
  if (failed) {
    return (
      <div className="reader-page-error">
        <p role="alert">{leaf.label}：圖片未能載入，請檢查檔案或網絡連線。</p>
        <button type="button" className="secondary" onClick={onRetry}>重新載入</button>
      </div>
    );
  }
  return (
    <img
      key={`${leaf.ref}-${reload}`}
      className="reader-media"
      src={resolveAssetUrl(leaf.ref)}
      alt={`${contentName}，${leaf.label}，第 ${page} 頁`}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
function PdfPage({ pdf, page }: { pdf: PDFDocumentProxy; page: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let stopped = false;
    let task: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
    void pdf
      .getPage(page)
      .then((p) => {
        if (stopped || !canvas.current) return;
        const viewport = p.getViewport({ scale: 1.6 });
        const node = canvas.current;
        node.width = viewport.width;
        node.height = viewport.height;
        task = p.render({ canvas: node, viewport });
        return task.promise;
      })
      .catch((e) => {
        if (!stopped && e?.name !== 'RenderingCancelledException') setError(true);
      });
    return () => {
      stopped = true;
      task?.cancel();
    };
  }, [pdf, page]);
  return error ? (
    <p className="error">此頁未能顯示，請返回目錄重新開啟。</p>
  ) : (
    <canvas ref={canvas} aria-label={`PDF 第 ${page} 頁`} />
  );
}
