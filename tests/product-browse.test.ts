import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import { productBrowseValues, productTagsForContent } from '../src/lib/product-browse';
import { buildSearchVocabulary, searchCatalogEnhanced, suggestForCategory } from '../src/lib/catalog-search';

test('product filters keep legacy product labels and exclude room and style labels', () => {
  const data = initialCatalog(true);
  const content = data.contents.find((item) => item.id === 'kit-a')!;
  content.tags = ['梳化', '客廳', '兩房', '米白色', '不確定類別'];
  const before = [...content.tags];
  const values = productBrowseValues(data, content);
  assert.ok(values.includes('梳化'));
  for (const other of ['客廳', '兩房', '米白色', '不確定類別']) assert.equal(values.includes(other), false);
  assert.deepEqual(content.tags, before);
  assert.ok(searchCatalogEnhanced(data, null, '客廳').contents.some((entry) => entry.item.id === content.id));
  assert.equal(searchCatalogEnhanced(data, null, '產品 客廳').contents.some((entry) => entry.item.id === content.id), false);
  assert.ok(searchCatalogEnhanced(data, null, '產品 梳化').contents.some((entry) => entry.item.id === content.id));
  assert.ok(searchCatalogEnhanced(data, null, '產品 sofa').contents.some((entry) => entry.item.id === content.id));
});

test('explicit product tags are additive and legacy records without the field remain valid', () => {
  const data = initialCatalog(true);
  const content = data.contents.find((item) => item.id === 'kit-a')!;
  delete content.productTags;
  content.tags = ['異形產品'];
  assert.equal(productTagsForContent(data, content).includes('異形產品'), false);
  content.productTags = ['異形產品'];
  assert.ok(productBrowseValues(data, content).includes('異形產品'));
  assert.ok(searchCatalogEnhanced(data, null, '產品 異形產品').contents.some((entry) => entry.item.id === content.id));
  assert.deepEqual(content.tags, ['異形產品']);
});

test('product suggestions use confirmed product labels, and room scenes stay in general search', () => {
  const data = initialCatalog(true);
  const content = data.contents.find((item) => item.id === 'kit-a')!;
  content.name = '特別測試三房單位';
  content.productTags = ['特別測試床頭櫃'];
  data.scenes.push({ id: 'scene-room-check', name: '特別測試三房場景', image: '', url: '', order: 0, active: true });
  const vocabulary = buildSearchVocabulary(data, null);
  assert.ok(suggestForCategory(vocabulary, 'product', '特別測試床頭櫃').includes('特別測試床頭櫃'));
  assert.equal(suggestForCategory(vocabulary, 'product', '特別測試三房').length, 0);
  assert.ok(searchCatalogEnhanced(data, null, '特別測試三房').scenes.some((entry) => entry.item.id === 'scene-room-check'));
  assert.equal(searchCatalogEnhanced(data, null, '產品 特別測試三房').scenes.length, 0);
});
