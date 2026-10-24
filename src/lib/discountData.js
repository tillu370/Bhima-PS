import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

// Percentage-based discount campaigns ("10% OFF" badges), independent of the
// single "Deal of the Day" feature. A campaign applies to all products, one
// category, or a specific list of products, for an optional date window.
let campaignsPromise = null;
export function fetchActiveDiscountCampaigns({ fresh = false } = {}) {
  if (fresh) campaignsPromise = null;
  if (!campaignsPromise) {
    campaignsPromise = supabase.from('discount_campaigns').select('*').eq('is_active', true)
      .then(({ data, error }) => {
        if (error) { campaignsPromise = null; return []; }
        return data || [];
      })
      .catch(() => { campaignsPromise = null; return []; });
  }
  return campaignsPromise;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export function isCampaignLive(c, today = todayStr()) {
  if (!c.is_active) return false;
  if (c.start_date && today < c.start_date) return false;
  if (c.end_date && today > c.end_date) return false;
  return true;
}

export function campaignAppliesToProduct(c, product) {
  if (c.scope === 'all') return true;
  if (c.scope === 'category') return product.category_id === c.category_id || product.categories?.id === c.category_id;
  if (c.scope === 'products') return (c.product_ids || []).includes(product.id);
  return false;
}

// The single best (highest percent) live campaign for a product, or null.
export function bestCampaignForProduct(product, campaigns) {
  if (!product || !campaigns || !campaigns.length) return null;
  const today = todayStr();
  const matches = campaigns.filter(c => isCampaignLive(c, today) && campaignAppliesToProduct(c, product));
  if (!matches.length) return null;
  return matches.sort((a, b) => Number(b.percent) - Number(a.percent))[0];
}

// Rounding rule: discounted prices are rounded to the nearest whole rupee
// (standard half-up rounding), shown alongside the original price struck through.
export function applyDiscountPercent(price, percent) {
  if (price == null || !Number.isFinite(Number(price))) return price;
  const discounted = Number(price) * (1 - Number(percent) / 100);
  return Math.round(discounted);
}

export function useActiveDiscountCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    let on = true;
    fetchActiveDiscountCampaigns().then(c => { if (on) setCampaigns(c); });
    return () => { on = false; };
  }, []);
  return campaigns;
}
