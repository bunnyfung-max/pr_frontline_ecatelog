-- Stakeholder trial feedback and screenshot attachments.
begin;

create table public.feedback_submissions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reporter_name text not null check (char_length(reporter_name) between 1 and 200),
  category text not null check (category in ('bug', 'optimization')),
  description text not null check (char_length(description) between 1 and 4000),
  priority text not null check (priority in ('urgent', 'high', 'medium', 'low')),
  page_context text,
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  created_at timestamptz not null default now()
);

create index feedback_created_at on public.feedback_submissions (created_at desc);

alter table public.feedback_submissions enable row level security;
revoke all on public.feedback_submissions from anon;
grant insert, select on public.feedback_submissions to authenticated;

create policy feedback_insert on public.feedback_submissions
  for insert to authenticated
  with check (
    (select public.is_catalog_member()) and user_id = (select auth.uid())
  );

create policy feedback_admin_read on public.feedback_submissions
  for select to authenticated
  using ((select public.is_catalog_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback', 'feedback', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create function public.can_read_feedback_asset(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_catalog_member() and (
    public.is_catalog_admin() or
    split_part(object_name, '/', 1) = (select auth.uid())::text
  );
$$;

revoke all on function public.can_read_feedback_asset(text) from public;
grant execute on function public.can_read_feedback_asset(text) to authenticated;

create policy feedback_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'feedback' and
    (select public.is_catalog_member()) and
    split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy feedback_storage_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'feedback' and
    (select public.can_read_feedback_asset(name))
  );

commit;
