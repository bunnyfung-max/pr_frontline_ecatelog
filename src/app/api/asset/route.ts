import { requireSession, demoEnabled, supabase, failure, HttpError } from '@/lib/server';
import { resolveAssetAccess } from '@/lib/asset-access';
import { assetRef } from '@/lib/validation';
import { validateUploadBytes } from '@/lib/upload-validation';
import { mimeFromExtension } from '@/lib/upload-policy';
import { objectKeyFromRef } from '@/lib/storage/refs';
import { getStorageProvider } from '@/lib/storage/server';
import { readLocalAssetBytes } from '@/lib/storage/server/providers/local';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const ref = new URL(request.url).searchParams.get('ref') || '';
    if (!assetRef.safeParse(ref).success || !ref.startsWith('asset:'))
      throw new HttpError(400, '檔案位置無效。');
    const { access } = await resolveAssetAccess(session);
    if (!access.allowed.has(ref)) throw new HttpError(404, '檔案不存在或尚未發布。');
    if (!access.all.has(ref)) throw new HttpError(404, '檔案不存在或尚未發布。');
    const objectKey = objectKeyFromRef(ref);
    if (demoEnabled() || getStorageProvider().name === 'local') {
      if (
        !/^[\w-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(objectKey) &&
        !/^[\w-]+\/[\w-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(objectKey)
      )
        throw new HttpError(404, '找不到檔案。');
      const bytes = await readLocalAssetBytes(objectKey);
      const mime = mimeFromExtension(objectKey.split('.').pop()!);
      if (!mime || !validateUploadBytes(bytes, mime)) throw new HttpError(404, '找不到檔案。');
      return new Response(new Uint8Array(bytes), {
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'private, max-age=3600, immutable',
        },
      });
    }
    const provider = getStorageProvider();
    const sb = await supabase();
    const signedUrl = await provider.getReadUrl(objectKey, 120, sb);
    return new Response(null, {
      status: 307,
      headers: { Location: signedUrl, 'Cache-Control': 'private, max-age=60' },
    });
  } catch (e) {
    return failure(e);
  }
}
