import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  demoEnabled,
  dataDirectory,
  failure,
  HttpError,
  requireSession,
  supabase,
} from '@/lib/server';
import { feedbackRefSchema } from '@/lib/feedback';

export async function GET(request: Request) {
  try {
    await requireSession(true);
    const ref = new URL(request.url).searchParams.get('ref') || '';
    const parsed = feedbackRefSchema.safeParse(ref);
    if (!parsed.success) throw new HttpError(400, '不支援的附件。');
    const objectName = parsed.data.slice('feedback:'.length);
    if (demoEnabled()) {
      const bytes = await readFile(path.join(dataDirectory(), 'feedback-uploads', objectName));
      const ext = objectName.split('.').pop()?.toLowerCase();
      const type =
        ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      return new Response(bytes, {
        headers: {
          'Content-Type': type,
          'Cache-Control': 'private, no-store',
        },
      });
    }
    const sb = await supabase();
    const { data, error } = await sb.storage.from('feedback').download(objectName);
    if (error || !data) throw new HttpError(404, '找不到附件。');
    return new Response(await data.arrayBuffer(), {
      headers: {
        'Content-Type': data.type || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    return failure(e);
  }
}
