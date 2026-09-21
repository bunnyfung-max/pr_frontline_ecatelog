'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Content, EshopProductLink, Product } from '@/lib/types';
import { api } from '@/lib/client';
import { External, Thumb } from './ui';
import { EshopQrCode } from './eshop-qr-code';

function safeLink(value?: string) {
  if (!value) return '';
  try {
    return new URL(value).protocol === 'https:' ? value : '';
  } catch {
    return '';
  }
}

type LiveEshopProduct = EshopProductLink & {
  price: number | null;
  priceLabel: string;
  basePrice: number | null;
  specialPrice: number | null;
  available: boolean;
};

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

function toLiveProduct(product: EshopProductLink): LiveEshopProduct {
  return {
    ...product,
    price: null,
    priceLabel: '',
    basePrice: null,
    specialPrice: null,
    available: true,
  };
}

export type EshopProductPrices = {
  live: LiveEshopProduct[];
  loading: boolean;
};

async function fetchEshopProductPrices(
  products: EshopProductLink[],
): Promise<LiveEshopProduct[]> {
  if (!products.length) return [];
  const params = new URLSearchParams();
  for (const product of products) params.append('url', product.url);
  const response = await api<{ products: LiveEshopProduct[] }>(
    `/api/eshop-product?${params.toString()}`,
  );
  const byUrl = new Map(response.products.map((item) => [item.url, item]));
  return products.map((product) => {
    const current = byUrl.get(product.url);
    if (!current) {
      return {
        ...product,
        price: null,
        priceLabel: '',
        basePrice: null,
        specialPrice: null,
        available: false,
      };
    }
    return {
      ...product,
      title: current.title || product.title,
      brand: current.brand || product.brand,
      sku: current.sku || product.sku,
      image: current.image || product.image,
      price: current.price,
      priceLabel: current.priceLabel,
      basePrice: current.basePrice,
      specialPrice: current.specialPrice,
      available: current.available,
    };
  });
}

/** Prefetch live eShop prices as soon as the viewer opens. */
export function useEshopProductPrices(products: EshopProductLink[]): EshopProductPrices {
  const urls = useMemo(() => products.map((product) => product.url).join('\0'), [products]);
  const [live, setLive] = useState<LiveEshopProduct[]>(() => products.map(toLiveProduct));
  const [loading, setLoading] = useState(products.length > 0);
  useEffect(() => {
    if (!products.length) {
      setLoading(false);
      return;
    }
    let active = true;
    setLive(products.map(toLiveProduct));
    setLoading(true);
    void fetchEshopProductPrices(products)
      .then((next) => {
        if (active) setLive(next);
      })
      .catch(() => {
        if (!active) return;
        setLive(
          products.map((product) => ({
            ...product,
            price: null,
            priceLabel: '',
            basePrice: null,
            specialPrice: null,
            available: true,
          })),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [urls, products]);
  return { live, loading };
}

function EshopProductCards({
  prices,
}: {
  prices: EshopProductPrices;
}) {
  const { live, loading } = prices;
  return (
    <>
      <div className="list-title">
        <h3>eShop 產品</h3>
        <span>{loading ? '更新價格中…' : '即時價格'}</span>
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
            <div className="mini-image">
              <Thumb src={product.image} fallbackLabel={product.brand || '產品'} />
            </div>
            <div className="related-product-copy">
              <h3>{product.title}</h3>
              <small>{product.brand}</small>
              <div className="eshop-product-price-row">
                {loading ? (
                  <span className="eshop-product-price muted">讀取價格中…</span>
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
}: {
  content: Content;
  products: Product[];
  eshopPrices?: EshopProductPrices;
}) {
  const tags = content.tags ?? [];
  const eshopProducts = content.eshopProducts ?? [];
  const internalEshopPrices = useEshopProductPrices(eshopPrices ? [] : eshopProducts);
  const resolvedEshopPrices = eshopPrices ?? internalEshopPrices;
  const related = products.filter((p) => content.productIds.includes(p.id));
  return (
    <>
      <section className="store-card content-shopping-links" aria-label="本份內容購物連結">
        <ShoppingBag size={27} aria-hidden="true" />
        <h3>{content.name}</h3>
        <p>本份內容 / Sales Kit 專屬連結</p>
        <PurchaseLinks storeUrl={content.storeUrl} eshopUrl={content.eshopUrl} />
        {content.eshopUrl?.trim() && <EshopQrCode url={content.eshopUrl} />}
      </section>
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
      {eshopProducts.length > 0 && <EshopProductCards prices={resolvedEshopPrices} />}
      {related.length > 0 && (
        <>
          <div className="list-title">
            <h3>相關產品</h3>
          </div>
          {related.map((p) => (
            <article className="related-product" key={p.id} aria-label={p.name}>
              <div className="mini-image">
                <Thumb src={p.image} />
              </div>
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
