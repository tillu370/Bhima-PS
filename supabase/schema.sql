-- ============================================================================
-- Bhima Printing Solutions - complete Supabase setup
-- Run this ONCE in: Supabase Dashboard > SQL Editor > New query > paste > Run.
-- Safe to re-run (it skips or replaces what already exists).
-- ============================================================================

-- ---------- admin allow-list (RLS on, no policies => unreadable from the API) ----------
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    case when exists (select 1 from public.admin_emails a where lower(a.email) = lower(new.email)) then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'role cannot be changed';
  end if;
  return new;
end $$;
revoke all on function public.protect_profile_role() from public, anon, authenticated;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- ---------- catalog ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true
);
alter table public.categories enable row level security;
drop policy if exists "categories read active" on public.categories;
create policy "categories read active" on public.categories for select to anon, authenticated
  using (is_active or public.is_admin());
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  description text,
  price_from numeric(10,2) not null check (price_from >= 0),
  image_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
alter table public.products enable row level security;
drop policy if exists "products read active" on public.products;
create policy "products read active" on public.products for select to anon, authenticated
  using (is_active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- wishlist ----------
create table if not exists public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.wishlist enable row level security;
drop policy if exists "wishlist own" on public.wishlist;
create policy "wishlist own" on public.wishlist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- enquiries ----------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  email text check (email is null or char_length(email) <= 200),
  enquiry_type text not null default 'General enquiry' check (char_length(enquiry_type) <= 120),
  product_interest text check (product_interest is null or char_length(product_interest) <= 120),
  quantity int check (quantity is null or quantity between 1 and 10000000),
  message text check (message is null or char_length(message) <= 3000),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
drop policy if exists "enquiries insert" on public.enquiries;
create policy "enquiries insert" on public.enquiries for insert to anon, authenticated
  with check (status = 'new' and (user_id is null or user_id = auth.uid()));
drop policy if exists "enquiries read own or admin" on public.enquiries;
create policy "enquiries read own or admin" on public.enquiries for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "enquiries admin update" on public.enquiries;
create policy "enquiries admin update" on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- storage: product images (public read, admin write) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "product images admin select" on storage.objects;
create policy "product images admin select" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------- starter data ----------
insert into public.categories (slug, name, description, sort_order) values
 ('business-cards','Business Cards','Make every introduction count',1),
 ('apparel','T-Shirts & Apparel','Custom wear for your team',2),
 ('gifts','Gifts & Drinkware','Personalised gifts for every occasion',3),
 ('packaging','Packaging','Boxes, labels, stickers & tape',4),
 ('stationery','Stationery','Notebooks, flyers, calendars',5),
 ('signage','Signage & Banners','Boards, standees, rollup displays',6)
on conflict (slug) do nothing;

insert into public.products (slug, category_id, name, description, price_from, image_url, is_featured, sort_order)
select v.slug, c.id, v.name, v.descr, v.price, v.img, true, v.ord
from (values
 ('premium-business-cards','business-cards','Premium Business Cards','Business cards printed on quality card stock. Share your finished design, or ask our team to help you create one. Tell us the quantity and finish you want when you place your request.',499,'./images/prod_biz_cards.jpg',1),
 ('custom-t-shirts','apparel','Custom T-Shirts','Custom printed t-shirts for teams, events, colleges and brands. Share your design and the sizes you need, and we will confirm the details with you.',299,'./images/prod_folded_tees.jpg',2),
 ('personalised-mugs','gifts','Personalised Mugs','Mugs printed with your photo, name or message. A simple personalised gift for birthdays, anniversaries and corporate gifting.',249,'./images/prod_personalised_mug.jpg',3),
 ('custom-packaging-boxes','packaging','Custom Packaging Boxes','Branded packaging boxes for your products. Tell us the size, quantity and artwork and we will get back with the details.',699,'./images/prod_pkg_box.jpg',4),
 ('flyers-brochures','stationery','Flyers & Brochures','Flyers and brochures for promotions, events and business information. Share your artwork or ask for design help.',299,'./images/prod_flyers_brochures.jpg',5),
 ('spiral-notebooks','stationery','Spiral Notebooks','Spiral notebooks with a custom cover for offices, events and gifting.',249,'./images/prod_spiral_notebook.jpg',6),
 ('photo-frames','gifts','Photo Frames','Photo frames personalised with your pictures, a thoughtful gift for family and friends.',299,'./images/prod_photo_frame.jpg',7),
 ('roll-up-banners','signage','Roll-Up Banners','Portable roll-up banners for shops, exhibitions and events. Share your artwork and size requirements.',1299,'./images/prod_rollup_banner.jpg',8)
) as v(slug,cat,name,descr,price,img,ord)
join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- Admin: anyone who signs up with this email becomes an admin. Change or add emails as needed.
insert into public.admin_emails (email) values ('lakshmisrinivas1849@gmail.com') on conflict do nothing;

-- If this email already has an account, promote it now.
insert into public.profiles (id, email, role)
select u.id, u.email, 'admin' from auth.users u where lower(u.email) in (select lower(email) from public.admin_emails)
on conflict (id) do update set role = 'admin';
