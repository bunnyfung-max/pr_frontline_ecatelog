import {
  requireSession,
  configured,
  demoEnabled,
  failure,
  json,
  readJsonBody,
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
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { passwordUpdateErrorMessage, validatePasswordChange } from '@/lib/change-password';
export async function GET() {
  if (!configured() && !demoEnabled()) return json({ setup: true });
  try {
    const session = await requireSession();
    return json({ session, cmsUnlocked: await isCmsUnlocked(session) });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJsonBody<{
      email?: string;
      password?: string;
      action?: string;
      currentPassword?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
    }>(request);
    const { email, password, action } = body;
    const limitKey = `session:${action || 'login'}:${clientKey(request)}`;
    const limit =
      action === 'unlock-cms' || action === 'change-password'
        ? 8
        : action === 'logout' || action === 'lock-cms'
          ? 60
          : 20;
    if (!rateLimit(limitKey, limit, 15 * 60 * 1000)) {
      throw new HttpError(429, '嘗試次數過多，請稍後再試。');
    }
    if (action === 'lock-cms') {
      await requireSession();
      await clearCmsUnlock();
      return json({ cmsUnlocked: false });
    }
    if (action === 'unlock-cms') {
      const session = await requireSession(true);
      if (typeof password !== 'string') throw new HttpError(400, '請輸入有效的密碼。');
      await verifyCmsPassword(password, session);
      await setCmsUnlocked(session);
      return json({ cmsUnlocked: true, session });
    }
    if (action === 'change-password') {
      const session = await requireSession();
      if (session.demo) throw new HttpError(400, '示例模式無法更改密碼。');
      if (!session.email) throw new HttpError(400, '此帳戶沒有可用的登入電郵。');
      const passwords = validatePasswordChange(body);
      const sb = await supabase();
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: session.email,
        password: passwords.currentPassword,
      });
      if (signInError) throw new HttpError(401, '現有密碼不正確。');
      const { error: updateError } = await sb.auth.updateUser({ password: passwords.newPassword });
      if (updateError) throw new HttpError(400, passwordUpdateErrorMessage(updateError.message));
      return json({ ok: true });
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
    return json({ session, cmsUnlocked: await isCmsUnlocked(session) });
  } catch (e) {
    return failure(e);
  }
}
