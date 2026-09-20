import { randomUUID } from 'node:crypto';
import {
  assertSameOrigin,
  demoEnabled,
  failure,
  json,
  readJsonBody,
  requireSession,
  supabase,
  HttpError,
} from '@/lib/server';
import { feedbackSubmitSchema } from '@/lib/feedback';
import { ensurePendingMigrations } from '@/lib/pending-migrations';
import { listFeedbackSubmissions, saveFeedbackSubmission } from '@/lib/feedback-repository';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export async function GET() {
  try {
    await requireSession(true);
    if (!demoEnabled()) await ensurePendingMigrations();
    if (demoEnabled()) {
      return json({ items: await listFeedbackSubmissions() });
    }
    const sb = await supabase();
    return json({ items: await listFeedbackSubmissions(sb) });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireSession();
    const key = `feedback:${session.email || clientKey(request)}`;
    if (!rateLimit(key, 10, 60 * 60 * 1000))
      throw new HttpError(429, '提交次數過多，請稍後再試。');
    const parsed = feedbackSubmitSchema.safeParse(await readJsonBody(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0]?.message || '請檢查表格內容。');
    const body = parsed.data;
    const submission = {
      ...body,
      id: randomUUID(),
      email: session.email,
      createdAt: new Date().toISOString(),
    };
    if (!demoEnabled()) await ensurePendingMigrations();
    if (demoEnabled()) {
      await saveFeedbackSubmission(submission);
      return json({ ok: true, id: submission.id });
    }
    const sb = await supabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) throw new HttpError(401, '請先登入員工帳戶。');
    await saveFeedbackSubmission(submission, sb, user.id);
    return json({ ok: true, id: submission.id });
  } catch (e) {
    return failure(e);
  }
}
