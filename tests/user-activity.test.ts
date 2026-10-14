import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { catalogItemExists, catalogItemName, incomingItemName } from '../src/lib/user-activity';
import type { Catalog } from '../src/lib/types';

const catalog = {
  folders: [{ id: 'housing', parentId: null, name: 'New Housing', subtitle: '', order: 0 }],
  contents: [],
  products: [],
  scenes: [],
  offers: [],
  settings: { id: 'store', label: '前往自在購', url: '' },
} as Catalog;

test('names catalog changes from the saved item', () => {
  assert.equal(catalogItemExists(catalog, 'folder', 'housing'), true);
  assert.equal(catalogItemExists(catalog, 'folder', 'missing'), false);
  assert.equal(catalogItemName(catalog, 'folder', 'housing'), 'New Housing');
  assert.equal(catalogItemName(catalog, 'folder', 'missing'), 'missing');
  assert.equal(incomingItemName('content', { id: 'kit-1', name: '平面圖' }), '平面圖');
  assert.equal(incomingItemName('settings', { id: 'store', label: '門市連結' }), '門市連結');
});

test('activity log is append-only and only admins can read or record it', async () => {
  const db = new PGlite();
  const admin = '11111111-1111-4111-8111-111111111111';
  const staff = '22222222-2222-4222-8222-222222222222';
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema public, auth to authenticated, anon;
      create table public.members (
        id uuid primary key references auth.users(id) on delete cascade,
        role text not null check (role in ('frontline', 'admin'))
      );
      create function public.is_catalog_admin() returns boolean
      language sql stable security definer set search_path = '' as $$
        select exists(select 1 from public.members where id = (select auth.uid()) and role = 'admin');
      $$;
    `);
    await db.exec(await readFile('supabase/migrations/009_user_activity.sql', 'utf8'));
    await db.exec(
      `insert into auth.users values ('${admin}', 'admin@example.com'), ('${staff}', 'staff@example.com');
       insert into public.members (id, role) values ('${admin}', 'admin'), ('${staff}', 'frontline');`,
    );

    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.user_activity_log'), /permission denied/);

    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [staff]);
    assert.equal((await db.query('select * from public.user_activity_log')).rows.length, 0);
    await assert.rejects(
      db.query("select public.record_user_activity('create','folder','housing','New Housing')"),
      /not allowed/,
    );

    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    await assert.rejects(
      db.query(
        "insert into public.user_activity_log (email, action, entity, target_id) values ('fake@example.com','create','folder','housing')",
      ),
      /permission denied/,
    );
    await db.query("select public.record_user_activity('update','folder','housing','New Housing')");
    const rows = await db.query<{ email: string; action: string; target_name: string }>(
      'select email, action, target_name from public.user_activity_log',
    );
    assert.deepEqual(rows.rows, [
      { email: 'admin@example.com', action: 'update', target_name: 'New Housing' },
    ]);

    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [staff]);
    assert.equal((await db.query('select * from public.user_activity_log')).rows.length, 0);

    await db.exec('reset role');
    await db.exec(await readFile('supabase/migrations/009_user_activity.sql', 'utf8'));
    await db.exec('set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    const kept = await db.query<{ email: string; action: string }>(
      'select email, action from public.user_activity_log',
    );
    assert.deepEqual(kept.rows, [{ email: 'admin@example.com', action: 'update' }]);
  } finally {
    await db.close();
  }
});
