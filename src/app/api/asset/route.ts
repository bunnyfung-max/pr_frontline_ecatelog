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
import { allowedAssetRefs, catalogAssetRefs } from '@/lib/catalog';
import { isCmsUnlocked } from '@/lib/cms-access';
import { assetRef } from '@/lib/validation';
import { validateUploadBytes } from '@/lib/upload-validation';
import { mimeFromExtension } from '@/lib/upload-policy';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const ref = new URL(request.url).searchParams.get('ref') || '';
    if (!assetRef.safeParse(ref).success || !ref.startsWith('asset:'))
      throw new HttpError(400, '檔案位置無效。');
    const raw = await readCatalog();
    const cmsUnlocked = session.role === 'admin' && (await isCmsUnlocked(session));
    const allowed = allowedAssetRefs(raw, cmsUnlocked);
    if (!allowed.includes(ref)) throw new HttpError(404, '檔案不存在或尚未發布。');
    if (!catalogAssetRefs(raw).includes(ref)) throw new HttpError(404, '檔案不存在或尚未發布。');
    const file = ref.slice(6);
    if (demoEnabled()) {
      if (!/^[\w-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(file) && !/^[\w-]+\/[\w-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(file))
        throw new HttpError(404, '找不到檔案。');
      let bytes: Buffer;
      try {
        bytes = await readFile(path.join(dataDirectory(), 'uploads', file));
      } catch {
        throw new HttpError(404, '找不到檔案。');
      }
      const mime = mimeFromExtension(file.split('.').pop()!);
      if (!mime || !validateUploadBytes(bytes, mime))
        throw new HttpError(404, '找不到檔案。');
      return new Response(new Uint8Array(bytes), {
        headers: {
          'Content-Type': mime,
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
