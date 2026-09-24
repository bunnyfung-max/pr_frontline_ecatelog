import type { ContentType } from './types';

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const MAX_CONTENT_PAGES = 40;

export const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageMime = (typeof IMAGE_MIMES)[number];

export const UPLOAD_MIMES = [
  ...IMAGE_MIMES,
  'application/pdf',
  'video/mp4',
  'video/webm',
] as const;
export type UploadMime = (typeof UPLOAD_MIMES)[number];

export const KIT_MIMES = [...UPLOAD_MIMES] as const;

export const mimeExtension: Record<UploadMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

const EXT_TO_MIME: Record<string, UploadMime> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export function mimeFromExtension(ext: string): UploadMime | undefined {
  return EXT_TO_MIME[ext.toLowerCase()];
}

export const GALLERY_MIMES = UPLOAD_MIMES;

export function mimesForContentType(type: ContentType): readonly string[] {
  if (type === 'image') return GALLERY_MIMES;
  if (type === 'pdf') return ['application/pdf'];
  if (type === 'video') return ['video/mp4', 'video/webm'];
  return [];
}

export function acceptForContentType(type: ContentType): string {
  if (type === 'image') {
    return 'image/jpeg,image/png,image/webp,application/pdf,.pdf,video/mp4,video/webm,.mp4,.webm,.mov,.m4v';
  }
  if (type === 'pdf') return 'application/pdf,.pdf';
  if (type === 'video') return 'video/mp4,video/webm,.mp4,.webm,.mov,.m4v';
  return '';
}

export function isImageMime(mime: string): boolean {
  return (IMAGE_MIMES as readonly string[]).includes(mime);
}
