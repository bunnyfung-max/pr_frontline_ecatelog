const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const accounts = [
  { email: 'ecatalog-admin@test.pricerite.hk', password: 'TestAdmin#2026', role: 'admin' },
  { email: 'ecatalog-frontline@test.pricerite.hk', password: 'TestFront#2026', role: 'frontline' },
];

async function listUsers() {
  const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`list users failed: ${res.status} ${JSON.stringify(body)}`);
  return body.users ?? [];
}

async function upsertUser(account) {
  const existing = (await listUsers()).find((user) => user.email === account.email);
  const endpoint = existing
    ? `${url}/auth/v1/admin/users/${existing.id}`
    : `${url}/auth/v1/admin/users`;
  const res = await fetch(endpoint, {
    method: existing ? 'PUT' : 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      email_confirm: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${existing ? 'update' : 'create'} user failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function upsertMember(id, role) {
  const res = await fetch(`${url}/rest/v1/members`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ id, role }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`member upsert failed: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

for (const account of accounts) {
  const user = await upsertUser(account);
  await upsertMember(user.id, account.role);
  console.log(`ok ${account.role} ${account.email}`);
}
