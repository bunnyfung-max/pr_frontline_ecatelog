import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import {
  descendants,
  searchCatalog,
  publicCatalog,
  visiblePages,
  activeOffer,
  cacheableAssetRefs,
  folderPublishedContents,
  allowedAssetRefs,
  catalogAssetRefs,
} from '../src/lib/catalog';
import { schemas, assetRef, httpsUrl } from '../src/lib/validation';
test('home has exactly five roots; weekly summary never seeded', () => {
  const d = initialCatalog();
  assert.equal(d.folders.filter((f) => !f.parentId).length, 5);
  assert.equal(
    d.folders.some((f) => /weekly summary/i.test(f.name)),
    false,
  );
  assert.equal(
    d.folders.some((f) => f.name === 'Weekly Eposter'),
    true,
  );
  assert.equal(d.contents.length, 49);
  assert.equal(d.products.length, 0);
  assert.equal(d.scenes.length, 6);
});
test('scope includes current and all descendants, but not siblings or parents', () => {
  const d = initialCatalog(true);
  const scope = descendants(d.folders, 'estate-a');
  assert.deepEqual([...scope], ['estate-a', 'unit-a']);
  assert.equal(descendants(d.folders, 'invalid').size, 0);
  assert.equal(searchCatalog(d, 'estate-a', '橡木').contents[0]?.id, 'kit-a');
  assert.equal(searchCatalog(d, 'estate-b', '米白色').contents.length, 0);
});
test('products match name, code, brand, colour and design; associations never escape branch', () => {
  const d = initialCatalog(true);
  for (const query of ['雙人梳化', 'demo-001', '示例品牌', '米白色', '北歐', ' SOFA ', 'RIVO', '263521', '衣櫃']) {
    const results = searchCatalog(d, 'estate-a', query).contents;
    assert.deepEqual(
      results.map((c) => c.id),
      ['kit-a'],
    );
  }
  assert.equal(searchCatalog(d, 'pop', '梳化').contents[0].id, 'poster-demo');
  assert.deepEqual(searchCatalog(d, 'invalid', '梳化').contents, []);
});
test('home searches every root and active scenes; invalid folder never becomes global', () => {
  const d = initialCatalog(true);
  assert.deepEqual(
    searchCatalog(d, null, '米白色').contents.map((c) => c.id),
    ['kit-a', 'poster-demo'],
  );
  assert.ok(searchCatalog(d, null, '橡木').contents.some((c) => c.id === 'kit-b'));
  assert.equal(searchCatalog(d, null, '私樓傢俬').scenes.length, 1);
  assert.equal(searchCatalog(d, 'housing', '私樓傢俬').scenes.length, 0);
  assert.equal(searchCatalog(d, 'scenes', '私樓傢俬').scenes.length, 1);
  assert.equal(searchCatalog(d, '', '梳化').contents.length, 0);
  assert.equal(searchCatalog(d, 'invalid', '').folders.length, 0);
  assert.equal(searchCatalog(d, null, '草稿').contents.length, 0);
  d.scenes[0].active = false;
  assert.equal(searchCatalog(d, null, '公居屋專家').scenes.length, 0);
});
test('free text combines words across metadata and normalizes case/full-width input', () => {
  const d = initialCatalog(true);
  for (const q of ['米白色 梳化', 'ＳＯＦＡ 北歐', '示例屋苑 A 米白色', '新屋入伙 米白色']) {
    assert.equal(searchCatalog(d, 'estate-a', q).contents[0].id, 'kit-a');
  }
  assert.equal(searchCatalog(d, 'estate-a', '米白色 橡木').contents[0]?.id, 'kit-a');
  assert.equal(searchCatalog(d, 'estate-b', '米白色 梳化').contents.length, 0);
});
test('draft and archived content never appear in frontline searches or snapshots', () => {
  const d = initialCatalog(true);
  assert.equal(searchCatalog(d, 'housing', '草稿').contents.length, 0);
  assert.equal(searchCatalog(d, 'housing', '草稿', true).contents.length, 1);
  d.contents.find((c) => c.id === 'kit-a')!.status = 'archived';
  const filtered = publicCatalog(d);
  assert.equal(
    filtered.contents.some((c) => c.status !== 'published'),
    false,
  );
  assert.equal(searchCatalog(d, 'estate-a', '梳化').contents.length, 0);
});
test('folder published contents include descendants but exclude drafts', () => {
  const d = initialCatalog(true);
  const scoped = folderPublishedContents(d, 'private');
  assert.ok(scoped.length > 1);
  assert.ok(scoped.every((content) => content.status === 'published'));
  assert.equal(scoped.some((content) => content.id === 'draft-demo'), false);
});
test('draft asset refs require CMS unlock; published refs stay visible', () => {
  const d = initialCatalog(true);
  d.contents.push({
    ...d.contents[0],
    id: 'draft-asset',
    name: '草稿素材',
    status: 'draft',
    files: ['asset:draft-only.jpg'],
    cover: 'asset:draft-cover.png',
  });
  const all = catalogAssetRefs(d);
  assert.ok(all.includes('asset:draft-only.jpg'));
  assert.ok(all.includes('asset:draft-cover.png'));
  const locked = allowedAssetRefs(d, false);
  assert.equal(locked.includes('asset:draft-only.jpg'), false);
  assert.equal(locked.includes('asset:draft-cover.png'), false);
  const unlocked = allowedAssetRefs(d, true);
  assert.ok(unlocked.includes('asset:draft-only.jpg'));
  assert.ok(unlocked.includes('asset:draft-cover.png'));
});
test('cacheable assets include local files but skip external links', () => {
  const d = initialCatalog(true);
  const kit = d.contents.find((c) => c.id === 'kit-a')!;
  assert.equal(cacheableAssetRefs(kit).length, 5);
  assert.equal(
    cacheableAssetRefs({
      ...kit,
      type: 'link',
      files: ['https://example.com/promo'],
      cover: '',
    }).length,
    0,
  );
});
test('rotation preserves current position and never duplicates odd last page', () => {
  assert.deepEqual(visiblePages(1, 3, true), [1, 2]);
  assert.deepEqual(visiblePages(2, 3, false), [2]);
  assert.deepEqual(visiblePages(2, 3, true), [2, 3]);
  assert.deepEqual(visiblePages(3, 3, true), [3]);
  assert.deepEqual(visiblePages(1, 1, true), [1]);
});
test('offer dates are inclusive in Hong Kong timezone', () => {
  const offer = {
    ...initialCatalog(true).offers[0],
    startDate: '2026-09-18',
    endDate: '2026-09-18',
  };
  assert.equal(activeOffer(offer, new Date('2026-09-17T16:01:00Z')), true);
  assert.equal(activeOffer(offer, new Date('2026-09-18T16:00:00Z')), false);
  assert.equal(activeOffer({ ...offer, active: false }, new Date('2026-09-18T00:00:00Z')), false);
});
test('URL and asset validation rejects unsafe protocols and path traversal', () => {
  for (const v of ['javascript:alert(1)', 'data:text/html,hi', 'http://example.com', '//evil.com'])
    assert.equal(httpsUrl.safeParse(v).success, false);
  assert.equal(httpsUrl.safeParse('https://www.pricerite.com.hk').success, true);
  assert.equal(assetRef.safeParse('/demo/housing-floorplan.svg').success, true);
  assert.equal(assetRef.safeParse('/demo/sales-kit-floorplan.svg').success, true);
  assert.equal(assetRef.safeParse('/demo/sales-kit-product-2.svg').success, true);
  for (const v of ['asset:../secret.pdf', 'asset:x.html', '/secret', 'https://evil.com/file.png'])
    assert.equal(assetRef.safeParse(v).success, false);
});
test('content type enforces file formats and non-image single asset', () => {
  const c = {
    ...initialCatalog(true).contents.find((item) => item.id === 'kit-a')!,
    salesKit: false,
    files: ['/demo/sales-kit-floorplan.svg'],
    cover: '',
  };
  assert.equal(
    schemas.content.safeParse({ ...c, type: 'pdf', files: ['asset:document.pdf'] }).success,
    true,
  );
  assert.equal(
    schemas.content.safeParse({ ...c, type: 'pdf', files: ['asset:photo.jpg'] }).success,
    false,
  );
  assert.equal(
    schemas.content.safeParse({ ...c, type: 'pdf', files: ['asset:a.pdf', 'asset:b.pdf'] }).success,
    false,
  );
});
