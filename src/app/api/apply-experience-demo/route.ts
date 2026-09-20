import { applyExperienceDemo } from '@/lib/apply-experience-demo';
import { failure, json, HttpError } from '@/lib/server';

function allowed(request: Request) {
  if (process.env.ALLOW_EXPERIENCE_DEMO_APPLY === 'true') return true;
  const secret = process.env.CMS_UNLOCK_SECRET;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(secret && token && token === secret);
}

export async function POST(request: Request) {
  try {
    if (!allowed(request)) throw new HttpError(403, '未授權更新體驗內容。');
    const result = await applyExperienceDemo();
    return json({ ok: true, ...result });
  } catch (error) {
    return failure(error);
  }
}
