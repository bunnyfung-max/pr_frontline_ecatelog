'use client';

import { useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { isPriceriteEshopUrl, normalizePriceriteEshopUrl } from '@/lib/pricerite-eshop-url';

export function EshopQrPanel() {
  const [input, setInput] = useState('');
  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (!isPriceriteEshopUrl(trimmed)) {
      return { error: '請輸入有效的 Pricerite eShop HTTPS 連結。' };
    }
    try {
      return { url: normalizePriceriteEshopUrl(trimmed) };
    } catch {
      return { error: '連結格式不正確。' };
    }
  }, [input]);

  return (
    <section className="eshop-qr-panel" aria-label="eShop QR 碼">
      <label>
        <span className="field-label">eShop 連結</span>
        <input
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="貼上 eShop 連結"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </label>
      {result?.error && <p className="form-error">{result.error}</p>}
      {result?.url && (
        <div className="eshop-qr-display">
          <div className="eshop-qr-code" aria-hidden="true">
            <QRCode value={result.url} size={180} />
          </div>
          <p className="eshop-qr-hint">請客人掃描 QR 碼開啟 eShop</p>
          <p className="eshop-qr-url muted">{result.url}</p>
        </div>
      )}
    </section>
  );
}
