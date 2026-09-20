import test from 'node:test';
import assert from 'node:assert/strict';
import { diffCache } from '../src/lib/cache-diff';
import { buildDesiredManifest } from '../src/lib/cache-manifest';
import type { Content } from '../src/lib/types';

const content = (id: string, files: string[]): Content => ({
  id,
  folderId: 'housing',
  name: id,
  type: 'image',
  files,
  fileName: id,
  cover: '',
  keywords: '',
  tags: [],
  eshopProducts: [],
  productIds: [],
  status: 'published',
  order: 0,
  updatedAt: '2026-01-01T00:00:00Z',
});

test('sync diff downloads missing refs before considering removal', () => {
  const desired = buildDesiredManifest([content('c1', ['asset:new.jpg'])]);
  const local = [{ ref: 'asset:old.jpg', contentId: 'c1', size: 1, cachedAt: '2026-01-01T00:00:00Z' }];
  const result = diffCache(desired, local);
  assert.equal(result.download[0]?.ref, 'asset:new.jpg');
  assert.equal(result.remove[0]?.ref, 'asset:old.jpg');
});
