import 'server-only';
import { cookies } from 'next/headers';
import { HttpError } from './server';
import type { Session } from './types';
import { demoEnabled, requireSession } from './server';
import { DEMO_CMS_PASSWORD_DEFAULT } from './cms-password';

const CMS_UNLOCK_COOKIE = 'cms_unlock';

export const demoCmsPassword = () => process.env.DEMO_CMS_PASSWORD || DEMO_CMS_PASSWORD_DEFAULT;

export async function isCmsUnlocked() {
  const jar = await cookies();
  return jar.get(CMS_UNLOCK_COOKIE)?.value === '1';
}

export async function setCmsUnlocked() {
  const jar = await cookies();
  jar.set(CMS_UNLOCK_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function clearCmsUnlock() {
  const jar = await cookies();
  jar.delete(CMS_UNLOCK_COOKIE);
}

export async function requireCmsAccess(): Promise<Session> {
  const session = await requireSession(true);
  if (!(await isCmsUnlocked())) {
    throw new HttpError(403, '請先驗證內容管理密碼。');
  }
  return session;
}

export async function verifyCmsPassword(password: string, session: Session) {
  if (typeof password !== 'string' || !password || password.length > 500) {
    throw new HttpError(400, '請輸入有效的密碼。');
  }
  if (demoEnabled()) {
    if (password !== demoCmsPassword()) throw new HttpError(401, '密碼不正確。');
    return;
  }
  const { supabase } = await import('./server');
  const sb = await supabase();
  const { error } = await sb.auth.signInWithPassword({ email: session.email, password });
  if (error) throw new HttpError(401, '密碼不正確。');
}
