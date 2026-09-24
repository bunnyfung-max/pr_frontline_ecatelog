import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog } from '../src/lib/seed';
import { collectReaderPreloadTargets } from '../src/lib/reader-preload';
import { readerAssets, readerLeaves } from '../src/lib/sales-kit';

const kit = initialCatalog(true).contents.find((item) => item.id === 'kit-a')!;
const images = ['asset:plan.png', 'asset:render.jpg', 'asset:list1.webp', 'asset:list2.png', ''];
const content = {
  ...kit,
  salesKit: true,
  files: [...images, 'asset:clip.mp4', 'asset:tail.png', 'asset:extra.jpg'],
};

test('reader preload collects all pages after the visible spread', () => {
  const leaves = readerLeaves(readerAssets(content), {});
  const targets = collectReaderPreloadTargets(
    leaves,
    [1, 2],
    (ref) => `/api/asset?ref=${encodeURIComponent(ref)}`,
    {},
  );
  assert.deepEqual(
    targets.map((target) => target.key),
    [
      'image:asset:list1.webp',
      'image:asset:list2.png',
      'video:asset:clip.mp4',
      'image:asset:tail.png',
      'image:asset:extra.jpg',
    ],
  );
});

test('reader preload starts after the current single page in portrait mode', () => {
  const leaves = readerLeaves(readerAssets(content), {});
  const targets = collectReaderPreloadTargets(
    leaves,
    [3],
    (ref) => `/api/asset?ref=${encodeURIComponent(ref)}`,
    {},
  );
  assert.equal(targets[0]?.key, 'image:asset:list2.png');
});
