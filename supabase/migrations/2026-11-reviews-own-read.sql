-- Let a logged-in customer read their own reviews (any status), not just approved ones,
-- so "My Reviews" on the Account page can show pending/rejected reviews too.
drop policy if exists "reviews read approved or admin" on public.reviews;
create policy "reviews read approved or admin or own" on public.reviews for select to anon, authenticated
  using (status = 'approved' or public.is_admin() or (user_id is not null and user_id = auth.uid()));
