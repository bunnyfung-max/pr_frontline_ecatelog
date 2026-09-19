'use client';

import { ShoppingBag } from 'lucide-react';
import type { Content, Product } from '@/lib/types';
import { External, Thumb } from './ui';

function safeLink(value?: string) {
  if (!value) return '';
  try {
    return new URL(value).protocol === 'https:' ? value : '';
  } catch {
    return '';
  }
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

export function ContentShoppingLinks({
  content,
  products,
}: {
  content: Content;
  products: Product[];
}) {
  const related = products.filter((p) => content.productIds.includes(p.id));
  return (
    <>
      <section className="store-card content-shopping-links" aria-label="本份內容購物連結">
        <ShoppingBag size={27} aria-hidden="true" />
        <h3>{content.name}</h3>
        <p>本份內容 / Sales Kit 專屬連結</p>
        <PurchaseLinks storeUrl={content.storeUrl} eshopUrl={content.eshopUrl} />
      </section>
      {related.length > 0 && (
        <div className="list-title">
          <h3>相關產品</h3>
        </div>
      )}
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
  );
}
