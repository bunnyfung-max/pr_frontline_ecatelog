import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IMAGE_COMPRESS_MIN_BYTES,
  scaleImageDimensions,
  shouldCompressImage,
} from '../src/lib/image-compress';

test('scale image dimensions down to the configured long edge', () => {
  assert.deepEqual(scaleImageDimensions(4000, 3000, 2560), { width: 2560, height: 1920 });
  assert.deepEqual(scaleImageDimensions(1200, 800, 2560), { width: 1200, height: 800 });
});

test('only compress images above the size threshold', () => {
  const large = { size: IMAGE_COMPRESS_MIN_BYTES + 1 } as File;
  const small = { size: IMAGE_COMPRESS_MIN_BYTES - 1 } as File;
  assert.equal(shouldCompressImage(large, 'image/jpeg'), true);
  assert.equal(shouldCompressImage(small, 'image/jpeg'), false);
  assert.equal(shouldCompressImage(large, 'image/png'), true);
  assert.equal(shouldCompressImage(large, 'image/webp'), true);
});
