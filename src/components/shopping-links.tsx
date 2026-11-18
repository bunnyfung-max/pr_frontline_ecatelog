'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Content, EshopProductLink, Product } from '@/lib/types';
import { splitProductTitleDimensions } from '@/lib/product-title-dimensions';
import {
  fetchLiveEshopProducts,
  toLiveEshopProduct,
  type LiveEshopProduct,
} from '@/lib/eshop-product-client';
import { External, Thumb } from './ui';

const NO_ESHOP_PRODUCTS: EshopProductLink[] = [];

function safeLink(value?: string) {
  if (!value) return '';
  try {
    return new URL(value).protocol === 'https:' ? value : '';
  } catch {
    return '';
  }
}

export type EshopProductPrices = {
  live: LiveEshopProduct[];
  loading: boolean;
};

export type ProductSelection =
  | { kind: 'catalog'; id: string }
  | { kind: 'eshop'; url: string };

export function productSelectionKey(selection: ProductSelection) {
  return selection.kind === 'catalog' ? `catalog:${selection.id}` : `eshop:${selection.url}`;
}

/** Fetch live eShop prices when enabled; otherwise show saved catalog snapshots. */
export function useEshopProductPrices(
  products: EshopProductLink[],
  enabled = true,
): EshopProductPrices {
  const urls = useMemo(() => products.map((product) => product.url).join('\0'), [products]);
  const [live, setLive] = useState<LiveEshopProduct[]>(() => products.map(toLiveEshopProduct));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLive(products.map(toLiveEshopProduct));
    if (!products.length || !enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void fetchLiveEshopProducts(products)
      .then((next) => {
        if (active) setLive(next);
      })
      .catch(() => {
        if (!active) return;
        setLive(products.map(toLiveEshopProduct));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [urls, products, enabled]);

  return { live, loading };
}

export function PurchaseLinks({ storeUrl, eshopUrl }: { storeUrl?: string; eshopUrl?: string }) {
  const store = safeLink(storeUrl);
  const eshop = safeLink(eshopUrl);
  if (!store && !eshop) return <p className="purchase-links-empty">購物連結待設定</p>;
  return (
    <div className="purchase-links">
      {store && (
        <External url={store} className="secondary">
          前往自在購
        </External>
      )}
      {eshop && (
        <External url={eshop} className="secondary">
          前往 eShop
        </External>
      )}
    </div>
  );
}

export function StorePurchaseLink({ storeUrl }: { storeUrl?: string }) {
  const store = safeLink(storeUrl);
  if (!store) return <p className="purchase-links-empty">自在購連結待設定</p>;
  return (
    <div className="purchase-links">
      <External url={store} className="secondary">
        前往自在購
      </External>
    </div>
  );
}

function EshopProductCards({
  prices,
  onProductSelect,
}: {
  prices: EshopProductPrices;
  onProductSelect?: (selection: ProductSelection) => void;
}) {
  const { live, loading } = prices;
  return (
    <>
      <div className="list-title">
        <h3>eShop 產品</h3>
        <span>{loading ? '價格更新中…' : '即時價格'}</span>
      </div>
      {live.map((product) => {
        const url = safeLink(product.url);
        const unavailable = !product.available;
        const showStrike =
          product.basePrice != null &&
          product.specialPrice != null &&
          product.specialPrice < product.basePrice;
        return (
          <article
            className={`related-product eshop-product-card${unavailable ? ' is-unavailable' : ''}`}
            key={product.url}
            aria-label={product.title}
          >
            {onProductSelect ? (
              <button className="mini-image product-detail-trigger" type="button" aria-label={`查看 ${product.title} 詳情`} data-product-select={`eshop:${product.url}`} onClick={() => onProductSelect({ kind: 'eshop', url: product.url })}>
                <Thumb src={product.image} fallbackLabel={product.brand || '產品'} />
                <span>查看詳情</span>
              </button>
            ) : (
              <div className="mini-image"><Thumb src={product.image} fallbackLabel={product.brand || '產品'} /></div>
            )}
            <div className="related-product-copy">
              <h3>{product.title}</h3>
              <small>{product.brand}</small>
              <div className="eshop-product-price-row">
                {loading ? (
                  <span className="eshop-product-price muted">價格更新中…</span>
                ) : unavailable ? (
                  <span className="eshop-product-price muted">已下架或連結失效</span>
                ) : product.priceLabel ? (
                  <>
                    <span className="eshop-product-price">{product.priceLabel}</span>
                    {showStrike && (
                      <span className="eshop-product-price-old">
                        HK${product.basePrice!.toLocaleString('en-HK', { maximumFractionDigits: 1 })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="eshop-product-price muted">價格未能更新</span>
                )}
              </div>
              {url && !unavailable && (
                <External url={url} className="secondary">
                  前往 eShop
                </External>
              )}
            </div>
          </article>
        );
      })}
    </>
  );
}

export function ContentShoppingLinks({
  content,
  products,
  eshopPrices,
  onProductSelect,
}: {
  content: Content;
  products: Product[];
  eshopPrices?: EshopProductPrices;
  onProductSelect?: (selection: ProductSelection) => void;
}) {
  const tags = content.tags ?? [];
  const eshopProducts = content.eshopProducts ?? [];
  const internalEshopPrices = useEshopProductPrices(eshopPrices ? NO_ESHOP_PRODUCTS : eshopProducts);
  const resolvedEshopPrices = eshopPrices ?? internalEshopPrices;
  const related = products.filter((p) => content.productIds.includes(p.id));
  return (
    <>
      {safeLink(content.storeUrl) ? (
        <section className="store-card content-shopping-links" aria-label="本份內容購物連結">
          <ShoppingBag size={27} aria-hidden="true" />
          <h3>{content.name}</h3>
          <p>本份內容 / 自在購連結</p>
          <StorePurchaseLink storeUrl={content.storeUrl} />
        </section>
      ) : (
        <section className="content-shopping-links-empty" aria-label="本份內容購物連結">
          <ShoppingBag size={16} aria-hidden="true" />
          <span>自在購連結待設定</span>
        </section>
      )}
      {tags.length > 0 && (
        <section className="content-tags" aria-label="內容標籤">
          <div className="list-title">
            <h3>標籤</h3>
          </div>
          <div className="tag-list tag-list-panel">
            {tags.map((tag) => (
              <span className="tag-chip" key={tag}>{tag}</span>
            ))}
          </div>
        </section>
      )}
      {eshopProducts.length > 0 && <EshopProductCards prices={resolvedEshopPrices} onProductSelect={onProductSelect} />}
      {related.length > 0 && (
        <>
          <div className="list-title">
            <h3>相關產品</h3>
          </div>
          {related.map((p) => (
            <article className="related-product" key={p.id} aria-label={p.name}>
              {onProductSelect ? (
                <button className="mini-image product-detail-trigger" type="button" aria-label={`查看 ${p.name} 詳情`} data-product-select={`catalog:${p.id}`} onClick={() => onProductSelect({ kind: 'catalog', id: p.id })}>
                  <Thumb src={p.image} />
                  <span>查看詳情</span>
                </button>
              ) : (
                <div className="mini-image"><Thumb src={p.image} /></div>
              )}
              <div className="related-product-copy">
                <h3>{p.name}</h3>
                <small>{[p.brand, p.colour, p.style].filter(Boolean).join(' · ')}</small>
                <PurchaseLinks storeUrl={p.storeUrl} eshopUrl={p.url} />
              </div>
            </article>
          ))}
        </>
      )}
    </>
  );
}

/** A single-product view of the same published data and prices as the list. */
export function ContentProductDetail({
  content,
  products,
  prices,
  selection,
  onSelect,
}: {
  content: Content;
  products: Product[];
  prices: EshopProductPrices;
  selection: ProductSelection;
  onSelect: (selection: ProductSelection) => void;
}) {
  const related = products.filter((product) => content.productIds.includes(product.id));
  const choices: ProductSelection[] = [
    ...content.eshopProducts.map((product) => ({ kind: 'eshop' as const, url: product.url })),
    ...related.map((product) => ({ kind: 'catalog' as const, id: product.id })),
  ];
  const selectionKey = productSelectionKey(selection);
  const index = choices.findIndex((choice) => productSelectionKey(choice) === selectionKey);
  const catalog = selection.kind === 'catalog' ? related.find((product) => product.id === selection.id) : undefined;
  const saved = selection.kind === 'eshop' ? content.eshopProducts.find((product) => product.url === selection.url) : undefined;
  const live = prices.live.find((product) => product.url === (saved?.url || catalog?.url));
  const title = catalog?.name || live?.title || saved?.title || '產品資料';
  const { displayTitle, dimensions } = splitProductTitleDimensions(title);
  const brand = catalog?.brand || live?.brand || saved?.brand;
  const code = catalog?.code || live?.sku || saved?.sku;
  const image = catalog?.image || live?.image || saved?.image || '';
  const unavailable = Boolean(live && !live.available);
  const eshopUrl = unavailable ? '' : catalog?.url || saved?.url;
  const description = live?.description || saved?.description;
  const showPrice = Boolean(live?.priceLabel && !unavailable);
  const showStrike = live?.basePrice != null && live?.specialPrice != null && live.specialPrice < live.basePrice;
  const metadata = [
    ['產品編號', code],
    ['品牌', brand],
    ['尺寸', displayTitle !== title ? dimensions : undefined],
    ['顏色', catalog?.colour],
    ['風格', catalog?.style],
  ].filter((item) => Boolean(item[1]));

  return (
    <section className="product-detail" aria-label="單件產品詳情">
      {index < 0 || (!catalog && !saved) ? (
        <p role="status">這件產品已不在本份內容內。</p>
      ) : (
        <>
          <div className="product-detail-image"><Thumb src={image} fallbackLabel={brand || '產品'} /></div>
          <p className="product-detail-brand">{brand || '產品資料'}</p>
          <h3 className="product-detail-title" aria-live="polite">{displayTitle}</h3>
          <div className="product-detail-price" aria-live="polite">
            {prices.loading && (saved || live) ? <span>價格更新中…</span> : unavailable ? <span>已下架或連結失效</span> : showPrice ? (
              <>
                <strong>{live!.priceLabel}</strong>
                {showStrike && <del>HK${live!.basePrice!.toLocaleString('en-HK', { maximumFractionDigits: 1 })}</del>}
              </>
            ) : <span>{saved ? '價格未能更新' : '價格以購物頁面為準'}</span>}
          </div>
          {metadata.length > 0 && (
            <dl className="product-detail-specs">
              {metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          )}
          {description && <p className="product-detail-description">{description}</p>}
          <div className="product-detail-actions">
            <PurchaseLinks storeUrl={catalog?.storeUrl} eshopUrl={eshopUrl} />
            <nav className="product-detail-pager" aria-label="切換產品">
              <button type="button" aria-label="上一件產品" disabled={index === 0} onClick={() => onSelect(choices[index - 1])}><ChevronLeft size={18} /></button>
              <span aria-live="polite">{index + 1} / {choices.length}</span>
              <button type="button" aria-label="下一件產品" disabled={index === choices.length - 1} onClick={() => onSelect(choices[index + 1])}><ChevronRight size={18} /></button>
            </nav>
          </div>
        </>
      )}
    </section>
  );
}
