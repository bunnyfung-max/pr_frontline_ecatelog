import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPriceriteProductUrls } from '../src/lib/eshop-product-import';

const a =
  'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/alpha-111111?store_id=701';
const b =
  'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/table/beta-222222?store_id=701';

test('extract product urls from newline and comma separated text', () => {
  assert.deepEqual(extractPriceriteProductUrls(`${a}\n${b}`), [a, b]);
  assert.deepEqual(extractPriceriteProductUrls(`${a}, ${b}`), [a, b]);
});

test('extract product urls from excel-style tab separated paste', () => {
  assert.deepEqual(extractPriceriteProductUrls(`${a}\t${b}`), [a, b]);
});

test('extract product urls from quoted csv cells and dedupe repeats', () => {
  const text = `"${a}"\n"${a}"\n${b}`;
  assert.deepEqual(extractPriceriteProductUrls(text), [a, b]);
});

test('ignore non-product pricerite links', () => {
  const promo = 'https://www.pricerite.com.hk/hk/zh-hk/promotions/summer-sale';
  assert.deepEqual(extractPriceriteProductUrls(`${promo}\n${a}`), [a]);
});
