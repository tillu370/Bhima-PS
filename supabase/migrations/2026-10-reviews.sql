-- Product reviews: customers submit (pending), admins approve/reject before they show on the product page.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 100),
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews (product_id, status);
alter table public.reviews enable row level security;

drop policy if exists "reviews insert" on public.reviews;
create policy "reviews insert" on public.reviews for insert to anon, authenticated
  with check (status = 'pending' and (user_id is null or user_id = auth.uid()));
drop policy if exists "reviews read approved or admin" on public.reviews;
create policy "reviews read approved or admin" on public.reviews for select to anon, authenticated
  using (status = 'approved' or public.is_admin());
drop policy if exists "reviews admin write" on public.reviews;
create policy "reviews admin write" on public.reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reviews admin delete" on public.reviews;
create policy "reviews admin delete" on public.reviews for delete to authenticated
  using (public.is_admin());
