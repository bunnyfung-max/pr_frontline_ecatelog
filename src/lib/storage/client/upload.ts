import { api } from '@/lib/client';
import { compressImageForUpload } from '@/lib/image-compress';
import { isImageMime, type ImageMime } from '@/lib/upload-policy';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import type { PrepareUploadResult } from '../types';
import { resolveUploadMime, validateUploadFile } from '../validate-client';

async function uploadToTarget(file: File, prepared: PrepareUploadResult) {
  const target = prepared.upload;
  if (target.kind === 'local') {
    const form = new FormData();
    form.append('file', file);
    form.append('objectKey', prepared.objectKey);
    const result = await api<{ ref: string }>(target.uploadUrl, { method: 'POST', body: form });
    return result.ref;
  }
  if (target.kind === 'supabase') {
    const sb = createBrowserSupabase();
    const { error } = await sb.storage.from(target.bucket).upload(target.objectKey, file, {
      contentType: target.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message || '檔案上載失敗，請稍後重試。');
    return prepared.ref;
  }
  const response = await fetch(target.url, {
    method: 'PUT',
    body: file,
    headers: target.headers,
  });
  if (!response.ok) throw new Error('檔案上載失敗，請稍後重試。');
  return prepared.ref;
}

export async function uploadCatalogAsset(file: File): Promise<string> {
  const resolved = resolveUploadMime(file);
  const uploadFile =
    resolved && isImageMime(resolved)
      ? await compressImageForUpload(file, resolved as ImageMime)
      : file;
  const mime = await validateUploadFile(uploadFile);
  const prepared = await api<PrepareUploadResult>('/api/storage/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: uploadFile.name, size: uploadFile.size, mime }),
  });
  await uploadToTarget(uploadFile, prepared);
  const completed = await api<{ ref: string }>('/api/storage/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: prepared.ref }),
  });
  return completed.ref;
}
