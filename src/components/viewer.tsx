'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Maximize2,
  QrCode,
  Tag,
  X,
  ExternalLink,
  Minus,
  Plus,
  PanelsTopLeft,
} from 'lucide-react';
import './viewer-enhancements.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Catalog, Content } from '@/lib/types';
import { activeOffer, byOrder, folderLabel, trail } from '@/lib/catalog';
import { assetUrl } from '@/lib/client';
import { contentPreviewRef } from '@/lib/content-display';
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
import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';
import { preloadPdfJs } from '@/lib/pdfjs-preload';
import { External, Thumb } from './ui';
import { ContentProductDetail, ContentShoppingLinks, productSelectionKey, useEshopProductPrices, type ProductSelection } from './shopping-links';
import { EshopQrCode } from './eshop-qr-code';
import { ShowcaseViewerSheets } from './showcase-sheets';

const SHOWCASE_CORNERS = [
  { id: 'render', title: '空間效果圖', subtitle: 'Space Renderings' },
  { id: 'plan', title: '平面配置', subtitle: 'Layout Plan' },
  { id: 'products', title: '產品資料', subtitle: 'Product Information' },
  { id: 'full', title: '完整資料', subtitle: 'Full Details' },
] as const;

function showcaseCornerId(label: string, salesKit: boolean) {
  if (!salesKit) return 'render';
  if (label.includes('平面圖')) return 'plan';
  if (label.includes('產品列表')) return 'products';
  if (label.includes('補充') || label.includes('額外')) return 'full';
  return 'render';
}

