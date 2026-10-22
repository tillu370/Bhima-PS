-- ============================================================================
-- BHIMA PRINT SOLUTIONS - FESTIVAL THEMES MIGRATION
-- Run this in Supabase SQL Editor to enable dynamic Festival Themes
-- (Diwali, Christmas, New Year, Sankranti, Dussehra, Holi, Eid, etc.)
-- ============================================================================

create table if not exists public.site_festival_theme (
  id text primary key default 'diwali',
  is_active boolean not null default true,
  theme_id text not null default 'diwali',
  banner_title text default 'Shubh Deepavali Celebrations',
  banner_text text default 'Celebrate the Festival of Lights with custom gift printing! Special festive discounts on Mugs, T-Shirts & Corporate Sets.',
  banner_tag text default 'FESTIVE SPECIAL',
  button_text text default 'Enquire on WhatsApp',
  button_link text default 'https://wa.me/919491811360?text=Hi%20Bhima%20Print,%20I%20am%20interested%20in%20Festive%20Discount%20Offers!',
  show_banner boolean not null default true,
  show_ambient boolean not null default true,
  config_json jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ensure config_json column exists if the table already existed previously
alter table public.site_festival_theme add column if not exists config_json jsonb default '{}'::jsonb;
update public.site_festival_theme set config_json = '{}'::jsonb where config_json is null;
alter table public.site_festival_theme alter column config_json set default '{}'::jsonb;
alter table public.site_festival_theme alter column config_json set not null;

-- Enable Row Level Security
alter table public.site_festival_theme enable row level security;

-- Public can read active festival theme
drop policy if exists "festival theme read all" on public.site_festival_theme;
create policy "festival theme read all" on public.site_festival_theme for select to anon, authenticated using (true);

-- Admin can insert and update festival theme
drop policy if exists "festival theme admin write" on public.site_festival_theme;
create policy "festival theme admin write" on public.site_festival_theme for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Seed default initial festival theme if empty (keyed to 'diwali' as expected by legacy diwaliThemeData.js)
insert into public.site_festival_theme (
  id, is_active, theme_id, banner_title, banner_text, banner_tag,
  button_text, button_link, show_banner, show_ambient, config_json, updated_at
)
values (
  'diwali',
  true,
  'diwali',
  'Shubh Deepavali Celebrations',
  'Celebrate the Festival of Lights with custom photo gifts! Special festive discounts on Mugs, T-Shirts & Corporate Sets.',
  'FESTIVE SPECIAL',
  'Enquire on WhatsApp',
  'https://wa.me/919491811360?text=Hi%20Bhima%20Print,%20I%20want%20to%20enquire%20about%20Diwali%20Festive%20Offers!',
  true,
  true,
  '{}'::jsonb,
  now()
)
on conflict (id) do nothing;

-- Seed festive_master row supporting unified 4-festival switcher system
insert into public.site_festival_theme (
  id, is_active, theme_id, banner_title, banner_text, banner_tag,
  button_text, button_link, show_banner, show_ambient, config_json, updated_at
)
values (
  'festive_master',
  false,
  'none',
  'Bhima Print Solutions Festive Showcase',
  'Celebrate special seasons with personalized gifts and custom merchandise.',
  'FESTIVE SPECIAL',
  'Explore Products',
  '/products',
  false,
  false,
  '{"active_festival_id": "none", "themes": {}}'::jsonb,
  now()
)
on conflict (id) do nothing;
