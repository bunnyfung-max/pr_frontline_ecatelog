import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Catalog, Entity, Session } from './types';
import { initialCatalog } from './seed';
export const demoEnabled = () =>
  process.env.NODE_ENV === 'development' && process.env.DEMO_MODE === 'true' && !process.env.VERCEL;
export const configured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const dataDirectory = () => path.join(process.cwd(), '.data');
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function supabase() {
  if (!configured()) throw new HttpError(503, '尚未設定 Supabase，請參閱部署指南。');
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value, options }) => jar.set(name, value, options));
        },
      },
    },
  );
}
export async function requireSession(admin = false): Promise<Session> {
  if (demoEnabled()) return { role: 'admin', email: '本機示例模式', demo: true };
  const sb = await supabase();
  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error || !user) throw new HttpError(401, '請先登入員工帳戶。');
  const { data: member } = await sb.from('members').select('role').eq('id', user.id).single();
  if (!member || (admin && member.role !== 'admin'))
    throw new HttpError(403, '此帳戶沒有操作權限，請聯絡管理員。');
  return { role: member.role, email: user.email || '', demo: false };
}
const collection: Record<Entity, keyof Catalog> = {
  folder: 'folders',
  content: 'contents',
  product: 'products',
  scene: 'scenes',
  offer: 'offers',
  settings: 'settings',
};
let localQueue: Promise<unknown> = Promise.resolve();
async function writeLocal(data: Catalog) {
  await mkdir(dataDirectory(), { recursive: true });
  const temp = path.join(dataDirectory(), `catalog-${randomUUID()}.tmp`);
  await writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
  await rename(temp, path.join(dataDirectory(), 'catalog.json'));
}
async function readLocal(): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(path.join(dataDirectory(), 'catalog.json'), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return initialCatalog(true);
  }
}
export async function readCatalog(): Promise<Catalog> {
  if (demoEnabled()) return readLocal();
  const sb = await supabase();
  const data: Catalog = {
    folders: [],
    contents: [],
    products: [],
    scenes: [],
    offers: [],
    settings: { id: 'store', label: '前往自在購', url: '' },
  };
  for (let from = 0; ; from += 500) {
    const { data: rows, error } = await sb
      .from('catalog_entries')
      .select('entity,payload')
      .order('id')
      .range(from, from + 499);
    if (error) throw new HttpError(503, '資料庫尚未就緒，請確認 migration 及存取權限。');
    for (const row of rows) {
      const key = collection[row.entity as Entity];
      if (key === 'settings') data.settings = row.payload;
      else if (key) (data[key] as unknown[]).push(row.payload);
    }
    if (rows.length < 500) break;
  }
  return data;
}
export async function deleteEntry(entity: Entity, id: string) {
  if (entity === 'settings') throw new HttpError(400, '不可刪除此設定。');
  if (demoEnabled()) {
    const action = localQueue.then(async () => {
      const data = await readLocal();
      const key = collection[entity];
      const list = data[key] as { id: string }[];
      const index = list.findIndex((row) => row.id === id);
      if (index < 0) throw new HttpError(404, '找不到項目。');
      list.splice(index, 1);
      await writeLocal(data);
    });
    localQueue = action.catch(() => undefined);
    await action;
    return;
  }
  const sb = await supabase();
  const { error } = await sb.from('catalog_entries').delete().eq('entity', entity).eq('id', id);
  if (error) throw new HttpError(500, '刪除失敗，請稍後重試。');
}
export async function saveEntry(entity: Entity, payload: { id: string }, expectedVersion?: string) {
  if (demoEnabled()) {
    const action = localQueue.then(async () => {
      const data = await readLocal();
      const key = collection[entity];
      if (key === 'settings') data.settings = payload as Catalog['settings'];
      else {
        const list = data[key] as { id: string; updatedAt?: string }[];
        const index = list.findIndex((row) => row.id === payload.id);
        if (entity === 'content' && index >= 0 && list[index].updatedAt !== expectedVersion)
          throw new HttpError(409, '內容已被更新，請重新載入後再修改。');
        if (index >= 0) list[index] = payload;
        else list.push(payload);
      }
      await writeLocal(data);
    });
    localQueue = action.catch(() => undefined);
    await action;
    return;
  }
  const sb = await supabase();
  const row = { id: payload.id, entity, payload };
  if (entity === 'content' && expectedVersion) {
    const { data, error } = await sb
      .from('catalog_entries')
      .update(row)
      .eq('id', payload.id)
      .eq('entity', entity)
      .eq('payload->>updatedAt', expectedVersion)
      .select('id');
    if (error) throw new HttpError(500, '儲存失敗，請稍後重試。');
    if (!data?.length) throw new HttpError(409, '內容已被更新，請重新載入後再修改。');
  } else {
    const query =
      entity === 'content'
        ? sb.from('catalog_entries').insert(row)
        : sb.from('catalog_entries').upsert(row, { onConflict: 'entity,id' });
    const { error } = await query;
    if (error) throw new HttpError(500, '儲存失敗，請稍後重試。');
  }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  // Next may normalize request.url to localhost internally. The browser's Host
  // remains the actual request destination (including Preview domains and ports).
  let originUrl: URL;
  try {
    originUrl = new URL(origin || '');
  } catch {
    throw new HttpError(403, '不接受跨網站請求。');
  }
  if (
    !['http:', 'https:'].includes(originUrl.protocol) ||
    originUrl.host !== request.headers.get('host')
  )
    throw new HttpError(403, '不接受跨網站請求。');
}
export function failure(error: unknown) {
  const status = error instanceof HttpError ? error.status : 500;
  return Response.json(
    { error: error instanceof HttpError ? error.message : '操作未完成，請稍後重試。' },
    { status, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
export function json(data: unknown) {
  return Response.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
