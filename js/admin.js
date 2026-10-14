/** Admin dashboard. Access is enforced by Row Level Security in Supabase (profiles.role = 'admin'). */
(function () {
  'use strict';
  const root = document.getElementById('adminRoot');
  const modal = document.getElementById('adminModal');
  const mTitle = document.getElementById('adminModalTitle');
  const mBody = document.getElementById('adminModalBody');
  const ENQ_STATUSES = ['new', 'contacted', 'closed'];
  const label = s => s.replace('_', ' ');
  const slugify = s => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  let tab = (location.hash || '#overview').slice(1);
  let cats = [];

  /* -------------------------------------------------------------- modal */
  function openModal(title, html) {
    mTitle.textContent = title; mBody.innerHTML = html;
    modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
    const f = mBody.querySelector('input,select,textarea,button'); if (f) setTimeout(() => f.focus(), 50);
  }
  function closeModal() { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); }
  document.getElementById('adminModalClose').onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

  const panel = () => document.getElementById('panel');
  const loading = () => (panel().innerHTML = '<div class="sk-block" style="min-height:180px"></div>');
  function fail(e, retry) {
    panel().innerHTML = `<div class="state-box"><h3>Something went wrong</h3><p>${BPS.esc(BPS.errMsg(e))}</p><button class="btn btn-primary" id="retry">Try again</button></div>`;
    document.getElementById('retry').onclick = retry;
  }
  const opts = (list, cur) => list.map(s => `<option value="${s}"${s === cur ? ' selected' : ''}>${label(s)}</option>`).join('');

  /* --------------------------------------------------------------- init */
  async function init() {
    await BPS.ready;
    if (!BPS.user()) {
      root.innerHTML = '<div class="state-box"><h2>Admin login required</h2><p>Log in with an admin account.</p><a class="btn btn-primary" href="login.html?next=admin.html">Log in</a></div>';
      return;
    }
    if (!BPS.isAdmin()) {
      root.innerHTML = '<div class="state-box"><h2>Access denied</h2><p>This account does not have admin access.</p><a class="btn btn-primary" href="account.html">Go to My Account</a></div>';
      return;
    }
    if (!['overview', 'enquiries', 'products', 'categories', 'customers'].includes(tab)) tab = 'overview';
    root.innerHTML = `
      <div class="dash">
        <nav class="dash-nav" role="tablist" aria-label="Admin sections">
          ${['overview', 'enquiries', 'products', 'categories', 'customers'].map(t => `<button role="tab" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
          <a href="account.html">My Account</a>
        </nav>
        <div id="panel" class="panel" role="tabpanel" tabindex="-1"></div>
      </div>`;
    root.querySelector('.dash-nav').addEventListener('click', e => {
      const b = e.target.closest('[data-tab]');
      if (b) { tab = b.dataset.tab; history.replaceState(null, '', '#' + tab); show(); }
    });
    show();
  }
  function show() {
    root.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    ({ overview, enquiries, products, categories, customers })[tab]();
  }

  /* ----------------------------------------------------------- overview */
  async function overview() {
    loading();
    try {
      const count = async (table, f) => { let q = BPS.sb.from(table).select('*', { count: 'exact', head: true }); if (f) q = f(q); const { count: c, error } = await q; if (error) throw error; return c; };
      const [newEnq, allEnq, prods, custs] = await Promise.all([
        count('enquiries', q => q.eq('status', 'new')), count('enquiries'),
        count('products', q => q.eq('is_active', true)), count('profiles', q => q.eq('role', 'customer'))
      ]);
      panel().innerHTML = `
        <h2>Overview</h2>
        <div class="stat-grid">
          <div class="stat"><strong>${newEnq}</strong><span>New enquiries</span></div>
          <div class="stat"><strong>${allEnq}</strong><span>Total enquiries</span></div>
          <div class="stat"><strong>${prods}</strong><span>Active products</span></div>
          <div class="stat"><strong>${custs}</strong><span>Customers</span></div>
        </div>
        <p style="color:#475569">Orders are placed on WhatsApp, so they are not tracked here. Enquiries from the website form arrive under <strong>Enquiries</strong>.</p>`;
    } catch (e) { fail(e, overview); }
  }

  /* ---------------------------------------------------------- enquiries */
  async function enquiries() {
    loading();
    const { data, error } = await BPS.sb.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) return fail(error, enquiries);
    panel().innerHTML = `
      <div class="panel-head"><h2>Enquiries</h2></div>
      <div class="admin-filters"><select id="eStatus" aria-label="Filter by status"><option value="">All statuses</option>${opts(ENQ_STATUSES, '')}</select></div>
      <div id="eTable"></div>`;
    const draw = () => {
      const st = document.getElementById('eStatus').value;
      const list = data.filter(q => !st || q.status === st);
      document.getElementById('eTable').innerHTML = list.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>From</th><th>Type / product</th><th>Qty</th><th>Message</th><th>Status</th></tr></thead><tbody>
        ${list.map(q => `<tr><td>${BPS.fmtDate(q.created_at)}</td><td><strong>${BPS.esc(q.name)}</strong><br><a href="tel:${BPS.esc(q.phone)}">${BPS.esc(q.phone)}</a>${q.email ? `<br><a href="mailto:${BPS.esc(q.email)}">${BPS.esc(q.email)}</a>` : ''}</td><td>${BPS.esc(q.enquiry_type)}${q.product_interest ? `<br><small>${BPS.esc(q.product_interest)}</small>` : ''}</td><td>${q.quantity || '-'}</td><td style="max-width:260px">${BPS.esc(q.message || '')}</td>
        <td><select data-enq="${q.id}" aria-label="Status for enquiry from ${BPS.esc(q.name)}">${opts(ENQ_STATUSES, q.status)}</select></td></tr>`).join('')}
        </tbody></table></div>` : '<div class="state-box"><h3>No enquiries found</h3></div>';
    };
    draw();
    document.getElementById('eStatus').onchange = draw;
    document.getElementById('eTable').onchange = async e => {
      const s = e.target.closest('[data-enq]'); if (!s) return;
      const { error: err } = await BPS.sb.from('enquiries').update({ status: s.value }).eq('id', s.dataset.enq);
      if (err) { BPS.toast(err.message, 'error'); return; }
      data.find(q => q.id === s.dataset.enq).status = s.value; BPS.toast('Enquiry updated');
    };
  }

  /* ----------------------------------------------------------- products */
  async function products() {
    loading();
    try {
      const [c, res] = await Promise.all([
        BPS.sb.from('categories').select('*').order('sort_order'),
        BPS.sb.from('products').select('*, categories(name)').order('sort_order')
      ]);
      if (c.error) throw c.error; if (res.error) throw res.error;
      cats = c.data;
      panel().innerHTML = `
        <div class="panel-head"><h2>Products</h2><button class="btn btn-primary btn-sm" id="addProduct">Add product</button></div>
        ${res.data.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th></th><th>Name</th><th>Category</th><th>From</th><th>Status</th><th></th></tr></thead><tbody>
          ${res.data.map(p => `<tr><td><img class="table-img" src="${BPS.esc(BPS.img(p.image_url))}" alt=""></td><td><strong>${BPS.esc(p.name)}</strong><br><small style="color:#64748b">/${BPS.esc(p.slug)}</small></td><td>${BPS.esc(p.categories ? p.categories.name : '-')}</td><td>${BPS.money(p.price_from)}</td>
          <td><span class="badge ${p.is_active ? 'on' : 'off'}">${p.is_active ? 'Active' : 'Hidden'}</span>${p.is_featured ? ' <span class="badge confirmed">Featured</span>' : ''}</td>
          <td><div class="row-actions"><button class="btn btn-secondary btn-sm" data-edit="${p.id}">Edit</button><button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button></div></td></tr>`).join('')}
          </tbody></table></div>` : '<div class="state-box"><h3>No products yet</h3></div>'}`;
      document.getElementById('addProduct').onclick = () => productModal(null);
      panel().onclick = async e => {
        const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
        if (ed) productModal(res.data.find(p => p.id === ed.dataset.edit));
        if (del) {
          const p = res.data.find(x => x.id === del.dataset.del);
          if (!confirm(`Delete "${p.name}"? You can also just hide it instead.`)) return;
          const { error } = await BPS.sb.from('products').delete().eq('id', p.id);
          if (error) return BPS.toast(error.message, 'error');
          const m = (p.image_url || '').match(/\/product-images\/([^?]+)$/);
          if (m) await BPS.sb.storage.from('product-images').remove([decodeURIComponent(m[1])]);
          BPS.toast('Product deleted'); products();
        }
      };
    } catch (e) { fail(e, products); }
  }
  function productModal(p) {
    openModal(p ? 'Edit product' : 'Add product', `
      <form id="pForm" novalidate>
        <p class="form-error" id="mErr" role="alert" hidden></p>
        <div class="field"><label for="pName">Name *</label><input id="pName" required maxlength="120" value="${BPS.esc(p ? p.name : '')}"></div>
        <div class="field-row">
          <div class="field"><label for="pSlug">URL slug *</label><input id="pSlug" required maxlength="80" value="${BPS.esc(p ? p.slug : '')}"></div>
          <div class="field"><label for="pCat">Category *</label><select id="pCat">${cats.map(c => `<option value="${c.id}"${p && p.category_id === c.id ? ' selected' : ''}>${BPS.esc(c.name)}</option>`).join('')}</select></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="pPrice">Starting price (₹) *</label><input id="pPrice" type="number" min="0" step="0.01" required value="${p ? p.price_from : ''}"></div>
          <div class="field"><label for="pOrder">Sort order</label><input id="pOrder" type="number" value="${p ? p.sort_order : 0}"></div>
        </div>
        <div class="field"><label for="pDesc">Description</label><textarea id="pDesc" maxlength="2000">${BPS.esc(p ? p.description || '' : '')}</textarea></div>
        <div class="field"><label for="pImgFile">Image (upload JPG, PNG or WebP, max 5 MB)</label><input id="pImgFile" type="file" accept="image/jpeg,image/png,image/webp">
          <label for="pImgUrl" style="margin-top:8px">…or image URL / path</label><input id="pImgUrl" value="${BPS.esc(p ? p.image_url || '' : '')}">
          <img class="img-preview" id="pPreview" src="${BPS.esc(BPS.img(p && p.image_url))}" alt="Preview"></div>
        <div class="check-row">
          <label><input type="checkbox" id="pActive"${!p || p.is_active ? ' checked' : ''}> Visible in store</label>
          <label><input type="checkbox" id="pFeatured"${p && p.is_featured ? ' checked' : ''}> Featured on home page</label>
        </div>
        <button class="btn btn-primary btn-block" type="submit" id="pSave">${p ? 'Save changes' : 'Create product'}</button>
      </form>`);
    const name = document.getElementById('pName'), slug = document.getElementById('pSlug');
    if (!p) name.addEventListener('input', () => (slug.value = slugify(name.value)));
    document.getElementById('pImgFile').onchange = e => { const f = e.target.files[0]; if (f) document.getElementById('pPreview').src = URL.createObjectURL(f); };
    document.getElementById('pImgUrl').oninput = e => (document.getElementById('pPreview').src = BPS.img(e.target.value));
    document.getElementById('pForm').onsubmit = async e => {
      e.preventDefault();
      const err = document.getElementById('mErr'), btn = document.getElementById('pSave');
      const bad = m => { err.textContent = m; err.hidden = false; };
      err.hidden = true;
      const price = parseFloat(document.getElementById('pPrice').value);
      if (name.value.trim().length < 2) return bad('Please enter a product name.');
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.value)) return bad('Slug may only contain lowercase letters, numbers and hyphens.');
      if (!Number.isFinite(price) || price < 0) return bad('Please enter a valid price.');
      btn.disabled = true;
      let image_url = document.getElementById('pImgUrl').value.trim() || null;
      const file = document.getElementById('pImgFile').files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { btn.disabled = false; return bad('Image is larger than 5 MB.'); }
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const up = await BPS.sb.storage.from('product-images').upload(path, file, { contentType: file.type });
        if (up.error) { btn.disabled = false; return bad('Image upload failed: ' + up.error.message); }
        image_url = BPS.sb.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      }
      const row = {
        name: name.value.trim(), slug: slug.value, category_id: document.getElementById('pCat').value, price_from: price,
        sort_order: parseInt(document.getElementById('pOrder').value, 10) || 0,
        description: document.getElementById('pDesc').value.trim() || null, image_url,
        is_active: document.getElementById('pActive').checked, is_featured: document.getElementById('pFeatured').checked
      };
      const { error } = p ? await BPS.sb.from('products').update(row).eq('id', p.id) : await BPS.sb.from('products').insert(row);
      btn.disabled = false;
      if (error) return bad(error.code === '23505' ? 'That URL slug is already used by another product.' : error.message);
      closeModal(); BPS.toast(p ? 'Product saved' : 'Product created'); products();
    };
  }

  /* --------------------------------------------------------- categories */
  async function categories() {
    loading();
    const { data, error } = await BPS.sb.from('categories').select('*').order('sort_order');
    if (error) return fail(error, categories);
    panel().innerHTML = `
      <div class="panel-head"><h2>Categories</h2><button class="btn btn-primary btn-sm" id="addCat">Add category</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Slug</th><th>Order</th><th>Status</th><th></th></tr></thead><tbody>
      ${data.map(c => `<tr><td><strong>${BPS.esc(c.name)}</strong><br><small style="color:#64748b">${BPS.esc(c.description || '')}</small></td><td>${BPS.esc(c.slug)}</td><td>${c.sort_order}</td><td><span class="badge ${c.is_active ? 'on' : 'off'}">${c.is_active ? 'Active' : 'Hidden'}</span></td>
      <td><div class="row-actions"><button class="btn btn-secondary btn-sm" data-edit="${c.id}">Edit</button><button class="btn btn-danger btn-sm" data-del="${c.id}">Delete</button></div></td></tr>`).join('')}
      </tbody></table></div>`;
    document.getElementById('addCat').onclick = () => catModal(null);
    panel().onclick = async e => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) catModal(data.find(c => c.id === ed.dataset.edit));
      if (del) {
        const c = data.find(x => x.id === del.dataset.del);
        if (!confirm(`Delete category "${c.name}"? This only works if it has no products.`)) return;
        const { error: er } = await BPS.sb.from('categories').delete().eq('id', c.id);
        if (er) return BPS.toast(er.code === '23503' ? 'This category still has products. Move or delete them first.' : er.message, 'error');
        BPS.toast('Category deleted'); categories();
      }
    };
  }
  function catModal(c) {
    openModal(c ? 'Edit category' : 'Add category', `
      <form id="cForm" novalidate>
        <p class="form-error" id="mErr" role="alert" hidden></p>
        <div class="field"><label for="cName">Name *</label><input id="cName" required maxlength="80" value="${BPS.esc(c ? c.name : '')}"></div>
        <div class="field"><label for="cSlug">URL slug *</label><input id="cSlug" required maxlength="60" value="${BPS.esc(c ? c.slug : '')}"></div>
        <div class="field"><label for="cDesc">Description</label><input id="cDesc" maxlength="200" value="${BPS.esc(c ? c.description || '' : '')}"></div>
        <div class="field"><label for="cOrder">Sort order</label><input id="cOrder" type="number" value="${c ? c.sort_order : 0}"></div>
        <div class="check-row"><label><input type="checkbox" id="cActive"${!c || c.is_active ? ' checked' : ''}> Visible in store</label></div>
        <button class="btn btn-primary btn-block" type="submit">${c ? 'Save changes' : 'Create category'}</button>
      </form>`);
    const n = document.getElementById('cName'), s = document.getElementById('cSlug');
    if (!c) n.addEventListener('input', () => (s.value = slugify(n.value)));
    document.getElementById('cForm').onsubmit = async e => {
      e.preventDefault();
      const err = document.getElementById('mErr'); err.hidden = true;
      if (n.value.trim().length < 2 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.value)) { err.textContent = 'Enter a name and a valid slug (lowercase letters, numbers, hyphens).'; err.hidden = false; return; }
      const row = { name: n.value.trim(), slug: s.value, description: document.getElementById('cDesc').value.trim() || null, sort_order: parseInt(document.getElementById('cOrder').value, 10) || 0, is_active: document.getElementById('cActive').checked };
      const { error } = c ? await BPS.sb.from('categories').update(row).eq('id', c.id) : await BPS.sb.from('categories').insert(row);
      if (error) { err.textContent = error.code === '23505' ? 'That slug is already used.' : error.message; err.hidden = false; return; }
      closeModal(); BPS.toast('Category saved'); categories();
    };
  }

  /* ---------------------------------------------------------- customers */
  async function customers() {
    loading();
    const { data, error } = await BPS.sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return fail(error, customers);
    panel().innerHTML = `<h2>Customers</h2>${data.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead><tbody>
      ${data.map(u => `<tr><td>${BPS.esc(u.full_name || '-')}</td><td>${BPS.esc(u.email || '-')}</td><td>${BPS.esc(u.phone || '-')}</td><td><span class="badge ${u.role === 'admin' ? 'confirmed' : ''}">${u.role}</span></td><td>${BPS.fmtDate(u.created_at)}</td></tr>`).join('')}
      </tbody></table></div>` : '<div class="state-box"><h3>No customers yet</h3></div>'}`;
  }

  init();
})();
