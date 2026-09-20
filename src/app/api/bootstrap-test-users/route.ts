import { bootstrapTestUsers } from '@/lib/bootstrap-test-users';
import { runMigrations } from '@/lib/run-migrations';
import { failure, json, HttpError } from '@/lib/server';

function allowed(request: Request) {
  if (process.env.ALLOW_TEST_USER_BOOTSTRAP === 'true') return true;
  const secret = process.env.CMS_UNLOCK_SECRET;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(secret && token && token === secret);
}

export async function POST(request: Request) {
  try {
    if (!allowed(request)) throw new HttpError(403, '未授權建立測試帳戶。');
    const migration = await runMigrations();
    const emails = await bootstrapTestUsers();
    return json({ ok: true, emails, migration });
  } catch (error) {
    return failure(error);
  }
}
