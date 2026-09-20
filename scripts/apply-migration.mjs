import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function loadEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i);
    let value = trimmed.slice(i + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const args = process.argv.slice(2);
const migrationPath = args.at(-1);
const envPath = args.length > 1 ? args[0] : null;
if (!migrationPath) {
  console.error('Usage: node scripts/apply-migration.mjs [env-file] <migration.sql>');
  process.exit(1);
}

const env = envPath ? loadEnvFile(envPath) : process.env;
const url =
  env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!url) throw new Error('POSTGRES_URL_NON_POOLING or POSTGRES_URL is required');

const sql = postgres(url, { ssl: 'require', max: 1 });
const migration = await readFile(resolve(migrationPath), 'utf8');
await sql.unsafe(migration);
const tables = await sql`select to_regclass('public.feedback_submissions') as table_name`;
const buckets = await sql`select id from storage.buckets where id = 'feedback'`;
console.log('feedback_submissions:', tables[0]?.table_name);
console.log('feedback bucket:', buckets[0]?.id || 'missing');
await sql.end();
