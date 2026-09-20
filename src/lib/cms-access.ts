import 'server-only';
import { cookies } from 'next/headers';
import { HttpError } from './server';
import type { Session } from './types';
import { demoEnabled, requireSession } from './server';
import { DEMO_CMS_PASSWORD_DEFAULT } from './cms-password';
import {
  cmsCookieSecret,
  createCmsUnlockToken,
  verifyCmsUnlockToken,
} from './cms-cookie-token';

const CMS_UNLOCK_COOKIE = 'cms_unlock';

export const demoCmsPassword = () => process.env.DEMO_CMS_PASSWORD || DEMO_CMS_PASSWORD_DEFAULT;

export async function isCmsUnlocked(expected?: Session) {
  if (expected?.role === 'admin') return true;
  const jar = await cookies();
  const token = jar.get(CMS_UNLOCK_COOKIE)?.value;
  if (!token) return false;
  try {
    const verified = verifyCmsUnlockToken(token, cmsCookieSecret());
    if (!verified) {
      await clearCmsUnlock();
      return false;
    }
    if (expected && (expected.email !== verified.email || expected.role !== verified.role)) {
      return false;
    }
    return true;
  } catch {
    await clearCmsUnlock();
    return false;
  }
}

export async function setCmsUnlocked(session: Session) {
  const jar = await cookies();
  jar.set(CMS_UNLOCK_COOKIE, createCmsUnlockToken(session.email, session.role, cmsCookieSecret()), {
    httpOnly: true,
    sameSite: 'strict',
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
  if (!(await isCmsUnlocked(session))) {
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
