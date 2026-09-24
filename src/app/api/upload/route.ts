import { assertSameOrigin, demoEnabled, failure, json, HttpError } from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { uploadSchema, mimeExtension } from '@/lib/validation';
import { validateUploadBytes } from '@/lib/upload-validation';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-policy';
import { getStorageProvider } from '@/lib/storage/server';
import { localStorageProvider } from '@/lib/storage/server/providers/local';
import { resolveUploadMime } from '@/lib/storage/validate-client';
import { randomUUID } from 'node:crypto';

/** Demo/local fallback only. Production uploads use /api/storage/prepare + direct storage upload. */
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCmsAccess();
    if (!demoEnabled() && getStorageProvider().name !== 'local')
      throw new HttpError(410, '請使用新的上載流程。');
    if (Number(request.headers.get('content-length')) > MAX_UPLOAD_BYTES + 1024 * 1024)
      throw new HttpError(413, '檔案不可超過 50 MB。');
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, '請選擇檔案。');
    const mime = resolveUploadMime(file);
    const valid = uploadSchema.safeParse({ name: file.name, size: file.size, mime });
    if (!valid.success)
      throw new HttpError(400, '只支援 JPG、PNG、WebP、PDF、MP4、WebM，每個不超過 50 MB。');
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!validateUploadBytes(bytes, valid.data.mime))
      throw new HttpError(400, '檔案內容與所選格式不符，請重新選擇檔案。');
    const objectKey =
      String(form.get('objectKey') || '') ||
      `demo-user/${randomUUID()}.${mimeExtension[valid.data.mime]}`;
    const ref = await localStorageProvider.saveLocalFile!(objectKey, bytes, valid.data.mime);
    return json({ ref });
  } catch (e) {
    return failure(e);
  }
}
