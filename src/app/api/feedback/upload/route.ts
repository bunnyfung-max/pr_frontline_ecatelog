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
  requireSession,
} from '@/lib/server';
import { MAX_FEEDBACK_IMAGE_BYTES } from '@/lib/feedback';
import { ensurePendingMigrations } from '@/lib/pending-migrations';
import { mimeExtension } from '@/lib/validation';
import { validateUploadBytes } from '@/lib/upload-validation';
import { IMAGE_MIMES } from '@/lib/upload-policy';
import { z } from 'zod';

const uploadSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(MAX_FEEDBACK_IMAGE_BYTES),
  mime: z.enum(IMAGE_MIMES),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireSession();
    if (Number(request.headers.get('content-length')) > MAX_FEEDBACK_IMAGE_BYTES + 1024 * 1024)
      throw new HttpError(413, '圖片不可超過 5 MB。');
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, '請選擇圖片。');
    const valid = uploadSchema.safeParse({ name: file.name, size: file.size, mime: file.type });
    if (!valid.success)
      throw new HttpError(400, '只支援 JPG、PNG、WebP 圖片，每張不超過 5 MB。');
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!validateUploadBytes(bytes, valid.data.mime))
      throw new HttpError(400, '檔案內容與所選格式不符，請重新選擇。');
    if (!demoEnabled()) await ensurePendingMigrations();
    if (demoEnabled()) {
      const name = `${randomUUID()}.${mimeExtension[valid.data.mime]}`;
      await mkdir(path.join(dataDirectory(), 'feedback-uploads'), { recursive: true });
      await writeFile(path.join(dataDirectory(), 'feedback-uploads', name), bytes);
      return json({ ref: `feedback:${name}` });
    }
    const sb = await supabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) throw new HttpError(401, '請先登入員工帳戶。');
    const storageName = `${user.id}/${randomUUID()}.${mimeExtension[valid.data.mime]}`;
    const { error } = await sb.storage.from('feedback').upload(storageName, bytes, {
      contentType: valid.data.mime,
      upsert: false,
    });
    if (error) {
      if (error.message?.includes('Bucket not found'))
        throw new HttpError(503, '意見回饋上載尚未完成設定，請聯絡 IT。');
      throw new HttpError(500, '圖片上載失敗，請稍後重試。');
    }
    return json({ ref: `feedback:${storageName}` });
  } catch (e) {
    return failure(e);
  }
}
