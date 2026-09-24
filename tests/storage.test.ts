import test from 'node:test';
import assert from 'node:assert/strict';
import { objectKeyFromRef, toAssetRef } from '../src/lib/storage/refs';
import { resolveUploadMime } from '../src/lib/storage/validate-client';
test('asset refs stay provider-neutral', () => {
  const key = 'user-1/abc.mp4';
  assert.equal(toAssetRef(key), 'asset:user-1/abc.mp4');
  assert.equal(objectKeyFromRef('asset:user-1/abc.mp4'), key);
});

test('upload mime resolver accepts common video extensions', () => {
  assert.equal(
    resolveUploadMime({ name: 'clip.mov', type: 'video/quicktime', size: 1 } as File),
    'video/mp4',
  );
  assert.equal(
    resolveUploadMime({ name: 'clip.mp4', type: 'video/mp4', size: 1 } as File),
    'video/mp4',
  );
});
