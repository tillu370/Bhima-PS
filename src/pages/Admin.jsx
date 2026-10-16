import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { useDialog } from '../lib/useDialog.js';
import { errMsg, fmtDate, imgUrl, money, slugify } from '../lib/utils.js';

const TABS = ['overview', 'orders', 'enquiries', 'products', 'categories', 'customers'];
const ORDER_STATUSES = ['new', 'contacted', 'confirmed', 'printing', 'delivered', 'cancelled'];
const ENQ_STATUSES = ['new', 'contacted', 'closed'];
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
function Overview() {
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
          <div className="stat"><strong>{d.newOrders ?? '-'}</strong><span>New orders</span></div>
          <div className="stat"><strong>{d.allOrders ?? '-'}</strong><span>Total orders</span></div>
          <div className="stat"><strong>{d.newEnq}</strong><span>New enquiries</span></div>
          <div className="stat"><strong>{d.allEnq}</strong><span>Total enquiries</span></div>
          <div className="stat"><strong>{d.prods}</strong><span>Active products</span></div>
          <div className="stat"><strong>{d.custs}</strong><span>Customers</span></div>
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
      const list = rows.filter(o => !filter || o.status === filter);
      return (
        <>
          <div className="admin-filters">
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!list.length ? <div className="state-box"><h3>No orders yet</h3><p>Orders appear here when a customer sends their cart from the Checkout page.</p></div> : (
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
                        {i.design && <a href={i.design.preview} target="_blank" rel="noopener noreferrer"><img src={i.design.preview} alt={`Design for ${i.name}`} loading="lazy" /></a>}
                        <div>
                          <strong>{i.name}</strong> × {i.qty}
                          {i.design && <div className="muted">{i.design.colourName} · {i.design.template}{i.design.background ? ` · background ${i.design.background}` : ''}</div>}
                          {i.design && i.design.texts && i.design.texts.length > 0 && <div className="muted">Text: {i.design.texts.map(t => `"${t.text}" (${t.font})`).join(', ')}</div>}
                          {i.design && i.design.assets && i.design.assets.map((u, k) => <a key={k} className="link-btn" href={u} target="_blank" rel="noopener noreferrer" download>Original file {k + 1}</a>)}
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

  const setStatus = async (q, status) => {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', q.id);
    if (error) { toast(error.message, 'error'); return; }
    state.setData(rows => rows.map(r => (r.id === q.id ? { ...r, status } : r)));
    toast('Enquiry updated');
  };
  return (
    <Async state={state}>{rows => {
      const list = rows.filter(q => !filter || q.status === filter);
      return (
        <>
          <div className="admin-filters">
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{ENQ_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!list.length ? <div className="state-box"><h3>No enquiries found</h3></div> : (
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
    image_url: p ? p.image_url || '' : '', is_active: p ? p.is_active : true, is_featured: p ? p.is_featured : false
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const onName = e => setF(cur => ({ ...cur, name: e.target.value, slug: p ? cur.slug : slugify(e.target.value) }));
  const onFile = e => {
    const fl = e.target.files[0];
    setFile(fl || null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(fl ? URL.createObjectURL(fl) : null);
  };

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
      description: f.description.trim() || null, image_url, is_active: f.is_active, is_featured: f.is_featured
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
            <select id="pCat" value={f.category_id} onChange={set('category_id')}>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div className="field-row">
          <div className="field"><label htmlFor="pPrice">Starting price (₹)</label><input id="pPrice" type="number" min="0" step="0.01" value={f.price} onChange={set('price')} placeholder="Empty = price on request" /></div>
          <div className="field"><label htmlFor="pOrder">Sort order</label><input id="pOrder" type="number" value={f.sort_order} onChange={set('sort_order')} /></div>
        </div>
        <div className="field"><label htmlFor="pDesc">Description</label><textarea id="pDesc" maxLength={2000} value={f.description} onChange={set('description')} /></div>
        <div className="field">
          <label htmlFor="pImgFile">Image (upload JPG, PNG or WebP, max 5 MB)</label>
          <input id="pImgFile" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
          <label htmlFor="pImgUrl" style={{ marginTop: 8 }}>…or image URL / path</label>
          <input id="pImgUrl" value={f.image_url} onChange={set('image_url')} />
          <img className="img-preview" src={preview || imgUrl(f.image_url)} alt="Preview" />
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
      <Async state={state}>{({ cats, products }) => (
        <>
          {!products.length ? <div className="state-box"><h3>No products yet</h3></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th></th><th>Name</th><th>Category</th><th>From</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {products.map(p => (
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
      )}</Async>
    </>
  );
}

function CategoryForm({ category: c, onClose, onSaved }) {
  const { toast } = useUi();
  const [f, setF] = useState({ name: c ? c.name : '', slug: c ? c.slug : '', description: c ? c.description || '' : '', image_url: c ? c.image_url || '' : '', sort_order: c ? c.sort_order : 0, is_active: c ? c.is_active : true });
  const [error, setError] = useState('');
  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const submit = async e => {
    e.preventDefault();
    setError('');
    if (f.name.trim().length < 2 || !SLUG_RE.test(f.slug)) return setError('Enter a name and a valid slug (lowercase letters, numbers, hyphens).');
    const row = { name: f.name.trim(), slug: f.slug, description: f.description.trim() || null, image_url: f.image_url.trim() || null, sort_order: parseInt(f.sort_order, 10) || 0, is_active: f.is_active };
    const { error: err } = c ? await supabase.from('categories').update(row).eq('id', c.id) : await supabase.from('categories').insert(row);
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
        <div className="field"><label htmlFor="cImg">Tile image URL (optional)</label><input id="cImg" value={f.image_url} onChange={set('image_url')} placeholder="https://… or /images/…" /></div>
        <div className="field"><label htmlFor="cOrder">Sort order</label><input id="cOrder" type="number" value={f.sort_order} onChange={set('sort_order')} /></div>
        <div className="check-row"><label><input type="checkbox" checked={f.is_active} onChange={set('is_active')} /> Visible in store</label></div>
        <button className="btn btn-primary btn-block" type="submit">{c ? 'Save changes' : 'Create category'}</button>
      </form>
    </Modal>
  );
}

function Categories() {
  const { toast } = useUi();
  const state = useLoad(async () => must(await supabase.from('categories').select('*').order('sort_order')), []);
  const [editing, setEditing] = useState(undefined);
  const remove = async c => {
    if (!window.confirm(`Delete category "${c.name}"? This only works if it has no products.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) return toast(error.code === '23503' ? 'This category still has products. Move or delete them first.' : error.message, 'error');
    toast('Category deleted');
    state.reload();
  };
  return (
    <>
      <div className="panel-head"><h2>Categories</h2><button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>Add category</button></div>
      <Async state={state}>{rows => (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map(c => (
                  <tr key={c.id}>
                    <td data-label="Name"><strong>{c.name}</strong><br /><small style={{ color: '#64748b' }}>{c.description}</small></td>
                    <td data-label="Slug">{c.slug}</td><td data-label="Order">{c.sort_order}</td>
                    <td data-label="Status"><span className={'badge ' + (c.is_active ? 'on' : 'off')}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
                    <td data-label=""><div className="row-actions"><button className="btn btn-secondary btn-sm" onClick={() => setEditing(c)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editing !== undefined && <CategoryForm category={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); state.reload(); }} />}
        </>
      )}</Async>
    </>
  );
}

function Customers() {
  const state = useLoad(async () => must(await supabase.from('profiles').select('*').order('created_at', { ascending: false })), []);
  return (
    <Async state={state}>{rows => !rows.length ? <div className="state-box"><h3>No customers yet</h3></div> : (
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td data-label="Name">{u.full_name || '-'}</td><td data-label="Email">{u.email || '-'}</td><td data-label="Phone">{u.phone || '-'}</td>
                <td data-label="Role"><span className={'badge ' + (u.role === 'admin' ? 'confirmed' : '')}>{u.role}</span></td><td data-label="Joined">{fmtDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}</Async>
  );
}

/* ----------------------------------------------------------------------- page */
export default function Admin() {
  const { tab: tabParam } = useParams();
  const tab = TABS.includes(tabParam) ? tabParam : 'overview';
  const navigate = useNavigate();
  const { user, isAdmin, ready } = useAuth();
  useEffect(() => { document.title = 'Admin | Bhima Print Solutions'; }, []);

  const hero = <PageHero title="Admin Dashboard" subtitle="Manage orders, enquiries, products and customers." />;
  if (!ready) return <>{hero}<PageSection><div className="sk-block" style={{ minHeight: 260 }} /></PageSection></>;
  if (!user) return <>{hero}<PageSection><StateBox title="Admin login required" action={<Link className="btn btn-primary" to="/login?next=/admin">Log in</Link>}>Log in with an admin account.</StateBox></PageSection></>;
  if (!isAdmin) return <>{hero}<PageSection><StateBox title="Access denied" action={<Link className="btn btn-primary" to="/account">Go to My Account</Link>}>This account does not have admin access.</StateBox></PageSection></>;

  const View = { overview: Overview, orders: Orders, enquiries: Enquiries, products: Products, categories: Categories, customers: Customers }[tab];
  return (
    <>
      {hero}
      <PageSection>
        <div className="dash">
          <nav className="dash-nav" role="tablist" aria-label="Admin sections">
            {TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => navigate('/admin/' + t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
            <Link to="/account">My Account</Link>
          </nav>
          <div className="panel" role="tabpanel">
            {tab !== 'products' && tab !== 'categories' && <h2>{tab[0].toUpperCase() + tab.slice(1)}</h2>}
            <View key={tab} />
          </div>
        </div>
      </PageSection>
    </>
  );
}
