import { supabase } from './supabase.js';

export const FRAME_TIERS = [
  { value: 'budget', label: 'Budget / Affordable' },
  { value: 'medium', label: 'Medium' },
  { value: 'premium', label: 'Premium' }
];

// Categories whose products can be assigned a photo-frame price tier.
export const FRAME_CATEGORY_SLUGS = ['photo-frames', 'led-frames', 'frames-clocks', 'wall-clocks'];

export const isFrameCategory = slug => !!slug && FRAME_CATEGORY_SLUGS.some(s => slug === s || slug.includes('frame'));

export function frameTierLabel(value) {
  return FRAME_TIERS.find(t => t.value === value)?.label || value;
}

export async function fetchFrameTierRanges() {
  try {
    const { data, error } = await supabase.from('frame_tier_ranges').select('*');
    if (!error && data) return Object.fromEntries(data.map(r => [r.tier, r]));
  } catch (e) { /* table not migrated yet or offline */ }
  return {};
}

export async function saveFrameTierRange(tier, min_price, max_price) {
  try {
    const { error } = await supabase.from('frame_tier_ranges').upsert({
      tier, min_price: min_price === '' || min_price == null ? null : Number(min_price),
      max_price: max_price === '' || max_price == null ? null : Number(max_price),
      updated_at: new Date().toISOString()
    }, { onConflict: 'tier' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message || 'Could not save. Please try again.' };
  }
}
