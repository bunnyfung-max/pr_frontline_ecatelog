import 'server-only';
import postgres from 'postgres';
import { HttpError } from './http-error';

export function postgresUrl() {
  return process.env.POSTGRES_URL;
}

export function createPostgres() {
  const url = postgresUrl();
  if (!url) throw new HttpError(503, '尚未設定 POSTGRES_URL。');
  return postgres(url, { ssl: 'require', max: 1 });
}

export async function reloadPostgrestSchema(sql: postgres.Sql) {
  await sql`select pg_notify('pgrst', 'reload schema')`;
}
