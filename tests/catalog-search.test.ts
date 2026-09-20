import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import {
  buildSearchVocabulary,
  parseSearchQuery,
  searchCatalogEnhanced,
  suggestForCategory,
} from '../src/lib/catalog-search';
import { searchCatalog } from '../src/lib/catalog';

test('parseSearchQuery understands category prefixes', () => {
  assert.deepEqual(parseSearchQuery('品牌 RIVO'), {
    category: 'brand',
    terms: ['rivo'],
    raw: '品牌 RIVO',
  });
  assert.deepEqual(parseSearchQuery('product:sofa'), {
    category: 'product',
    terms: ['sofa'],
    raw: 'product:sofa',
  });
  assert.deepEqual(parseSearchQuery('屋苑'), {
    category: 'estate',
    terms: [],
    raw: '屋苑',
  });
});

test('search vocabulary is built from catalog and eshop data only', () => {
  const data = initialCatalog(true);
  const vocabulary = buildSearchVocabulary(data, null, false);
  assert.ok(vocabulary.brands.includes('RIVO'));
  assert.ok(vocabulary.products.some((value) => value.includes('衣櫃')));
  assert.ok(vocabulary.spaces.includes('客廳'));
  assert.equal(vocabulary.brands.includes('虛構品牌'), false);
});

test('category search limits field scope', () => {
  const data = initialCatalog(true);
  const brandOnly = searchCatalogEnhanced(data, 'estate-a', '品牌 RIVO', { includeDrafts: true });
  assert.equal(brandOnly.contents[0]?.item.id, 'kit-a');
  const colourMiss = searchCatalogEnhanced(data, 'estate-a', '顏色 橡木', { includeDrafts: true });
  assert.equal(colourMiss.contents.length, 0);
});

test('synonyms expand sofa queries without inventing catalog data', () => {
  const data = initialCatalog(true);
  assert.equal(searchCatalog(data, 'estate-a', 'sofa').contents[0]?.id, 'kit-a');
  assert.equal(searchCatalog(data, 'estate-a', '沙發').contents[0]?.id, 'kit-a');
});

test('facets filter by tags, brands and eshop links', () => {
  const data = initialCatalog(true);
  const tagged = searchCatalogEnhanced(data, null, '', {
    includeDrafts: true,
    facets: { spaces: ['客廳'], brands: [], hasEshop: false },
  });
  assert.ok(tagged.contents.some((entry) => entry.item.id === 'kit-a'));
  assert.equal(tagged.contents.some((entry) => entry.item.id === 'poster-demo'), false);

  const eshopOnly = searchCatalogEnhanced(data, null, '', {
    includeDrafts: true,
    facets: { spaces: [], brands: [], hasEshop: true },
  });
  assert.ok(eshopOnly.contents.every((entry) => (entry.item.eshopProducts?.length ?? 0) > 0));
});

test('suggestions come from existing vocabulary', () => {
  const data = initialCatalog(true);
  const vocabulary = buildSearchVocabulary(data, 'estate-a', true);
  const suggestions = suggestForCategory(vocabulary, 'brand', 'riv', 5);
  assert.deepEqual(suggestions, ['RIVO']);
});
