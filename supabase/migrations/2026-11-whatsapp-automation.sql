-- ============================================================================
-- WhatsApp promotional automation: customer registry, activity tracking,
-- scheduled messages, campaigns, delivery logs.
-- Run once in: Supabase Dashboard > SQL Editor > New query > paste > Run.
-- Safe to re-run.
--
-- Design note: enquiries/checkout/signup all work for guests, so there is no
-- single auth.users row to key these tables on. Everything below is keyed on
-- the customer's normalized phone number instead; user_id is kept only as an
-- optional link when the visitor happens to be logged in.
-- ============================================================================

-- ---------- phone normalization (Indian mobile, matches src/lib/whatsappData.js) ----------
create or replace function public.normalize_in_phone(raw text) returns text
language sql immutable as $$
  select case
    when regexp_replace(coalesce(raw, ''), '\D', '', 'g') ~ '^0?[6-9]\d{9}$'
      then '91' || right(regexp_replace(raw, '\D', '', 'g'), 10)
    else regexp_replace(coalesce(raw, ''), '\D', '', 'g')
  end;
$$;

-- ---------- whatsapp_customers ----------
create table if not exists public.whatsapp_customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^[0-9]{7,15}$'),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text check (customer_name is null or char_length(customer_name) <= 100),
  marketing_consent boolean not null default false,
  consent_timestamp timestamptz,
  consent_source text check (consent_source is null or char_length(consent_source) <= 60),
  opted_out boolean not null default false,
  opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists whatsapp_customers_consent_idx on public.whatsapp_customers (marketing_consent, opted_out);
