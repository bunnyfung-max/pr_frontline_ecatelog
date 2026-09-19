import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUploadBytes } from '../src/lib/upload-validation';

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const webp = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const pdf = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
const mp4 = Uint8Array.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
]);
const webm = Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x00, 0x00, 0x00]);

test('validateUploadBytes accepts known magic signatures', () => {
  assert.equal(validateUploadBytes(jpeg, 'image/jpeg'), true);
  assert.equal(validateUploadBytes(png, 'image/png'), true);
  assert.equal(validateUploadBytes(webp, 'image/webp'), true);
  assert.equal(validateUploadBytes(pdf, 'application/pdf'), true);
  assert.equal(validateUploadBytes(mp4, 'video/mp4'), true);
  assert.equal(validateUploadBytes(webm, 'video/webm'), true);
});

test('validateUploadBytes rejects mismatched mime and content', () => {
  assert.equal(validateUploadBytes(png, 'image/jpeg'), false);
  assert.equal(validateUploadBytes(jpeg, 'application/pdf'), false);
  assert.equal(validateUploadBytes(Uint8Array.from([0x3c, 0x68, 0x74, 0x6d]), 'image/png'), false);
});
