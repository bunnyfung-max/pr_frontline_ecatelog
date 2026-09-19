import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  requireSession,
  readCatalog,
  dataDirectory,
  demoEnabled,
  supabase,
  failure,
  HttpError,
} from '@/lib/server';
import { publicCatalog } from '@/lib/catalog';
import { assetRef } from '@/lib/validation';
export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const ref = new URL(request.url).searchParams.get('ref') || '';
    if (!assetRef.safeParse(ref).success || !ref.startsWith('asset:'))
      throw new HttpError(400, '檔案位置無效。');
    const raw = await readCatalog();
    const data = session.role === 'admin' ? raw : publicCatalog(raw);
    const refs = [
      ...data.contents.flatMap((c) => [...c.files, c.cover]),
      ...data.products.map((p) => p.image),
      ...data.scenes.map((s) => s.image),
      ...data.offers.map((o) => o.image),
    ];
    if (session.role !== 'admin' && !refs.includes(ref))
      throw new HttpError(404, '檔案不存在或尚未發布。');
    const file = ref.slice(6);
    if (demoEnabled()) {
      if (!/^[\w-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(file))
        throw new HttpError(404, '找不到檔案。');
      let bytes: Buffer;
      try {
        bytes = await readFile(path.join(dataDirectory(), 'uploads', file));
      } catch {
        throw new HttpError(404, '找不到檔案。');
      }
      const mime: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        pdf: 'application/pdf',
        mp4: 'video/mp4',
        webm: 'video/webm',
      };
      return new Response(new Uint8Array(bytes), {
        headers: {
          'Content-Type': mime[file.split('.').pop()!],
          'Cache-Control': 'private, no-store',
        },
      });
    }
    const sb = await supabase();
    const { data: signed, error } = await sb.storage.from('catalog').createSignedUrl(file, 120);
    if (error || !signed) throw new HttpError(404, '檔案不存在或無法讀取。');
    return new Response(null, {
      status: 307,
      headers: { Location: signed.signedUrl, 'Cache-Control': 'private, no-store' },
    });
  } catch (e) {
    return failure(e);
  }
}
