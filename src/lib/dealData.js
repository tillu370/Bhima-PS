import { supabase } from './supabase.js';

export const DEFAULT_DEAL = {
  id: 'active',
  is_active: true,
  badge_text: '🔥 DEAL OF THE DAY',
  title: 'Custom Ceramic Magic Mug',
  subtitle: 'Premium heat-sensitive photo reveal mug with ultra-vivid glossy finish. Perfect gift for birthdays, anniversaries & celebrations!',
  original_price: 350,
  deal_price: 249,
  discount_tag: '30% OFF',
  image_url: '/images/mug-printing.jpg',
  product_slug: 'mug-printing',
  button_text: 'Claim Deal on WhatsApp',
  button_link: '',
  banner_note: '⚡ Limited Quantity Available for Today Only!',
  updated_at: new Date().toISOString()
};

const STORAGE_KEY = 'bps_deal_of_the_day';
const DISMISSED_KEY = 'bps_deal_dismissed_stamp';

export function getCachedDeal() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore
  }
  return DEFAULT_DEAL;
}

export async function fetchCurrentDeal() {
  try {
    const { data, error } = await supabase
      .from('deal_of_the_day')
      .select('*')
      .eq('id', 'active')
      .maybeSingle();

    if (!error && data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) { /* ignore */ }
      return data;
    }
  } catch (err) {
    // Supabase table may not exist yet or offline
    console.warn('Could not fetch deal from Supabase:', err);
  }

  return getCachedDeal();
}

export async function saveDeal(dealData) {
  const payload = {
    ...dealData,
    id: 'active',
    updated_at: new Date().toISOString()
  };

  // Cache locally first for instant availability
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('bps_deal_updated', { detail: payload }));
  } catch (e) { /* ignore */ }

  // Try updating Supabase
  try {
    const { data, error } = await supabase
      .from('deal_of_the_day')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase deal save error (fallback to local storage):', error.message);
      return { success: true, warning: 'Saved locally. Please ensure deal_of_the_day table is created in Supabase: ' + error.message, data: payload };
    }
    return { success: true, data: data || payload };
  } catch (err) {
    console.warn('Supabase connection error while saving deal:', err);
    return { success: true, warning: 'Saved in browser memory. Please run migration in Supabase.', data: payload };
  }
}

export function isDealDismissedToday(deal) {
  try {
    const stamp = localStorage.getItem(DISMISSED_KEY);
    if (!stamp) return false;
    const parsed = JSON.parse(stamp);
    const today = new Date().toISOString().slice(0, 10);
    // If dismissed today for the same or older deal update, do not show
    if (parsed.date === today && parsed.updated_at === (deal?.updated_at || '')) {
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}

export function dismissDealToday(deal) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({
      date: today,
      updated_at: deal?.updated_at || ''
    }));
  } catch (e) { /* ignore */ }
}
