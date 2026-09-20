import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { demoEnabled } from './server';
import { createPostgres, reloadPostgrestSchema } from './postgres';

const migrationFiles = [
  '006_app_migrations.sql',
  '005_feedback.sql',
] as const;

let ensurePromise: Promise<string[]> | null = null;

async function migrationTableExists(sql: ReturnType<typeof createPostgres>) {
  const [row] = await sql<{ exists: boolean }[]>`
    select to_regclass('public.app_migrations') is not null as exists
  `;
  return row?.exists ?? false;
}

async function applyPendingMigrations() {
  if (demoEnabled()) return [];
  const sql = createPostgres();
  const applied: string[] = [];
  try {
    if (!(await migrationTableExists(sql))) {
      const bootstrap = await readFile(
        join(process.cwd(), 'supabase/migrations', '006_app_migrations.sql'),
        'utf8',
      );
      await sql.unsafe(bootstrap);
      await sql`insert into public.app_migrations (name) values ('006_app_migrations.sql') on conflict do nothing`;
      applied.push('006_app_migrations.sql');
    }

    for (const file of migrationFiles) {
      const [row] = await sql<{ exists: number }[]>`
        select 1 as exists from public.app_migrations where name = ${file} limit 1
      `;
      if (row?.exists) continue;
      const content = await readFile(join(process.cwd(), 'supabase/migrations', file), 'utf8');
      await sql.unsafe(content);
      await sql`insert into public.app_migrations (name) values (${file})`;
      applied.push(file);
    }

    if (applied.length) await reloadPostgrestSchema(sql);
    return applied;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export function ensurePendingMigrations() {
  if (!ensurePromise) ensurePromise = applyPendingMigrations();
  return ensurePromise;
}
