import { assertSameOrigin, failure, json, readJsonBody, HttpError } from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { assetRef } from '@/lib/validation';
import { getStorageProvider } from '@/lib/storage/server';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCmsAccess();
    const body = await readJsonBody<{ ref?: string }>(request);
    const ref = String(body.ref || '');
    if (!assetRef.safeParse(ref).success || !ref.startsWith('asset:'))
      throw new HttpError(400, '檔案位置無效。');
    const provider = getStorageProvider();
    const confirmed = await provider.confirmUpload(ref);
    return json({ ref: confirmed });
  } catch (e) {
    return failure(e);
  }
}
