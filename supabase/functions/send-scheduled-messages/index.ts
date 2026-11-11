// Picks up due rows from scheduled_messages, re-checks eligibility, and sends
// the approved WhatsApp marketing template through the Meta Cloud API.
// Triggered on a schedule (every few minutes) - see supabase/functions/README.md
// for how to wire that up. Never called from the frontend.
import { requireServiceRole, supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const GRAPH_VERSION = 'v21.0';
const MAX_RETRIES = 3;
const RETRY_DELAY_MINUTES = 15;
const BATCH_SIZE = 25;

Deno.serve(async req => {
  const denied = requireServiceRole(req);
  if (denied) return denied;

  const token = Deno.env.get('META_WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID');
  if (!token || !phoneNumberId) {
    return new Response('Missing META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID secret', { status: 500 });
  }

  const supa = supabaseAdmin();
  const { data: due, error } = await supa
    .from('scheduled_messages')
    .select(`
      id, customer_id, session_id, campaign_id, retry_count,
      whatsapp_customers ( phone, customer_name, marketing_consent, opted_out ),
      campaigns ( campaign_status, template_name, template_language, image_url ),
      website_sessions ( session_status )
    `)
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) return new Response(`Query failed: ${error.message}`, { status: 500 });

  const results = { sent: 0, skipped: 0, retried: 0, failed: 0 };

  for (const row of due || []) {
    const customer = row.whatsapp_customers as any;
    const campaign = row.campaigns as any;
    const session = row.website_sessions as any;

    const skipReason = await findSkipReason(supa, row, customer, campaign, session);
    if (skipReason) {
      await supa.from('scheduled_messages').update({ status: 'skipped', skip_reason: skipReason }).eq('id', row.id);
      results.skipped++;
      continue;
    }

    try {
      const components: any[] = [];
      if (customer.customer_name) {
        components.push({ type: 'body', parameters: [{ type: 'text', text: customer.customer_name }] });
      }
      if (campaign.image_url) {
        components.push({ type: 'header', parameters: [{ type: 'image', image: { link: campaign.image_url } }] });
      }

      const resp = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: customer.phone,
          type: 'template',
          template: {
            name: campaign.template_name,
            language: { code: campaign.template_language || 'en' },
            ...(components.length ? { components } : {})
          }
        })
      });

      const body = await resp.json().catch(() => ({}));

      if (resp.ok) {
        const wamid = body?.messages?.[0]?.id ?? null;
        await supa.from('scheduled_messages').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', row.id);
        await supa.from('message_logs').insert({
          customer_id: row.customer_id, campaign_id: row.campaign_id, scheduled_message_id: row.id,
          whatsapp_message_id: wamid, delivery_status: 'sent'
        });
        results.sent++;
        continue;
      }

      const retryable = resp.status >= 500 || resp.status === 429;
      const errMsg = body?.error?.message || `HTTP ${resp.status}`;

      if (retryable && row.retry_count < MAX_RETRIES) {
        await supa.from('scheduled_messages').update({
          retry_count: row.retry_count + 1,
          scheduled_at: new Date(Date.now() + RETRY_DELAY_MINUTES * 60_000).toISOString()
        }).eq('id', row.id);
        results.retried++;
      } else {
        await supa.from('scheduled_messages').update({ status: 'failed', skip_reason: errMsg.slice(0, 60) }).eq('id', row.id);
        await supa.from('message_logs').insert({
          customer_id: row.customer_id, campaign_id: row.campaign_id, scheduled_message_id: row.id,
          delivery_status: 'failed', error_message: errMsg
        });
        results.failed++;
      }
    } catch (e) {
      // Network error reaching Meta: treat like a retryable failure.
      if (row.retry_count < MAX_RETRIES) {
        await supa.from('scheduled_messages').update({
          retry_count: row.retry_count + 1,
          scheduled_at: new Date(Date.now() + RETRY_DELAY_MINUTES * 60_000).toISOString()
        }).eq('id', row.id);
        results.retried++;
      } else {
        await supa.from('scheduled_messages').update({ status: 'failed', skip_reason: 'network_error' }).eq('id', row.id);
        results.failed++;
      }
    }
  }

  return new Response(JSON.stringify({ processed: (due || []).length, ...results }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

async function findSkipReason(supa: ReturnType<typeof supabaseAdmin>, row: any, customer: any, campaign: any, session: any) {
  if (!customer) return 'customer_missing';
  if (!customer.marketing_consent || customer.opted_out) return 'no_consent_or_opted_out';
  if (!campaign || campaign.campaign_status !== 'active') return 'campaign_not_active';
  if (session && session.session_status === 'converted') return 'purchase_completed';

  const { data: already } = await supa
    .from('message_logs')
    .select('id')
    .eq('customer_id', row.customer_id)
    .eq('campaign_id', row.campaign_id)
    .in('delivery_status', ['sent', 'delivered', 'read'])
    .limit(1);
  if (already && already.length) return 'duplicate_campaign';

  return null;
}
