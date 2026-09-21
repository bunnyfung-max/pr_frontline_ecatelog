'use client';

import { useMemo } from 'react';
import QRCode from 'react-qr-code';

function toQrUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return null;
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

export function EshopQrCode({
  url,
  hint = '請客人掃描 QR 碼開啟 eShop',
}: {
  url: string;
  hint?: string;
}) {
  const qrUrl = useMemo(() => toQrUrl(url), [url]);
  if (!qrUrl) return null;

  return (
    <div className="eshop-qr-display">
      <div className="eshop-qr-code" aria-hidden="true">
        <QRCode value={qrUrl} size={160} />
      </div>
      <p className="eshop-qr-hint">{hint}</p>
    </div>
  );
}
