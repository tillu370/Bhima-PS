// Public endpoint Meta calls directly: the verification handshake (GET) and
// delivery/read/failure status + inbound-message webhooks (POST).
// Deploy with --no-verify-jwt (see supabase/functions/README.md) since Meta
// cannot send a Supabase JWT; this file verifies Meta's own signature instead.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

Deno.serve(async req => {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === Deno.env.get('META_WEBHOOK_VERIFY_TOKEN')) {
      return new Response(challenge ?? '', { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') || '';
  const valid = await verifySignature(rawBody, signature, Deno.env.get('META_APP_SECRET') || '');
  if (!valid) return new Response('Invalid signature', { status: 401 });

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const supa = supabaseAdmin();
  const changes = (payload?.entry ?? []).flatMap((e: any) => e.changes ?? []);

  for (const change of changes) {
    const value = change?.value ?? {};

    for (const status of value.statuses ?? []) {
      const delivery = mapMetaStatus(status.status);
      if (!delivery) continue;
      await supa.from('message_logs')
        .update({
          delivery_status: delivery,
          error_message: status.errors?.[0]?.title ?? null
        })
        .eq('whatsapp_message_id', status.id);
    }

    for (const message of value.messages ?? []) {
      const text = (message?.text?.body || '').trim().toLowerCase();
      if (['stop', 'unsubscribe', 'stop promotions'].includes(text)) {
        await supa.rpc('whatsapp_opt_out', { p_phone: message.from });
      }
    }
  }

  // Meta expects a fast 200 regardless of internal outcome, or it will retry.
  return new Response('EVENT_RECEIVED', { status: 200 });
});

function mapMetaStatus(status: string): string | null {
  if (status === 'sent' || status === 'delivered' || status === 'read' || status === 'failed') return status;
  return null;
}

async function verifySignature(rawBody: string, header: string, appSecret: string): Promise<boolean> {
  if (!appSecret || !header.startsWith('sha256=')) return false;
  const expectedHex = header.slice('sha256='.length);
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const gotHex = [...new Uint8Array(sigBuf)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (gotHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < gotHex.length; i++) diff |= gotHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}
