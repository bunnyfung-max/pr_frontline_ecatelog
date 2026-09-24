-- Feedback workflow status for admin triage.
begin;

alter table public.feedback_submissions
  add column if not exists status text not null default 'open'
  check (status in ('open', 'solved', 'future_plan'));

grant update on public.feedback_submissions to authenticated;

create policy feedback_admin_update on public.feedback_submissions
  for update to authenticated
  using ((select public.is_catalog_admin()))
  with check ((select public.is_catalog_admin()));

commit;
