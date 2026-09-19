import { createBrowserClient } from '@supabase/ssr';
import type { Entity } from './types';
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '操作未完成，請重試。');
  return data;
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
export async function upload(file: File, demo: boolean): Promise<string> {
  if (file.size > 50 * 1024 * 1024) throw new Error('每個檔案不可超過 50 MB。');
  if (demo) {
    const form = new FormData();
    form.append('file', file);
    return (await api<{ ref: string }>('/api/upload', { method: 'POST', body: form })).ref;
  }
  const ticket = await api<{ ref: string; path: string; token: string }>('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, size: file.size, mime: file.type }),
  });
  const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const { error } = await sb.storage
    .from('catalog')
    .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
  if (error) throw new Error('檔案上載失敗，請檢查網絡後重試。');
  return ticket.ref;
}
