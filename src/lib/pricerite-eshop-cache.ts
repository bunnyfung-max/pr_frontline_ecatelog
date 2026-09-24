import type { EshopProductSnapshot } from './pricerite-eshop-parse';
import { fetchPriceriteProduct } from './pricerite-eshop-fetch';
import { normalizePriceriteProductUrl } from './pricerite-eshop-url';

const TTL_MS = 10 * 60 * 1000;

type CacheEntry = { snapshot: EshopProductSnapshot; expires: number };

const cache = new Map<string, CacheEntry>();

export function clearPriceriteProductCache(url?: string) {
  if (!url) {
    cache.clear();
    return;
  }
  cache.delete(normalizePriceriteProductUrl(url));
}

export async function fetchPriceriteProductCached(
  url: string,
  options?: { fresh?: boolean; fetcher?: typeof fetchPriceriteProduct },
): Promise<EshopProductSnapshot> {
  const normalized = normalizePriceriteProductUrl(url);
  if (!options?.fresh) {
    const hit = cache.get(normalized);
    if (hit && hit.expires > Date.now()) return hit.snapshot;
  }
  const load = options?.fetcher ?? fetchPriceriteProduct;
  const snapshot = await load(url);
  cache.set(normalized, { snapshot, expires: Date.now() + TTL_MS });
  return snapshot;
}
