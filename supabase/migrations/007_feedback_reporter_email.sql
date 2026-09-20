-- Store submitter email on feedback rows for admin review.
begin;

alter table public.feedback_submissions
  add column if not exists reporter_email text;

commit;
