-- Public website video and poster uploads from the admin dashboard.
-- Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media', 'site-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/ogg','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site media public read" on storage.objects;
create policy "site media public read" on storage.objects for select to public
  using (bucket_id = 'site-media');
drop policy if exists "site media admin insert" on storage.objects;
create policy "site media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "site media admin update" on storage.objects;
create policy "site media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and public.is_admin()) with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "site media admin delete" on storage.objects;
create policy "site media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and public.is_admin());
