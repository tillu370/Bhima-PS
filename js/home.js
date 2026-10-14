/** Home page: featured products from Supabase, FAQ accordion, scroll reveal. */
(function () {
  'use strict';
  const grid = document.getElementById('productsGrid');
  const pills = document.getElementById('filterPills');
  const state = document.getElementById('productsState');
  let products = [], activeCat = 'all';

  function skeletons() {
    grid.innerHTML = Array.from({ length: 8 }, () => '<div class="product-card skeleton" aria-hidden="true"><div class="product-img-box"></div><div class="sk-line"></div><div class="sk-line short"></div></div>').join('');
  }
  function showState(html) { state.innerHTML = html; state.hidden = !html; }

  function renderPills(cats) {
    const list = [{ slug: 'all', name: 'All' }].concat(cats);
    pills.innerHTML = list.map(c => `<button class="pill-btn${c.slug === activeCat ? ' active' : ''}" data-cat="${BPS.esc(c.slug)}" aria-pressed="${c.slug === activeCat}">${BPS.esc(c.name)}</button>`).join('');
  }
  function renderGrid() {
    const shown = products.filter(p => activeCat === 'all' || (p.categories && p.categories.slug === activeCat));
    grid.innerHTML = shown.map(BPS.productCard).join('');
    showState(shown.length ? '' : '<p>No products in this category yet.</p>');
    pills.querySelectorAll('.pill-btn').forEach(b => {
      const on = b.dataset.cat === activeCat;
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
    });
  }

  async function loadProducts() {
    skeletons(); showState('');
    try {
      const [cats, res] = await Promise.all([
        BPS.categories(),
        BPS.sb.from('products').select('id,slug,name,price_from,image_url,categories(slug,name)').eq('is_active', true).eq('is_featured', true).order('sort_order').limit(8)
      ]);
      if (res.error) throw res.error;
      products = res.data;
      await BPS.ready;
      renderPills(cats);
      renderGrid();
      if (!products.length) grid.innerHTML = '';
    } catch (e) {
      grid.innerHTML = '';
      showState(`<p>We couldn't load products right now. ${BPS.esc(BPS.errMsg(e))}</p><button class="btn btn-primary" id="retryProducts">Try again</button>`);
      document.getElementById('retryProducts').addEventListener('click', loadProducts);
    }
  }
  pills.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (b) { activeCat = b.dataset.cat; renderGrid(); }
  });
  // Delegate with live product list (products reassigned after load).
  grid.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { const p = products.find(x => x.id === add.dataset.add); if (p) BPS.addToCart(p, add); return; }
    const wish = e.target.closest('[data-wish]');
    if (wish) BPS.wishlist.toggle(wish.dataset.wish, wish);
  });
  document.addEventListener('bps:auth', () => { if (products.length) renderGrid(); });
  loadProducts();

  /* FAQ accordion (keyboard + aria) */
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item, i) => {
    const q = item.querySelector('.faq-question'), a = item.querySelector('.faq-answer');
    q.id = 'faq-q-' + i; a.id = 'faq-a-' + i;
    q.setAttribute('aria-controls', a.id); q.setAttribute('aria-expanded', 'false');
    a.setAttribute('role', 'region'); a.setAttribute('aria-labelledby', q.id);
    q.addEventListener('click', () => {
      const open = !item.classList.contains('active');
      items.forEach(o => { o.classList.remove('active'); o.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('active'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* Scroll reveal (disabled for reduced motion) */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) {
        const t = en.target; t.classList.add('in'); io.unobserve(t);
        setTimeout(() => { t.classList.remove('reveal', 'in'); t.style.removeProperty('--d'); }, 1400);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.section-header, .products-header, .category-card, .promo-card, .why-left, .why-card, .corporate-card, .step-card, .testimonials-grid, .testimonial-card, .faq-item, .bottom-cta-card').forEach(el => {
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min([...el.parentElement.children].indexOf(el), 7) * 0.06 + 's');
      io.observe(el);
    });
  }
})();
