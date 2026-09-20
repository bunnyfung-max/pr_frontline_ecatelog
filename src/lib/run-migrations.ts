import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type postgres from 'postgres';
import { HttpError } from './http-error';
import { createPostgres, reloadPostgrestSchema } from './postgres';

const migrationFiles = [
  '001_catalog.sql',
  '002_seed.sql',
  '003_admin_delete.sql',
] as const;

async function membersTableExists(sql: postgres.Sql) {
  const [row] = await sql<{ exists: boolean }[]>`
    select to_regclass('public.members') is not null as exists
  `;
  return row?.exists ?? false;
}

export async function runMigrations() {
  const sql = createPostgres();
  try {
    if (await membersTableExists(sql)) return { migrated: false };

    for (const file of migrationFiles) {
      try {
        const content = await readFile(join(process.cwd(), 'supabase/migrations', file), 'utf8');
        await sql.unsafe(content);
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知錯誤';
        throw new HttpError(500, `資料庫初始化失敗（${file}）：${message}`);
      }
    }
    await reloadPostgrestSchema(sql);
    return { migrated: true };
  } finally {
    await sql.end({ timeout: 5 });
  }
}
