# WhatsApp automation - Edge Functions

Two functions. Neither is called from the frontend; the frontend only ever
calls the RPCs in `supabase/migrations/2026-11-whatsapp-automation.sql`
(`save_whatsapp_consent`, `touch_session`, `mark_session_converted`).

## `send-scheduled-messages`

Sends due rows from `scheduled_messages` through the Meta WhatsApp Cloud API.
Re-checks consent, opt-out, campaign status, purchase-completion and
duplicates immediately before sending (not just at schedule time).

**Deploy:**
```bash
supabase link --project-ref scjesfsrrgawtojuwzlk
supabase functions deploy send-scheduled-messages
```

**Secrets** (one-time):
```bash
supabase secrets set META_WHATSAPP_TOKEN=xxxx META_PHONE_NUMBER_ID=xxxx
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically -
never set those yourself.

**Schedule it** (pick one):
- **Dashboard (simplest):** Project > Integrations > Cron Jobs > Create job >
  type "Supabase Edge Function" > select `send-scheduled-messages` > every 5
  minutes. The dashboard handles auth for you.
- **SQL (`pg_cron` + `pg_net`), if you'd rather keep it versioned:**
  ```sql
  create extension if not exists pg_net with schema extensions;
  select cron.schedule(
    'send-scheduled-messages',
    '*/5 * * * *',
    $$
    select net.http_post(
      url := 'https://scjesfsrrgawtojuwzlk.functions.supabase.co/send-scheduled-messages',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
    $$
  );
  ```
  (Store the service role key in Vault first: `select vault.create_secret('<service-role-key>', 'service_role_key');` -
  do this from the SQL editor only, never commit the key to the repo.)

## `whatsapp-webhook`

Public endpoint for Meta's delivery/read/failure callbacks and inbound
messages (handles the `STOP` opt-out keyword). Meta cannot send a Supabase
JWT, so this one must be deployed without JWT verification and instead
checks Meta's own HMAC signature:

```bash
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase secrets set META_WEBHOOK_VERIFY_TOKEN=xxxx META_APP_SECRET=xxxx
```

In Meta App Dashboard > WhatsApp > Configuration, set the webhook URL to
`https://scjesfsrrgawtojuwzlk.functions.supabase.co/whatsapp-webhook` and the
verify token to the same `META_WEBHOOK_VERIFY_TOKEN` value, then subscribe to
the `messages` field.

## Testing before going live

Use Meta's test WABA/phone number and a template in `PENDING`/sandbox mode
first. Nothing in `schedule_due_messages()` or either function sends to a
real customer until: a campaign row has `campaign_status = 'active'`, the
customer has `marketing_consent = true` and `opted_out = false`, and the
template is Meta-approved for the `to` number. Keep every campaign in
`draft` until you've verified all of that.
