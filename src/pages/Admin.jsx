import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { useDialog } from '../lib/useDialog.js';
import { errMsg, fmtDate, imgUrl, money, slugify } from '../lib/utils.js';
import { fetchCurrentDeal, saveDeal, DEFAULT_DEAL } from '../lib/dealData.js';
import { DiwaliThemeManager } from '../components/DiwaliThemeManager.jsx';
import { FESTIVALS } from '../lib/festiveThemeData.js';
import { normalizeWhatsAppNumber, saveWhatsAppNumber, validateWhatsAppNumber, buildWhatsAppUrl, buildGeneralEnquiryMessage, useWhatsAppNumber } from '../lib/whatsappData.js';
import { fetchPromoVideo, savePromoVideo, DEFAULT_PROMO_VIDEO } from '../lib/videoData.js';
import { FRAME_TIERS, isFrameCategory, frameTierLabel, fetchFrameTierRanges, saveFrameTierRange } from '../lib/frameTiers.js';

const TABS = ['overview', 'orders', 'enquiries', 'reviews', 'products', 'categories', 'customers', 'deal', 'discounts', 'whatsapp', 'video', 'festival'];
const ORDER_STATUSES = ['new', 'contacted', 'confirmed', 'printing', 'delivered', 'cancelled'];
const ENQ_STATUSES = ['new', 'contacted', 'closed'];
const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/* ----------------------------------------------------------------- shared bits */
function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useDialog(true, onClose, ref);
  useEffect(() => { const f = ref.current && ref.current.querySelector('input,select,textarea,button:not(.modal-close)'); if (f) f.focus(); }, []);
  return (
    <div className="modal-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card wide" role="dialog" aria-modal="true" aria-labelledby="adminModalTitle" ref={ref}>
        <div className="modal-header"><h3 id="adminModalTitle">{title}</h3><button className="modal-close" onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  );
}

// Drag-and-drop (or click-to-browse) image picker, shared by the product and
// category forms. `file`/`preview` are lifted into the parent form so submit
// can upload the picked file; `fallbackSrc` shows the image already saved.
function ImageDropzone({ inputId, file, setFile, preview, setPreview, fallbackSrc }) {
  const [over, setOver] = useState(false);
  const pick = fl => {
    if (!fl) return;
    if (!/^image\/(jpeg|png|webp)$/.test(fl.type)) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(fl);
    setPreview(URL.createObjectURL(fl));
  };
  const clear = e => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };
  const open = () => document.getElementById(inputId).click();
  const shown = preview || fallbackSrc;
  return (
    <div
      className={'dropzone' + (over ? ' drag-over' : '') + (shown ? ' has-image' : '')}
      role="button" tabIndex={0}
      onClick={open}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files && e.dataTransfer.files[0]); }}
    >
      <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => pick(e.target.files[0])} />
      {shown
        ? <img className="dropzone-preview" src={shown} alt="" />
        : (
          <div className="dropzone-empty">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
            <span>Drag &amp; drop an image, or click to browse</span>
          </div>
        )}
      {file && <div className="dropzone-filename"><span>{file.name}</span><button type="button" onClick={clear} aria-label="Remove selected image">✕</button></div>}
    </div>
  );
}