export function Viewer({
  content,
  data,
  close,
  switchFolder,
  openContent,
  previewOrientation,
}: {
  content: Content;
  data: Catalog;
  close: () => void;
  switchFolder?: (folderId: string) => void;
  openContent?: (contentId: string) => void;
  previewOrientation?: 'landscape' | 'portrait';
}) {
  const [landscape, setLandscape] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'auto' | 'single' | 'double'>('auto');
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSelection | null>(null);
  const eshopPrices = useEshopProductPrices(content.eshopProducts, panel);
  const [thumbnails, setThumbnails] = useState(false);
  const [sheet, setSheet] = useState<'browse' | 'documents' | 'furniture' | 'zoom' | null>(null);
  const [pdfs, setPdfs] = useState<Record<string, PDFDocumentProxy>>({});
  const [pdfCounts, setPdfCounts] = useState<Record<string, number>>({});
  const [reload, setReload] = useState(0);
  const pageHistory = useRef<number[]>([]);
  const closeRef = useRef(close);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnButtonRef = useRef<HTMLButtonElement>(null);
  const shoppingButtonRef = useRef<HTMLButtonElement>(null);
  const panelCloseRef = useRef<HTMLButtonElement>(null);
  const thumbnailsRef = useRef<HTMLElement>(null);
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
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    returnButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (dialogRef.current?.querySelector('dialog[open]')) return;
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      if (dialogRef.current.querySelector('dialog[open]')) return;
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), video[controls], [tabindex]:not([tabindex="-1"])',
      )).filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'));
      if (!controls.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const activeIndex = controls.indexOf(document.activeElement as HTMLElement);
      if (activeIndex < 0 || (event.shiftKey && activeIndex === 0) || (!event.shiftKey && activeIndex === controls.length - 1)) {
        event.preventDefault();
        (event.shiftKey ? controls[controls.length - 1] : controls[0]).focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
      else requestAnimationFrame(() => {
        // The directory may be unmounted while the full-screen reader owns
        // the page. Restore focus to the newly mounted result on close.
        const result = Array.from(document.querySelectorAll<HTMLElement>('.main .search-content-entry, .main .case-card'))
          .find((element) => element.textContent?.includes(content.name));
        const fallback = document.querySelector<HTMLElement>('.main input[type="search"], .main button, .brand');
        (result ?? fallback)?.focus();
      });
    };
  }, []);
  useEffect(() => {
    setPage(1);
    pageHistory.current = [];
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
  const orientationLandscape = previewOrientation ? previewOrientation === 'landscape' : landscape;
  const horizontal = previewOrientation
    ? orientationLandscape
    : layoutMode === 'auto'
      ? landscape && !panel
      : layoutMode === 'double';
  useEffect(() => {
    if (!orientationLandscape && panel) {
      const reader = dialogRef.current?.querySelector('.reader-area');
      reader?.querySelectorAll('video').forEach((video) => video.pause());
    }
    if (panel) panelCloseRef.current?.focus();
  }, [orientationLandscape, panel]);
  const leaves = useMemo(() => readerLeaves(assets, pdfCounts), [assets, pdfCounts]);
  const total = leaves.length;
  const pages = readerSpread(leaves, page, horizontal);
  const current = leaves[pages[0] - 1];
  useEffect(() => {
    if (thumbnails) thumbnailsRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [page, thumbnails]);
  useEffect(() => { pageHistory.current = []; }, [leaves]);
  const visiblePdfs = Array.from(new Map(
    pages.map((n) => leaves[n - 1]).filter((leaf) => leaf?.kind === 'pdf' && !leaf.pending && !leaf.failed)
      .map((leaf) => [leaf.ref, leaf]),
  ).values());
  const pageLoading = Boolean(current?.pending);
  const activeOffers = data.offers.filter((o) => activeOffer(o)).sort(byOrder);
  const contentEshopUrl = content.eshopUrl?.trim() ?? '';
  useReaderPreload({
    leaves,
    visiblePages: pages,
    resolveAssetUrl,
    pdfs,
    resetKey: `${content.id}:${reload}:${assets.map((asset) => asset.ref).join('\0')}`,
  });
  const { scale, setScale, targetRef: pinchRef } = usePinchZoom(page);
  const spreadRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const [baseSpread, setBaseSpread] = useState<{ width: number; height: number; paperWidths: number[] } | null>(null);
  // Measure the fitted, unzoomed spread. Transforming that exact layout makes
  // 125% mean 1.25 times what the user saw at 100%, for any image aspect ratio.
  useLayoutEffect(() => {
    const spread = spreadRef.current;
    if (!spread || scale !== 1) return;
    const papers = Array.from(spread.querySelectorAll<HTMLElement>('.paper'));
    const measure = () => {
      if (scaleRef.current !== 1) return;
      const rects = papers.map((paper) => paper.getBoundingClientRect());
      if (!rects.length || rects.some((rect) => !rect.width || !rect.height)) return;
      const next = {
        width: Math.max(...rects.map((rect) => rect.right)) - Math.min(...rects.map((rect) => rect.left)),
        height: Math.max(...rects.map((rect) => rect.height)),
        paperWidths: rects.map((rect) => rect.width),
      };
      setBaseSpread((previous) => previous &&
        Math.abs(previous.width - next.width) < 0.1 &&
        Math.abs(previous.height - next.height) < 0.1 &&
        previous.paperWidths.length === next.paperWidths.length &&
        previous.paperWidths.every((width, index) => Math.abs(width - next.paperWidths[index]) < 0.1)
        ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(spread);
    papers.forEach((paper) => observer.observe(paper));
    return () => observer.disconnect();
  }, [scale, page, horizontal, orientationLandscape, panel, leaves, reload]);
  // A new fit is required after rotation, layout choice or panel resizing.
  useEffect(() => {
    setScale(1);
    pageHistory.current = [];
  }, [horizontal, orientationLandscape, panel, setScale]);
  useEffect(() => {
    const resetForResize = () => setScale(1);
    window.addEventListener('resize', resetForResize);
    return () => window.removeEventListener('resize', resetForResize);
  }, [setScale]);
  const navigate = (next: number) => {
    setPage(next);
  };
  const canGoPrevious = page > 1 && !pageLoading;
  const canGoNext = total > 0 && pages.at(-1)! < total && !pageLoading;
  const goPrevious = () => navigate(pageHistory.current.pop() ?? previousReaderPage(leaves, page, horizontal));
  const goNext = () => {
    pageHistory.current.push(page);
    navigate(Math.min(total, pages.at(-1)! + 1));
  };
  useSwipeNavigation(pinchRef, {
    enabled: scale <= 1,
    onSwipe: (direction) => {
      if (direction === 'next' && canGoNext) goNext();
      if (direction === 'previous' && canGoPrevious) goPrevious();
    },
  });
  const place = trail(data.folders, content.folderId).map(folderLabel);
  const placeTitle = place.at(-1) || content.name;
  const currentFolder = data.folders.find((item) => item.id === content.folderId);
  const units = data.folders
    .filter((item) => currentFolder && item.parentId === currentFolder.parentId)
    .sort(byOrder);
  const linkedCount = (content.eshopProducts?.length ?? 0) + content.productIds.length;
  const corners = useMemo(() => {
    const buckets = new Map<string, number[]>();
    leaves.forEach((leaf, index) => {
      const id = showcaseCornerId(leaf.label, Boolean(content.salesKit));
      buckets.set(id, [...(buckets.get(id) ?? []), index]);
    });
    return SHOWCASE_CORNERS.map((corner) => {
      const indexes = buckets.get(corner.id) ?? [];
      const first = leaves[indexes[0]];
      return {
        ...corner,
        count: indexes.length,
        page: indexes.length ? indexes[0] + 1 : 0,
        thumb: first?.kind === 'image' && first.ref ? resolveAssetUrl(first.ref) : '',
      };
    }).filter((corner) => content.salesKit || corner.count > 0);
  }, [leaves, content.salesKit, resolveAssetUrl]);
  const activeCorner = current ? showcaseCornerId(current.label, Boolean(content.salesKit)) : '';
  const photograph = pages.length === 1 && current?.kind === 'image' && activeCorner === 'render';
  const ContentHeading = previewOrientation ? 'h2' : 'h1';
  const handleClose = () => {
    closeRef.current();
  };
  const closePanel = () => {
    setPanel(false);
    setSelectedProduct(null);
    requestAnimationFrame(() => shoppingButtonRef.current?.focus());
  };
  const selectProduct = (selection: ProductSelection) => {
    setSelectedProduct(selection);
    requestAnimationFrame(() => dialogRef.current?.querySelector('.shopping-panel')?.scrollTo({ top: 0 }));
  };
  const returnToProducts = () => {
    const key = selectedProduct ? productSelectionKey(selectedProduct) : '';
    setSelectedProduct(null);
    requestAnimationFrame(() => {
      const source = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('[data-product-select]') ?? [])
        .find((element) => element.dataset.productSelect === key);
      (source ?? panelCloseRef.current)?.focus();
    });
  };
  const markup = (
    <div className="ecat">
    <div
      role="dialog"
      aria-modal="true"
      ref={dialogRef}
      tabIndex={-1}
      className={`viewer shell source-shell viewer-shell ${orientationLandscape ? 'landscape' : 'portrait'} ${horizontal ? 'spread-double' : 'spread-single'} ${panel ? 'panel-open' : ''} ${thumbnails ? 'rail-open' : ''} ${previewOrientation ? 'is-preview' : ''}`}
      aria-label={`${content.name} 閱讀器`}
    >
      <header className="viewer-top masthead">
        <div className="brand showcase-brand">
          <img src="/pricerite-logo.svg" alt="Pricerite 實惠" />
          <div className="viewer-heading">
            <span>家具展示</span>
            <ContentHeading className="viewer-content-title">{content.name}</ContentHeading>
          </div>
        </div>
        <div className="showcase-tools">
          <button
            type="button"
            ref={returnButtonRef}
            className="subtle viewer-back"
            onClick={handleClose}
            aria-label="返回目錄"
          >
            <Home size={16} />
            <span className="viewer-back-label">返回目錄</span>
          </button>
          {switchFolder && !previewOrientation && (
            <button
              type="button"
              className="subtle viewer-back"
              aria-haspopup="dialog"
              aria-controls="browse"
              onClick={() => setSheet('browse')}
            >
              換個單位
            </button>
          )}
        </div>
      </header>
      <div className="viewer-body">
        <section className={`reader-area viewer-stage source-stage housing-viewer${photograph ? ' is-photograph' : ''}`} aria-label="展示內容">
          <div className="reader-scroll reader-pinch housing-canvas" ref={pinchRef}>
            {current && current.kind !== 'link' ? (
              <div
                className={`page-spread-host${scale > 1 ? ' is-zoomed' : ''}`}
                style={scale > 1 && baseSpread ? { width: baseSpread.width * scale, height: baseSpread.height * scale } : undefined}
              >
                <div
                  className="page-spread"
                  data-testid="page-spread"
                  ref={spreadRef}
                  style={scale > 1 && baseSpread ? { position: 'absolute', left: 0, top: 0, width: baseSpread.width, height: baseSpread.height, transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}
                >
                  {pages.map((n, index) => {
                    const leaf = leaves[n - 1];
                    return (
                      <div
                        className={`paper${leaf.pending ? ' is-loading' : ''}`}
                        key={`${n}-${reload}`}
                        data-page={n}
                        data-file-kind={leaf.kind}
                        data-file-label={leaf.label}
                        style={scale > 1 && baseSpread ? { flex: '0 0 auto', width: baseSpread.paperWidths[index], maxWidth: 'none' } : undefined}
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
                          onMediaReady={() => setScale(1)}
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
          {current?.kind === 'image' && (
            <button type="button" className="round image-expand" aria-label="放大檢視圖片" aria-haspopup="dialog" aria-controls="image-dialog" onClick={() => setSheet('zoom')}>
              <Maximize2 size={18} />
            </button>
          )}
          <div className="source-title">
            <span>{placeTitle}</span>
          </div>
          {leaves.length > 1 && leaves.length <= 12 && (
            <div className="showcase-dots source-dots" aria-label="頁面位置">
              {leaves.map((leaf, index) => (
                <button
                  key={`${leaf.ref}-dot-${index}`}
                  type="button"
                  className={pages.includes(index + 1) ? 'is-current' : ''}
                  aria-label={`第 ${index + 1} 頁`}
                  aria-current={pages.includes(index + 1) ? 'page' : undefined}
                  onClick={() => navigate(index + 1)}
                />
              ))}
            </div>
          )}
          {thumbnails && leaves.length > 0 && (
            <aside id="reader-thumbnails" ref={thumbnailsRef} className="showcase-thumbs housing-rail" aria-label="頁面縮圖">
              {leaves.map((leaf, index) => (
                <button
                  key={`${leaf.ref}-${index}`}
                  type="button"
                  className={pages.includes(index + 1) ? 'is-current' : ''}
                  aria-current={pages.includes(index + 1) ? 'page' : undefined}
                  aria-label={`${leaf.label}，第 ${index + 1} 頁`}
                  onClick={() => navigate(index + 1)}
                >
                  {leaf.kind === 'image' && leaf.ref ? (
                    <img src={resolveAssetUrl(leaf.ref)} alt="" />
                  ) : (
                    <span className="showcase-thumb-fallback">{FILE_KIND_LABEL[leaf.kind]}</span>
                  )}
                  <small>{leaf.label.replace(' Floor Plan', '').replace(/（[一二]）/g, '')}</small>
                  <b>{index + 1}</b>
                </button>
              ))}
              {leaves.length > 3 && <span className="thumbnail-scroll-hint">上下滑動查看更多</span>}
            </aside>
          )}
          <button
            type="button"
            className={`shopping-toggle showcase-price pill source-purchase-entry ${panel ? 'selected' : ''}`}
            ref={shoppingButtonRef}
            onClick={() => panel ? closePanel() : setPanel(true)}
            aria-expanded={panel}
            aria-controls="shopping-panel"
            aria-label={panel ? '關閉相關產品面板' : '查看相關產品'}
          >
            價格與下單
            <span>{linkedCount}</span>
          </button>
          <div className="page-controls">
            <button
              className="icon-btn source-arrow source-arrow-prev"
              aria-label="上一頁"
              disabled={!canGoPrevious}
              onClick={goPrevious}
            >
              <ChevronLeft size={18} />
            </button>
            <span aria-live="polite">
              {pageLoading ? '載入中' : `${pages.join('–') || '0'} / ${total}`}
            </span>
            <button
              className="icon-btn source-arrow source-arrow-next"
              aria-label="下一頁"
              disabled={!canGoNext}
              onClick={goNext}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
        <div className="reader-toolbar source-dock">
            {!previewOrientation && (
              <>
                <div className="source-dock-main">
                <p className="showcase-prompt source-dock-intro">
                  <strong>想看看哪個角落？</strong>
                  <span>輕點切換，選「單頁」看清細節</span>
                </p>
                <div className="showcase-corners source-category-list">
                  {corners.map((corner) => (
                    <button
                      key={corner.id}
                      type="button"
                      className={`source-category${activeCorner === corner.id ? ' is-current' : ''}`}
                      aria-pressed={activeCorner === corner.id}
                      disabled={!corner.page}
                      onClick={() => navigate(corner.page)}
                    >
                      {corner.id === 'full' ? (
                        <span className="showcase-corner-qr" aria-hidden="true"><QrCode size={28} /></span>
                      ) : corner.thumb ? (
                        <img src={corner.thumb} alt="" />
                      ) : (
                        <span className="showcase-thumb-fallback">{corner.count}</span>
                      )}
                      <span>
                        <strong>{corner.title}{corner.count ? ` (${corner.count})` : ''}</strong>
                        <small>{corner.subtitle}</small>
                      </span>
                    </button>
                  ))}
                </div>
                {leaves.length > 1 && (
                  <button type="button" className="round source-thumbnails" aria-label={thumbnails ? '收起頁面縮圖' : '顯示頁面縮圖'} aria-expanded={thumbnails} aria-controls="reader-thumbnails" onClick={() => setThumbnails((value) => !value)}>
                    <PanelsTopLeft size={22} />
                  </button>
                )}
                </div>
                <div className="viewer-reader-controls">
                <span className="reader-page-position" aria-live="polite">{pageLoading ? '載入中' : `第 ${pages.join('–') || '0'} / ${total} 頁`}</span>
                {leaves.length > 1 && (
                  <button type="button" className="viewer-mode-button" aria-haspopup="dialog" aria-controls="browse" onClick={() => setSheet('documents')}>
                    選擇房型文件
                  </button>
                )}
                <div className="viewer-layout-controls" role="group" aria-label="頁面顯示模式">
                  <button type="button" className="viewer-mode-button viewer-single-page" title="切換至單頁，放大閱讀內容" aria-pressed={!horizontal} onClick={() => setLayoutMode('single')}>單頁</button>
                  <button type="button" className="viewer-mode-button" aria-pressed={horizontal} onClick={() => setLayoutMode('double')}>雙頁</button>
                </div>
                {visiblePdfs.map((pdf) => (
                  <a className="viewer-pdf-link" key={pdf.ref} href={resolveAssetUrl(pdf.ref)} target="_blank" rel="noopener noreferrer">
                    開啟原 PDF{visiblePdfs.length > 1 ? `：${pdf.label}` : ''} <ExternalLink size={14} />
                  </a>
                ))}
                <div className="zoom-controls" role="group" aria-label="展示內容縮放">
                  <button type="button" className="icon-btn" aria-label="縮小" disabled={scale <= 1} onClick={() => setScale(scale - 0.25)}><Minus size={18} /></button>
                  <button type="button" className="viewer-zoom-reset" onClick={() => setScale(1)} aria-label={`目前縮放 ${Math.round(scale * 100)}%，重設縮放`}>{Math.round(scale * 100)}%</button>
                  <button type="button" className="icon-btn" aria-label="放大" disabled={scale >= 3} onClick={() => setScale(scale + 0.25)}><Plus size={18} /></button>
                </div>
                </div>
              </>
            )}
        </div>
        {panel && (
          <aside className="shopping-panel" id="shopping-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">SHOP THE IDEAS</span>
                <h2>{selectedProduct ? '產品詳情' : '相關產品及優惠'}</h2>
              </div>
              <button
                className="icon-btn"
                ref={panelCloseRef}
                aria-label="收起相關產品"
                onClick={closePanel}
              >
                <X size={21} />
              </button>
            </div>
            {selectedProduct ? (
              <ContentProductDetail content={content} products={data.products} prices={eshopPrices} selection={selectedProduct} onSelect={selectProduct} onBack={returnToProducts} />
            ) : (
            <>
            <ContentShoppingLinks content={content} products={data.products} eshopPrices={eshopPrices} onProductSelect={selectProduct} />
            {activeOffers.length > 0 || contentEshopUrl ? (
              <>
                <div className="list-title">
                  <h3>eShop 組合優惠</h3>
                </div>
                {activeOffers.map((o) => (
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
                {activeOffers.length === 0 && (
                  <article className="offer-card offer-card--content-link">
                    <div>
                      <EshopQrCode url={contentEshopUrl} />
                      <External url={contentEshopUrl} className="text-link">
                        前往 eShop
                      </External>
                    </div>
                  </article>
                )}
                <p className="panel-footnote">優惠由內容團隊更新，實際詳情以 eShop 為準。</p>
              </>
            ) : (
              <div className="content-shopping-links-empty eshop-links-empty">
                <Tag size={16} aria-hidden="true" />
                <span>暫時未有 eShop 組合優惠</span>
              </div>
            )}
            </>
            )}
          </aside>
        )}
      </div>
      {sheet && (
        <ShowcaseViewerSheets
          sheet={sheet}
          onClose={() => setSheet(null)}
          data={data}
          content={content}
          units={units}
          pages={leaves.map((leaf, index) => ({
            name: leaf.label,
            image: leaf.kind === 'image' && leaf.ref ? resolveAssetUrl(leaf.ref) : '',
            page: index + 1,
          }))}
          imageSrc={current?.kind === 'image' && current.ref ? resolveAssetUrl(current.ref) : ''}
          imageLabel={current?.label || content.name}
          onOpenContent={(contentId) => openContent?.(contentId)}
          onSelectPage={(next) => navigate(next)}
        />
      )}
    </div>
    </div>
  );
  if (typeof document === 'undefined') return null;
  // CMS uses a native modal dialog in the browser top layer. Its preview must
  // live inside that dialog, otherwise the browser makes the preview inert.
  const activeDialog = document.activeElement?.closest('dialog[open]');
  const previewDialog = activeDialog ?? Array.from(document.querySelectorAll('dialog[open]')).at(-1);
  return createPortal(markup, previewOrientation && previewDialog ? previewDialog : document.body);
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
  onMediaReady,
}: {
  contentName: string;
  leaf: ReaderLeaf;
  page: number;
  pdf?: PDFDocumentProxy;
  reload: number;
  heroSrc: string;
  resolveAssetUrl: (ref: string) => string;
  onRetry: () => void;
  onMediaReady: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const [networkOnly, setNetworkOnly] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const src = networkOnly ? assetUrl(leaf.ref) : resolveAssetUrl(leaf.ref);
  const handleMediaError = () => {
    // A stale offline-cache blob URL must not hide a file that is still online.
    if (!networkOnly && src.startsWith('blob:')) setNetworkOnly(true);
    else setFailed(true);
  };
  useEffect(() => {
    setFailed(false);
    setNetworkOnly(false);
    const node = imageRef.current;
    setImageReady(Boolean(node?.complete && node.naturalWidth > 0));
    if (node?.complete && node.naturalWidth > 0) onMediaReady();
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
    return <PdfPage pdf={pdf} page={leaf.pdfPage!} onReady={onMediaReady} />;
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
        key={`${leaf.ref}-${page}-${reload}-${networkOnly}`}
        src={src}
        aria-label={leaf.label}
        controls
        playsInline
        preload="auto"
        onLoadedMetadata={onMediaReady}
        onError={handleMediaError}
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
    <div className={`reader-image-frame${imageReady ? '' : ' is-loading'}`}>
      {!imageReady && (
        <div className="reader-page-loading" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>正在載入圖片…</span>
        </div>
      )}
      <img
        key={`${leaf.ref}-${reload}-${networkOnly}`}
        ref={imageRef}
        className={`reader-media${imageReady ? '' : ' is-pending'}`}
        src={src}
        alt={`${contentName}，${leaf.label}，第 ${page} 頁`}
        decoding="async"
        onLoad={() => { setImageReady(true); onMediaReady(); }}
        onError={handleMediaError}
      />
    </div>
  );
}
function PdfPage({ pdf, page, onReady }: { pdf: PDFDocumentProxy; page: number; onReady: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
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
        return task.promise.then(() => { if (!stopped) onReadyRef.current(); });
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
