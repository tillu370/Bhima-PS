/** Catalog page: category pills, search (?q=), sort, all from Supabase. */
(function () {
  'use strict';
  const grid = document.getElementById('productsGrid');
  const pills = document.getElementById('filterPills');
  const stateBox = document.getElementById('productsState');
  const count = document.getElementById('resultCount');
  const sortSel = document.getElementById('sortSelect');
  let products = [], cats = [];
  let cat = BPS.qs('cat') || 'all';
  let q = BPS.qs('q') || '';

  function skeletons() {
    grid.innerHTML = Array.from({ length: 8 }, () => '<div class="product-card skeleton" aria-hidden="true"><div class="product-img-box"></div><div class="sk-line"></div><div class="sk-line short"></div></div>').join('');
  }
  function syncUrl() {
    const p = new URLSearchParams();
    if (cat !== 'all') p.set('cat', cat);
    if (q) p.set('q', q);
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }
  function renderPills() {
    const list = [{ slug: 'all', name: 'All' }].concat(cats);
    pills.innerHTML = list.map(c => `<button class="pill-btn${c.slug === cat ? ' active' : ''}" data-cat="${BPS.esc(c.slug)}" aria-pressed="${c.slug === cat}">${BPS.esc(c.name)}</button>`).join('');
  }
  function visible() {
    const term = q.trim().toLowerCase();
    const list = products.filter(p => {
      const inCat = cat === 'all' || (p.categories && p.categories.slug === cat);
      const hay = (p.name + ' ' + (p.description || '') + ' ' + (p.categories ? p.categories.name : '')).toLowerCase();
      return inCat && (!term || hay.includes(term));
    });
    const s = sortSel.value;
    if (s === 'price-asc') list.sort((a, b) => a.price_from - b.price_from);
    else if (s === 'price-desc') list.sort((a, b) => b.price_from - a.price_from);
    else if (s === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (s === 'new') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }
  function render() {
    const list = visible();
    renderPills();
    grid.innerHTML = list.map(BPS.productCard).join('');
    grid.hidden = !list.length;
    count.textContent = `${list.length} product${list.length === 1 ? '' : 's'}${q ? ` for "${q}"` : ''}`;
    if (!list.length) {
      stateBox.hidden = false;
      stateBox.innerHTML = `<h3>No products found</h3><p>${q ? 'Try a different search word or category.' : 'There are no products in this category yet.'}</p><button class="btn btn-primary" id="resetFilters">Show all products</button>`;
      document.getElementById('resetFilters').addEventListener('click', () => {
        cat = 'all'; q = '';
        document.querySelectorAll('#searchInput,#searchInputMobile').forEach(i => (i.value = ''));
        syncUrl(); render();
      });
    } else stateBox.hidden = true;
    const c = cats.find(x => x.slug === cat);
    document.title = (c ? c.name : 'All Products') + ' | Bhima Print Solutions';
  }
  async function load() {
    skeletons(); stateBox.hidden = true; grid.hidden = false;
    try {
      const [c, res] = await Promise.all([
        BPS.categories(),
        BPS.sb.from('products').select('id,slug,name,description,price_from,image_url,created_at,sort_order,categories(slug,name)').eq('is_active', true).order('sort_order')
      ]);
      if (res.error) throw res.error;
      cats = c; products = res.data;
      await BPS.ready;
      render();
    } catch (e) {
      grid.innerHTML = ''; count.textContent = '';
      stateBox.hidden = false;
      stateBox.innerHTML = `<h3>We couldn't load products</h3><p>${BPS.esc(BPS.errMsg(e))}</p><button class="btn btn-primary" id="retry">Try again</button>`;
      document.getElementById('retry').addEventListener('click', load);
    }
  }
  pills.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { cat = b.dataset.cat; syncUrl(); render(); } });
  sortSel.addEventListener('change', render);
  BPS.onSearch = v => { q = v; syncUrl(); render(); };
  grid.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { const p = products.find(x => x.id === add.dataset.add); if (p) BPS.addToCart(p, add); return; }
    const wish = e.target.closest('[data-wish]');
    if (wish) BPS.wishlist.toggle(wish.dataset.wish, wish);
  });
  document.addEventListener('bps:auth', () => { if (products.length) render(); });
  load();
})();
