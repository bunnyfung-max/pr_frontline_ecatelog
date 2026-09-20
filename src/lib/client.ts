import type { Entity } from './types';
import { MAX_FEEDBACK_IMAGE_BYTES } from './feedback';
import { MAX_UPLOAD_BYTES } from './upload-policy';
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: 'no-store' });
  const text = await response.text();
  let data: { error?: string } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { error?: string };
    } catch {
      if (!response.ok) throw new Error('操作未完成，請重試。');
      return {} as T;
    }
  }
  if (!response.ok) throw new Error(data.error || '操作未完成，請重試。');
  return data as T;
}
export function save(
  entity: Entity,
  payload: unknown,
  originFolder?: string,
  expectedVersion?: string,
) {
  return api('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entity, payload, originFolder, expectedVersion }),
  });
}
export function remove(entity: Entity, id: string) {
  return api('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', entity, id }),
  });
}
export const assetUrl = (ref: string) =>
  ref.startsWith('asset:') ? `/api/asset?ref=${encodeURIComponent(ref)}` : ref;
export async function upload(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('每個檔案不可超過 50 MB。');
  const form = new FormData();
  form.append('file', file);
  return (await api<{ ref: string }>('/api/upload', { method: 'POST', body: form })).ref;
}
export const feedbackAssetUrl = (ref: string) =>
  ref.startsWith('feedback:')
    ? `/api/feedback/asset?ref=${encodeURIComponent(ref)}`
    : ref;
export async function uploadFeedbackImage(file: File): Promise<string> {
  if (file.size > MAX_FEEDBACK_IMAGE_BYTES) throw new Error('每張圖片不可超過 5 MB。');
  const form = new FormData();
  form.append('file', file);
  return (await api<{ ref: string }>('/api/feedback/upload', { method: 'POST', body: form }))
    .ref;
}