// Loads data with loading / error / retry states.
function useLoad(fn, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const run = useCallback(async () => {
    setError('');
    try { setData(await fn()); } catch (e) { setError(errMsg(e)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { data, error, reload: run, setData };
}
function Async({ state, children }) {
  if (state.error) return <StateBox title="Something went wrong" action={<button className="btn btn-primary" onClick={state.reload}>Try again</button>}>{state.error}</StateBox>;
  if (!state.data) return <div className="sk-block" style={{ minHeight: 180 }} />;
  return children(state.data);
}
const must = res => { if (res.error) throw res.error; return res.data; };

/* ---------------------------------------------------------------------- views */
function Overview({ goTab }) {
  const state = useLoad(async () => {
    const count = async (table, f) => {
      let q = supabase.from(table).select('*', { count: 'exact', head: true });
      if (f) q = f(q);
      const { count: c, error } = await q;
      if (error) throw error;
      return c;
    };
    const [newEnq, allEnq, prods, custs, newOrders, allOrders] = await Promise.all([
      count('enquiries', q => q.eq('status', 'new')), count('enquiries'),
      count('products', q => q.eq('is_active', true)), count('profiles', q => q.eq('role', 'customer')),
      count('orders', q => q.eq('status', 'new')).catch(() => null), count('orders').catch(() => null)
    ]);
    return { newEnq, allEnq, prods, custs, newOrders, allOrders };
  }, []);
  return (
    <Async state={state}>{d => (
      <>
        <div className="stat-grid">
          <button type="button" className="stat stat-link" onClick={() => goTab('orders')}><strong>{d.newOrders ?? '-'}</strong><span>New orders</span></button>
          <button type="button" className="stat stat-link" onClick={() => goTab('orders')}><strong>{d.allOrders ?? '-'}</strong><span>Total orders</span></button>
          <button type="button" className="stat stat-link" onClick={() => goTab('enquiries')}><strong>{d.newEnq}</strong><span>New enquiries</span></button>
          <button type="button" className="stat stat-link" onClick={() => goTab('enquiries')}><strong>{d.allEnq}</strong><span>Total enquiries</span></button>
          <button type="button" className="stat stat-link" onClick={() => goTab('products')}><strong>{d.prods}</strong><span>Active products</span></button>
          <button type="button" className="stat stat-link" onClick={() => goTab('customers')}><strong>{d.custs}</strong><span>Customers</span></button>
        </div>
        {d.allOrders === null
          ? <p className="form-error">The orders table is missing. Run <code>supabase/migrations/2026-10-orders.sql</code> in the Supabase SQL Editor.</p>
          : <p style={{ color: '#475569' }}>Customers send orders on WhatsApp; each one is also saved under <strong>Orders</strong> with the customer's design. Enquiries from the website form arrive under <strong>Enquiries</strong>.</p>}
      </>
    )}</Async>
  );
}

function Orders() {
  const { toast } = useUi();
  const state = useLoad(async () => must(await supabase.from('orders').select('*').order('created_at', { ascending: false })), []);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const update = async (o, patch, msg) => {
    const { error } = await supabase.from('orders').update(patch).eq('id', o.id);
    if (error) { toast(error.message, 'error'); return false; }
    state.setData(rows => rows.map(r => (r.id === o.id ? { ...r, ...patch } : r)));
    toast(msg || 'Order updated');
    return true;
  };
  return (
    <Async state={state}>{rows => {
      const needle = q.trim().toLowerCase();
      const list = rows.filter(o => (!filter || o.status === filter)
        && (!needle || [o.ref, o.name, o.phone].some(v => (v || '').toLowerCase().includes(needle))));
      return (
        <>
          <div className="admin-filters">
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by order ref, name or phone…" aria-label="Search orders" />
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!rows.length ? <div className="state-box"><h3>No orders yet</h3><p>Orders appear here when a customer sends their cart from the Checkout page.</p></div>
           : !list.length ? <div className="state-box"><h3>No orders match</h3><p>Try a different search word or status.</p></div> : (
            <div className="order-list">
              {list.map(o => (
                <article className="order-card" key={o.id}>
                  <header>
                    <div>
                      <strong>{o.ref}</strong> <span className={'badge ' + (o.status === 'delivered' || o.status === 'confirmed' ? 'confirmed' : '')}>{o.status}</span>
                      <div className="muted">{fmtDate(o.created_at)}</div>
                    </div>
                    <select value={o.status} onChange={e => update(o, { status: e.target.value })} aria-label={`Status for order ${o.ref}`}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </header>
                  <p><strong>{o.name}</strong> · <a href={`tel:${o.phone}`}>{o.phone}</a> · <a href={`https://wa.me/${o.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
                  {o.address && <p className="muted">{o.address}</p>}
                  {o.notes && <p className="muted">Notes: {o.notes}</p>}
                  <ul className="order-items">
                    {(o.items || []).map((i, n) => (
                      <li key={n}>
                        {i.design?.assets?.[0] && /\.(png|jpe?g|webp|gif)$/i.test(i.design.assets[0]) && <a href={i.design.assets[0]} target="_blank" rel="noopener noreferrer"><img src={i.design.assets[0]} alt={`Upload for ${i.name}`} loading="lazy" /></a>}
                        <div>
                          <strong>{i.name}</strong> × {i.qty}
                          {i.design?.color && (
                            <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span>Colour:</span>
                              <span style={{ width: 12, height: 12, borderRadius: '50%', background: i.design.color.hex, display: 'inline-block', border: '1px solid rgba(0,0,0,0.2)' }} />
                              <strong>{i.design.color.name}</strong>
                              <code>({i.design.color.hex})</code>
                            </div>
                          )}
                          {i.design?.sizes && Object.keys(i.design.sizes).length > 0 && <div className="muted">Sizes: {Object.entries(i.design.sizes).map(([s, n2]) => `${s} × ${n2}`).join(', ')}</div>}
                          {i.design?.assets?.map((u, k) => <a key={k} className="link-btn" href={u} target="_blank" rel="noopener noreferrer" download>Uploaded file {k + 1}</a>)}
                          {i.design && !i.design.assets?.length && <div className="muted">No file uploaded</div>}
                          {i.notes && <div className="muted">Item notes: {i.notes}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {o.est_total != null && <p className="muted">Estimated total: {money(o.est_total)} (priced items only)</p>}
                  <label className="field"><span>Internal notes (customers cannot see this)</span>
                    <textarea rows={2} maxLength={2000} defaultValue={o.admin_notes || ''} onBlur={e => { if (e.target.value !== (o.admin_notes || '')) update(o, { admin_notes: e.target.value || null }, 'Notes saved'); }} />
                  </label>
                </article>
              ))}
            </div>
          )}
          {open}
        </>
      );
    }}</Async>
  );
}

function Enquiries() {
  const { toast } = useUi();
  const state = useLoad(async () => must(await supabase.from('enquiries').select('*').order('created_at', { ascending: false })), []);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');

  const setStatus = async (q, status) => {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', q.id);
    if (error) { toast(error.message, 'error'); return; }
    state.setData(rows => rows.map(r => (r.id === q.id ? { ...r, status } : r)));
    toast('Enquiry updated');
  };
  return (
    <Async state={state}>{rows => {
      const needle = q.trim().toLowerCase();
      const list = rows.filter(r => (!filter || r.status === filter)
        && (!needle || [r.name, r.phone, r.email, r.enquiry_type, r.product_interest].some(v => (v || '').toLowerCase().includes(needle))));
      return (
        <>
          <div className="admin-filters">
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, phone, email or product…" aria-label="Search enquiries" />
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{ENQ_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!rows.length ? <div className="state-box"><h3>No enquiries yet</h3></div>
           : !list.length ? <div className="state-box"><h3>No enquiries match</h3><p>Try a different search word or status.</p></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Date</th><th>From</th><th>Type / product</th><th>Qty</th><th>Message</th><th>Status</th></tr></thead>
                <tbody>
                  {list.map(q => (
                    <tr key={q.id}>
                      <td data-label="Date">{fmtDate(q.created_at)}</td>
                      <td data-label="From"><strong>{q.name}</strong><br /><a href={`tel:${q.phone}`}>{q.phone}</a>{q.email && <><br /><a href={`mailto:${q.email}`}>{q.email}</a></>}</td>
                      <td data-label="Type / product">{q.enquiry_type}{q.product_interest && <><br /><small>{q.product_interest}</small></>}</td>
                      <td data-label="Qty">{q.quantity || '-'}</td>
                      <td data-label="Message" style={{ maxWidth: 260 }}>{q.message}</td>
                      <td data-label="Status">
                        <select value={q.status} onChange={e => setStatus(q, e.target.value)} aria-label={`Status for enquiry from ${q.name}`}>
                          {ENQ_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );
    }}</Async>
  );
}

function ProductForm({ product: p, cats, onClose, onSaved }) {
  const { toast } = useUi();
  const [f, setF] = useState({
    name: p ? p.name : '', slug: p ? p.slug : '', category_id: p ? p.category_id : (cats[0] ? cats[0].id : ''),
    price: p && p.price_from != null ? String(p.price_from) : '', sort_order: p ? p.sort_order : 0, description: p ? p.description || '' : '',
    image_url: p ? p.image_url || '' : '', image_url_2: p ? p.image_url_2 || '' : '', is_active: p ? p.is_active : true, is_featured: p ? p.is_featured : false,
    frame_tier: p ? p.frame_tier || '' : ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const onName = e => setF(cur => ({ ...cur, name: e.target.value, slug: p ? cur.slug : slugify(e.target.value) }));
  const isFrame = isFrameCategory(cats.find(c => c.id === f.category_id)?.slug);

  const submit = async e => {
    e.preventDefault();
    setError('');
    const price = f.price.trim() === '' ? null : parseFloat(f.price);
    if (f.name.trim().length < 2) return setError('Please enter a product name.');
    if (!SLUG_RE.test(f.slug)) return setError('Slug may only contain lowercase letters, numbers and hyphens.');
    if (price !== null && (!Number.isFinite(price) || price < 0)) return setError('Enter a valid price, or leave it empty for "price on request".');
    setBusy(true);
    let image_url = f.image_url.trim() || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setBusy(false); return setError('Image is larger than 5 MB.'); }
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const up = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
      if (up.error) { setBusy(false); return setError('Image upload failed: ' + up.error.message); }
      image_url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }
    const row = {
      name: f.name.trim(), slug: f.slug, category_id: f.category_id, price_from: price, sort_order: parseInt(f.sort_order, 10) || 0,
      description: f.description.trim() || null, image_url, image_url_2: f.image_url_2.trim() || null, is_active: f.is_active, is_featured: f.is_featured,
      frame_tier: isFrame ? (f.frame_tier || null) : null
    };
    const { error: err } = p ? await supabase.from('products').update(row).eq('id', p.id) : await supabase.from('products').insert(row);
    setBusy(false);
    if (err) return setError(err.code === '23505' ? 'That URL slug is already used by another product.' : err.message);
    toast(p ? 'Product saved' : 'Product created');
    onSaved();
  };

  return (
    <Modal title={p ? 'Edit product' : 'Add product'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="pName">Name *</label><input id="pName" required maxLength={120} value={f.name} onChange={onName} /></div>
        <div className="field-row">
          <div className="field"><label htmlFor="pSlug">URL slug *</label><input id="pSlug" required maxLength={80} value={f.slug} onChange={set('slug')} /></div>
          <div className="field"><label htmlFor="pCat">Category *</label>
            <select id="pCat" value={f.category_id} onChange={set('category_id')}>
              {[...cats].sort((a, b) => b.is_active - a.is_active || a.sort_order - b.sort_order)
                .map(c => <option key={c.id} value={c.id}>{c.name}{!c.is_active ? ' (hidden)' : ''}</option>)}
            </select></div>
        </div>
        <div className="field-row">
          <div className="field"><label htmlFor="pPrice">Starting price (₹)</label><input id="pPrice" type="number" min="0" step="0.01" value={f.price} onChange={set('price')} placeholder="Empty = price on request" /></div>
          <div className="field"><label htmlFor="pOrder">Sort order</label><input id="pOrder" type="number" value={f.sort_order} onChange={set('sort_order')} /></div>
        </div>
        <div className="field"><label htmlFor="pDesc">Description</label><textarea id="pDesc" maxLength={2000} value={f.description} onChange={set('description')} /></div>
        <div className="field">
          <label htmlFor="pImgFile">Image (drag &amp; drop, or browse — JPG, PNG or WebP, max 5 MB)</label>
          <ImageDropzone inputId="pImgFile" file={file} setFile={setFile} preview={preview} setPreview={setPreview} fallbackSrc={f.image_url ? imgUrl(f.image_url) : null} />
          <label htmlFor="pImgUrl" style={{ marginTop: 8 }}>…or image URL / path</label>
          <input id="pImgUrl" value={f.image_url} onChange={set('image_url')} />
          <label htmlFor="pImgUrl2" style={{ marginTop: 8 }}>Second image URL (shown on hover in the product grid, optional)</label>
          <input id="pImgUrl2" value={f.image_url_2} onChange={set('image_url_2')} placeholder="https://… or /images/…" />
        </div>
        {isFrame && (
          <div className="field"><label htmlFor="pFrameTier">Price tier</label>
            <select id="pFrameTier" value={f.frame_tier} onChange={set('frame_tier')}>
              <option value="">No tier</option>
              {FRAME_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        )}
        <div className="check-row">
          <label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} /> Visible in store</label>
          <label><input type="checkbox" checked={f.is_featured} onChange={set('is_featured')} /> Featured on home page</label>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Saving…' : p ? 'Save changes' : 'Create product'}</button>
      </form>
    </Modal>
  );
}

function FrameTierRanges() {
  const { toast } = useUi();
  const state = useLoad(fetchFrameTierRanges, []);
  const [open, setOpen] = useState(false);
  const [busyTier, setBusyTier] = useState(null);

  const save = async (tier, min_price, max_price) => {
    setBusyTier(tier);
    const res = await saveFrameTierRange(tier, min_price, max_price);
    setBusyTier(null);
    if (!res.success) return toast(res.error, 'error');
    toast('Price range saved');
    state.reload();
  };

  return (
    <div className="state-box" style={{ marginBottom: 16, textAlign: 'left' }}>
      <button type="button" className="link-btn" onClick={() => setOpen(o => !o)}>{open ? '▾' : '▸'} Photo frame price tier ranges (optional, for reference only)</button>
      {open && (
        <Async state={state}>{ranges => (
          <div className="field-row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
            {FRAME_TIERS.map(t => {
              const r = ranges[t.value] || {};
              return (
                <div key={t.value} className="field" style={{ minWidth: 220 }}>
                  <label>{t.label}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input id={'min-' + t.value} type="number" min="0" step="1" defaultValue={r.min_price ?? ''} placeholder="Min ₹"
                      onBlur={e => save(t.value, e.target.value, document.getElementById('max-' + t.value)?.value ?? r.max_price)} />
                    <input id={'max-' + t.value} type="number" min="0" step="1" defaultValue={r.max_price ?? ''} placeholder="Max ₹"
                      onBlur={e => save(t.value, document.getElementById('min-' + t.value)?.value ?? r.min_price, e.target.value)} />
                  </div>
                  {busyTier === t.value && <small className="muted">Saving…</small>}
                </div>
              );
            })}
          </div>
        )}</Async>
      )}
    </div>
  );
}

function Products() {
  const { toast } = useUi();
  const state = useLoad(async () => {
    const [c, p] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*, categories(name,slug)').order('sort_order')
    ]);
    return { cats: must(c), products: must(p) };
  }, []);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit
  const [q, setQ] = useState('');

  const remove = async p => {
    if (!window.confirm(`Delete "${p.name}"? You can also just hide it instead.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) return toast(error.message, 'error');
    const m = (p.image_url || '').match(/\/product-images\/([^?]+)$/);
    if (m) await supabase.storage.from('product-images').remove([decodeURIComponent(m[1])]);
    toast('Product deleted');
    state.reload();
  };

  return (
    <>
      <div className="panel-head"><h2>Products</h2><button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>Add product</button></div>
      <FrameTierRanges />
      <Async state={state}>{({ cats, products }) => {
        const needle = q.trim().toLowerCase();
        const list = products.filter(p => !needle || [p.name, p.slug, p.categories?.name].some(v => (v || '').toLowerCase().includes(needle)));
        return (
        <>
          {products.length > 0 && (
            <div className="admin-filters">
              <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, slug or category…" aria-label="Search products" />
              <span className="admin-filter-count">{list.length} of {products.length}</span>
            </div>
          )}
          {!products.length ? <div className="state-box"><h3>No products yet</h3></div>
           : !list.length ? <div className="state-box"><h3>No products match</h3><p>Try a different search word.</p></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th></th><th>Name</th><th>Category</th><th>From</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {list.map(p => (
                    <tr key={p.id}>
                      <td data-label=""><img className="table-img" src={imgUrl(p.image_url)} alt="" /></td>
                      <td data-label="Name"><strong>{p.name}</strong><br /><small style={{ color: '#64748b' }}>/{p.slug}</small></td>
                      <td data-label="Category">{p.categories ? p.categories.name : '-'}</td>
                      <td data-label="From">{p.price_from == null ? 'On request' : money(p.price_from)}</td>
                      <td data-label="Status"><span className={'badge ' + (p.is_active ? 'on' : 'off')}>{p.is_active ? 'Active' : 'Hidden'}</span>{p.is_featured && <> <span className="badge confirmed">Featured</span></>}{p.frame_tier && <> <span className="badge">{frameTierLabel(p.frame_tier)}</span></>}</td>
                      <td data-label=""><div className="row-actions"><button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {editing !== undefined && <ProductForm product={editing} cats={cats} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); state.reload(); }} />}
        </>
      );
      }}</Async>
    </>
  );
}

function CategoryForm({ category: c, onClose, onSaved }) {
  const { toast } = useUi();
  const [f, setF] = useState({ name: c ? c.name : '', slug: c ? c.slug : '', description: c ? c.description || '' : '', image_url: c ? c.image_url || '' : '', sort_order: c ? c.sort_order : 0, is_active: c ? c.is_active : true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const submit = async e => {
    e.preventDefault();
    setError('');
    if (f.name.trim().length < 2 || !SLUG_RE.test(f.slug)) return setError('Enter a name and a valid slug (lowercase letters, numbers, hyphens).');
    setBusy(true);
    let image_url = f.image_url.trim() || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setBusy(false); return setError('Image is larger than 5 MB.'); }
      const path = `categories/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const up = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
      if (up.error) { setBusy(false); return setError('Image upload failed: ' + up.error.message); }
      image_url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }
    const row = { name: f.name.trim(), slug: f.slug, description: f.description.trim() || null, image_url, sort_order: parseInt(f.sort_order, 10) || 0, is_active: f.is_active };
    const { error: err } = c ? await supabase.from('categories').update(row).eq('id', c.id) : await supabase.from('categories').insert(row);
    setBusy(false);
    if (err) return setError(err.code === '23505' ? 'That slug is already used.' : err.message);
    toast('Category saved');
    onSaved();
  };
  return (
    <Modal title={c ? 'Edit category' : 'Add category'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="cName">Name *</label><input id="cName" required maxLength={80} value={f.name} onChange={e => setF(cur => ({ ...cur, name: e.target.value, slug: c ? cur.slug : slugify(e.target.value) }))} /></div>
        <div className="field"><label htmlFor="cSlug">URL slug *</label><input id="cSlug" required maxLength={60} value={f.slug} onChange={set('slug')} /></div>
        <div className="field"><label htmlFor="cDesc">Description</label><input id="cDesc" maxLength={200} value={f.description} onChange={set('description')} /></div>
        <div className="field">
          <label htmlFor="cImgFile">Tile image (drag &amp; drop, or browse — JPG, PNG or WebP, max 5 MB)</label>
          <ImageDropzone inputId="cImgFile" file={file} setFile={setFile} preview={preview} setPreview={setPreview} fallbackSrc={f.image_url ? imgUrl(f.image_url, f.slug) : null} />
          <label htmlFor="cImg" style={{ marginTop: 8 }}>…or image URL / path</label>
          <input id="cImg" value={f.image_url} onChange={set('image_url')} placeholder="https://… or /images/…" />
        </div>
        <div className="field"><label htmlFor="cOrder">Sort order</label><input id="cOrder" type="number" value={f.sort_order} onChange={set('sort_order')} /></div>
        <div className="check-row"><label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} /> Visible in store</label></div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Saving…' : c ? 'Save changes' : 'Create category'}</button>
      </form>
    </Modal>
  );
}

function Categories() {
  const { toast } = useUi();
  const state = useLoad(async () => must(await supabase.from('categories').select('*').order('sort_order')), []);
  const [editing, setEditing] = useState(undefined);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const remove = async c => {
    if (!window.confirm(`Delete category "${c.name}"? This only works if it has no products.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) return toast(error.code === '23503' ? 'This category still has products. Move or delete them first.' : error.message, 'error');
    const m = (c.image_url || '').match(/\/product-images\/([^?]+)$/);
    if (m) await supabase.storage.from('product-images').remove([decodeURIComponent(m[1])]);
    toast('Category deleted');
    state.reload();
  };
  return (
    <>
      <div className="panel-head"><h2>Categories</h2><button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>Add category</button></div>
      <Async state={state}>{rows => {
        const needle = q.trim().toLowerCase();
        const list = rows.filter(c => (!filter || (filter === 'active' ? c.is_active : !c.is_active))
          && (!needle || [c.name, c.slug].some(v => (v || '').toLowerCase().includes(needle))));
        return (
        <>
          {rows.length > 0 && (
            <div className="admin-filters">
              <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or slug…" aria-label="Search categories" />
              <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
              <span className="admin-filter-count">{list.length} of {rows.length}</span>
            </div>
          )}
          {!list.length && <div className="state-box"><h3>No categories match</h3><p>Try a different search word or status.</p></div>}
          {!!list.length && (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th></th><th>Name</th><th>Slug</th><th>Order</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {list.map(c => (
                  <tr key={c.id}>
                    <td data-label=""><img className="table-img" src={imgUrl(c.image_url, c.slug)} alt="" /></td>
                    <td data-label="Name"><strong>{c.name}</strong><br /><small style={{ color: '#64748b' }}>{c.description}</small></td>
                    <td data-label="Slug">{c.slug}</td><td data-label="Order">{c.sort_order}</td>
                    <td data-label="Status"><span className={'badge ' + (c.is_active ? 'on' : 'off')}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
                    <td data-label=""><div className="row-actions"><button className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {editing !== undefined && <CategoryForm category={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); state.reload(); }} />}
        </>
      );
      }}</Async>
    </>
  );
}

// Reviews are created and managed exclusively by admins (customers cannot submit
// reviews — enforced server-side via RLS, see the admin-enhancements migration).
function ReviewForm({ review: r, products, onClose, onSaved }) {
  const { toast } = useUi();
  const [f, setF] = useState({
    product_id: r ? r.product_id : (products[0]?.id || ''), name: r ? r.name : '', rating: r ? r.rating : 5,
    comment: r ? r.comment || '' : '', status: r ? r.status : 'approved'
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!f.product_id) return setError('Choose a product.');
    if (f.name.trim().length < 2) return setError('Enter the customer’s display name.');
    const rating = parseInt(f.rating, 10);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return setError('Choose a rating between 1 and 5.');
    setBusy(true);
    const row = { product_id: f.product_id, name: f.name.trim(), rating, comment: f.comment.trim().slice(0, 2000) || null, status: f.status };
    const { error: err } = r ? await supabase.from('reviews').update(row).eq('id', r.id) : await supabase.from('reviews').insert(row);
    setBusy(false);
    if (err) return setError(err.message);
    toast(r ? 'Review saved' : 'Review added');
    onSaved();
  };

  return (
    <Modal title={r ? 'Edit review' : 'Add review on behalf of a customer'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="rvProduct">Product *</label>
          <select id="rvProduct" required value={f.product_id} onChange={set('product_id')}>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></div>
        <div className="field-row">
          <div className="field"><label htmlFor="rvName">Display name *</label><input id="rvName" required maxLength={100} value={f.name} onChange={set('name')} placeholder="e.g. Anitha K." /></div>
          <div className="field"><label htmlFor="rvRating">Rating *</label>
            <select id="rvRating" value={f.rating} onChange={set('rating')}>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select></div>
        </div>
        <div className="field"><label htmlFor="rvComment">Review text</label><textarea id="rvComment" maxLength={2000} rows={3} value={f.comment} onChange={set('comment')} /></div>
        <div className="field"><label htmlFor="rvStatus">Status *</label>
          <select id="rvStatus" value={f.status} onChange={set('status')}>
            {REVIEW_STATUSES.map(s => <option key={s} value={s}>{s === 'approved' ? 'Published (visible to customers)' : s === 'rejected' ? 'Unpublished' : 'Pending'}</option>)}
          </select></div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Saving…' : r ? 'Save changes' : 'Add review'}</button>
      </form>
    </Modal>
  );
}

function Reviews() {
  const { toast } = useUi();
  const state = useLoad(async () => {
    const [r, p] = await Promise.all([
      supabase.from('reviews').select('*, products(name,slug)').order('created_at', { ascending: false }),
      supabase.from('products').select('id,name').order('sort_order')
    ]);
    return { rows: must(r), products: must(p) };
  }, []);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(undefined);

  const setStatus = async (r, status) => {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', r.id);
    if (error) { toast(error.message, 'error'); return; }
    state.setData(cur => ({ ...cur, rows: cur.rows.map(x => (x.id === r.id ? { ...x, status } : x)) }));
    toast(status === 'approved' ? 'Review published — now visible on the product page' : 'Review updated');
  };
  const remove = async r => {
    if (!window.confirm(`Delete this review from "${r.name}"?`)) return;
    const { error } = await supabase.from('reviews').delete().eq('id', r.id);
    if (error) { toast(error.message, 'error'); return; }
    state.setData(cur => ({ ...cur, rows: cur.rows.filter(x => x.id !== r.id) }));
    toast('Review deleted');
  };

  return (
    <Async state={state}>{({ rows, products }) => {
      const needle = q.trim().toLowerCase();
      const list = rows.filter(r => (!filter || r.status === filter)
        && (!needle || [r.name, r.comment, r.products?.name].some(v => (v || '').toLowerCase().includes(needle))));
      return (
        <>
          <div className="panel-head"><h2>Reviews</h2><button className="btn btn-primary btn-sm" disabled={!products.length} onClick={() => setEditing(null)}>Add review</button></div>
          <p className="muted" style={{ marginTop: -6 }}>Reviews are created and published by admins only — there is no customer submission form, on this site or via the API.</p>
          <div className="admin-filters">
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, product or text…" aria-label="Search reviews" />
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{REVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!rows.length ? <div className="state-box"><h3>No reviews yet</h3><p>Use "Add review" to publish a review on a customer's behalf.</p></div>
           : !list.length ? <div className="state-box"><h3>No reviews match</h3><p>Try a different search word or status.</p></div> : (
            <ul className="review-list admin-review-list">
              {list.map(r => (
                <li className="review-item" key={r.id}>
                  <div className="review-item-head">
                    <span className={'badge ' + (r.status === 'approved' ? 'confirmed' : r.status === 'rejected' ? 'cancelled' : 'new')}>{r.status}</span>
                    <strong>{r.name}</strong>
                    <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    {r.products && <Link to={'/product/' + r.products.slug} target="_blank">{r.products.name}</Link>}
                    <span className="muted">{fmtDate(r.created_at)}</span>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <div className="row-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(r)}>Edit</button>
                    {r.status !== 'approved' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(r, 'approved')}>Publish</button>}
                    {r.status !== 'rejected' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(r, 'rejected')}>Unpublish</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(r)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {editing !== undefined && <ReviewForm review={editing} products={products} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); state.reload(); }} />}
        </>
      );
    }}</Async>
  );
}

function Customers() {
  const state = useLoad(async () => must(await supabase.from('profiles').select('*').order('created_at', { ascending: false })), []);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  return (
    <Async state={state}>{rows => {
      const needle = q.trim().toLowerCase();
      const list = rows.filter(u => (!role || u.role === role)
        && (!needle || [u.full_name, u.email, u.phone].some(v => (v || '').toLowerCase().includes(needle))));
      return !rows.length ? <div className="state-box"><h3>No customers yet</h3></div> : (
      <>
        <div className="admin-filters">
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email or phone…" aria-label="Search customers" />
          <select value={role} onChange={e => setRole(e.target.value)} aria-label="Filter by role">
            <option value="">All roles</option><option value="customer">Customer</option><option value="admin">Admin</option>
          </select>
        </div>
        {!list.length ? <div className="state-box"><h3>No customers match</h3><p>Try a different search word.</p></div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id}>
                  <td data-label="Name">{u.full_name || '-'}</td><td data-label="Email">{u.email || '-'}</td><td data-label="Phone">{u.phone || '-'}</td>
                  <td data-label="Role"><span className={'badge ' + (u.role === 'admin' ? 'confirmed' : '')}>{u.role}</span></td><td data-label="Joined">{fmtDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </>
      );
    }}</Async>
  );
}

function DealManager() {
  const { toast } = useUi();
  const [deal, setDeal] = useState(DEFAULT_DEAL);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchCurrentDeal(),
      supabase.from('products').select('id,slug,name,description,price_from,image_url').eq('is_active', true).order('sort_order')
    ]).then(([d, pRes]) => {
      if (!alive) return;
      if (d) setDeal(d);
      if (pRes.data) setProducts(pRes.data);
      setLoading(false);
    }).catch(err => {
      if (!alive) return;
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const setField = (field, val) => {
    setDeal(prev => ({ ...prev, [field]: val }));
  };

  // Original price, deal price and discount % are kept in sync: editing any one
  // of the three recalculates the other two, so they never drift apart.
  const handleOrigPriceChange = val => {
    setDeal(prev => {
      const o = Number(val) || 0;
      const d = Number(prev.deal_price) || 0;
      const pct = o > 0 ? Math.max(0, Math.min(99, Math.round(((o - d) / o) * 100))) : 0;
      return { ...prev, original_price: val, discount_tag: o > 0 && d > 0 ? pct + '% OFF' : prev.discount_tag };
    });
  };
  const handleDealPriceChange = val => {
    setDeal(prev => {
      const o = Number(prev.original_price) || 0;
      const d = Number(val) || 0;
      const pct = o > 0 ? Math.max(0, Math.min(99, Math.round(((o - d) / o) * 100))) : 0;
      return { ...prev, deal_price: val, discount_tag: o > 0 ? pct + '% OFF' : prev.discount_tag };
    });
  };
  const handlePctChange = val => {
    setDeal(prev => {
      const o = Number(prev.original_price) || 0;
      const pct = Math.max(0, Math.min(99, Number(val) || 0));
      const newDealPrice = o > 0 ? Math.round(o * (1 - pct / 100)) : prev.deal_price;
      return { ...prev, deal_price: newDealPrice, discount_tag: pct + '% OFF' };
    });
  };

  const applyPreset = preset => {
    setDeal(prev => ({
      ...prev,
      ...preset,
      is_active: true
    }));
    setFile(null);
    setPreview(null);
    toast(`Preset applied: "${preset.title}". Click "Save & Update Deal" to publish.`);
  };

  const handleProductSelect = e => {
    const slug = e.target.value;
    if (!slug) return;
    const p = products.find(item => item.slug === slug);
    if (!p) return;
    const origPrice = p.price_from ? Number(p.price_from) : 300;
    const dealPrice = Math.round(origPrice * 0.75);
    setDeal(prev => ({
      ...prev,
      product_slug: p.slug,
      title: p.name,
      subtitle: p.description || prev.subtitle,
      image_url: p.image_url || prev.image_url,
      original_price: origPrice,
      deal_price: dealPrice,
      discount_tag: '25% OFF',
      banner_note: '⚡ Special Limited Offer for Today Only!'
    }));
    setPreview(null);
    setFile(null);
    toast(`Auto-filled details from "${p.name}"!`);
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    let finalImageUrl = deal.image_url;

    if (file) {
      try {
        const ext = file.name.split('.').pop();
        const path = 'deal-' + Date.now() + '.' + ext;
        const { error: uploadError } = await supabase.storage.from('products').upload(path, file, { cacheControl: '3600', upsert: true });
        if (!uploadError) {
          const { data: pubData } = supabase.storage.from('products').getPublicUrl(path);
          finalImageUrl = pubData.publicUrl;
        }
      } catch (err) {
        console.warn('Image upload error:', err);
      }
    }

    const payload = {
      ...deal,
      image_url: finalImageUrl,
      original_price: deal.original_price ? Number(deal.original_price) : null,
      deal_price: deal.deal_price ? Number(deal.deal_price) : 0
    };

    const res = await saveDeal(payload);
    setSaving(false);
    if (res.warning) {
      toast('Deal saved locally! Note: Run migration in Supabase SQL editor for remote database sync.', 'error');
    } else {
      toast('🔥 Deal of the Day successfully updated and live on website!');
    }
  };

  if (loading) return <div className="sk-block" style={{ minHeight: 240 }} />;

  const origNum = Number(deal.original_price) || 0;
  const dealNum = Number(deal.deal_price) || 0;
  const derivedPct = origNum > 0 ? Math.max(0, Math.min(99, Math.round(((origNum - dealNum) / origNum) * 100))) : '';
  const hasSavings = origNum > dealNum;
  const savings = hasSavings ? origNum - dealNum : 0;
  const displayImage = preview || deal.image_url;

  return (
    <div className="deal-manager-wrapper">
      <div className="panel-head">
        <div>
          <h2>Deal of the Day Manager</h2>
          <p className="muted" style={{ margin: '4px 0 0 0' }}>Configure today's blinking popup deal shown across the website. Change it daily with 1 click!</p>
        </div>
        <span className={'badge ' + (deal.is_active ? 'confirmed' : 'cancelled')}>
          {deal.is_active ? '● LIVE ON SITE' : '○ POPUP DISABLED'}
        </span>
      </div>

      <div className="deal-presets-box">
        <div className="deal-presets-title">⚡ Quick Daily Presets (Click to Load):</div>
        <div className="deal-presets-list">
          <button
            type="button"
            className="deal-preset-btn"
            onClick={() => applyPreset({
              title: 'Custom Ceramic Magic Mug',
              subtitle: 'Reveal special memories with heat-activated photo printing. Color changing glossy mug!',
              original_price: 350,
              deal_price: 249,
              discount_tag: '30% OFF',
              image_url: '/images/mug-printing.jpg',
              product_slug: 'mug-printing',
              banner_note: '⚡ Limited Stock for Today Only!'
            })}
          >
            ☕ Magic Mug (₹249)
          </button>
          <button
            type="button"
            className="deal-preset-btn"
            onClick={() => applyPreset({
              title: 'Personalised Photo T-Shirt',
              subtitle: 'Breathable 100% cotton fabric with vibrant multi-colour fade-proof digital printing.',
              original_price: 499,
              deal_price: 349,
              discount_tag: '30% OFF',
              image_url: '/images/t-shirt-printing.jpg',
              product_slug: 't-shirt-printing',
              banner_note: '⚡ Limited Stock for Today Only!'
            })}
          >
            👕 Custom T-Shirt (₹349)
          </button>
          <button
            type="button"
            className="deal-preset-btn"
            onClick={() => applyPreset({
              title: 'Illuminated LED Photo Frame',
              subtitle: 'Bright ambient LED glow frame that highlights your memories with warm light.',
              original_price: 850,
              deal_price: 599,
              discount_tag: '30% OFF',
              image_url: '/images/led-frames.jpg',
              product_slug: 'led-frames',
              banner_note: '⚡ High Demand Item for Today!'
            })}
          >
            🖼️ LED Frame (₹599)
          </button>
          <button
            type="button"
            className="deal-preset-btn"
            onClick={() => applyPreset({
              title: 'Personalised Photo Wall Clock',
              subtitle: 'Custom dial with family, couple or corporate photo. Silent quartz sweep movement.',
              original_price: 650,
              deal_price: 449,
              discount_tag: '30% OFF',
              image_url: '/images/photo-wall-clocks.jpg',
              product_slug: 'photo-wall-clocks',
              banner_note: '⚡ Special One-Day Discount!'
            })}
          >
            ⏰ Wall Clock (₹449)
          </button>
          <button
            type="button"
            className="deal-preset-btn"
            onClick={() => applyPreset({
              title: 'Personalised Stainless Steel Water Bottle',
              subtitle: 'Double wall insulated bottle with laser engraved or color printed custom name & photo.',
              original_price: 550,
              deal_price: 399,
              discount_tag: '27% OFF',
              image_url: '/images/water-bottles.jpg',
              product_slug: 'water-bottles',
              banner_note: '⚡ Limited Daily Stock!'
            })}
          >
            💧 Water Bottle (₹399)
          </button>
        </div>
      </div>

      <div className="deal-admin-grid">
        <form className="deal-admin-form" onSubmit={handleSave}>
          <div className="deal-toggle-row">
            <div>
              <div className="deal-toggle-label">Enable Deal Popup on Website</div>
              <small className="muted">Shows blinking popup and floating deal trigger on all pages</small>
            </div>
            <label className="deal-switch" aria-label="Toggle Deal of the Day">
              <input
                type="checkbox"
                checked={!!deal.is_active}
                onChange={e => setField('is_active', e.target.checked)}
              />
              <span className="deal-slider" />
            </label>
          </div>

          <div className="field">
            <label htmlFor="dealProductSelect">Choose from Catalog Products (Auto-Fill):</label>
            <select id="dealProductSelect" onChange={handleProductSelect} value={deal.product_slug || ''}>
              <option value="">-- Select a product to auto-fill details --</option>
              {products.map(p => (
                <option key={p.slug} value={p.slug}>
                  {p.name} {p.price_from ? `(from ${money(p.price_from)})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="dealBadge">Blinking Badge Label</label>
              <input
                id="dealBadge"
                value={deal.badge_text || ''}
                onChange={e => setField('badge_text', e.target.value)}
                placeholder="🔥 DEAL OF THE DAY"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="dealDiscount">Discount Tag (auto-updates with price/% below)</label>
              <input
                id="dealDiscount"
                value={deal.discount_tag || ''}
                onChange={e => setField('discount_tag', e.target.value)}
                placeholder="30% OFF"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="dealTitle">Deal Headline / Title *</label>
            <input
              id="dealTitle"
              value={deal.title || ''}
              onChange={e => setField('title', e.target.value)}
              placeholder="e.g. Custom Ceramic Magic Mug"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="dealSubtitle">Short Description / Subtitle</label>
            <textarea
              id="dealSubtitle"
              rows={2}
              value={deal.subtitle || ''}
              onChange={e => setField('subtitle', e.target.value)}
              placeholder="Describe the product and the special offer..."
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="dealOrigPrice">Original Price (₹)</label>
              <input
                id="dealOrigPrice"
                type="number"
                min="0"
                step="1"
                value={deal.original_price ?? ''}
                onChange={e => handleOrigPriceChange(e.target.value)}
                placeholder="350"
              />
            </div>
            <div className="field">
              <label htmlFor="dealPrice">Deal Price (₹) *</label>
              <input
                id="dealPrice"
                type="number"
                min="0"
                step="1"
                value={deal.deal_price ?? ''}
                onChange={e => handleDealPriceChange(e.target.value)}
                placeholder="249"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="dealPct">Discount %</label>
              <input
                id="dealPct"
                type="number"
                min="0"
                max="99"
                step="1"
                value={derivedPct}
                onChange={e => handlePctChange(e.target.value)}
                placeholder="30"
                disabled={!origNum}
              />
              {!origNum && <small className="muted">Enter an original price first</small>}
            </div>
          </div>

          <div className="field">
            <label>Deal Image</label>
            <ImageDropzone
              inputId="dealImgFile"
              file={file}
              setFile={setFile}
              preview={preview}
              setPreview={setPreview}
              fallbackSrc={imgUrl(deal.image_url)}
            />
            <input
              type="text"
              style={{ marginTop: 8 }}
              value={deal.image_url || ''}
              onChange={e => setField('image_url', e.target.value)}
              placeholder="Or paste image URL (e.g. /images/mug-printing.jpg)"
            />
          </div>

          <div className="field">
            <label htmlFor="dealBannerNote">Urgency Note</label>
            <input
              id="dealBannerNote"
              value={deal.banner_note || ''}
              onChange={e => setField('banner_note', e.target.value)}
              placeholder="⚡ Limited Stock for Today Only!"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="dealBtnText">Button Label</label>
              <input
                id="dealBtnText"
                value={deal.button_text || ''}
                onChange={e => setField('button_text', e.target.value)}
                placeholder="Claim Deal on WhatsApp"
              />
            </div>
            <div className="field">
              <label htmlFor="dealSlug">Linked Product Slug</label>
              <input
                id="dealSlug"
                value={deal.product_slug || ''}
                onChange={e => setField('product_slug', e.target.value)}
                placeholder="mug-printing"
              />
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save & Update Deal of the Day'}
            </button>
          </div>
        </form>

        <div className="deal-preview-wrap">
          <div className="deal-preview-title">
            <span>👁️ Live Popup Preview</span>
          </div>

          <div className="deal-preview-box">
            <div className="deal-modal-top-badge" style={{ marginBottom: 16 }}>
              <span className="deal-blinking-pill">
                <span className="deal-blinking-dot" />
                <span className="deal-blinking-text">{deal.badge_text || '🔥 DEAL OF THE DAY'}</span>
                <span className="deal-shimmer-sweep" />
              </span>
              <span className="deal-timer-hint">⏰ Today Only</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="deal-modal-media" style={{ width: '100%', height: 180 }}>
                <img
                  src={imgUrl(displayImage)}
                  alt={deal.title}
                  className="deal-product-img"
                />
                {deal.discount_tag && (
                  <div className="deal-discount-sticker">
                    <span>{deal.discount_tag}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0b1b3f' }}>
                  {deal.title || 'Untitled Deal'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  {deal.subtitle}
                </p>

                <div className="deal-price-card" style={{ padding: '8px 12px', marginBottom: 10 }}>
                  <div className="deal-price-main">
                    <span className="deal-price-label">Today:</span>
                    <strong className="deal-current-price" style={{ fontSize: '1.3rem' }}>{money(deal.deal_price || 0)}</strong>
                    {deal.original_price && (
                      <span className="deal-orig-price">{money(deal.original_price)}</span>
                    )}
                  </div>
                  {hasSavings && (
                    <div className="deal-savings-badge">
                      Save {money(savings)}
                    </div>
                  )}
                </div>

                {deal.banner_note && (
                  <div className="deal-urgency-note" style={{ marginBottom: 10, fontSize: '0.78rem' }}>
                    {deal.banner_note}
                  </div>
                )}

                <button type="button" className="btn btn-deal-claim" style={{ pointerEvents: 'none' }}>
                  <span>{deal.button_text || 'Claim Deal on WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- discounts */
const DISCOUNT_SCOPES = [
  { value: 'all', label: 'All products' },
  { value: 'category', label: 'One category' },
  { value: 'products', label: 'Specific products' }
];

function DiscountForm({ campaign: c, cats, products, onClose, onSaved }) {
  const { toast } = useUi();
  const [f, setF] = useState({
    name: c ? c.name : '', percent: c ? String(c.percent) : '10',
    scope: c ? c.scope : 'all', category_id: c?.category_id || (cats[0]?.id || ''),
    product_ids: c ? c.product_ids || [] : [],
    start_date: c?.start_date || '', end_date: c?.end_date || '', is_active: c ? c.is_active : true
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleProduct = id => setF(cur => ({ ...cur, product_ids: cur.product_ids.includes(id) ? cur.product_ids.filter(x => x !== id) : [...cur.product_ids, id] }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    const percent = parseFloat(f.percent);
    if (f.name.trim().length < 2) return setError('Please enter a campaign name.');
    if (!Number.isFinite(percent) || percent <= 0 || percent > 90) return setError('Enter a discount percentage between 1 and 90.');
    if (f.scope === 'category' && !f.category_id) return setError('Choose a category for this campaign.');
    if (f.scope === 'products' && !f.product_ids.length) return setError('Choose at least one product for this campaign.');
    if (f.start_date && f.end_date && f.start_date > f.end_date) return setError('The start date must be before the end date.');
    setBusy(true);
    const row = {
      name: f.name.trim(), percent, scope: f.scope,
      category_id: f.scope === 'category' ? f.category_id : null,
      product_ids: f.scope === 'products' ? f.product_ids : [],
      start_date: f.start_date || null, end_date: f.end_date || null, is_active: f.is_active
    };
    const { error: err } = c ? await supabase.from('discount_campaigns').update(row).eq('id', c.id) : await supabase.from('discount_campaigns').insert(row);
    setBusy(false);
    if (err) return setError(err.message);
    toast(c ? 'Campaign saved' : 'Campaign created');
    onSaved();
  };

  return (
    <Modal title={c ? 'Edit discount campaign' : 'New discount campaign'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="dName">Campaign name *</label><input id="dName" required maxLength={120} value={f.name} onChange={set('name')} placeholder="e.g. Festive Season Sale" /></div>
        <div className="field-row">
          <div className="field"><label htmlFor="dPercent">Discount % *</label><input id="dPercent" type="number" min="1" max="90" step="1" required value={f.percent} onChange={set('percent')} /></div>
          <div className="field"><label htmlFor="dScope">Applies to *</label>
            <select id="dScope" value={f.scope} onChange={set('scope')}>
              {DISCOUNT_SCOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select></div>
        </div>
        {f.scope === 'category' && (
          <div className="field"><label htmlFor="dCat">Category *</label>
            <select id="dCat" value={f.category_id} onChange={set('category_id')}>
              {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select></div>
        )}
        {f.scope === 'products' && (
          <div className="field">
            <label>Products * ({f.product_ids.length} selected)</label>
            <div className="table-wrap" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {products.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
                  <input type="checkbox" checked={f.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} /> {p.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="field-row">
          <div className="field"><label htmlFor="dStart">Start date (optional)</label><input id="dStart" type="date" value={f.start_date} onChange={set('start_date')} /></div>
          <div className="field"><label htmlFor="dEnd">End date (optional)</label><input id="dEnd" type="date" value={f.end_date} onChange={set('end_date')} /></div>
        </div>
        <div className="check-row"><label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} /> Active</label></div>
        <p className="muted" style={{ fontSize: '.85rem' }}>Discounted prices are rounded to the nearest rupee and shown with the original price struck through. A product never gets two discounts at once — a running campaign always takes priority over a bulk-quantity discount.</p>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Saving…' : c ? 'Save changes' : 'Create campaign'}</button>
      </form>
    </Modal>
  );
}

function DiscountManager() {
  const { toast } = useUi();
  const state = useLoad(async () => {
    const [d, c, p] = await Promise.all([
      supabase.from('discount_campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name').order('sort_order'),
      supabase.from('products').select('id,name').order('sort_order')
    ]);
    return { campaigns: must(d), cats: must(c), products: must(p) };
  }, []);
  const [editing, setEditing] = useState(undefined);

  const toggleActive = async c => {
    const { error } = await supabase.from('discount_campaigns').update({ is_active: !c.is_active }).eq('id', c.id);
    if (error) return toast(error.message, 'error');
    state.reload();
  };
  const remove = async c => {
    if (!window.confirm(`Delete the campaign "${c.name}"?`)) return;
    const { error } = await supabase.from('discount_campaigns').delete().eq('id', c.id);
    if (error) return toast(error.message, 'error');
    toast('Campaign deleted');
    state.reload();
  };

  const today = new Date().toISOString().slice(0, 10);
  const scopeLabel = (c, cats) => c.scope === 'all' ? 'All products' : c.scope === 'category' ? (cats.find(x => x.id === c.category_id)?.name || 'Category') : `${c.product_ids.length} product${c.product_ids.length === 1 ? '' : 's'}`;
  const isLive = c => c.is_active && (!c.start_date || today >= c.start_date) && (!c.end_date || today <= c.end_date);

  return (
    <>
      <div className="panel-head"><h2>Discount Campaigns</h2><button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>New campaign</button></div>
      <p className="muted" style={{ marginTop: -6 }}>Percentage-based "X% OFF" badges shown on the storefront. These are separate from Deal of the Day.</p>
      <Async state={state}>{({ campaigns, cats, products }) => (
        <>
          {!campaigns.length ? <div className="state-box"><h3>No discount campaigns yet</h3></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Discount</th><th>Applies to</th><th>Dates</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td data-label="Name"><strong>{c.name}</strong></td>
                      <td data-label="Discount">{c.percent}% OFF</td>
                      <td data-label="Applies to">{scopeLabel(c, cats)}</td>
                      <td data-label="Dates">{c.start_date || 'Anytime'} → {c.end_date || 'No end'}</td>
                      <td data-label="Status"><span className={'badge ' + (isLive(c) ? 'on' : 'off')}>{isLive(c) ? 'Live' : (c.is_active ? 'Scheduled / Expired' : 'Inactive')}</span></td>
                      <td data-label="">
                        <div className="row-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>Edit</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(c)}>{c.is_active ? 'Deactivate' : 'Activate'}</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {editing !== undefined && <DiscountForm campaign={editing} cats={cats} products={products} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); state.reload(); }} />}
        </>
      )}</Async>
    </>
  );
}

/* --------------------------------------------------------------- whatsapp */
function WhatsAppSettings() {
  const { toast } = useUi();
  const liveNumber = useWhatsAppNumber();
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (!touched) setValue(liveNumber); }, [liveNumber, touched]);

  const preview = buildWhatsAppUrl(buildGeneralEnquiryMessage());
  const validation = touched ? validateWhatsAppNumber(value) : '';

  const submit = async e => {
    e.preventDefault();
    setError('');
    const v = validateWhatsAppNumber(value);
    if (v) return setError(v);
    setBusy(true);
    const res = await saveWhatsAppNumber(value);
    setBusy(false);
    if (!res.success) return setError(res.error);
    setValue(res.number); setTouched(false);
    toast('WhatsApp number updated — all WhatsApp buttons on the site now use this number.');
  };

  return (
    <>
      <h2>WhatsApp Settings</h2>
      <p className="muted">This number powers every WhatsApp button and link across the storefront (chat bubble, footer, checkout, deal alerts and product enquiries). There is only one place to change it.</p>
      <form onSubmit={submit} noValidate style={{ maxWidth: 480 }}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="field">
          <label htmlFor="waNum">Business WhatsApp number (with country code, no + or spaces) *</label>
          <input id="waNum" required value={value} onChange={e => { setValue(normalizeWhatsAppNumber(e.target.value)); setTouched(true); }} placeholder="919491811360" inputMode="numeric" />
          {validation && <p className="form-error" role="alert">{validation}</p>}
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !!validation}>{busy ? 'Saving…' : 'Save number'}</button>
      </form>
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: '1rem' }}>Preview</h3>
        {validateWhatsAppNumber(value) ? <p className="muted">Enter a valid number to preview the chat link.</p> : (
          <a className="btn btn-secondary btn-sm" href={buildWhatsAppUrl(buildGeneralEnquiryMessage())} target="_blank" rel="noopener noreferrer">Open WhatsApp chat preview →</a>
        )}
      </div>
    </>
  );
}

/* --------------------------------------------------------------- promo video */
function PromoVideoManager() {
  const { toast } = useUi();
  const state = useLoad(async () => await fetchPromoVideo(), []);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (state.data && !f) setF(state.data); }, [state.data, f]);
  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (f.is_active && !f.video_url.trim()) return setError('Add a video URL before enabling this section, or leave it disabled.');
    setBusy(true);
    const res = await savePromoVideo(f);
    setBusy(false);
    if (!res.success) return setError(res.error);
    toast('Promo video saved');
    setF(res.data);
  };

  if (!f) return <div className="sk-block" style={{ minHeight: 220 }} />;
  return (
    <>
      <h2>Promotional Video</h2>
      <p className="muted">A short brand / product / process video shown on the home page. Leave the section disabled, or the URL empty, and nothing broken shows on the storefront — the section is simply hidden.</p>
      <form onSubmit={submit} noValidate style={{ maxWidth: 560 }}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="check-row"><label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} /> Show this section on the home page</label></div>
        <div className="field"><label htmlFor="pvUrl">Video URL (MP4 or a direct video link) *</label><input id="pvUrl" value={f.video_url || ''} onChange={set('video_url')} placeholder="https://…/showcase.mp4" /></div>
        <div className="field"><label htmlFor="pvThumb">Thumbnail / poster image URL</label><input id="pvThumb" value={f.thumbnail_url || ''} onChange={set('thumbnail_url')} placeholder="https://…/poster.jpg" /></div>
        <div className="field"><label htmlFor="pvTitle">Title</label><input id="pvTitle" maxLength={120} value={f.title || ''} onChange={set('title')} /></div>
        <div className="field"><label htmlFor="pvDesc">Short description</label><textarea id="pvDesc" maxLength={300} value={f.description || ''} onChange={set('description')} /></div>
        <div className="field-row">
          <div className="field"><label htmlFor="pvCtaLabel">CTA label</label><input id="pvCtaLabel" maxLength={60} value={f.cta_label || ''} onChange={set('cta_label')} /></div>
          <div className="field"><label htmlFor="pvCtaLink">CTA link</label><input id="pvCtaLink" maxLength={200} value={f.cta_link || ''} onChange={set('cta_link')} /></div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </form>
      {f.is_active && f.video_url && (
        <div style={{ marginTop: 20, maxWidth: 480 }}>
          <h3 style={{ fontSize: '1rem' }}>Preview</h3>
          <video src={f.video_url} poster={f.thumbnail_url || undefined} controls muted style={{ width: '100%', borderRadius: 12 }} />
        </div>
      )}
    </>
  );
}

/* ----------------------------------------------------------------------- page */
// Small "new" counts shown as a badge next to the Orders / Enquiries nav links, so admins can see
// at a glance whether anything needs attention without opening each tab.
function useNavCounts(ready) {
  const [counts, setCounts] = useState({});
  useEffect(() => {
    if (!ready) return;
    let on = true;
    const count = async (table, status) => {
      const { count: c, error } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', status);
      return error ? null : c;
    };
    Promise.all([count('orders', 'new'), count('enquiries', 'new'), count('reviews', 'pending')])
      .then(([orders, enquiries, reviews]) => { if (on) setCounts({ orders, enquiries, reviews }); });
    return () => { on = false; };
  }, [ready]);
  return counts;
}

export default function Admin() {
  const { tab: tabParam } = useParams();
  const tab = TABS.includes(tabParam) ? tabParam : 'overview';
  const navigate = useNavigate();
  const goTab = useCallback(t => navigate('/admin/' + t), [navigate]);
  const { user, isAdmin, ready } = useAuth();
  const navCounts = useNavCounts(isAdmin);
  useEffect(() => { document.title = 'Admin | Bhima Print Solutions'; }, []);

  const hero = <PageHero title="Admin Dashboard" subtitle="Manage orders, enquiries, products, customers and daily deals." />;
  if (!ready) return <>{hero}<PageSection><div className="sk-block" style={{ minHeight: 260 }} /></PageSection></>;
  if (!user) return <>{hero}<PageSection><StateBox title="Admin login required" action={<Link className="btn btn-primary" to="/login?next=/admin">Log in</Link>}>Log in with an admin account.</StateBox></PageSection></>;
  if (!isAdmin) return <>{hero}<PageSection><StateBox title="Access denied" action={<Link className="btn btn-primary" to="/account">Go to My Account</Link>}>This account does not have admin access.</StateBox></PageSection></>;

  const View = { overview: Overview, orders: Orders, enquiries: Enquiries, reviews: Reviews, products: Products, categories: Categories, customers: Customers, deal: DealManager, discounts: DiscountManager, whatsapp: WhatsAppSettings, video: PromoVideoManager, festival: DiwaliThemeManager }[tab];
  return (
    <>
      {hero}
      <PageSection>
        <div className="admin-page-container">
          <div className={'dash' + (tab === 'festival' ? ' admin-expanded' : '')}>
            <nav className="dash-nav" role="tablist" aria-label="Admin sections">
              {TABS.map(t => {
                const n = (t === 'orders' || t === 'enquiries' || t === 'reviews') ? navCounts[t] : null;
                const label = t === 'deal'
                  ? 'Deal of the Day'
                  : t === 'discounts' ? 'Discounts'
                  : t === 'whatsapp' ? 'WhatsApp'
                  : t === 'video' ? 'Promo Video'
                  : (t === 'festival' ? 'Festive Theme' : (t[0].toUpperCase() + t.slice(1)));
                return (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => goTab(t)}>
                    <span>{label}</span>
                    {t === 'festival' && <span className="festive-tab-badge" style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 9999, background: '#fef3c7', color: '#92400e', fontWeight: 800 }}>✦ {FESTIVALS.length}</span>}
                    {!!n && <span className="count">{n}</span>}
                  </button>
                );
              })}
              <Link to="/account">My Account</Link>
            </nav>
            <div className={'panel' + (tab === 'festival' ? ' admin-panel-clean' : '')} role="tabpanel">
              {!['products', 'categories', 'reviews', 'deal', 'discounts', 'whatsapp', 'video', 'festival'].includes(tab) && <h2>{tab[0].toUpperCase() + tab.slice(1)}</h2>}
              {tab === 'overview' ? <Overview goTab={goTab} key={tab} /> : <View key={tab} />}
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
