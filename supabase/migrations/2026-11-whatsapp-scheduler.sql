-- ============================================================================
-- WhatsApp automation, part 2: the 60-minute scheduler and the
-- "customer came back" cancellation.
-- Run once in: Supabase Dashboard > SQL Editor > New query > paste > Run.
-- Safe to re-run. Requires 2026-11-whatsapp-automation.sql to have run first.
--
-- pg_cron calls public.schedule_due_messages() directly every 5 minutes -
-- no HTTP hop, no secrets, pure SQL. Actually SENDING the message needs an
-- outbound HTTPS call with a bearer token, which Postgres can't do safely by
-- itself, so that half lives in the send-scheduled-messages Edge Function -
-- see supabase/functions/README.md for how to schedule that one.
-- ============================================================================

create extension if not exists pg_cron with schema extensions;

create or replace function public.schedule_due_messages() returns void
language plpgsql security definer set search_path = public as $$
declare
  camp record;
begin
  for camp in select * from public.campaigns where campaign_status = 'active' loop
    insert into public.scheduled_messages (customer_id, session_id, campaign_id, scheduled_at)
    select s.customer_id, s.id, camp.id, s.last_activity_at + (camp.inactivity_minutes || ' minutes')::interval
    from public.website_sessions s
    join public.whatsapp_customers c on c.id = s.customer_id
    where s.session_status = 'active'
      and c.marketing_consent = true
      and c.opted_out = false
      and s.last_activity_at <= now() - (camp.inactivity_minutes || ' minutes')::interval
    on conflict (customer_id, campaign_id) where status in ('pending', 'sent') do nothing;
  end loop;
end $$;
revoke all on function public.schedule_due_messages() from public, anon, authenticated;

-- cron.schedule() re-running with the same job name just updates it in place.
select cron.schedule(
  'schedule-due-messages',
  '*/5 * * * *',
  $$select public.schedule_due_messages();$$
);

-- A customer who comes back before the message went out no longer meets the
-- "still inactive" condition that scheduled it, so cancel that pending row.
create or replace function public.touch_session(p_session_id text, p_phone text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  cust_id uuid;
  sess_id uuid;
begin
  if p_phone is not null and public.normalize_in_phone(p_phone) ~ '^[0-9]{7,15}$' then
    select id into cust_id from public.whatsapp_customers where phone = public.normalize_in_phone(p_phone);
  end if;

  insert into public.website_sessions (session_id, customer_id, last_activity_at, session_status)
  values (p_session_id, cust_id, now(), 'active')
  on conflict (session_id) do update set
    last_activity_at = now(),
    session_status = 'active',
    customer_id = coalesce(public.website_sessions.customer_id, cust_id)
  returning id into sess_id;

  update public.scheduled_messages set status = 'cancelled'
  where session_id = sess_id and status = 'pending';
end $$;
revoke all on function public.touch_session(text, text) from public;
grant execute on function public.touch_session(text, text) to anon, authenticated;
