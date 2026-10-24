-- ============================================================================
-- Bhima Print Solutions - complete Supabase setup
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
  image_url text,
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
  price_from numeric(10,2) check (price_from is null or price_from >= 0), -- null = "ask for price"
  image_url text,
  image_url_2 text, -- optional: shown on hover in the product grid instead of image_url
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

-- ---------- storage: public promotional media (images + videos, admin write) ----------
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

-- Customiser: public bucket for design previews and customer-uploaded logos/photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('design-uploads', 'design-uploads', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set file_size_limit = 5242880, allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

drop policy if exists "design uploads insert" on storage.objects;
create policy "design uploads insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'design-uploads');
-- no select/update/delete policies: files cannot be listed or changed through the API; admins manage them in the dashboard.

-- ---------- starter data (only inserted when the tables are empty) ----------
do $seed$
begin
  if not exists (select 1 from public.categories) then
    insert into public.categories (slug, name, description, sort_order, image_url) values
     ('mugs-bottles','Mugs & Bottles','Mugs and water bottles with your photo or design',1,'/images/mugs-bottles.png'),
     ('apparel-cushions','T-Shirts & Pillows','T-shirts and pillows, personalised',2,'/images/apparel-cushions.png'),
     ('frames-clocks','Photo Frames & Clocks','Photo, LED and wood frames, wall clocks',3,'/images/frames-clocks.png'),
     ('laser-wood','Laser & Wood Engraving','Engraved wood, laser gifts, key chains, name boards',4,'/images/laser-wood.png'),
     ('keychains-magnets','Key Chains, Magnets & Badges','Photo key chains, fridge magnets, photo badges',5,'/images/keychains-magnets.png'),
     ('corporate-gifts','Corporate & Office Gifts','Gift sets, pens, pen stands, wallet cards, leather',6,'/images/corporate-gifts.png');

    insert into public.products (slug, category_id, name, description, price_from, image_url, is_featured, sort_order)
    select v.slug, c.id, v.name, v.descr, null, v.img, v.feat, v.ord
    from (values
     ('mug-printing','mugs-bottles','Mug Printing','Mugs printed with your photo, name or design. A simple personalised gift for birthdays and special occasions. Tell us the quantity and we will share the price.','/images/prod_personalised_mug.jpg',true,1),
     ('water-bottles','mugs-bottles','Water Bottles','Water bottles personalised with a name, photo or logo. Tell us the quantity you need and we will share the price.',null,false,2),
     ('t-shirt-printing','apparel-cushions','T Shirt Printing','T-shirts printed with your design, for teams, events and gifts. Tell us the sizes and quantity and we will share the price.','/images/prod_folded_tees.jpg',true,3),
     ('pillow-printing','apparel-cushions','Pillow Printing','Pillows printed with your photos or a message. Share your picture and the quantity and we will share the price.',null,false,4),
     ('photo-frames','frames-clocks','Photo Frames','Photo frames with your pictures printed in. Share your photos and the size you want and we will share the price.','/images/prod_photo_frame.jpg',true,5),
     ('led-frames','frames-clocks','LED Frames','LED photo frames that light up your picture. Share your photo and the size you need and we will share the price.',null,true,6),
     ('wood-photo-frames','frames-clocks','Wood Photo Frames','Wooden photo frames with your picture. Tell us the size and how many you need and we will share the price.',null,false,7),
     ('photo-wall-clocks','frames-clocks','Photo Wall Clocks','Wall clocks with your photo on the dial. A personal gift or room decoration. Tell us the quantity and we will share the price.',null,false,8),
     ('wood-engraving','laser-wood','Wood Engraving','Names, designs and messages engraved on wood. Share your design and the item you want engraved and we will share the price.',null,true,9),
     ('laser-gifts','laser-wood','Laser Gifts','Gift items engraved with a laser: names, dates and designs. Tell us what you have in mind and we will share the price.',null,false,10),
     ('laser-key-chains','laser-wood','Laser Key Chains','Key chains engraved with a laser. Send us the name or design you want and the quantity and we will share the price.',null,false,11),
     ('name-boards','laser-wood','Name Boards','Name boards for desks, doors and homes. Send us the name and style you want and we will share the price.',null,false,12),
     ('photo-key-chains','keychains-magnets','Photo Key Chains','Key chains with your photo. A small, personal gift. Share your picture and the quantity and we will share the price.',null,true,13),
     ('photo-fridge-magnets','keychains-magnets','Photo Fridge Magnets','Fridge magnets with your photos. A small keepsake or gift. Share your pictures and the quantity and we will share the price.',null,false,14),
     ('photo-badges','keychains-magnets','Photo Badges','Badges with your photo, for events, teams and gifts. Tell us the size and quantity and we will share the price.',null,false,15),
     ('corporate-gift-sets','corporate-gifts','Corporate Gift Sets','Gift sets for employees, clients and events. Tell us your budget and quantity and we will suggest options and share the price.','/images/corp_merchandise_set.jpg',true,16),
     ('customised-pens','corporate-gifts','Customised Pens','Pens customised with a name or logo, for gifting and promotions. Tell us the quantity and we will share the price.',null,true,17),
     ('pen-stands','corporate-gifts','Pen Stands','Pen stands customised for offices and gifting. Share your name or logo and the quantity and we will share the price.',null,false,18),
     ('wallet-cards','corporate-gifts','Wallet Cards','Wallet cards with your photo or details. Share your design and the quantity and we will share the price.',null,false,19),
     ('leather-products','corporate-gifts','Leather Products','Leather products personalised for gifting. Ask us about the items and customisation available and we will share the price.',null,false,20)
    ) as v(slug,cat,name,descr,img,feat,ord)
    join public.categories c on c.slug = v.cat;

  end if;
end $seed$;

-- Admin: anyone who signs up with one of these emails becomes an admin. Change or add emails as needed.
insert into public.admin_emails (email) values
  ('lakshmisrinivas1849@gmail.com'),
  ('bhimaxerox1@gmail.com')
on conflict do nothing;

-- If this email already has an account, promote it now.
insert into public.profiles (id, email, role)
select u.id, u.email, 'admin' from auth.users u where lower(u.email) in (select lower(email) from public.admin_emails)
on conflict (id) do update set role = 'admin';

-- Orders: every WhatsApp checkout is also saved here so the team can track it and see the customer's design.
-- Run this once in Supabase Dashboard > SQL Editor (it is also included at the end of schema.sql).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique check (ref ~ '^BPS-[A-Z0-9]{6}$'),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  address text check (address is null or char_length(address) <= 300),
  notes text check (notes is null or char_length(notes) <= 1000),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 100 and octet_length(items::text) <= 200000),
  est_total numeric(12,2) check (est_total is null or est_total >= 0),
  status text not null default 'new' check (status in ('new','contacted','confirmed','printing','delivered','cancelled')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
alter table public.orders enable row level security;

drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null and (user_id is null or user_id = auth.uid()));
drop policy if exists "orders read own or admin" on public.orders;
create policy "orders read own or admin" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
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
