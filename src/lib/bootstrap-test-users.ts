import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { TEST_LOGIN_ACCOUNTS } from './test-login-accounts';
import { HttpError } from './http-error';
import { createPostgres } from './postgres';
import { supabaseUrl } from './server';

function adminClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(503, '尚未設定 Supabase service role。');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function bootstrapTestUsers() {
  const admin = adminClient();
  const created: string[] = [];

  for (const account of TEST_LOGIN_ACCOUNTS) {
    const role = account.label === '管理員' ? 'admin' : 'frontline';
    const { data: listed, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) throw new HttpError(500, '無法讀取 Supabase 用戶。');

    const existing = listed.users.find((user) => user.email === account.email);
    const { data: user, error: userError } = existing
      ? await admin.auth.admin.updateUserById(existing.id, {
          email: account.email,
          password: account.password,
          email_confirm: true,
        })
      : await admin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
        });
    if (userError || !user.user) throw new HttpError(500, `無法建立 ${account.email}。`);

    const sql = createPostgres();
    try {
      await sql`
        insert into public.members (id, role)
        values (${user.user.id}::uuid, ${role})
        on conflict (id) do update set role = excluded.role
      `;
    } finally {
      await sql.end({ timeout: 5 });
    }

    created.push(account.email);
  }

  return created;
}
