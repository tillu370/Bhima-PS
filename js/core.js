/**
 * Bhima Print Solutions - shared core (loaded on every page).
 * Supabase client, auth/session, cart, wishlist, toast, enquiry modal and the
 * shared header / footer / cart drawer.
 */
(function () {
  'use strict';

  const cfg = window.BPS_CONFIG;
  const sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const BPS = (window.BPS = { sb, session: null, profile: null });

  /* ------------------------------------------------------------------ utils */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  BPS.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);
  BPS.money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  BPS.qs = k => new URLSearchParams(location.search).get(k);
  BPS.fmtDate = d => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  BPS.PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#eef2f6"/><text x="200" y="210" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#94a3b8">No image</text></svg>');
  BPS.img = u => u || BPS.PLACEHOLDER_IMG;
  BPS.whatsappUrl = text => 'https://wa.me/' + cfg.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  BPS.errMsg = e => (e && (e.message || e.error_description)) || 'Something went wrong. Please try again.';

  /* ------------------------------------------------------------------ toast */
  let toastTimer;
  BPS.toast = function (msg, type) {
    const t = document.getElementById('toastNotification');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('error', type === 'error');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
  };

  /* ------------------------------------------------------------------- cart */
  const CART_KEY = 'bps_cart_v1';
  let memCart = [];
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return memCart; }
  };
  const writeCart = items => {
    memCart = items;
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* storage blocked: memory only */ }
    renderCart();
    document.dispatchEvent(new CustomEvent('bps:cart'));
  };
  BPS.cart = {
    items: readCart,
    count: () => readCart().reduce((n, i) => n + i.qty, 0),
    subtotal: () => readCart().reduce((n, i) => n + i.qty * i.price, 0),
    add(p, qty) {
      qty = Math.max(1, Math.min(100000, parseInt(qty, 10) || 1));
      const items = readCart();
      const hit = items.find(i => i.id === p.id);
      if (hit) hit.qty = Math.min(100000, hit.qty + qty);
      else items.push({ id: p.id, slug: p.slug, name: p.name, price: Number(p.price_from), image: p.image_url || '', qty, notes: '' });
      writeCart(items);
    },
    setQty(id, qty) {
      qty = Math.max(1, Math.min(100000, parseInt(qty, 10) || 1));
      writeCart(readCart().map(i => (i.id === id ? { ...i, qty } : i)));
    },
    setNotes(id, notes) { writeCart(readCart().map(i => (i.id === id ? { ...i, notes: String(notes).slice(0, 500) } : i))); },
    remove(id) { writeCart(readCart().filter(i => i.id !== id)); },
    clear() { writeCart([]); },
    // Re-price from the database and drop products that no longer exist.
    async refresh() {
      const items = readCart();
      if (!items.length) return items;
      const { data, error } = await sb.from('products').select('id,slug,name,price_from,image_url,is_active').in('id', items.map(i => i.id));
      if (error) throw error;
      const byId = new Map(data.map(p => [p.id, p]));
      const fresh = items.filter(i => byId.get(i.id) && byId.get(i.id).is_active).map(i => {
        const p = byId.get(i.id);
        return { ...i, name: p.name, slug: p.slug, price: Number(p.price_from), image: p.image_url || '' };
      });
      if (JSON.stringify(fresh) !== JSON.stringify(items)) writeCart(fresh);
      return fresh;
    }
  };

  BPS.addToCart = function (product, btn) {
    BPS.cart.add(product, 1);
    BPS.toast(`Added "${product.name}" to your cart`);
    if (btn) {
      const old = btn.dataset.label || btn.textContent;
      btn.dataset.label = old;
      btn.classList.add('added');
      btn.textContent = 'Added';
      setTimeout(() => { btn.classList.remove('added'); btn.textContent = old; }, 1200);
    }
  };

  /* ------------------------------------------------------------------- auth */
  async function loadProfile() {
    if (!BPS.session) { BPS.profile = null; return null; }
    const { data } = await sb.from('profiles').select('*').eq('id', BPS.session.user.id).maybeSingle();
    BPS.profile = data || null;
    return BPS.profile;
  }
  BPS.isAdmin = () => !!(BPS.profile && BPS.profile.role === 'admin');
  BPS.user = () => (BPS.session ? BPS.session.user : null);
  BPS.requireLogin = function (next) {
    const target = next || (location.pathname.split('/').pop() || 'index.html') + location.search + location.hash;
    location.href = 'login.html?next=' + encodeURIComponent(target);
  };
  BPS.signOut = async function () {
    await sb.auth.signOut();
    BPS.session = null; BPS.profile = null;
    BPS.wishlist.ids.clear();
    location.href = 'index.html';
  };
  // Only allow same-site relative redirects after login.
  BPS.safeNext = function (n) {
    return n && /^[a-z0-9_\-]+\.html([?#].*)?$/i.test(n) ? n : 'account.html';
  };

  /* --------------------------------------------------------------- wishlist */
  BPS.wishlist = {
    ids: new Set(),
    async load() {
      this.ids.clear();
      if (!BPS.session) return;
      const { data } = await sb.from('wishlist').select('product_id');
      (data || []).forEach(r => this.ids.add(r.product_id));
    },
    has(id) { return this.ids.has(id); },
    async toggle(productId, btn) {
      if (!BPS.session) {
        BPS.toast('Please log in to save items to your wishlist.');
        setTimeout(() => BPS.requireLogin(), 900);
        return;
      }
      const had = this.ids.has(productId);
      const { error } = had
        ? await sb.from('wishlist').delete().eq('product_id', productId)
        : await sb.from('wishlist').insert({ user_id: BPS.session.user.id, product_id: productId });
      if (error) { BPS.toast(BPS.errMsg(error), 'error'); return; }
      if (had) this.ids.delete(productId); else this.ids.add(productId);
      if (btn) { btn.classList.toggle('active', !had); btn.setAttribute('aria-pressed', String(!had)); }
      BPS.toast(had ? 'Removed from wishlist' : 'Saved to your wishlist');
      document.dispatchEvent(new CustomEvent('bps:wishlist'));
    }
  };

  /* ------------------------------------------------------------------ data */
  let catCache = null;
  BPS.categories = async function () {
    if (catCache) return catCache;
    const { data, error } = await sb.from('categories').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    catCache = data;
    return data;
  };
  BPS.productCard = function (p) {
    const wished = BPS.wishlist.has(p.id);
    return `
      <article class="product-card" data-category="${BPS.esc(p.categories ? p.categories.name : '')}">
        <button class="wishlist-btn${wished ? ' active' : ''}" data-wish="${p.id}" aria-label="Save ${BPS.esc(p.name)} to wishlist" aria-pressed="${wished}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <a class="product-img-box" href="product.html?slug=${encodeURIComponent(p.slug)}" aria-label="View ${BPS.esc(p.name)}">
          <img loading="lazy" decoding="async" src="${BPS.esc(BPS.img(p.image_url))}" alt="${BPS.esc(p.name)}">
        </a>
        <div class="product-info">
          <h3 class="product-title"><a href="product.html?slug=${encodeURIComponent(p.slug)}">${BPS.esc(p.name)}</a></h3>
          <div class="product-bottom">
            <span class="product-price"><strong>${BPS.money(p.price_from)}</strong> <small>onwards</small></span>
            <button class="btn-add" data-add="${p.id}">Add</button>
          </div>
        </div>
      </article>`;
  };
  // Wire wishlist hearts and Add buttons inside a container, given the product list.
  BPS.bindProductGrid = function (root, products) {
    const byId = new Map(products.map(p => [p.id, p]));
    root.addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      if (add) { BPS.addToCart(byId.get(add.dataset.add), add); return; }
      const wish = e.target.closest('[data-wish]');
      if (wish) BPS.wishlist.toggle(wish.dataset.wish, wish);
    });
  };

  /* ---------------------------------------------------------------- layout */
  const HEADER = () => `
  <header class="main-header">
    <div class="container nav-container">
      <a href="index.html" class="brand-logo" aria-label="Bhima Print Solutions home">
        <div class="logo-mark"><span class="letter-b">B.</span></div>
        <div class="logo-text"><span class="brand-name">BHIMA PRINT</span><span class="brand-sub">SOLUTIONS</span></div>
      </a>
      <nav class="nav-links" aria-label="Main">
        <div class="nav-item dropdown">
          <a href="products.html" class="nav-link" aria-haspopup="true">Products
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </a>
          <div class="dropdown-menu" id="navCategories"></div>
        </div>
        <a href="index.html#for-business" class="nav-link">For Business</a>
        <a href="index.html#how-it-works" class="nav-link">Design Help</a>
        <a href="index.html#why-choose" class="nav-link">About Us</a>
        <a href="#footer" class="nav-link">Contact</a>
      </nav>
      <div class="header-actions">
        <form class="search-box" id="searchForm" role="search">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" id="searchInput" placeholder="Search for products..." autocomplete="off" aria-label="Search products">
        </form>
        <a class="icon-btn" id="accountBtn" href="login.html" aria-label="Log in or sign up">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
        <button class="icon-btn cart-btn" id="cartToggleBtn" aria-label="Open cart" aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-badge" id="cartCount" aria-live="polite">0</span>
        </button>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" id="mobileNav" aria-label="Mobile" hidden>
    <div class="container">
      <form class="mobile-search" id="mobileSearchForm" role="search">
        <input type="search" id="searchInputMobile" placeholder="Search for products..." autocomplete="off" aria-label="Search products">
      </form>
      <a href="products.html">All Products</a>
      <a href="index.html#for-business">For Business</a>
      <a href="index.html#how-it-works">Design Help</a>
      <a href="index.html#why-choose">About Us</a>
      <a href="#footer">Contact</a>
      <a href="login.html" id="mobileAccountLink">Log in / Sign up</a>
    </div>
  </nav>`;

  const OVERLAYS = `
  <div class="cart-drawer-overlay" id="cartOverlay"></div>
  <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden="true">
    <div class="cart-drawer-header">
      <h3 id="cartTitle">Your Cart (<span id="drawerCartCount">0</span>)</h3>
      <button class="close-drawer-btn" id="cartCloseBtn" aria-label="Close cart">✕</button>
    </div>
    <div class="cart-drawer-body" id="cartItemsList"></div>
    <div class="cart-drawer-footer">
      <div class="cart-subtotal"><span>Estimated subtotal:</span><strong id="cartSubtotalPrice">₹0</strong></div>
      <p class="cart-note">Starting prices. We confirm the final price on WhatsApp before production.</p>
      <a class="btn btn-secondary btn-block" href="cart.html">View Cart</a>
      <a class="btn btn-primary btn-block btn-checkout" id="cartCheckoutBtn" href="checkout.html">Order on WhatsApp</a>
    </div>
  </aside>

  <div class="modal-overlay" id="enquiryModal" aria-hidden="true">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-header">
        <h3 id="modalTitle">Get a Custom Quote</h3>
        <button class="modal-close" id="modalCloseBtn" aria-label="Close enquiry form">✕</button>
      </div>
      <div id="enquirySuccess" class="enquiry-success" hidden>
        <div class="success-tick" aria-hidden="true">✓</div>
        <h4>Enquiry received</h4>
        <p id="enquirySuccessMsg"></p>
        <button type="button" class="btn btn-primary btn-block" id="enquiryDoneBtn">Done</button>
      </div>
      <form class="modal-form" id="enquiryForm" novalidate>
        <div class="form-group"><label for="enqName">Your Name *</label>
          <input type="text" id="enqName" required maxlength="100" placeholder="e.g. Anand Sharma" autocomplete="name"></div>
        <div class="form-group"><label for="enqPhone">Phone Number *</label>
          <input type="tel" id="enqPhone" required maxlength="20" inputmode="tel" placeholder="+91 98765 43210" autocomplete="tel"></div>
        <div class="form-group"><label for="enqEmail">Email Address</label>
          <input type="email" id="enqEmail" maxlength="200" placeholder="yourname@company.com" autocomplete="email"></div>
        <div class="form-group"><label for="enqProduct">Product of Interest</label>
          <select id="enqProduct"><option value="">Select (optional)</option></select></div>
        <div class="form-group"><label for="enqQty">Approximate Quantity</label>
          <input type="number" id="enqQty" min="1" max="10000000" placeholder="e.g. 100"></div>
        <div class="form-group"><label for="enqNotes">Specific Requirements / Notes</label>
          <textarea id="enqNotes" rows="3" maxlength="3000" placeholder="Tell us sizes, material, delivery timeline..."></textarea></div>
        <p class="form-error" id="enqError" role="alert" hidden></p>
        <button type="submit" class="btn btn-primary btn-block" id="enqSubmit">Send Enquiry</button>
      </form>
    </div>
  </div>
  <div class="toast" id="toastNotification" role="status" aria-live="polite"></div>`;

  function mountLayout() {
    document.body.insertAdjacentHTML('afterbegin',
      '<a class="skip-link" href="#main">Skip to content</a>' + window.BPS_HTML.top + HEADER());
    if (!document.getElementById('footer')) document.body.insertAdjacentHTML('beforeend', window.BPS_HTML.foot);
    document.body.insertAdjacentHTML('beforeend', OVERLAYS);
    document.querySelectorAll('a[aria-label="WhatsApp"]').forEach(a => { a.href = BPS.whatsappUrl('Hello Bhima Print Solutions'); a.target = '_blank'; a.rel = 'noopener'; });
    document.querySelectorAll('a[href="account.html#orders"]').forEach(a => { a.href = BPS.whatsappUrl('Hello Bhima Print Solutions, I would like an update on my order.'); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Order Help (WhatsApp)'; });
    const footerYear = document.getElementById('copyYear');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
    renderNavCategories(STATIC_CATS);
  }

  const STATIC_CATS = [
    ['business-cards', 'Business Cards'], ['apparel', 'T-Shirts & Apparel'], ['gifts', 'Gifts & Drinkware'],
    ['packaging', 'Packaging'], ['stationery', 'Stationery'], ['signage', 'Signage & Banners']
  ];
  function renderNavCategories(list) {
    const el = document.getElementById('navCategories');
    if (el) el.innerHTML = list.map(([slug, name]) => `<a href="products.html?cat=${encodeURIComponent(slug)}">${BPS.esc(name)}</a>`).join('');
  }

  /* ------------------------------------------------------------- cart drawer */
  function renderCart() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const items = readCart();
    badge.textContent = BPS.cart.count();
    document.getElementById('drawerCartCount').textContent = BPS.cart.count();
    const list = document.getElementById('cartItemsList');
    const checkout = document.getElementById('cartCheckoutBtn');
    if (!items.length) {
      list.innerHTML = `<div class="empty-cart-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.5" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Your cart is empty.</p><a href="products.html" class="btn btn-primary">Explore Products</a></div>`;
      document.getElementById('cartSubtotalPrice').textContent = '₹0';
      checkout.setAttribute('aria-disabled', 'true'); checkout.classList.add('disabled');
      return;
    }
    checkout.removeAttribute('aria-disabled'); checkout.classList.remove('disabled');
    list.innerHTML = items.map(i => `
      <div class="cart-item-row">
        <img class="cart-thumb" src="${BPS.esc(BPS.img(i.image))}" alt="">
        <div class="cart-item-main">
          <a class="cart-item-title" href="product.html?slug=${encodeURIComponent(i.slug)}">${BPS.esc(i.name)}</a>
          <div class="cart-item-price">from ${BPS.money(i.price)}</div>
          <div class="qty-stepper" role="group" aria-label="Quantity for ${BPS.esc(i.name)}">
            <button type="button" data-qty="-1" data-id="${i.id}" aria-label="Decrease quantity">−</button>
            <span aria-live="polite">${i.qty}</span>
            <button type="button" data-qty="1" data-id="${i.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-remove" data-remove="${i.id}" aria-label="Remove ${BPS.esc(i.name)}">✕</button>
      </div>`).join('');
    document.getElementById('cartSubtotalPrice').textContent = 'from ' + BPS.money(BPS.cart.subtotal());
  }

  let lastFocused = null;
  BPS.toggleCartDrawer = function (force) {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    const open = typeof force === 'boolean' ? force : !drawer.classList.contains('active');
    drawer.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) { lastFocused = document.activeElement; document.getElementById('cartCloseBtn').focus(); }
    else if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  /* ------------------------------------------------------------- enquiry modal */
  let productOptionsLoaded = false;
  async function loadProductOptions() {
    if (productOptionsLoaded) return;
    productOptionsLoaded = true;
    const sel = document.getElementById('enqProduct');
    try {
      const { data } = await sb.from('products').select('name').eq('is_active', true).order('sort_order');
      const names = (data || []).map(p => p.name).concat(['Bulk corporate merchandise', 'Something else']);
      sel.insertAdjacentHTML('beforeend', names.map(n => `<option value="${BPS.esc(n)}">${BPS.esc(n)}</option>`).join(''));
    } catch (e) {
      sel.insertAdjacentHTML('beforeend', '<option value="Something else">Something else</option>');
    }
  }
  BPS.openEnquiryModal = function (title, opts) {
    opts = opts || {};
    const modal = document.getElementById('enquiryModal');
    document.getElementById('modalTitle').textContent = title || 'Get a Custom Quote';
    document.getElementById('enquirySuccess').hidden = true;
    document.getElementById('enquiryForm').hidden = false;
    document.getElementById('enqError').hidden = true;
    loadProductOptions().then(() => {
      if (opts.product) document.getElementById('enqProduct').value = opts.product;
    });
    const u = BPS.user();
    if (u) {
      const nameEl = document.getElementById('enqName'), phoneEl = document.getElementById('enqPhone'), mailEl = document.getElementById('enqEmail');
      if (!nameEl.value && BPS.profile && BPS.profile.full_name) nameEl.value = BPS.profile.full_name;
      if (!phoneEl.value && BPS.profile && BPS.profile.phone) phoneEl.value = BPS.profile.phone;
      if (!mailEl.value) mailEl.value = u.email || '';
    }
    lastFocused = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('enqName').focus(), 60);
  };
  BPS.closeEnquiryModal = function () {
    const modal = document.getElementById('enquiryModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };
  async function submitEnquiry(e) {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const err = document.getElementById('enqError');
    const btn = document.getElementById('enqSubmit');
    err.hidden = true;
    const name = v('enqName'), phone = v('enqPhone'), email = v('enqEmail');
    if (name.length < 2) return showErr('Please enter your name.');
    if (!/^[+0-9][0-9 +\-]{6,18}$/.test(phone)) return showErr('Please enter a valid phone number (digits, spaces, + or -).');
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return showErr('Please enter a valid email address.');
    const qty = parseInt(v('enqQty'), 10);
    btn.disabled = true; btn.textContent = 'Sending…';
    const payload = {
      user_id: BPS.user() ? BPS.user().id : null,
      name, phone, email: email || null,
      enquiry_type: document.getElementById('modalTitle').textContent.slice(0, 120),
      product_interest: v('enqProduct') || null,
      quantity: Number.isFinite(qty) && qty > 0 ? qty : null,
      message: v('enqNotes') || null
    };
    const { error } = await sb.from('enquiries').insert(payload);
    btn.disabled = false; btn.textContent = 'Send Enquiry';
    if (error) return showErr('We could not send your enquiry: ' + BPS.errMsg(error));
    document.getElementById('enquiryForm').reset();
    document.getElementById('enquiryForm').hidden = true;
    document.getElementById('enquirySuccessMsg').textContent = `Thank you, ${name}. Our team will contact you on ${phone}.`;
    document.getElementById('enquirySuccess').hidden = false;
    function showErr(m) { err.textContent = m; err.hidden = false; }
  }

  /* -------------------------------------------------------- header behaviour */
  function updateAccountUI() {
    const a = document.getElementById('accountBtn');
    const m = document.getElementById('mobileAccountLink');
    if (!a) return;
    if (BPS.session) {
      a.href = 'account.html';
      a.setAttribute('aria-label', 'My account');
      a.classList.add('logged-in');
      if (m) { m.href = 'account.html'; m.textContent = BPS.isAdmin() ? 'My Account (Admin)' : 'My Account'; }
    } else {
      a.href = 'login.html';
      a.setAttribute('aria-label', 'Log in or sign up');
      a.classList.remove('logged-in');
      if (m) { m.href = 'login.html'; m.textContent = 'Log in / Sign up'; }
    }
  }
  function closeMobileNav() {
    const btn = document.getElementById('mobileMenuBtn'), nav = document.getElementById('mobileNav');
    if (!nav || nav.hidden) return;
    nav.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); btn.classList.remove('open');
  }
  function bindChrome() {
    const btn = document.getElementById('mobileMenuBtn'), nav = document.getElementById('mobileNav');
    btn.addEventListener('click', () => {
      const open = nav.hidden;
      nav.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.classList.toggle('open', open);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeMobileNav(); });

    document.getElementById('cartToggleBtn').addEventListener('click', () => BPS.toggleCartDrawer());
    document.getElementById('cartOverlay').addEventListener('click', () => BPS.toggleCartDrawer(false));
    document.getElementById('cartCloseBtn').addEventListener('click', () => BPS.toggleCartDrawer(false));
    document.getElementById('cartCheckoutBtn').addEventListener('click', e => {
      if (!BPS.cart.count()) { e.preventDefault(); BPS.toast('Your cart is empty.'); }
    });
    document.getElementById('cartItemsList').addEventListener('click', e => {
      const q = e.target.closest('[data-qty]');
      if (q) {
        const it = BPS.cart.items().find(i => i.id === q.dataset.id);
        if (it) BPS.cart.setQty(it.id, it.qty + parseInt(q.dataset.qty, 10));
        return;
      }
      const r = e.target.closest('[data-remove]');
      if (r) BPS.cart.remove(r.dataset.remove);
    });

    const modal = document.getElementById('enquiryModal');
    document.getElementById('modalCloseBtn').addEventListener('click', BPS.closeEnquiryModal);
    document.getElementById('enquiryDoneBtn').addEventListener('click', BPS.closeEnquiryModal);
    modal.addEventListener('click', e => { if (e.target === modal) BPS.closeEnquiryModal(); });
    document.getElementById('enquiryForm').addEventListener('submit', submitEnquiry);

    // Search: pages may register BPS.onSearch for live filtering; otherwise Enter goes to the catalog.
    ['searchInput', 'searchInputMobile'].forEach(id => {
      const input = document.getElementById(id);
      input.addEventListener('input', () => {
        document.querySelectorAll('#searchInput, #searchInputMobile').forEach(i => { if (i !== input) i.value = input.value; });
        if (BPS.onSearch) BPS.onSearch(input.value);
      });
    });
    ['searchForm', 'mobileSearchForm'].forEach(id => {
      document.getElementById(id).addEventListener('submit', e => {
        e.preventDefault();
        const val = (document.getElementById('searchInput').value || document.getElementById('searchInputMobile').value).trim();
        if (BPS.onSearch) { BPS.onSearch(val); closeMobileNav(); }
        else location.href = 'products.html' + (val ? '?q=' + encodeURIComponent(val) : '');
      });
    });
    const q = BPS.qs('q');
    if (q) document.querySelectorAll('#searchInput, #searchInputMobile').forEach(i => (i.value = q));

    const header = document.querySelector('.main-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (modal.classList.contains('active')) BPS.closeEnquiryModal();
        else if (document.getElementById('cartDrawer').classList.contains('active')) BPS.toggleCartDrawer(false);
        else closeMobileNav();
      }
      if (e.key === 'Tab') {
        const layer = document.querySelector('#enquiryModal.active .modal-card') || document.querySelector('#cartDrawer.active');
        if (!layer) return;
        const f = [...layer.querySelectorAll('a[href],button:not([disabled]),input,select,textarea')].filter(x => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* Tables render as stacked cards on phones: each cell gets its column name as a label. */
  BPS.labelTables = function () {
    document.querySelectorAll('table.data-table').forEach(t => {
      if (t.dataset.labelled === String(t.rows.length)) return;
      const heads = [...t.querySelectorAll('thead th')].map(h => h.textContent.trim());
      t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => td.setAttribute('data-label', heads[i] || '')));
      t.dataset.labelled = String(t.rows.length);
    });
  };
  new MutationObserver(() => BPS.labelTables()).observe(document.body, { childList: true, subtree: true });

  /* Legacy inline handlers used by the static home markup. */
  const CAT_SLUGS = { 'Business Cards': 'business-cards', Apparel: 'apparel', Gifts: 'gifts', Packaging: 'packaging', Stationery: 'stationery', Signage: 'signage' };
  window.filterCategory = name => { location.href = CAT_SLUGS[name] ? 'products.html?cat=' + CAT_SLUGS[name] : 'products.html'; };
  window.openEnquiryModal = (t, o) => BPS.openEnquiryModal(t, o);
  window.toggleCartDrawer = () => BPS.toggleCartDrawer();

  /* ------------------------------------------------------------------- boot */
  mountLayout();
  bindChrome();
  renderCart();
  window.addEventListener('storage', e => { if (e.key === CART_KEY) { renderCart(); document.dispatchEvent(new CustomEvent('bps:cart')); } });

  BPS.ready = (async function () {
    try {
      const { data } = await sb.auth.getSession();
      BPS.session = data.session;
      await loadProfile();
      await BPS.wishlist.load();
    } catch (e) { /* offline or Supabase unreachable: site still renders as a guest */ }
    updateAccountUI();
    BPS.categories().then(c => renderNavCategories(c.map(x => [x.slug, x.name]))).catch(() => {});
    sb.auth.onAuthStateChange((evt, sess) => {
      setTimeout(async () => {
        BPS.session = sess;
        await loadProfile();
        await BPS.wishlist.load();
        updateAccountUI();
        document.dispatchEvent(new CustomEvent('bps:auth'));
      }, 0);
    });
  })();
})();
