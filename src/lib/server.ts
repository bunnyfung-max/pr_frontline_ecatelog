import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Catalog, Entity, Session } from './types';
import { getCatalogRepository, dataDirectory } from './catalog-repository';
import { HttpError } from './http-error';

export { dataDirectory, HttpError };
export const demoEnabled = () =>
  process.env.NODE_ENV === 'development' && process.env.DEMO_MODE === 'true' && !process.env.VERCEL;
export const configured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

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

async function repository() {
  if (demoEnabled()) return getCatalogRepository(true);
  return getCatalogRepository(false, await supabase());
}

export async function readCatalog(): Promise<Catalog> {
  return (await repository()).read();
}

export async function deleteEntry(entity: Entity, id: string) {
  await (await repository()).delete(entity, id);
}

export async function saveEntry(entity: Entity, payload: { id: string }, expectedVersion?: string) {
  await (await repository()).save(entity, payload, expectedVersion);
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
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
