'use client';
import { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import type { EshopProductLink } from '@/lib/types';
import { api } from '@/lib/client';
import { isPriceriteProductUrl } from '@/lib/pricerite-eshop-url';
import { extractPriceriteProductUrls, readEshopImportFile } from '@/lib/eshop-product-import';
import { MAX_ESHOP_PRODUCTS } from '@/lib/eshop-product-limits';

type BulkImportResult = {
  products: EshopProductLink[];
  errors: { url: string; message: string }[];
};

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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [busy, setBusy] = useState(false);
  const [importNote, setImportNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_ESHOP_PRODUCTS - products.length;

  const add = async () => {
    const url = input.trim();
    onError('');
    setImportNote('');
    if (!url) return;
    if (!isPriceriteProductUrl(url)) {
      onError('只接受 Pricerite eShop 產品 HTTPS 連結。');
      return;
    }
    if (products.some((item) => item.url === url)) {
      onError('此產品連結已加入。');
      return;
    }
    if (products.length >= MAX_ESHOP_PRODUCTS) {
      onError(`每份內容最多 ${MAX_ESHOP_PRODUCTS} 個產品連結。`);
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
    setImportNote('');
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

  const bulkImport = async (text: string) => {
    onError('');
    setImportNote('');
    const urls = extractPriceriteProductUrls(text);
    if (!urls.length) {
      onError('找不到有效的 eShop 產品連結。');
      return;
    }
    if (!remaining) {
      onError(`每份內容最多 ${MAX_ESHOP_PRODUCTS} 個產品連結。`);
      return;
    }

    const existing = new Set(products.map((item) => item.url));
    const pending = urls.filter((url) => !existing.has(url)).slice(0, remaining);
    const skipped = urls.length - pending.length;

    if (!pending.length) {
      onError('所有連結都已加入，沒有新產品可匯入。');
      return;
    }

    setBusy(true);
    try {
      const response = await api<BulkImportResult>('/api/eshop-product/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: pending }),
      });
      const merged = [...products];
      const seen = new Set(existing);
      for (const product of response.products) {
        if (seen.has(product.url) || merged.length >= MAX_ESHOP_PRODUCTS) continue;
        seen.add(product.url);
        merged.push(product);
      }
      onChange(merged);
      setBulkText('');
      const parts = [`成功加入 ${response.products.length} 個產品`];
      if (response.errors.length) parts.push(`${response.errors.length} 個失敗`);
      if (skipped) parts.push(`${skipped} 個重複已略過`);
      setImportNote(parts.join('，') + '。');
    } catch (error) {
      onError(error instanceof Error ? error.message : '批量匯入失敗。');
    } finally {
      setBusy(false);
    }
  };

  const onFileChange = async (file: File | undefined) => {
    if (!file) return;
    onError('');
    setImportNote('');
    try {
      const text = await readEshopImportFile(file);
      setBulkText(text);
      setBulkOpen(true);
      await bulkImport(text);
    } catch (error) {
      onError(error instanceof Error ? error.message : '無法讀取檔案。');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
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
            disabled={busy || remaining <= 0}
          />
          <button
            type="button"
            className="secondary"
            onClick={() => void add()}
            disabled={busy || !input.trim() || remaining <= 0}
          >
            {busy ? '讀取中…' : '加入'}
          </button>
        </div>
      </label>
      <small>
        貼上 eShop 產品連結後會自動讀取產品名稱、品牌及編號，並用於搜尋。展示時會即時顯示最新價格。
        {remaining < MAX_ESHOP_PRODUCTS && `（尚可加入 ${remaining} 個）`}
      </small>

      <details
        className="eshop-product-bulk"
        open={bulkOpen}
        onToggle={(event) => setBulkOpen((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary>批量加入 / 匯入</summary>
        <div className="eshop-product-bulk-body">
          <label>
            貼上多個連結
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`每行一個連結，例如：\nhttps://www.pricerite.com.hk/hk/zh-hk/products/...\nhttps://www.pricerite.com.hk/hk/zh-hk/products/...`}
              rows={6}
              disabled={busy || remaining <= 0}
            />
          </label>
          <div className="eshop-product-bulk-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => void bulkImport(bulkText)}
              disabled={busy || !bulkText.trim() || remaining <= 0}
            >
              {busy ? '匯入中…' : '匯入並加入'}
            </button>
            <label className="secondary eshop-product-file-button">
              選擇 CSV
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                hidden
                disabled={busy || remaining <= 0}
                onChange={(e) => void onFileChange(e.target.files?.[0])}
              />
            </label>
          </div>
          <small>
            支援每行一個連結、逗號或分號分隔，亦可直接從 Excel 複製一整欄連結貼上。CSV 檔案請只包含連結欄（Excel
            可「另存為 CSV」）。
          </small>
        </div>
      </details>

      {importNote && <p className="eshop-product-import-note">{importNote}</p>}

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
