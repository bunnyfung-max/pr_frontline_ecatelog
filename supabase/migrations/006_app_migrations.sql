-- Tracks one-off SQL migrations applied after initial catalog bootstrap.
begin;

create table if not exists public.app_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);

alter table public.app_migrations enable row level security;
revoke all on public.app_migrations from anon, authenticated;

commit;
