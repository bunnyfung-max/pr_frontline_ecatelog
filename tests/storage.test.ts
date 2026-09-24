import test from 'node:test';
import assert from 'node:assert/strict';
import { objectKeyFromRef, toAssetRef } from '../src/lib/storage/refs';
import { matchesUploadMime, resolveUploadMime } from '../src/lib/storage/validate-client';
import { acceptForContentType, mimesForContentType } from '../src/lib/upload-policy';
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

test('content and sales kit upload surfaces accept video where intended', () => {
  const mov = { name: 'clip.mov', type: 'video/quicktime', size: 1 } as File;
  assert.equal(matchesUploadMime(mov, mimesForContentType('video')), true);
  assert.equal(matchesUploadMime(mov, mimesForContentType('pdf')), false);
  assert.match(acceptForContentType('video'), /\.mov/);
});
