'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  X,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Maximize,
  Minimize,
} from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Catalog, Content } from '@/lib/types';
import { TYPE_LABEL } from '@/lib/types';
import { activeOffer, byOrder } from '@/lib/catalog';
import { readerAssets, readerLeaves, readerSpread, previousReaderPage } from '@/lib/sales-kit';
import { assetUrl } from '@/lib/client';
import { External, Thumb } from './ui';
import { ContentShoppingLinks } from './shopping-links';
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
  const dialog = useRef<HTMLDialogElement>(null);
  const [landscape, setLandscape] = useState(true);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [panel, setPanel] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pdfs, setPdfs] = useState<Record<string, PDFDocumentProxy>>({});
  const [pdfReady, setPdfReady] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const assets = useMemo(
    () => readerAssets(content),
    [content.files, content.type, content.salesKit],
  );
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    const media = matchMedia('(orientation: landscape)');
    const update = () => setLandscape(media.matches);
    update();
    media.addEventListener('change', update);
    const onFullscreen = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      media.removeEventListener('change', update);
      document.removeEventListener('fullscreenchange', onFullscreen);
      el?.close();
    };
  }, []);
  useEffect(() => {
    setPage(1);
    setZoom(1);
    setError('');
  }, [assets]);
  useEffect(() => {
    let cancelled = false;
    const tasks: ReturnType<(typeof import('pdfjs-dist'))['getDocument']>[] = [];
    setPdfs({});
    setPdfReady(false);
    const refs = [...new Set(assets.filter((a) => a.kind === 'pdf').map((a) => a.ref))];
    if (!refs.length) {
      setPdfReady(true);
      return;
    }
    void (async () => {
      const loaded: Record<string, PDFDocumentProxy> = {};
      try {
        const lib = await import('pdfjs-dist');
        if (cancelled) return;
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        await Promise.all(
          refs.map(async (ref) => {
            try {
              const task = lib.getDocument({ url: assetUrl(ref) });
              tasks.push(task);
              loaded[ref] = await task.promise;
            } catch {
              /* Keep a failed attachment in sequence; later files remain accessible. */
            }
          }),
        );
      } finally {
        if (!cancelled) {
          setPdfs(loaded);
          setPdfReady(true);
        }
      }
    })().catch(() => {
      /* A worker/import failure is shown at each PDF's position. */
    });
    return () => {
      cancelled = true;
      tasks.forEach((task) => {
        void task.destroy().catch(() => {});
      });
    };
  }, [assets, reload]);
  const horizontal = previewOrientation ? previewOrientation === 'landscape' : landscape;
  const leaves = useMemo(
    () =>
      readerLeaves(
        assets,
        Object.fromEntries(Object.entries(pdfs).map(([ref, doc]) => [ref, doc.numPages])),
      ),
    [assets, pdfs],
  );
  const total = leaves.length;
  const pages = readerSpread(leaves, page, horizontal);
  const current = leaves[pages[0] - 1];
  const loading = assets.some((asset) => asset.kind === 'pdf') && !pdfReady;
  const canZoom =
    !loading && current && !current.failed && (current.kind === 'image' || current.kind === 'pdf');
  const navigate = (next: number) => {
    setPage(next);
    setZoom(1);
    setError('');
  };
  const closeViewer = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    close();
  };
  return (
    <dialog
      ref={dialog}
      className={`viewer ${horizontal ? 'landscape' : 'portrait'} ${panel ? 'panel-open' : ''} ${previewOrientation ? 'is-preview' : ''}`}
      onCancel={(e) => {
        e.preventDefault();
        closeViewer();
      }}
      aria-label={`${content.name} 閱讀器`}
    >
      <header className="viewer-top">
        <button className="subtle" onClick={closeViewer}>
          <ArrowLeft size={19} />
          <span>返回目錄</span>
        </button>
        <div className="viewer-title">
          <strong>{content.name}</strong>
          <small>
            {previewOrientation
              ? `預覽 · ${horizontal ? '橫向雙頁' : '直向單頁'}`
              : `${content.salesKit ? 'Sales Kit' : TYPE_LABEL[content.type]} · ${horizontal ? '橫向雙頁' : '直向單頁'}`}
          </small>
        </div>
        <button
          className={`shopping-toggle ${panel ? 'selected' : ''}`}
          onClick={() => setPanel(!panel)}
          aria-expanded={panel}
          aria-controls="shopping-panel"
        >
          <ShoppingBag size={19} />
          <span>購物功能列</span>
        </button>
      </header>
      <div className="viewer-body">
        <section className="reader-area" aria-label="展示內容">
          <div className="reader-scroll">
            {loading ? (
              <div className="loading" role="status">
                正在載入 PDF 頁次…
              </div>
            ) : error || current?.failed ? (
              <div className="empty">
                <h2>內容未能載入</h2>
                <p role="alert">
                  {error || `${current.label}：PDF 未能載入，可重試或翻到下一頁。`}
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    setError('');
                    setReload((k) => k + 1);
                  }}
                >
                  重新載入
                </button>
              </div>
            ) : current?.kind === 'image' || current?.kind === 'pdf' ? (
              <div
                className={`page-spread ${zoom > 1 ? 'zoomed' : ''}`}
                data-testid="page-spread"
                style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
              >
                {pages.map((n) => {
                  const leaf = leaves[n - 1];
                  return (
                    <div
                      className="paper"
                      key={`${n}-${reload}`}
                      data-page={n}
                      data-file-kind={leaf.kind}
                      data-file-label={leaf.label}
                    >
                      {leaf.kind === 'pdf' && pdfs[leaf.ref] ? (
                        <PdfPage pdf={pdfs[leaf.ref]} page={leaf.pdfPage!} />
                      ) : (
                        <img
                          src={assetUrl(leaf.ref)}
                          alt={`${content.name}，${leaf.label}，第 ${n} 頁`}
                          onError={() => setError('圖片未能載入，請檢查檔案或網絡連線。')}
                        />
                      )}
                      <span className="paper-number">{n}</span>
                    </div>
                  );
                })}
              </div>
            ) : current?.kind === 'video' ? (
              <video
                className="reader-video"
                key={`${current.ref}-${page}-${reload}`}
                src={assetUrl(current.ref)}
                aria-label={current.label}
                controls
                playsInline
                preload="metadata"
                onError={() => setError('影片未能播放，請確認影片格式及檔案狀態。')}
              />
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
            <div className="zoom-controls">
              <button
                className="icon-btn"
                aria-label="縮小"
                disabled={zoom <= 1 || !canZoom}
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <ZoomOut size={19} />
              </button>
              <button className="zoom-reset" onClick={() => setZoom(1)} aria-label="重設縮放">
                {Math.round(zoom * 100)}%
              </button>
              <button
                className="icon-btn"
                aria-label="放大"
                disabled={zoom >= 2.5 || !canZoom}
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              >
                <ZoomIn size={19} />
              </button>
            </div>
            <div className="page-controls">
              <button
                className="icon-btn"
                aria-label="上一頁"
                disabled={page <= 1 || loading}
                onClick={() => navigate(previousReaderPage(leaves, page, horizontal))}
              >
                <ChevronLeft />
              </button>
              <span aria-live="polite">
                {loading ? '載入中' : `${pages.join('–') || '0'} / ${total}`}
              </span>
              <button
                className="icon-btn"
                aria-label="下一頁"
                disabled={!total || pages.at(-1)! >= total || loading}
                onClick={() => navigate(Math.min(total, pages.at(-1)! + 1))}
              >
                <ChevronRight />
              </button>
            </div>
            <button
              className="icon-btn fullscreen-control"
              aria-label={fullscreen ? '退出全螢幕' : '全螢幕'}
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else
                  void dialog.current
                    ?.requestFullscreen?.()
                    .catch(() => setError('此瀏覽器未支援全螢幕，可繼續正常閱讀。'));
              }}
            >
              {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
            </button>
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
                    <External url={o.url} className="text-link">
                      查看組合優惠
                    </External>
                  </div>
                </article>
              ))}
            {!data.offers.some((o) => activeOffer(o)) && (
              <p className="muted">暫時沒有已啟用的組合優惠。</p>
            )}
            <p className="panel-footnote">優惠由內容團隊更新，實際詳情以 eShop 為準。</p>
          </aside>
        )}
      </div>
    </dialog>
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
