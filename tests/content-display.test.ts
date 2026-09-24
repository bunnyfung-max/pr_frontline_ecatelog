import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import {
  contentAssetCount,
  contentPreviewKind,
  contentPreviewRef,
  contentReaderSubtitle,
} from '../src/lib/content-display';
import { readerAssets } from '../src/lib/sales-kit';

const kit = initialCatalog(true).contents.find((c) => c.id === 'kit-a')!;

test('content preview prefers cover then first image asset', () => {
  assert.equal(
    contentPreviewRef({
      ...kit,
      type: 'image',
      cover: 'asset:cover.png',
      files: ['asset:clip.mp4', 'asset:photo.jpg'],
    }),
    'asset:cover.png',
  );
  assert.equal(
    contentPreviewRef({
      ...kit,
      type: 'image',
      cover: '',
      files: ['asset:clip.mp4', 'asset:photo.jpg'],
    }),
    'asset:photo.jpg',
  );
});

test('content preview kind reflects first available asset', () => {
  assert.equal(
    contentPreviewKind({
      ...kit,
      type: 'image',
      cover: '',
      files: ['asset:brochure.pdf'],
    }),
    'pdf',
  );
  assert.equal(
    contentPreviewKind({
      ...kit,
      type: 'image',
      cover: '',
      files: ['asset:clip.mp4'],
    }),
    'video',
  );
});

test('reader subtitle describes mixed galleries and sales kits', () => {
  const mixed = {
    ...kit,
    salesKit: false,
    type: 'image' as const,
    files: ['asset:a.jpg', 'asset:b.pdf', 'asset:c.mp4'],
  };
  const assets = readerAssets(mixed);
  assert.equal(contentReaderSubtitle(mixed, assets, true), '圖文影片 · 3 項 · 橫向雙頁');
  assert.equal(
    contentReaderSubtitle({ ...kit, salesKit: true, files: kit.files }, readerAssets(kit), false),
    'Sales Kit · 直向單頁',
  );
  const link = { ...kit, salesKit: false, type: 'link' as const, files: ['https://example.com'] };
  assert.equal(contentReaderSubtitle(link, readerAssets(link), true), '連結 · 橫向雙頁');
});

test('content asset count follows reader assets', () => {
  assert.equal(
    contentAssetCount({
      ...kit,
      type: 'image',
      files: ['asset:a.jpg', '', 'asset:b.pdf'],
    }),
    2,
  );
});
