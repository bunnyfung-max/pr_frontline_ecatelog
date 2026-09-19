import type { UploadMime } from './upload-policy';

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return (
    bytes.length >= offset + signature.length &&
    signature.every((value, index) => bytes[offset + index] === value)
  );
}

function isJpeg(bytes: Uint8Array): boolean {
  return startsWith(bytes, [0xff, 0xd8, 0xff]);
}

function isPng(bytes: Uint8Array): boolean {
  return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function isWebp(bytes: Uint8Array): boolean {
  return (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  );
}

function isPdf(bytes: Uint8Array): boolean {
  return startsWith(bytes, [0x25, 0x50, 0x44, 0x46]);
}

function isMp4(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4);
}

function isWebm(bytes: Uint8Array): boolean {
  return startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
}

const validators: Record<UploadMime, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': isJpeg,
  'image/png': isPng,
  'image/webp': isWebp,
  'application/pdf': isPdf,
  'video/mp4': isMp4,
  'video/webm': isWebm,
};

export function validateUploadBytes(bytes: Uint8Array, mime: UploadMime): boolean {
  return validators[mime]?.(bytes) ?? false;
}
