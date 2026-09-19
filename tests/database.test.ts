import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
test('Postgres migration and RLS: anonymous, unapproved, frontline and admin boundaries', async () => {
  const db = new PGlite();
  try {
    // Minimal stand-ins for schemas managed by Supabase, not a hosted service test.
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id bigint generated always as identity primary key,bucket_id text,name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
      grant usage on schema public, auth, storage to authenticated, anon;
      grant select,insert on storage.objects to authenticated, anon;
      grant usage on sequence storage.objects_id_seq to authenticated;
    `);
    await db.exec(await readFile('supabase/migrations/001_catalog.sql', 'utf8'));
    await db.exec(await readFile('supabase/migrations/002_seed.sql', 'utf8'));
    await db.exec(await readFile('supabase/migrations/003_admin_delete.sql', 'utf8'));
    const admin = '11111111-1111-4111-8111-111111111111';
    const staff = '22222222-2222-4222-8222-222222222222';
    const outsider = '33333333-3333-4333-8333-333333333333';
    await db.exec(
      `insert into auth.users values ('${admin}'),('${staff}'),('${outsider}'); insert into public.members (id,role) values ('${admin}','admin'),('${staff}','frontline');`,
    );
    for (const status of ['published', 'draft', 'archived']) {
      await db.query('insert into public.catalog_entries(entity,id,payload) values ($1,$2,$3)', [
        'content',
        status,
        JSON.stringify({
          id: status,
          status,
          type: 'pdf',
          folderId: 'housing',
          files: [`asset:${status}.pdf`],
          tags: [],
          eshopProducts: [],
          productIds: [],
        }),
      ]);
      await db.query('insert into storage.objects(bucket_id,name) values ($1,$2)', [
        'catalog',
        `${status}.pdf`,
      ]);
    }
    const kitLinks = {
      storeUrl: 'https://example.com/store/kit',
      eshopUrl: 'https://example.com/kit',
    };
    await db.query(
      "update public.catalog_entries set payload=payload || $1::jsonb where entity='content' and id='published'",
      [JSON.stringify(kitLinks)],
    );
    const productLinks = {
      id: 'link-product',
      storeUrl: 'https://example.com/store/product',
      url: 'https://example.com/product',
    };
    await db.query(
      "insert into public.catalog_entries(entity,id,payload) values ('product','link-product',$1)",
      [JSON.stringify(productLinks)],
    );
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.catalog_entries'), /permission denied/);
    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [outsider]);
    assert.equal((await db.query('select * from public.catalog_entries')).rows.length, 0);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [staff]);
    const rows = await db.query<{ id: string }>(
      "select id from public.catalog_entries where entity='content' order by id",
    );
    const visible = rows.rows.map((r) => r.id);
    assert.equal(visible.includes('published'), true);
    assert.equal(visible.includes('draft'), false);
    assert.equal(visible.includes('archived'), false);
    assert.equal(visible.length, 50);
    const kitRow = await db.query<{ payload: typeof kitLinks }>(
      "select payload from public.catalog_entries where entity='content' and id='published'",
    );
    assert.equal(kitRow.rows[0].payload.storeUrl, kitLinks.storeUrl);
    assert.equal(kitRow.rows[0].payload.eshopUrl, kitLinks.eshopUrl);
    const productRow = await db.query<{ payload: typeof productLinks }>(
      "select payload from public.catalog_entries where entity='product' and id='link-product'",
    );
    assert.deepEqual(productRow.rows[0].payload, productLinks);
    const assets = await db.query<{ name: string }>('select name from storage.objects');
    assert.deepEqual(
      assets.rows.map((r) => r.name),
      ['published.pdf'],
    );
    await assert.rejects(
      db.query("insert into public.catalog_entries values('settings','x','{\"id\":\"x\"}')"),
      /row-level security/,
    );
    await assert.rejects(db.query("update public.members set role='admin'"), /permission denied/);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    assert.equal(
      (await db.query("select * from public.catalog_entries where entity='content'")).rows.length,
      52,
    );
    await db.query('insert into storage.objects(bucket_id,name) values ($1,$2)', [
      'catalog',
      `${admin}/valid.pdf`,
    ]);
    await assert.rejects(
      db.query('insert into storage.objects(bucket_id,name) values ($1,$2)', [
        'catalog',
        `${staff}/wrong.pdf`,
      ]),
      /row-level security/,
    );
    const kitFiles = [
      'asset:plan.png',
      'asset:render.png',
      'asset:list1.png',
      'asset:list2.png',
      '',
      `asset:${admin}/extra.pdf`,
      `asset:${admin}/clip.webm`,
    ];
    await db.query(
      "insert into public.catalog_entries(entity,id,payload) values ('content','mixed-kit',$1)",
      [
        JSON.stringify({
          id: 'mixed-kit',
          status: 'published',
          type: 'image',
          salesKit: true,
          folderId: 'housing',
          files: kitFiles,
          tags: [],
          eshopProducts: [],
          productIds: [],
        }),
      ],
    );
    const extraNames = [`${admin}/extra.pdf`, `${admin}/clip.webm`];
    for (const name of extraNames)
      await db.query('insert into storage.objects(bucket_id,name) values ($1,$2)', [
        'catalog',
        name,
      ]);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [staff]);
    const mixed = await db.query<{ payload: { files: string[]; salesKit: boolean } }>(
      "select payload from public.catalog_entries where id='mixed-kit'",
    );
    assert.equal(mixed.rows[0].payload.salesKit, true);
    assert.deepEqual(mixed.rows[0].payload.files, kitFiles);
    assert.deepEqual(
      (
        await db.query<{ name: string }>(
          'select name from storage.objects where name=any($1::text[]) order by name',
          [extraNames],
        )
      ).rows.map((r) => r.name),
      [...extraNames].sort(),
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    await db.exec(
      "update public.catalog_entries set payload=jsonb_set(payload,'{status}','\"archived\"') where id='mixed-kit'",
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [staff]);
    assert.equal(
      (await db.query('select name from storage.objects where name=any($1::text[])', [extraNames]))
        .rows.length,
      0,
    );
    const blockedDelete = await db.query(
      "delete from public.catalog_entries where entity='content' and id='published' returning id",
    );
    assert.equal(blockedDelete.rows.length, 0);
    assert.equal(
      (await db.query("select id from public.catalog_entries where id='published'")).rows.length,
      1,
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
    const adminDelete = await db.query(
      "delete from public.catalog_entries where entity='content' and id='archived' returning id",
    );
    assert.equal(adminDelete.rows.length, 1);
    assert.equal(
      (await db.query("select id from public.catalog_entries where id='archived'")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
