import { createHmac, timingSafeEqual } from 'node:crypto';

const CMS_TTL_MS = 8 * 60 * 60 * 1000;

export function cmsCookieSecret(): string {
  if (process.env.CMS_UNLOCK_SECRET) return process.env.CMS_UNLOCK_SECRET;
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.DEMO_MODE === 'true' &&
    !process.env.VERCEL
  ) {
    return 'demo-cms-unlock-secret-not-for-production';
  }
  throw new Error('CMS_UNLOCK_SECRET is not configured.');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createCmsUnlockToken(
  email: string,
  role: string,
  secret: string,
  now = Date.now(),
): string {
  const exp = now + CMS_TTL_MS;
  const payload = `${email}|${role}|${exp}`;
  return `${payload}|${sign(payload, secret)}`;
}

export function verifyCmsUnlockToken(
  token: string,
  secret: string,
  now = Date.now(),
): { email: string; role: string } | null {
  const parts = token.split('|');
  if (parts.length !== 4) return null;
  const [email, role, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!email || !role || !Number.isFinite(exp) || !sig) return null;
  const payload = `${email}|${role}|${expStr}`;
  const expected = sign(payload, secret);
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  if (exp < now) return null;
  return { email, role };
}
