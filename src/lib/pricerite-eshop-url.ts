const HOST_RE = /^(.+\.)?pricerite\.com\.hk$/i;

export function isPriceriteProductUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === 'https:' &&
      HOST_RE.test(parsed.hostname) &&
      /\/products\//i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function normalizePriceriteProductUrl(value: string): string {
  const parsed = new URL(value);
  if (!isPriceriteProductUrl(parsed.toString())) throw new Error('只接受 Pricerite eShop 產品 HTTPS 連結。');
  parsed.hash = '';
  return parsed.toString();
}
