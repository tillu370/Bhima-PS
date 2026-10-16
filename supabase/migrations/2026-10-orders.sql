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
