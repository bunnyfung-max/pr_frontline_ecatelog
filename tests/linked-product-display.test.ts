import test from 'node:test';
import assert from 'node:assert/strict';
import { experienceDemoContents } from '../src/lib/experience-demo-contents';
import { initialCatalog } from '../src/lib/seed';
import {
  contentLinkedProductLabelsForQuery,
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

test('formatEshopProductLabel keeps model name for experience demo sofas', () => {
  const label = formatEshopProductLabel({
    url: 'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/fergal-975663',
    title: 'FERGAL MENA T330 三座位功能性儲物真皮梳化 1905W x 813D x 1003Hmm',
    brand: 'FERGAL',
    sku: '975663',
    description: '',
    image: '',
    fetchedAt: '2026-09-20T00:00:00Z',
  });
  assert.match(label, /MENA T330/);
  assert.match(label, /真皮梳化/);
  assert.equal(label.includes('1905W'), false);
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

test('contentLinkedProductLabelsForQuery only returns products matching the search', () => {
  const data = initialCatalog();
  data.contents = experienceDemoContents();
  const content = data.contents[0];
  const labels = contentLinkedProductLabelsForQuery(data, content, '品牌 ESSENZO');
  assert.equal(labels.length, 1);
  assert.match(labels[0], /ESSENZO/);
  assert.equal(labels.some((label) => /FERGAL|CHEERS/.test(label)), false);
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
