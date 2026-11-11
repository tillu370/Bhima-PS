# WhatsApp Promotional Automation — runbook

Customer enters phone + ticks consent → goes idle on the site → after the
campaign's inactivity window (default 60 min) → an approved WhatsApp
marketing template is sent via the Meta Cloud API, if they still have
consent, haven't opted out, haven't already gotten this campaign, and haven't
completed a purchase in that session.

Nothing in this system can send a real message until: the database migrations
are applied, the Edge Function secrets are set, a campaign is created and set
to `active`, and that campaign's template is Meta-approved. Keep campaigns in
`draft` while testing.

## What's already built (this repo)

| Piece | File |
| --- | --- |
| Tables, RLS, consent/opt-out/session RPCs | `supabase/migrations/2026-11-whatsapp-automation.sql` |
| `pg_cron` scheduler + return-visit cancellation | `supabase/migrations/2026-11-whatsapp-scheduler.sql` |
| Sends due messages via Meta Cloud API | `supabase/functions/send-scheduled-messages/` |
| Meta delivery/read/failed + STOP webhook | `supabase/functions/whatsapp-webhook/` |
| Frontend: consent checkboxes, heartbeat, opt-out form | `src/lib/whatsappAutomation.js` and call sites in `EnquiryModal.jsx`, `Checkout.jsx`, `Login.jsx`, `Account.jsx`, `Info.jsx` |
| Admin dashboard | `/admin/campaigns` in `src/pages/Admin.jsx` |

## Phase 6 — Deployment, step by step

1. **Run the two SQL migrations**, in order, in Supabase Dashboard > SQL
   Editor (or they're already applied if you ran them earlier in this
   project):
   ```
   supabase/migrations/2026-11-whatsapp-automation.sql
   supabase/migrations/2026-11-whatsapp-scheduler.sql
   ```
   If `create extension if not exists pg_cron` errors with a permissions
   message, enable it first from Dashboard > Database > Extensions, then
   re-run the second file.

2. **Get your Meta WhatsApp Cloud API details** (from Meta Business
   Manager > WhatsApp > API Setup, using a test/sandbox number first):
   - a permanent access token (`META_WHATSAPP_TOKEN`)
   - the phone number ID (`META_PHONE_NUMBER_ID`)
   - the WABA ID (`META_WABA_ID`, not currently used by the code but kept for
     reference/future use)
   - an app secret from your Meta App's Basic Settings (`META_APP_SECRET`)
   - a verify token you make up yourself (`META_WEBHOOK_VERIFY_TOKEN`,
     any random string you also paste into Meta's webhook config)

3. **Link the project and set secrets:**
   ```bash
   supabase link --project-ref scjesfsrrgawtojuwzlk
   supabase secrets set META_WHATSAPP_TOKEN=xxxx META_PHONE_NUMBER_ID=xxxx META_WABA_ID=xxxx META_WEBHOOK_VERIFY_TOKEN=xxxx META_APP_SECRET=xxxx
   ```

4. **Deploy both functions:**
   ```bash
   supabase functions deploy send-scheduled-messages
   supabase functions deploy whatsapp-webhook --no-verify-jwt
   ```

5. **Schedule `send-scheduled-messages`** — Dashboard > Integrations > Cron
   Jobs > Create job > type "Supabase Edge Function" > pick
   `send-scheduled-messages` > every 5 minutes. (See
   `supabase/functions/README.md` for the SQL/`pg_net` alternative.)

6. **Register the webhook** in Meta App Dashboard > WhatsApp >
   Configuration: URL
   `https://scjesfsrrgawtojuwzlk.functions.supabase.co/whatsapp-webhook`,
   verify token = the same `META_WEBHOOK_VERIFY_TOKEN` you set above, then
   subscribe to the `messages` field.

7. **Create your first campaign** in `/admin/campaigns`: name, the exact
   Meta-approved template name, language, inactivity window. Leave it as
   `draft`.

## Phase 5 — Testing checklist

Do these in order, with a campaign in `draft` first, then `active` with
Meta's sandbox number before ever using a real customer number.

- [ ] **Consent saves correctly** — submit the Enquiry form, Checkout, Signup,
      and Account profile with the box ticked each time. In Supabase, check
      `select * from whatsapp_customers;` — `marketing_consent = true`,
      `consent_timestamp` set, `consent_source` matches the form used.
- [ ] **Consent isn't silently reset** — submit the same form again with the
      box unticked; `marketing_consent` should stay `true` (only an explicit
      opt-out or re-ticking changes it).
- [ ] **Heartbeat works** — open the site, watch
      `select * from website_sessions order by last_activity_at desc;`
      `last_activity_at` should advance roughly every 60s while the tab is
      visible, and stop advancing when you switch tabs or minimize.
- [ ] **Scheduling fires** — with a campaign set to `active` and a short
      `inactivity_minutes` (e.g. 5, just for this test), go idle past that
      window and wait for the next `pg_cron` tick (≤5 min). Check
      `select * from scheduled_messages;` for a new `pending` row.
- [ ] **Return-visit cancels it** — repeat the above, but come back and
      interact with the site before the scheduled row would be sent; its
      `status` should flip to `cancelled`.
- [ ] **Opt-out blocks sending** — use the privacy-page "Stop promotions"
      form (or reply `STOP` to a real template message once live), confirm
      `opted_out = true`, and confirm `send-scheduled-messages` skips any
      pending row for that customer with `skip_reason = 'no_consent_or_opted_out'`.
- [ ] **Duplicate prevention** — try to get the same customer scheduled twice
      for the same campaign; the partial unique index on `scheduled_messages`
      (or the `message_logs` duplicate check at send time) should block it.
- [ ] **Purchase completion skips the nudge** — complete a checkout in the
      same session that has a pending message; it should be skipped with
      `skip_reason = 'purchase_completed'`.
- [ ] **Real delivery + webhook** — once a real (or sandbox) template is
      approved, let one send, and confirm `message_logs.delivery_status`
      progresses `sent` → `delivered` → (optionally) `read` as Meta's
      webhook calls arrive.
- [ ] **Retry/failure handling** — temporarily set `META_PHONE_NUMBER_ID` to
      a bad value, let a message attempt send, and confirm it retries (up to
      3 times, 15 min apart) before marking `failed`.

## Cost notes

Everything above runs on Supabase's free tier (`pg_cron`, Edge Functions).
The only unavoidable cost is Meta's own per-template-message pricing once you
move off the sandbox number — nothing here enables that automatically; it
only happens once you set a campaign to `active` with an approved template
and a real customer has consented.
