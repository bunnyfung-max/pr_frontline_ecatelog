-- Allow catalog admins to delete entries. Required for CMS folder/content removal.
begin;

grant delete on public.catalog_entries to authenticated;

create policy admin_delete on public.catalog_entries
  for delete to authenticated
  using ((select public.is_catalog_admin()));

commit;
