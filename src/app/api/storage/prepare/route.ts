import {
  assertSameOrigin,
  demoEnabled,
  failure,
  json,
  readJsonBody,
  supabase,
  HttpError,
} from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { uploadSchema } from '@/lib/validation';
import { getStorageProvider } from '@/lib/storage/server';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCmsAccess();
    const parsed = uploadSchema.safeParse(await readJsonBody(request));
    if (!parsed.success)
      throw new HttpError(400, '只支援 JPG、PNG、WebP、PDF、MP4、WebM，每個不超過 50 MB。');
    const provider = getStorageProvider();
    const userId = demoEnabled()
      ? 'demo-user'
      : (await (await supabase()).auth.getUser()).data.user?.id;
    if (!userId) throw new HttpError(401, '請先登入員工帳戶。');
    const prepared = await provider.prepareUpload(userId, parsed.data);
    return json(prepared);
  } catch (e) {
    return failure(e);
  }
}
