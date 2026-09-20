import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatEshopProductLabel,
  formatLegacyProductLabel,
  filterSearchMatchReasons,
} from '../src/lib/linked-product-display';

test('formatEshopProductLabel keeps human-readable title and colour variant', () => {
  const label = formatEshopProductLabel({
    url: 'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/wardrobe/rivo-263521',
    title: 'RIVO 雙趟門三櫃桶衣櫃1200W x 600D x 2160Hmm - 奶油白配橡木紋',
    brand: 'RIVO',
    sku: '263521',
    description: '',
    image: '',
    fetchedAt: '2026-09-20T00:00:00Z',
  });
  assert.match(label, /RIVO/);
  assert.match(label, /衣櫃/);
  assert.match(label, /奶油白配橡木紋/);
  assert.equal(label.includes('263521'), false);
  assert.equal(label.includes('1200W'), false);
});

test('formatEshopProductLabel enriches sparse titles from brand and category', () => {
  assert.equal(
    formatEshopProductLabel({
      url: 'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/cheers-972783',
      title: 'CHEERS 梳化',
      brand: 'CHEERS',
      sku: '972783',
      description: '',
      image: '',
      fetchedAt: '2026-09-20T00:00:00Z',
    }),
    'CHEERS 梳化',
  );
  assert.equal(
    formatEshopProductLabel({
      url: 'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/study-desk/261518',
      title: '書枱',
      brand: 'Pricerite',
      sku: '261518',
      description: '',
      image: '',
      fetchedAt: '2026-09-20T00:00:00Z',
    }),
    '書枱',
  );
});

test('formatLegacyProductLabel prefers name with colour or style', () => {
  assert.equal(
    formatLegacyProductLabel({
      id: 'sofa',
      name: '示例雙人梳化',
      code: 'DEMO-001',
      brand: '示例品牌',
      colour: '米白色',
      style: '北歐簡約',
      keywords: '',
      image: '',
      url: '',
    }),
    '示例雙人梳化 · 米白色',
  );
});

test('filterSearchMatchReasons hides redundant brand hits when products are listed', () => {
  const reasons = filterSearchMatchReasons(
    [
      { label: '品牌', value: 'CHEERS' },
      { label: '標籤', value: '客廳' },
    ],
    ['FERGAL 梳化', 'CHEERS 梳化'],
  );
  assert.deepEqual(reasons, [{ label: '標籤', value: '客廳' }]);
});
