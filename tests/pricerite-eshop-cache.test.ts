import test from 'node:test';
import assert from 'node:assert/strict';
import type { EshopProductSnapshot } from '../src/lib/pricerite-eshop-parse';
import {
  clearPriceriteProductCache,
  fetchPriceriteProductCached,
} from '../src/lib/pricerite-eshop-cache';

const sampleUrl =
  'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/wardrobe/rivo-263521?isSearchPMCode=true&store_id=701';

test('pricerite product cache reuses snapshots until cleared', async () => {
  clearPriceriteProductCache();
  let calls = 0;
  const fetcher = async (url: string): Promise<EshopProductSnapshot> => {
    calls += 1;
    return {
      url,
      title: 'Cached Sofa',
      brand: 'RIVO',
      sku: '123',
      description: '',
      image: 'https://example.com/sofa.jpg',
      basePrice: 1000,
      specialPrice: 900,
      available: true,
    };
  };

  const first = await fetchPriceriteProductCached(sampleUrl, { fetcher });
  const second = await fetchPriceriteProductCached(sampleUrl, { fetcher });
  assert.equal(first.title, 'Cached Sofa');
  assert.equal(second.title, 'Cached Sofa');
  assert.equal(calls, 1);
  clearPriceriteProductCache(sampleUrl);
  await fetchPriceriteProductCached(sampleUrl, { fresh: true, fetcher });
  assert.equal(calls, 2);
});
