-- Run once in the Supabase SQL editor, before 002_seed.sql.
-- All company content is private. No anonymous reads and no self-enrolment.
begin;

create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('frontline', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.members enable row level security;
revoke all on public.members from anon, authenticated;
grant select on public.members to authenticated;
create policy own_membership on public.members for select to authenticated using (id = (select auth.uid()));

create function public.is_catalog_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.members where id = (select auth.uid()) and role = 'admin');
$$;
create function public.is_catalog_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.members where id = (select auth.uid()));
$$;
revoke all on function public.is_catalog_admin() from public;
revoke all on function public.is_catalog_member() from public;
grant execute on function public.is_catalog_admin(), public.is_catalog_member() to authenticated;

create table public.catalog_entries (
  entity text not null check (entity in ('folder','content','product','scene','offer','settings')),
  id text not null check (id ~ '^[a-zA-Z0-9_-]{1,100}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload->>'id' = id),
  modified_at timestamptz not null default now(),
  primary key(entity,id),
  constraint valid_content check (entity <> 'content' or (
    payload->>'status' in ('draft','published','archived') and
    payload->>'type' in ('image','pdf','video','link') and
    payload ? 'folderId' and jsonb_typeof(payload->'files') = 'array' and
    jsonb_typeof(payload->'productIds') = 'array'
  ))
);
create index catalog_folder on public.catalog_entries ((payload->>'folderId')) where entity = 'content';
create index catalog_parent on public.catalog_entries ((payload->>'parentId')) where entity = 'folder';
alter table public.catalog_entries enable row level security;
revoke all on public.catalog_entries from anon, authenticated;
grant select, insert, update on public.catalog_entries to authenticated;

create policy catalog_read on public.catalog_entries for select to authenticated using (
  (select public.is_catalog_member()) and (
    (select public.is_catalog_admin()) or
    (entity = 'content' and payload->>'status' = 'published') or
    (entity in ('scene','offer') and payload->>'active' = 'true') or
    entity in ('folder','product','settings')
  )
);
create policy admin_insert on public.catalog_entries for insert to authenticated with check ((select public.is_catalog_admin()));
create policy admin_update on public.catalog_entries for update to authenticated using ((select public.is_catalog_admin())) with check ((select public.is_catalog_admin()));

create function public.touch_catalog_entry() returns trigger language plpgsql set search_path = '' as $$
begin
  new.modified_at := now();
  return new;
end;
$$;
create trigger catalog_modified before update on public.catalog_entries for each row execute function public.touch_catalog_entry();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', false, 52428800, array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm']);

-- Invoker function intentionally respects catalog_entries RLS.
create function public.can_read_catalog_asset(object_name text) returns boolean
language sql stable security invoker set search_path = '' as $$
  select public.is_catalog_member() and (
    public.is_catalog_admin() or exists (
      select 1 from public.catalog_entries c where
        c.payload->>'image' = 'asset:' || object_name or
        c.payload->>'cover' = 'asset:' || object_name or
        coalesce(c.payload->'files', '[]'::jsonb) @> jsonb_build_array('asset:' || object_name)
    )
  );
$$;
revoke all on function public.can_read_catalog_asset(text) from public;
grant execute on function public.can_read_catalog_asset(text) to authenticated;
create policy private_catalog_read on storage.objects for select to authenticated
using (bucket_id = 'catalog' and public.can_read_catalog_asset(name));
create policy admin_catalog_upload on storage.objects for insert to authenticated
with check (bucket_id = 'catalog' and (select public.is_catalog_admin()) and (storage.foldername(name))[1] = (select auth.uid())::text);
-- No anonymous reads, overwrite or delete policies. Replacement uploads get new unique names.
commit;

-- Provision users using Dashboard > Authentication > Users. Disable public signup.
-- After creating an approved account, run this manually with its actual UUID:
-- insert into public.members (id, role) values ('<auth-user-uuid>', 'admin');
-- Use 'frontline' for read-only staff. Do not put actual user IDs/passwords in git.
