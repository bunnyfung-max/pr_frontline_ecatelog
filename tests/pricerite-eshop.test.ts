import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parsePriceriteProductHtml } from '../src/lib/pricerite-eshop-parse';
import { isPriceriteProductUrl } from '../src/lib/pricerite-eshop-url';

const fixture = path.join(import.meta.dirname, 'fixtures', 'pricerite-product.html');

const sampleUrl =
  'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/wardrobe/rivo-263521?isSearchPMCode=true&store_id=701';

test('accepts only Pricerite eShop product HTTPS links', () => {
  assert.equal(isPriceriteProductUrl(sampleUrl), true);
  assert.equal(isPriceriteProductUrl('https://example.com/products/sofa'), false);
  assert.equal(isPriceriteProductUrl('http://www.pricerite.com.hk/hk/zh-hk/products/sofa'), false);
});

test('parses product title, brand, sku, prices and image from eShop HTML', () => {
  const html = readFileSync(fixture, 'utf8');
  const snapshot = parsePriceriteProductHtml(html, sampleUrl);
  assert.match(snapshot.title, /RIVO 雙趟門三櫃桶衣櫃/);
  assert.equal(snapshot.brand, 'RIVO');
  assert.equal(snapshot.sku, '263521');
  assert.equal(snapshot.basePrice, 6999);
  assert.equal(snapshot.specialPrice, 6699);
  assert.match(snapshot.image, /^https:\/\//);
  assert.equal(snapshot.available, true);
});

test('marks missing product payload as unavailable', () => {
  const snapshot = parsePriceriteProductHtml('<html><head><title>404</title></head></html>', sampleUrl);
  assert.equal(snapshot.available, false);
  assert.equal(snapshot.title, '');
});
