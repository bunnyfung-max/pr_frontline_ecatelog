import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  requireSession,
  assertSameOrigin,
  demoEnabled,
  dataDirectory,
  supabase,
  failure,
  json,
  HttpError,
} from '@/lib/server';
import { uploadSchema, mimeExtension } from '@/lib/validation';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireSession(true);
    if (demoEnabled()) {
      if (Number(request.headers.get('content-length')) > 51 * 1024 * 1024)
        throw new HttpError(413, '檔案不可超過 50 MB。');
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new HttpError(400, '請選擇檔案。');
      const valid = uploadSchema.safeParse({ name: file.name, size: file.size, mime: file.type });
      if (!valid.success)
        throw new HttpError(400, '只支援 JPG、PNG、WebP、PDF、MP4、WebM，每個不超過 50 MB。');
      const name = `${randomUUID()}.${mimeExtension[file.type]}`;
      await mkdir(path.join(dataDirectory(), 'uploads'), { recursive: true });
      await writeFile(
        path.join(dataDirectory(), 'uploads', name),
        Buffer.from(await file.arrayBuffer()),
      );
      return json({ ref: `asset:${name}` });
    }
    const parsed = uploadSchema.safeParse(await request.json());
    if (!parsed.success) throw new HttpError(400, '檔案格式或大小不符合要求（上限 50 MB）。');
    const sb = await supabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    const name = `${user!.id}/${randomUUID()}.${mimeExtension[parsed.data.mime]}`;
    const { data, error } = await sb.storage.from('catalog').createSignedUploadUrl(name);
    if (error) throw new HttpError(500, '無法建立上載位置，請確認私人 Storage bucket 設定。');
    return json({ ref: `asset:${name}`, path: name, token: data.token });
  } catch (e) {
    return failure(e);
  }
}
