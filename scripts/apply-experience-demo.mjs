import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';

const root = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(root, '../supabase/migrations/004_experience_demo.sql'), 'utf8');
const url = process.env.POSTGRES_URL;

if (!url) {
  console.error('Missing POSTGRES_URL');
  process.exit(1);
}

const db = postgres(url, { ssl: 'require', max: 1 });
try {
  await db.unsafe(sql);
  console.log('ok experience demo applied');
} finally {
  await db.end({ timeout: 5 });
}
