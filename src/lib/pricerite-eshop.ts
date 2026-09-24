import 'server-only';
import { fetchPriceriteProduct } from './pricerite-eshop-fetch';

export type { EshopProductSnapshot } from './pricerite-eshop-parse';
export { parsePriceriteProductHtml } from './pricerite-eshop-parse';
export { fetchPriceriteProduct };

export function formatHkd(amount: number | null): string {
  if (amount == null) return '';
  return `HK$${amount.toLocaleString('en-HK', { maximumFractionDigits: 1 })}`;
}
