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
import {
  composeSearchQuery,
  splitSearchQuery,
} from '../src/hooks/use-catalog-search';

test('compose and split search query keep category separate from visible term', () => {
  assert.equal(composeSearchQuery('brand', 'CHEERS'), '品牌 CHEERS');
  assert.deepEqual(splitSearchQuery('品牌 CHEERS'), { category: 'brand', term: 'CHEERS' });
  assert.equal(composeSearchQuery('brand', ''), '');
});

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

test('estate-prefixed searches and suggestions only use housing estate names, while general POP search remains available', () => {
  const data = initialCatalog(true);
  data.folders.find((folder) => folder.id === 'estate-a')!.name = '海景中心';
  data.folders.find((folder) => folder.id === 'housing')!.name = '住宅展示';
  data.folders.find((folder) => folder.id === 'unit-a')!.name = 'A座';
  data.folders.find((folder) => folder.id === 'estate-a')!.subtitle = '門市推廣';
  const estate = searchCatalogEnhanced(data, null, '屋苑 海景中心');
  assert.ok(estate.contents.some((entry) => entry.item.id === 'kit-a'));
  for (const query of ['屋苑 Weekly', '屋苑 門市推廣', '屋苑 住宅展示', '屋苑 A座']) {
    const result = searchCatalogEnhanced(data, null, query);
    assert.equal(result.contents.length, 0, query);
    assert.equal(result.folders.length, 0, query);
  }
  const vocabulary = buildSearchVocabulary(data, null);
  assert.ok(vocabulary.estates.includes('海景中心'));
  assert.equal(vocabulary.estates.includes('Weekly Eposter'), false);
  assert.equal(vocabulary.estates.includes('門市推廣'), false);
  assert.equal(vocabulary.estates.includes('A座'), false);
  const general = searchCatalogEnhanced(data, null, 'Weekly');
  assert.ok(general.contents.some((entry) => entry.item.id === 'poster-demo'));
  assert.ok(general.folders.some((entry) => entry.item.id === 'pop-2'));
  assert.ok(searchCatalogEnhanced(data, null, '門市推廣').folders.some((entry) => entry.item.id === 'pop'));
  assert.ok(searchCatalogEnhanced(data, null, '門市推廣').contents.some((entry) => entry.item.id === 'poster-demo'));
  assert.equal(searchCatalogEnhanced(data, null, '品牌 Weekly').folders.some((entry) => entry.item.id === 'pop-2'), false);
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
