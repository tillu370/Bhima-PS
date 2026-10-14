/** Product detail page (?slug=...). */
(function () {
  'use strict';
  const root = document.getElementById('productRoot');
  const slug = BPS.qs('slug');

  function notFound(msg) {
    document.title = 'Product not found | Bhima Print Solutions';
    root.innerHTML = `<div class="state-box"><h2>${BPS.esc(msg || 'Product not found')}</h2><p>It may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="products.html">Browse all products</a></div>`;
  }

  async function load() {
    if (!slug) return notFound();
    try {
      const { data: p, error } = await BPS.sb.from('products')
        .select('id,slug,name,description,price_from,image_url,categories(slug,name)').eq('slug', slug).eq('is_active', true).maybeSingle();
      if (error) throw error;
      if (!p) return notFound();
      await BPS.ready;
      render(p);
      loadRelated(p);
    } catch (e) {
      root.innerHTML = `<div class="state-box"><h2>We couldn't load this product</h2><p>${BPS.esc(BPS.errMsg(e))}</p><button class="btn btn-primary" id="retry">Try again</button></div>`;
      document.getElementById('retry').addEventListener('click', load);
    }
  }

  function render(p) {
    document.title = p.name + ' | Bhima Print Solutions';
    document.getElementById('crumbName').textContent = p.name;
    const wished = BPS.wishlist.has(p.id);
    root.innerHTML = `
      <div class="pd-grid">
        <div class="pd-image"><img src="${BPS.esc(BPS.img(p.image_url))}" alt="${BPS.esc(p.name)}"></div>
        <div class="pd-info">
          ${p.categories ? `<a class="eyebrow" href="products.html?cat=${encodeURIComponent(p.categories.slug)}">${BPS.esc(p.categories.name)}</a>` : ''}
          <h1>${BPS.esc(p.name)}</h1>
          <div class="pd-price"><span>Starting from</span><strong>${BPS.money(p.price_from)}</strong></div>
          <p class="pd-desc">${BPS.esc(p.description || '')}</p>
          <p class="pd-note">This is a starting price. Final price depends on quantity, size and finish. We confirm it with you before we begin printing.</p>
          <div class="pd-actions">
            <div class="qty-stepper" role="group" aria-label="Quantity">
              <button type="button" id="qMinus" aria-label="Decrease quantity">−</button>
              <input id="qty" type="number" min="1" max="100000" value="1" aria-label="Quantity">
              <button type="button" id="qPlus" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-primary" id="addBtn">Add to Cart</button>
            <button class="wish-big${wished ? ' active' : ''}" id="wishBtn" aria-label="Save to wishlist" aria-pressed="${wished}">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
          <div class="pd-actions">
            <button class="btn btn-secondary" id="buyBtn">Buy Now</button>
            <button class="btn btn-secondary" id="askBtn">Ask About This Product</button>
          </div>
        </div>
      </div>
      <section class="related" id="related" hidden><h2>You might also like</h2><div class="products-grid" id="relatedGrid"></div></section>`;

    const qty = document.getElementById('qty');
    const getQty = () => Math.max(1, Math.min(100000, parseInt(qty.value, 10) || 1));
    document.getElementById('qMinus').onclick = () => (qty.value = Math.max(1, getQty() - 1));
    document.getElementById('qPlus').onclick = () => (qty.value = getQty() + 1);
    qty.addEventListener('change', () => (qty.value = getQty()));
    document.getElementById('addBtn').onclick = e => {
      const b = e.currentTarget;
      BPS.cart.add(p, getQty());
      BPS.toast(`Added ${getQty()} × "${p.name}" to your cart`);
      b.textContent = 'Added ✓';
      setTimeout(() => (b.textContent = 'Add to Cart'), 1300);
    };
    document.getElementById('buyBtn').onclick = () => { BPS.cart.add(p, getQty()); location.href = 'checkout.html'; };
    document.getElementById('askBtn').onclick = () => BPS.openEnquiryModal('Question about ' + p.name, { product: p.name });
    document.getElementById('wishBtn').onclick = e => BPS.wishlist.toggle(p.id, e.currentTarget);
  }

  async function loadRelated(p) {
    if (!p.categories) return;
    const { data } = await BPS.sb.from('products').select('id,slug,name,price_from,image_url,categories!inner(slug,name)')
      .eq('is_active', true).eq('categories.slug', p.categories.slug).neq('id', p.id).limit(4);
    const list = data || [];
    if (!list.length) return;
    const sec = document.getElementById('related'), g = document.getElementById('relatedGrid');
    sec.hidden = false;
    g.innerHTML = list.map(BPS.productCard).join('');
    g.addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      if (add) { BPS.addToCart(list.find(x => x.id === add.dataset.add), add); return; }
      const wish = e.target.closest('[data-wish]');
      if (wish) BPS.wishlist.toggle(wish.dataset.wish, wish);
    });
  }
  load();
})();
