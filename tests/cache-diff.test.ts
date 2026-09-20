import test from 'node:test';
import assert from 'node:assert/strict';
import { diffCache } from '../src/lib/cache-diff';
import type { DesiredAsset } from '../src/lib/cache-manifest';

const desired = (ref: string, contentId = 'c1'): DesiredAsset => ({
  ref,
  contentId,
  contentUpdatedAt: '2026-01-01T00:00:00Z',
});

test('diffCache marks missing refs for download', () => {
  const result = diffCache([desired('asset:a.jpg')], []);
  assert.equal(result.download.length, 1);
  assert.equal(result.keep.length, 0);
  assert.equal(result.remove.length, 0);
});

test('diffCache keeps refs that already exist locally', () => {
  const result = diffCache(
    [desired('asset:a.jpg')],
    [{ ref: 'asset:a.jpg', contentId: 'c1', size: 1, cachedAt: '2026-01-01T00:00:00Z' }],
  );
  assert.equal(result.keep.length, 1);
  assert.equal(result.download.length, 0);
});

test('diffCache removes global orphans when no content scope is set', () => {
  const result = diffCache(
    [desired('asset:a.jpg')],
    [{ ref: 'asset:old.jpg', contentId: 'c1', size: 1, cachedAt: '2026-01-01T00:00:00Z' }],
  );
  assert.equal(result.remove.length, 1);
  assert.equal(result.remove[0]?.ref, 'asset:old.jpg');
});

test('diffCache only removes folder-scoped orphans when content scope is set', () => {
  const result = diffCache(
    [desired('asset:a.jpg', 'folder-a')],
    [
      { ref: 'asset:old.jpg', contentId: 'folder-a', size: 1, cachedAt: '2026-01-01T00:00:00Z' },
      { ref: 'asset:other.jpg', contentId: 'folder-b', size: 1, cachedAt: '2026-01-01T00:00:00Z' },
    ],
    { removeContentIds: new Set(['folder-a']) },
  );
  assert.deepEqual(result.remove.map((item) => item.ref), ['asset:old.jpg']);
});
