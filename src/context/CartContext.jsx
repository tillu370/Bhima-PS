import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCategories } from '../lib/data.js';
import { supabase } from '../lib/supabase.js';
import { bestCampaignForProduct, fetchActiveDiscountCampaigns } from '../lib/discountData.js';
import { unitPrice } from '../lib/utils.js';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'bps_cart_v1';
const clampQty = q => Math.max(1, Math.min(100000, parseInt(q, 10) || 1));

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
}

// Cart lives in localStorage (guests and logged-in users alike). There is no payment: checkout is WhatsApp.
export function CartProvider({ children }) {
  const [items, setItems] = useState(read);

  // Bulk-quantity discount rules live on categories.qty_discount_tiers, looked
  // up by slug so cart lines never need to snapshot (and go stale on) a rule.
  // fetchCategories() selects '*', so this degrades safely to {} if that
  // column doesn't exist yet in the database.
  const [discountBySlug, setDiscountBySlug] = useState({});
  useEffect(() => {
    let on = true;
    fetchCategories().then(cats => {
      if (!on) return;
      setDiscountBySlug(Object.fromEntries(cats.filter(c => c.qty_discount_tiers).map(c => [c.slug, c.qty_discount_tiers])));
    }).catch(() => {});
    return () => { on = false; };
  }, []);

  // Active percentage discount campaigns, re-fetched from the database so the cart
  // and checkout always price lines off validated, current data (never a stale
  // client-side value), and never stack with the bulk-quantity tiers above.
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    let on = true;
    fetchActiveDiscountCampaigns().then(c => { if (on) setCampaigns(c); }).catch(() => {});
    return () => { on = false; };
  }, []);

  const persist = useCallback(next => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* storage blocked: memory only */ }
  }, []);

  useEffect(() => {
    const onStorage = e => { if (e.key === KEY) setItems(read()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Every cart line has a lineId. Plain products use the product id (one line per product);
  // customised products get their own line, so the same product can be ordered with several designs.
  const lineOf = i => i.lineId || i.id;
  const add = useCallback((p, qty = 1) => {
    setItems(cur => {
      const q = clampQty(qty);
      const hit = cur.find(i => !i.design && i.id === p.id);
      const next = hit
        ? cur.map(i => (i === hit ? { ...i, qty: Math.min(100000, i.qty + q) } : i))
        : [...cur, { id: p.id, lineId: p.id, slug: p.slug, name: p.name, price: p.price_from == null ? null : Number(p.price_from), image: p.image_url || p.categories?.image_url || '', qty: q, notes: '', categorySlug: p.categories?.slug || null, categoryId: p.category_id || p.categories?.id || null }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);
  const addCustom = useCallback((p, qty, notes, design) => {
    setItems(cur => {
      const next = [...cur, {
        id: p.id, lineId: p.id + ':' + Math.random().toString(36).slice(2, 10), slug: p.slug, name: p.name,
        price: p.price_from == null ? null : Number(p.price_from), image: design.preview, qty: clampQty(qty),
        notes: String(notes || '').slice(0, 500), design, categorySlug: p.categories?.slug || null, categoryId: p.category_id || p.categories?.id || null
      }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);
  const setQty = useCallback((lineId, qty) => persist(read().map(i => (lineOf(i) === lineId ? { ...i, qty: clampQty(qty) } : i))), [persist]);
  const setNotes = useCallback((lineId, notes) => persist(read().map(i => (lineOf(i) === lineId ? { ...i, notes: String(notes).slice(0, 500) } : i))), [persist]);
  const remove = useCallback(lineId => persist(read().filter(i => lineOf(i) !== lineId)), [persist]);
  const clear = useCallback(() => persist([]), [persist]);

  // Re-price from the database and drop products that no longer exist or were hidden.
  const refresh = useCallback(async () => {
    const cur = read();
    if (!cur.length) return cur;
    const { data, error } = await supabase.from('products').select('id,slug,name,price_from,image_url,is_active,category_id,categories(id,slug)').in('id', cur.map(i => i.id));
    if (error) throw error;
    const byId = new Map(data.map(p => [p.id, p]));
    const fresh = cur.filter(i => byId.get(i.id) && byId.get(i.id).is_active).map(i => {
      const p = byId.get(i.id);
      return { ...i, name: p.name, slug: p.slug, price: p.price_from == null ? null : Number(p.price_from), image: i.design ? i.image : (p.image_url || ''), categorySlug: p.categories?.slug || null, categoryId: p.category_id || p.categories?.id || null };
    });
    if (JSON.stringify(fresh) !== JSON.stringify(cur)) persist(fresh);
    return fresh;
  }, [persist]);

  const value = useMemo(() => {
    const priced = items.map(i => {
      const campaign = bestCampaignForProduct({ id: i.id, category_id: i.categoryId, categories: { id: i.categoryId } }, campaigns);
      return { ...i, discountTiers: (i.categorySlug && discountBySlug[i.categorySlug]) || null, campaignPercent: campaign ? Number(campaign.percent) : null, campaignName: campaign?.name || null };
    });
    return {
      items: priced,
      count: priced.reduce((n, i) => n + i.qty, 0),
      subtotal: priced.reduce((n, i) => n + (i.price == null ? 0 : i.qty * unitPrice(i)), 0),
      hasUnpriced: priced.some(i => i.price == null),
      hasPriced: priced.some(i => i.price != null),
      add, addCustom, setQty, setNotes, remove, clear, refresh
    };
  }, [items, discountBySlug, campaigns, add, addCustom, setQty, setNotes, remove, clear, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