alter table public.whatsapp_customers enable row level security;
-- No anon/authenticated policies: this table holds consent + personal data and is only
-- ever read/written through the security-definer functions below or by the admin.
drop policy if exists "whatsapp_customers admin all" on public.whatsapp_customers;
create policy "whatsapp_customers admin all" on public.whatsapp_customers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- website_sessions ----------
create table if not exists public.website_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique check (char_length(session_id) between 8 and 100),
  customer_id uuid references public.whatsapp_customers(id) on delete cascade,
  last_activity_at timestamptz not null default now(),
  session_status text not null default 'active' check (session_status in ('active', 'inactive', 'converted')),
  created_at timestamptz not null default now()
);
create index if not exists website_sessions_scan_idx on public.website_sessions (session_status, last_activity_at);
create index if not exists website_sessions_customer_idx on public.website_sessions (customer_id);
alter table public.website_sessions enable row level security;
drop policy if exists "website_sessions admin all" on public.website_sessions;
create policy "website_sessions admin all" on public.website_sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- campaigns ----------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null unique check (char_length(campaign_name) between 2 and 120),
  template_name text not null check (char_length(template_name) <= 120),
  template_language text not null default 'en',
  message_preview text check (message_preview is null or char_length(message_preview) <= 1000),
  image_url text,
  inactivity_minutes int not null default 60 check (inactivity_minutes between 5 and 1440),
  campaign_status text not null default 'draft' check (campaign_status in ('draft', 'active', 'paused', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
drop policy if exists "campaigns admin all" on public.campaigns;
create policy "campaigns admin all" on public.campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- scheduled_messages ----------
create table if not exists public.scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.whatsapp_customers(id) on delete cascade,
  session_id uuid references public.website_sessions(id) on delete set null,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled', 'skipped')),
  sent_at timestamptz,
  retry_count int not null default 0 check (retry_count >= 0),
  skip_reason text check (skip_reason is null or char_length(skip_reason) <= 60),
  created_at timestamptz not null default now()
);
-- One scheduled/sent attempt per customer per campaign: the duplicate-prevention rule from the spec.
create unique index if not exists scheduled_messages_no_dupe_idx on public.scheduled_messages (customer_id, campaign_id)
  where status in ('pending', 'sent');
create index if not exists scheduled_messages_due_idx on public.scheduled_messages (status, scheduled_at);
alter table public.scheduled_messages enable row level security;
drop policy if exists "scheduled_messages admin all" on public.scheduled_messages;
create policy "scheduled_messages admin all" on public.scheduled_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- message_logs ----------
create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.whatsapp_customers(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  scheduled_message_id uuid references public.scheduled_messages(id) on delete set null,
  whatsapp_message_id text,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message text check (error_message is null or char_length(error_message) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists message_logs_wamid_idx on public.message_logs (whatsapp_message_id);
create index if not exists message_logs_customer_idx on public.message_logs (customer_id, created_at desc);
alter table public.message_logs enable row level security;
drop policy if exists "message_logs admin all" on public.message_logs;
create policy "message_logs admin all" on public.message_logs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- updated_at bookkeeping ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists whatsapp_customers_touch on public.whatsapp_customers;
create trigger whatsapp_customers_touch before update on public.whatsapp_customers
  for each row execute function public.touch_updated_at();
drop trigger if exists campaigns_touch on public.campaigns;
create trigger campaigns_touch before update on public.campaigns
  for each row execute function public.touch_updated_at();
drop trigger if exists message_logs_touch on public.message_logs;
create trigger message_logs_touch before update on public.message_logs
  for each row execute function public.touch_updated_at();

-- ---------- public-facing RPCs (anon/authenticated call these directly; no raw table access) ----------

-- Called on every consent-bearing form submit (enquiry, checkout, signup, account profile).
-- Upserts the customer by phone and records/overwrites consent only when p_consent is true,
-- so re-submitting the same form without re-ticking the box never resets consent to false.
create or replace function public.save_whatsapp_consent(p_phone text, p_name text, p_consent boolean, p_source text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  norm_phone text := public.normalize_in_phone(p_phone);
begin
  if norm_phone !~ '^[0-9]{7,15}$' then
    raise exception 'invalid phone';
  end if;

  insert into public.whatsapp_customers (phone, customer_name, user_id, marketing_consent, consent_timestamp, consent_source)
  values (
    norm_phone,
    nullif(trim(coalesce(p_name, '')), ''),
    auth.uid(),
    coalesce(p_consent, false),
    case when p_consent then now() end,
    case when p_consent then left(coalesce(p_source, 'unknown'), 60) end
  )
  on conflict (phone) do update set
    customer_name = coalesce(nullif(trim(coalesce(p_name, '')), ''), public.whatsapp_customers.customer_name),
    user_id = coalesce(public.whatsapp_customers.user_id, auth.uid()),
    marketing_consent = case when p_consent then true else public.whatsapp_customers.marketing_consent end,
    consent_timestamp = case when p_consent then now() else public.whatsapp_customers.consent_timestamp end,
    consent_source = case when p_consent then left(coalesce(p_source, 'unknown'), 60) else public.whatsapp_customers.consent_source end,
    -- consenting again after a past opt-out is a fresh, explicit opt-in
    opted_out = case when p_consent then false else public.whatsapp_customers.opted_out end,
    opted_out_at = case when p_consent then null else public.whatsapp_customers.opted_out_at end;
end $$;
revoke all on function public.save_whatsapp_consent(text, text, boolean, text) from public;
grant execute on function public.save_whatsapp_consent(text, text, boolean, text) to anon, authenticated;

-- Self-service opt-out (e.g. an "unsubscribe" link/page). Phone-only, no auth required,
-- matching the "immediately prevent future marketing messages after opt-out" requirement.
create or replace function public.whatsapp_opt_out(p_phone text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.whatsapp_customers
  set opted_out = true, opted_out_at = now(), marketing_consent = false
  where phone = public.normalize_in_phone(p_phone);
end $$;
revoke all on function public.whatsapp_opt_out(text) from public;
grant execute on function public.whatsapp_opt_out(text) to anon, authenticated;

-- Heartbeat: called periodically while a tab is visible, and once right after a phone
-- number is captured so the session gets linked to a customer. Server-side last_activity_at
-- is the only thing the inactivity cron trusts; a closed tab simply stops refreshing it.
create or replace function public.touch_session(p_session_id text, p_phone text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  cust_id uuid;
begin
  if p_phone is not null and public.normalize_in_phone(p_phone) ~ '^[0-9]{7,15}$' then
    select id into cust_id from public.whatsapp_customers where phone = public.normalize_in_phone(p_phone);
  end if;

  insert into public.website_sessions (session_id, customer_id, last_activity_at, session_status)
  values (p_session_id, cust_id, now(), 'active')
  on conflict (session_id) do update set
    last_activity_at = now(),
    session_status = 'active',
    customer_id = coalesce(public.website_sessions.customer_id, cust_id);
end $$;
revoke all on function public.touch_session(text, text) from public;
grant execute on function public.touch_session(text, text) to anon, authenticated;

-- Marks a session converted (checkout completed) so the eligibility check can skip it
-- without having to join back through orders for every pending message.
create or replace function public.mark_session_converted(p_session_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.website_sessions set session_status = 'converted' where session_id = p_session_id;
end $$;
revoke all on function public.mark_session_converted(text) from public;
grant execute on function public.mark_session_converted(text) to anon, authenticated;
