import { isImageMime, type ImageMime } from './upload-policy';

export const IMAGE_COMPRESS_MAX_DIMENSION = 2560;
export const IMAGE_COMPRESS_MIN_BYTES = 400 * 1024;
export const IMAGE_COMPRESS_TARGET_BYTES = 2 * 1024 * 1024;

export function scaleImageDimensions(
  width: number,
  height: number,
  maxDimension = IMAGE_COMPRESS_MAX_DIMENSION,
) {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function shouldCompressImage(file: File, mime: ImageMime) {
  if (!isImageMime(mime)) return false;
  return file.size > IMAGE_COMPRESS_MIN_BYTES;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('圖片壓縮失敗。'))),
      type,
      quality,
    );
  });
}

function outputName(file: File) {
  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  return `${base}.webp`;
}

/** Resize large catalog images in the browser before upload. */
export async function compressImageForUpload(file: File, mime: ImageMime): Promise<File> {
  if (!shouldCompressImage(file, mime) || typeof document === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = scaleImageDimensions(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let quality = 0.86;
    let blob = await canvasToBlob(canvas, 'image/webp', quality);
    while (blob.size > IMAGE_COMPRESS_TARGET_BYTES && quality > 0.58) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, 'image/webp', quality);
    }

    if (blob.size >= file.size) return file;
    return new File([blob], outputName(file), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
