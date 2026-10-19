import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { useDialog } from '../lib/useDialog.js';
import { errMsg, fmtDate, imgUrl, money, slugify } from '../lib/utils.js';

const TABS = ['overview', 'orders', 'enquiries', 'reviews', 'products', 'categories', 'customers'];
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
    image_url: p ? p.image_url || '' : '', image_url_2: p ? p.image_url_2 || '' : '', is_active: p ? p.is_active : true, is_featured: p ? p.is_featured : false
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const onName = e => setF(cur => ({ ...cur, name: e.target.value, slug: p ? cur.slug : slugify(e.target.value) }));

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
      description: f.description.trim() || null, image_url, image_url_2: f.image_url_2.trim() || null, is_active: f.is_active, is_featured: f.is_featured
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
        <div className="check-row">
          <label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} /> Visible in store</label>
          <label><input type="checkbox" checked={f.is_featured} onChange={set('is_featured')} /> Featured on home page</label>
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Saving…' : p ? 'Save changes' : 'Create product'}</button>
      </form>
    </Modal>
  );
}

function Products() {
  const { toast } = useUi();
  const state = useLoad(async () => {
    const [c, p] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*, categories(name)').order('sort_order')
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
                      <td data-label="Status"><span className={'badge ' + (p.is_active ? 'on' : 'off')}>{p.is_active ? 'Active' : 'Hidden'}</span>{p.is_featured && <> <span className="badge confirmed">Featured</span></>}</td>
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

function Reviews() {
  const { toast } = useUi();
  const state = useLoad(async () => must(await supabase.from('reviews').select('*, products(name,slug)').order('created_at', { ascending: false })), []);
  const [filter, setFilter] = useState('pending');
  const [q, setQ] = useState('');

  const setStatus = async (r, status) => {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', r.id);
    if (error) { toast(error.message, 'error'); return; }
    state.setData(rows => rows.map(x => (x.id === r.id ? { ...x, status } : x)));
    toast(status === 'approved' ? 'Review approved — now visible on the product page' : 'Review updated');
  };
  const remove = async r => {
    if (!window.confirm(`Delete this review from "${r.name}"?`)) return;
    const { error } = await supabase.from('reviews').delete().eq('id', r.id);
    if (error) { toast(error.message, 'error'); return; }
    state.setData(rows => rows.filter(x => x.id !== r.id));
    toast('Review deleted');
  };

  return (
    <Async state={state}>{rows => {
      const needle = q.trim().toLowerCase();
      const list = rows.filter(r => (!filter || r.status === filter)
        && (!needle || [r.name, r.comment, r.products?.name].some(v => (v || '').toLowerCase().includes(needle))));
      return (
        <>
          <div className="admin-filters">
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, product or text…" aria-label="Search reviews" />
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{REVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!rows.length ? <div className="state-box"><h3>No reviews yet</h3><p>Customer reviews submitted on a product page land here for approval.</p></div>
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
                    {r.status !== 'approved' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(r, 'approved')}>Approve</button>}
                    {r.status !== 'rejected' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(r, 'rejected')}>Reject</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(r)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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

  const hero = <PageHero title="Admin Dashboard" subtitle="Manage orders, enquiries, products and customers." />;
  if (!ready) return <>{hero}<PageSection><div className="sk-block" style={{ minHeight: 260 }} /></PageSection></>;
  if (!user) return <>{hero}<PageSection><StateBox title="Admin login required" action={<Link className="btn btn-primary" to="/login?next=/admin">Log in</Link>}>Log in with an admin account.</StateBox></PageSection></>;
  if (!isAdmin) return <>{hero}<PageSection><StateBox title="Access denied" action={<Link className="btn btn-primary" to="/account">Go to My Account</Link>}>This account does not have admin access.</StateBox></PageSection></>;

  const View = { overview: Overview, orders: Orders, enquiries: Enquiries, reviews: Reviews, products: Products, categories: Categories, customers: Customers }[tab];
  return (
    <>
      {hero}
      <PageSection>
        <div className="dash">
          <nav className="dash-nav" role="tablist" aria-label="Admin sections">
            {TABS.map(t => {
              const n = (t === 'orders' || t === 'enquiries' || t === 'reviews') ? navCounts[t] : null;
              return (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => goTab(t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                  {!!n && <span className="count">{n}</span>}
                </button>
              );
            })}
            <Link to="/account">My Account</Link>
          </nav>
          <div className="panel" role="tabpanel">
            {tab !== 'products' && tab !== 'categories' && <h2>{tab[0].toUpperCase() + tab.slice(1)}</h2>}
            {tab === 'overview' ? <Overview goTab={goTab} key={tab} /> : <View key={tab} />}
          </div>
        </div>
      </PageSection>
    </>
  );
}
