import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { CATEGORY_DEFAULT_IMAGES } from '../lib/utils.js';

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
        : [...cur, { id: p.id, lineId: p.id, slug: p.slug, name: p.name, price: p.price_from == null ? null : Number(p.price_from), image: p.image_url || (p.categories?.slug && CATEGORY_DEFAULT_IMAGES[p.categories.slug]) || '', qty: q, notes: '' }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);
  const addCustom = useCallback((p, qty, notes, design) => {
    setItems(cur => {
      const next = [...cur, {
        id: p.id, lineId: p.id + ':' + Math.random().toString(36).slice(2, 10), slug: p.slug, name: p.name,
        price: p.price_from == null ? null : Number(p.price_from), image: design.preview, qty: clampQty(qty),
        notes: String(notes || '').slice(0, 500), design
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
    const { data, error } = await supabase.from('products').select('id,slug,name,price_from,image_url,is_active').in('id', cur.map(i => i.id));
    if (error) throw error;
    const byId = new Map(data.map(p => [p.id, p]));
    const fresh = cur.filter(i => byId.get(i.id) && byId.get(i.id).is_active).map(i => {
      const p = byId.get(i.id);
      return { ...i, name: p.name, slug: p.slug, price: p.price_from == null ? null : Number(p.price_from), image: i.design ? i.image : (p.image_url || '') };
    });
    if (JSON.stringify(fresh) !== JSON.stringify(cur)) persist(fresh);
    return fresh;
  }, [persist]);

  const value = useMemo(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + (i.price == null ? 0 : i.qty * i.price), 0),
    hasUnpriced: items.some(i => i.price == null),
    hasPriced: items.some(i => i.price != null),
    add, addCustom, setQty, setNotes, remove, clear, refresh
  }), [items, add, addCustom, setQty, setNotes, remove, clear, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
