// Service-role Supabase client for Edge Functions only. SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected automatically by the Supabase
// platform into every Edge Function - never set them manually as secrets.
import { createClient } from 'npm:@supabase/supabase-js@2';

export function supabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
}

// Defense in depth: besides the platform's own JWT check, require the caller
// to present the service-role key as the bearer token, so only the cron
// trigger (or an admin with the key) can invoke these internal functions.
export function requireServiceRole(req: Request): Response | null {
  const auth = req.headers.get('Authorization') || '';
  const expected = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`;
  if (auth !== expected) {
    return new Response('Forbidden', { status: 403 });
  }
  return null;
}
