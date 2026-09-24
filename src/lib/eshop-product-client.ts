import type { EshopProductLink } from './types';
import { api } from './client';

export type LiveEshopProduct = EshopProductLink & {
  price: number | null;
  priceLabel: string;
  basePrice: number | null;
  specialPrice: number | null;
  available: boolean;
};

const CLIENT_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { product: LiveEshopProduct; expires: number };

const resolved = new Map<string, CacheEntry>();
const inflightByUrl = new Map<string, Promise<LiveEshopProduct>>();

export function toLiveEshopProduct(product: EshopProductLink): LiveEshopProduct {
  return {
    ...product,
    price: null,
    priceLabel: '',
    basePrice: null,
    specialPrice: null,
    available: Boolean(product.title),
  };
}

function mergeLiveProduct(
  product: EshopProductLink,
  current: LiveEshopProduct | undefined,
): LiveEshopProduct {
  if (!current) {
    return {
      ...product,
      price: null,
      priceLabel: '',
      basePrice: null,
      specialPrice: null,
      available: false,
    };
  }
  return {
    ...product,
    title: current.title || product.title,
    brand: current.brand || product.brand,
    sku: current.sku || product.sku,
    image: current.image || product.image,
    price: current.price,
    priceLabel: current.priceLabel,
    basePrice: current.basePrice,
    specialPrice: current.specialPrice,
    available: current.available,
  };
}

async function fetchUrls(urls: string[]): Promise<Map<string, LiveEshopProduct>> {
  const unique = [...new Set(urls)];
  if (!unique.length) return new Map();

  const params = new URLSearchParams();
  for (const url of unique) params.append('url', url);
  const response = await api<{ products: LiveEshopProduct[] }>(
    `/api/eshop-product?${params.toString()}`,
  );
  const byUrl = new Map(response.products.map((item) => [item.url, item]));
  const now = Date.now();
  for (const url of unique) {
    const product = byUrl.get(url);
    if (!product) continue;
    resolved.set(url, { product, expires: now + CLIENT_TTL_MS });
  }
  return byUrl;
}

async function refreshUrl(url: string): Promise<LiveEshopProduct> {
  const existing = inflightByUrl.get(url);
  if (existing) return existing;

  const task = fetchUrls([url]).then((byUrl) => {
    const product = byUrl.get(url);
    if (!product) {
      return {
        url,
        title: '',
        brand: '',
        sku: '',
        description: '',
        image: '',
        fetchedAt: '',
        price: null,
        priceLabel: '',
        basePrice: null,
        specialPrice: null,
        available: false,
      };
    }
    return product;
  }).finally(() => {
    inflightByUrl.delete(url);
  });

  inflightByUrl.set(url, task);
  return task;
}

/** Shared client cache for live eShop product snapshots. */
export async function fetchLiveEshopProducts(
  products: EshopProductLink[],
  options?: { enabled?: boolean },
): Promise<LiveEshopProduct[]> {
  if (!products.length) return [];
  if (options?.enabled === false) return products.map(toLiveEshopProduct);

  const now = Date.now();
  const staleUrls = products
    .map((product) => product.url)
    .filter((url) => {
      const hit = resolved.get(url);
      return !hit || hit.expires <= now;
    });

  if (staleUrls.length) {
    const uniqueStale = [...new Set(staleUrls)];
    await Promise.all(uniqueStale.map((url) => refreshUrl(url)));
  }

  return products.map((product) => {
    const hit = resolved.get(product.url);
    return mergeLiveProduct(product, hit?.product);
  });
}
