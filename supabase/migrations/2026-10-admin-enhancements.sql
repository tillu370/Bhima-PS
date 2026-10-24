-- ============================================================================
-- BHIMA PRINT SOLUTIONS - ADMIN ENHANCEMENTS
-- WhatsApp settings, promotional video, discount campaigns, photo-frame
-- price tiers, and locking reviews down to admin-only writes.
-- Safe to re-run.
-- ============================================================================

-- ---------- site settings (WhatsApp number) ----------
create table if not exists public.site_settings (
  id text primary key default 'global',
  whatsapp_number text not null default '919491811360' check (whatsapp_number ~ '^[0-9]{7,15}$'),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "site settings read all" on public.site_settings;
create policy "site settings read all" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "site settings admin write" on public.site_settings;
create policy "site settings admin write" on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (id, whatsapp_number) values ('global', '919491811360')
on conflict (id) do nothing;

-- ---------- promotional video section ----------
create table if not exists public.promo_video (
  id text primary key default 'active',
  is_active boolean not null default false,
  video_url text,
  thumbnail_url text,
  title text default 'See How We Bring Your Ideas to Print',
  description text default 'A quick look at our printing process, from design to delivery.',
  cta_label text default 'Explore Products',
  cta_link text default '/products',
  updated_at timestamptz not null default now()
);
alter table public.promo_video enable row level security;

drop policy if exists "promo video read all" on public.promo_video;
create policy "promo video read all" on public.promo_video for select to anon, authenticated using (true);
drop policy if exists "promo video admin write" on public.promo_video;
create policy "promo video admin write" on public.promo_video for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.promo_video (id) values ('active') on conflict (id) do nothing;

-- ---------- discount campaigns (percentage-based "Deal" style promotions) ----------
create table if not exists public.discount_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  percent numeric(5,2) not null check (percent > 0 and percent <= 90),
  scope text not null default 'products' check (scope in ('all', 'category', 'products')),
  category_id uuid references public.categories(id) on delete cascade,
  product_ids uuid[] not null default '{}',
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint discount_scope_category check (scope <> 'category' or category_id is not null),
  constraint discount_scope_products check (scope <> 'products' or array_length(product_ids, 1) > 0),
  constraint discount_dates check (start_date is null or end_date is null or start_date <= end_date)
);
create index if not exists discount_campaigns_active_idx on public.discount_campaigns (is_active);
alter table public.discount_campaigns enable row level security;

drop policy if exists "discounts read all" on public.discount_campaigns;
create policy "discounts read all" on public.discount_campaigns for select to anon, authenticated using (true);
drop policy if exists "discounts admin write" on public.discount_campaigns;
create policy "discounts admin write" on public.discount_campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- photo frame price tiers ----------
alter table public.products add column if not exists frame_tier text check (frame_tier in ('budget', 'medium', 'premium'));

create table if not exists public.frame_tier_ranges (
  tier text primary key check (tier in ('budget', 'medium', 'premium')),
  min_price numeric(10,2),
  max_price numeric(10,2),
  updated_at timestamptz not null default now()
);
alter table public.frame_tier_ranges enable row level security;

drop policy if exists "frame tier ranges read all" on public.frame_tier_ranges;
create policy "frame tier ranges read all" on public.frame_tier_ranges for select to anon, authenticated using (true);
drop policy if exists "frame tier ranges admin write" on public.frame_tier_ranges;
create policy "frame tier ranges admin write" on public.frame_tier_ranges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.frame_tier_ranges (tier, min_price, max_price) values
  ('budget', null, null), ('medium', null, null), ('premium', null, null)
on conflict (tier) do nothing;

-- ---------- reviews: admin-managed only (critical requirement) ----------
-- Customers must not be able to create reviews, through the UI or the API.
-- Remove the public "anyone can insert a pending review" policy and replace
-- it with an admin-only insert policy so writes are rejected server-side too.
drop policy if exists "reviews insert" on public.reviews;
drop policy if exists "reviews admin insert" on public.reviews;
create policy "reviews admin insert" on public.reviews for insert to authenticated
  with check (public.is_admin());
-- "reviews admin write" (update) and "reviews admin delete" already restrict
-- updates/deletes to admins; "reviews read approved or admin" already limits
-- public reads to status = 'approved'. Re-affirm both are present:
drop policy if exists "reviews read approved or admin" on public.reviews;
create policy "reviews read approved or admin" on public.reviews for select to anon, authenticated
  using (status = 'approved' or public.is_admin());
drop policy if exists "reviews admin write" on public.reviews;
create policy "reviews admin write" on public.reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reviews admin delete" on public.reviews;
create policy "reviews admin delete" on public.reviews for delete to authenticated
  using (public.is_admin());
