const HOST_RE = /^(.+\.)?pricerite\.com\.hk$/i;

export function isPriceriteEshopUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && HOST_RE.test(parsed.hostname);
  } catch {
    return false;
  }
}

export function isPriceriteProductUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      isPriceriteEshopUrl(parsed.toString()) && /\/products\//i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function normalizePriceriteEshopUrl(value: string): string {
  const parsed = new URL(value.trim());
  if (!isPriceriteEshopUrl(parsed.toString())) throw new Error('只接受 Pricerite eShop HTTPS 連結。');
  parsed.hash = '';
  return parsed.toString();
}

export function normalizePriceriteProductUrl(value: string): string {
  const normalized = normalizePriceriteEshopUrl(value);
  if (!isPriceriteProductUrl(normalized)) throw new Error('只接受 Pricerite eShop 產品 HTTPS 連結。');
  return normalized;
}
