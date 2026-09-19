'use client';
import { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import type { EshopProductLink } from '@/lib/types';
import { api } from '@/lib/client';
import { isPriceriteProductUrl } from '@/lib/pricerite-eshop-url';

export function EshopProductField({
  products,
  onChange,
  onError,
}: {
  products: EshopProductLink[];
  onChange: (products: EshopProductLink[]) => void;
  onError: (message: string) => void;
}) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const add = async () => {
    const url = input.trim();
    onError('');
    if (!url) return;
    if (!isPriceriteProductUrl(url)) {
      onError('只接受 Pricerite eShop 產品 HTTPS 連結。');
      return;
    }
    if (products.some((item) => item.url === url)) {
      onError('此產品連結已加入。');
      return;
    }
    if (products.length >= 30) {
      onError('每份內容最多 30 個產品連結。');
      return;
    }
    setBusy(true);
    try {
      const snapshot = await api<EshopProductLink & { priceLabel?: string }>('/api/eshop-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      onChange([
        ...products,
        {
          url: snapshot.url,
          title: snapshot.title,
          brand: snapshot.brand,
          sku: snapshot.sku,
          description: snapshot.description,
          image: snapshot.image,
          fetchedAt: snapshot.fetchedAt,
        },
      ]);
      setInput('');
    } catch (error) {
      onError(error instanceof Error ? error.message : '無法讀取產品資料。');
    } finally {
      setBusy(false);
    }
  };
  const refresh = async (url: string) => {
    onError('');
    setBusy(true);
    try {
      const snapshot = await api<EshopProductLink & { priceLabel?: string }>('/api/eshop-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      onChange(
        products.map((item) =>
          item.url === url
            ? {
                url: snapshot.url,
                title: snapshot.title,
                brand: snapshot.brand,
                sku: snapshot.sku,
                description: snapshot.description,
                image: snapshot.image,
                fetchedAt: snapshot.fetchedAt,
              }
            : item,
        ),
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : '無法更新產品資料。');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="eshop-product-field">
      <label>
        eShop 產品連結
        <div className="eshop-product-input-row">
          <input
            type="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void add();
              }
            }}
            placeholder="https://www.pricerite.com.hk/hk/zh-hk/products/..."
            maxLength={2000}
            disabled={busy}
          />
          <button type="button" className="secondary" onClick={() => void add()} disabled={busy || !input.trim()}>
            {busy ? '讀取中…' : '加入'}
          </button>
        </div>
      </label>
      <small>貼上 eShop 產品連結後會自動讀取產品名稱、品牌及編號，並用於搜尋。展示時會即時顯示最新價格。</small>
      {products.length > 0 && (
        <div className="eshop-product-list">
          {products.map((product) => (
            <article className="eshop-product-item" key={product.url}>
              <div className="eshop-product-copy">
                <strong>{product.title}</strong>
                <small>
                  {[product.brand, product.sku].filter(Boolean).join(' · ') || product.url}
                </small>
              </div>
              <div className="eshop-product-actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`更新 ${product.title}`}
                  onClick={() => void refresh(product.url)}
                  disabled={busy}
                >
                  <UploadCloud size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`移除 ${product.title}`}
                  onClick={() => onChange(products.filter((item) => item.url !== product.url))}
                  disabled={busy}
                >
                  <X size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
