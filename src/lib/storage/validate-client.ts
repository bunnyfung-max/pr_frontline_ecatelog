import { MAX_UPLOAD_BYTES, UPLOAD_MIMES, type UploadMime } from '../upload-policy';
import { validateUploadBytes } from '../upload-validation';

const HEADER_BYTES = 16;

export function resolveUploadMime(file: File): UploadMime | null {
  if ((UPLOAD_MIMES as readonly string[]).includes(file.type)) return file.type as UploadMime;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'mov' || ext === 'm4v') return 'video/mp4';
  return null;
}

export async function validateUploadFile(file: File): Promise<UploadMime> {
  const mime = resolveUploadMime(file);
  if (!mime) throw new Error('只支援 JPG、PNG、WebP、PDF、MP4 或 WebM。');
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES)
    throw new Error('每個檔案須大於 0 bytes，並且不超過 50 MB。');
  const header = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
  if (!validateUploadBytes(header, mime))
    throw new Error('檔案內容與所選格式不符，請重新選擇檔案。');
  return mime;
}
