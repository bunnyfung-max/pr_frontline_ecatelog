import 'server-only';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserActivity } from './user-activity';
import { dataDirectory } from './catalog-repository';
import { HttpError } from './http-error';
import { demoEnabled, supabase } from './server';
import { postgresUrl } from './postgres';
import { ensurePendingMigrations } from './pending-migrations';

const activityFile = () => path.join(dataDirectory(), 'user-activity.json');

export type NewUserActivity = Omit<UserActivity, 'id' | 'createdAt'>;

async function readLocalActivity(): Promise<UserActivity[]> {
  try {
    return JSON.parse(await readFile(activityFile(), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return [];
  }
}

async function writeLocalActivity(rows: UserActivity[]) {
  await mkdir(dataDirectory(), { recursive: true });
  const temp = path.join(dataDirectory(), `activity-${randomUUID()}.tmp`);
  await writeFile(temp, JSON.stringify(rows, null, 2), 'utf8');
  await rename(temp, activityFile());
}

function missingActivitySetup(error: { code?: string; message?: string }) {
  const message = error.message || '';
  return (
    error.code === '42P01' ||
    error.code === '42883' ||
    error.code === 'PGRST202' ||
    message.includes('record_user_activity') ||
    message.includes('user_activity_log')
  );
}

export async function recordUserActivity(entry: NewUserActivity, client?: SupabaseClient) {
  if (demoEnabled()) {
    const rows = await readLocalActivity();
    rows.unshift({
      ...entry,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    });
    await writeLocalActivity(rows.slice(0, 500));
    return;
  }
  if (postgresUrl()) await ensurePendingMigrations();
  const sb = client || (await supabase());
  const { error } = await sb.rpc('record_user_activity', {
    p_action: entry.action,
    p_entity: entry.entity,
    p_target_id: entry.targetId,
    p_target_name: entry.targetName,
  });
  if (error) {
    if (missingActivitySetup(error))
      throw new HttpError(503, '操作記錄尚未完成資料庫設定，請聯絡 IT。');
    throw new HttpError(500, '未能記錄操作。');
  }
}
