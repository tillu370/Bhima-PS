const env = import.meta.env;

// Public values. Defaults keep the site working when no environment variables are set.
export const SUPABASE_URL = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || 'https://scjesfsrrgawtojuwzlk.supabase.co').replace(/\/+$/, '');
export const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OY7r8Oq7EVZ8JcRkAehj3g_j4Bt_3LB';
export const WHATSAPP_NUMBER = String(env.VITE_WHATSAPP_NUMBER || env.WHATSAPP_NUMBER || '919876543210').replace(/\D/g, '');

if (/^sb_secret_/.test(SUPABASE_KEY) || /service_role/.test(SUPABASE_KEY)) {
  throw new Error('A secret Supabase key was configured. Use the publishable (anon) key in the browser.');
}

export const whatsappUrl = text => 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');

// Social profile links. Leave a variable unset and that icon is not shown (no dead links).
export const SOCIAL = {
  instagram: env.VITE_INSTAGRAM_URL || '',
  youtube: env.VITE_YOUTUBE_URL || '',
  linkedin: env.VITE_LINKEDIN_URL || ''
};
