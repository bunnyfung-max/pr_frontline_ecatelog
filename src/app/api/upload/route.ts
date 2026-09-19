import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  assertSameOrigin,
  demoEnabled,
  dataDirectory,
  supabase,
  failure,
  json,
  HttpError,
} from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { uploadSchema, mimeExtension } from '@/lib/validation';
import { validateUploadBytes } from '@/lib/upload-validation';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-policy';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCmsAccess();
    if (Number(request.headers.get('content-length')) > MAX_UPLOAD_BYTES + 1024 * 1024)
      throw new HttpError(413, '檔案不可超過 50 MB。');
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, '請選擇檔案。');
    const valid = uploadSchema.safeParse({ name: file.name, size: file.size, mime: file.type });
    if (!valid.success)
      throw new HttpError(400, '只支援 JPG、PNG、WebP、PDF、MP4、WebM，每個不超過 50 MB。');
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!validateUploadBytes(bytes, valid.data.mime))
      throw new HttpError(400, '檔案內容與所選格式不符，請重新選擇檔案。');
    if (demoEnabled()) {
      const name = `${randomUUID()}.${mimeExtension[valid.data.mime]}`;
      await mkdir(path.join(dataDirectory(), 'uploads'), { recursive: true });
      await writeFile(path.join(dataDirectory(), 'uploads', name), bytes);
      return json({ ref: `asset:${name}` });
    }
    const sb = await supabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) throw new HttpError(401, '請先登入員工帳戶。');
    const storageName = `${user.id}/${randomUUID()}.${mimeExtension[valid.data.mime]}`;
    const { error } = await sb.storage.from('catalog').upload(storageName, bytes, {
      contentType: valid.data.mime,
      upsert: false,
    });
    if (error) throw new HttpError(500, '檔案上載失敗，請稍後重試。');
    return json({ ref: `asset:${storageName}` });
  } catch (e) {
    return failure(e);
  }
}
