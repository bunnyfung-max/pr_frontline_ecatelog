import {
  requireSession,
  configured,
  demoEnabled,
  failure,
  json,
  assertSameOrigin,
  supabase,
  HttpError,
} from '@/lib/server';
import {
  clearCmsUnlock,
  isCmsUnlocked,
  setCmsUnlocked,
  verifyCmsPassword,
} from '@/lib/cms-access';
export async function GET() {
  if (!configured() && !demoEnabled()) return json({ setup: true });
  try {
    const session = await requireSession();
    return json({ session, cmsUnlocked: await isCmsUnlocked() });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { email, password, action } = await request.json();
    if (action === 'lock-cms') {
      await clearCmsUnlock();
      return json({ cmsUnlocked: false });
    }
    if (action === 'unlock-cms') {
      const session = await requireSession(true);
      await verifyCmsPassword(password, session);
      await setCmsUnlocked();
      return json({ cmsUnlocked: true, session });
    }
    const sb = await supabase();
    if (action === 'logout') {
      await clearCmsUnlock();
      await sb.auth.signOut();
      return json({ ok: true });
    }
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.length > 320 ||
      password.length > 500
    )
      throw new HttpError(400, '請輸入有效的登入資料。');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new HttpError(401, '登入失敗，請檢查電郵及密碼，或稍後再試。');
    const session = await requireSession();
    return json({ session });
  } catch (e) {
    return failure(e);
  }
}
