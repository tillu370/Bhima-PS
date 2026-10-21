-- ============================================================================
-- BHIMA PRINT SOLUTIONS - DEAL OF THE DAY MIGRATION
-- Run this in Supabase SQL Editor to enable dynamic Deal of the Day.
-- ============================================================================

create table if not exists public.deal_of_the_day (
  id text primary key default 'active',
  is_active boolean not null default true,
  badge_text text not null default '🔥 DEAL OF THE DAY',
  title text not null default 'Custom Ceramic Magic Mug',
  subtitle text default 'Reveal special memories with heat-activated photo printing. Flat discount today only!',
  original_price numeric(10,2) default 350,
  deal_price numeric(10,2) default 249,
  discount_tag text default '30% OFF',
  image_url text default '/images/mug-printing.jpg',
  product_slug text default 'mug-printing',
  button_text text default 'Claim Deal on WhatsApp',
  button_link text default '',
  banner_note text default '⚡ Limited Stock for Today Only!',
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.deal_of_the_day enable row level security;

-- Public can read deal
drop policy if exists "deal read all" on public.deal_of_the_day;
create policy "deal read all" on public.deal_of_the_day for select to anon, authenticated using (true);

-- Admin can insert and update deal
drop policy if exists "deal admin write" on public.deal_of_the_day;
create policy "deal admin write" on public.deal_of_the_day for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Seed default initial deal if empty
insert into public.deal_of_the_day (
  id, is_active, badge_text, title, subtitle,
  original_price, deal_price, discount_tag, image_url,
  product_slug, button_text, banner_note, updated_at
)
values (
  'active',
  true,
  '🔥 DEAL OF THE DAY',
  'Custom Ceramic Magic Mug',
  'Premium heat-sensitive photo reveal mug with ultra-vivid glossy finish. Perfect gift for birthdays, anniversaries & celebrations!',
  350,
  249,
  '30% OFF',
  '/images/mug-printing.jpg',
  'mug-printing',
  'Claim Deal on WhatsApp',
  '⚡ Limited Stock for Today Only!',
  now()
)
on conflict (id) do nothing;
