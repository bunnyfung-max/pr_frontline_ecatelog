import 'server-only';
import { formatHkd } from './pricerite-eshop';
import { fetchPriceriteProductCached } from './pricerite-eshop-cache';
import type { EshopProductSnapshot } from './pricerite-eshop-parse';
import type { EshopProductLink } from './types';

function emptySnapshot(url: string): EshopProductSnapshot {
  return {
    url,
    title: '',
    brand: '',
    sku: '',
    description: '',
    image: '',
    basePrice: null,
    specialPrice: null,
    available: false,
  };
}

export function toLiveSnapshot(snapshot: EshopProductSnapshot) {
  const price = snapshot.specialPrice ?? snapshot.basePrice;
  return {
    ...snapshot,
    price,
    priceLabel: formatHkd(price),
    basePriceLabel: formatHkd(snapshot.basePrice),
    specialPriceLabel: formatHkd(snapshot.specialPrice),
  };
}

export async function loadEshopProductSnapshot(url: string, fresh = false) {
  try {
    return toLiveSnapshot(await fetchPriceriteProductCached(url, { fresh }));
  } catch {
    return toLiveSnapshot(emptySnapshot(url));
  }
}

export function toEshopProductLink(snapshot: EshopProductSnapshot): EshopProductLink {
  return {
    url: snapshot.url,
    title: snapshot.title,
    brand: snapshot.brand,
    sku: snapshot.sku,
    description: snapshot.description,
    image: snapshot.image,
    fetchedAt: new Date().toISOString(),
  };
}
