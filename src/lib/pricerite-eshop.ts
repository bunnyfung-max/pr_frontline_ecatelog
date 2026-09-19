import 'server-only';
import { normalizePriceriteProductUrl } from './pricerite-eshop-url';
import {
  parsePriceriteProductHtml,
  type EshopProductSnapshot,
} from './pricerite-eshop-parse';

export type { EshopProductSnapshot };
export { parsePriceriteProductHtml };

function skuFromUrl(url: string): string {
  const segment = new URL(url).pathname.split('/').pop() || '';
  const match = segment.match(/(\d{4,})/);
  return match?.[1] || '';
}

export async function fetchPriceriteProduct(url: string): Promise<EshopProductSnapshot> {
  const normalized = normalizePriceriteProductUrl(url);
  const response = await fetch(normalized, {
    headers: {
      'User-Agent': 'PriceriteCatalog/1.0',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    cache: 'no-store',
  });
  if (response.status === 404)
    return {
      url: normalized,
      title: '',
      brand: '',
      sku: skuFromUrl(normalized),
      description: '',
      image: '',
      basePrice: null,
      specialPrice: null,
      available: false,
    };
  if (!response.ok) throw new Error('無法讀取 eShop 產品資料，請稍後再試。');
  const html = await response.text();
  const snapshot = parsePriceriteProductHtml(html, normalized);
  if (!snapshot.title && !snapshot.available)
    return { ...snapshot, url: normalized, available: false };
  return { ...snapshot, url: normalized, available: true };
}

export function formatHkd(amount: number | null): string {
  if (amount == null) return '';
  return `HK$${amount.toLocaleString('en-HK', { maximumFractionDigits: 1 })}`;
}
