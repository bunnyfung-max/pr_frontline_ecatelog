-- Additive only. Do not alter catalog_entries, members, feedback, storage, or existing policies.
-- Older app versions never query these objects, so applying this migration must not change their behavior.
begin;

create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null check (char_length(email) between 1 and 320),
  action text not null check (action in ('create', 'update', 'delete')),
  entity text not null check (entity in ('folder', 'content', 'product', 'scene', 'offer', 'settings')),
  target_id text not null check (target_id ~ '^[a-zA-Z0-9_-]{1,100}$'),
  target_name text not null default '' check (char_length(target_name) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists user_activity_created_at on public.user_activity_log (created_at desc);

alter table public.user_activity_log enable row level security;
revoke all on public.user_activity_log from anon, authenticated;
grant select on public.user_activity_log to authenticated;

drop policy if exists user_activity_admin_read on public.user_activity_log;
create policy user_activity_admin_read on public.user_activity_log
  for select to authenticated
  using ((select public.is_catalog_admin()));

create or replace function public.record_user_activity(
  p_action text,
  p_entity text,
  p_target_id text,
  p_target_name text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_email text;
begin
  if actor is null or not public.is_catalog_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_action not in ('create', 'update', 'delete')
    or p_entity not in ('folder', 'content', 'product', 'scene', 'offer', 'settings')
    or p_target_id is null
    or p_target_id !~ '^[a-zA-Z0-9_-]{1,100}$'
  then
    raise exception 'invalid activity' using errcode = '22023';
  end if;
  select u.email into actor_email from auth.users u where u.id = actor;
  insert into public.user_activity_log (user_id, email, action, entity, target_id, target_name)
  values (
    actor,
    left(coalesce(nullif(actor_email, ''), 'unknown'), 320),
    p_action,
    p_entity,
    p_target_id,
    left(coalesce(p_target_name, ''), 200)
  );
end;
$$;

revoke all on function public.record_user_activity(text, text, text, text) from public;
grant execute on function public.record_user_activity(text, text, text, text) to authenticated;

commit;
