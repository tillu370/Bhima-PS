import { supabase } from './supabase.js';

export const DEFAULT_PROMO_VIDEO = {
  id: 'active',
  is_active: false,
  video_url: '',
  thumbnail_url: '',
  title: 'See How We Bring Your Ideas to Print',
  description: 'A quick look at our printing process, from design to delivery.',
  cta_label: 'Explore Products',
  cta_link: '/products',
  updated_at: new Date().toISOString()
};

const STORAGE_KEY = 'bps_promo_video';

export function getCachedPromoVideo() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) { /* ignore */ }
  return DEFAULT_PROMO_VIDEO;
}

export async function fetchPromoVideo() {
  try {
    const { data, error } = await supabase.from('promo_video').select('*').eq('id', 'active').maybeSingle();
    if (!error && data) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
      return data;
    }
  } catch (err) { /* table not migrated yet or offline */ }
  return getCachedPromoVideo();
}

export async function savePromoVideo(video) {
  const payload = { ...video, id: 'active', updated_at: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('bps_promo_video_updated', { detail: payload }));
  } catch (e) { /* ignore */ }
  try {
    const { data, error } = await supabase.from('promo_video').upsert(payload, { onConflict: 'id' }).select().maybeSingle();
    if (error) return { success: false, error: error.message, data: payload };
    return { success: true, data: data || payload };
  } catch (err) {
    return { success: false, error: err?.message || 'Could not save. Please try again.', data: payload };
  }
}
