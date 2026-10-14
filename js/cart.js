/** Cart page: quantities, per-item notes, live re-pricing from Supabase. */
(function () {
  'use strict';
  const root = document.getElementById('cartRoot');
  let items = [];

  function emptyState() {
    root.innerHTML = `<div class="state-box"><h2>Your cart is empty</h2><p>Browse our products and add something you like.</p><a class="btn btn-primary" href="products.html">Explore Products</a></div>`;
  }

  function render() {
    items = BPS.cart.items();
    if (!items.length) return emptyState();
    const total = BPS.cart.subtotal();
    root.innerHTML = `
      <div class="cart-layout">
        <div id="lines">
          ${items.map(i => `
            <article class="cart-line" data-id="${i.id}">
              <img src="${BPS.esc(BPS.img(i.image))}" alt="">
              <div>
                <h3><a href="product.html?slug=${encodeURIComponent(i.slug)}">${BPS.esc(i.name)}</a></h3>
                <p class="muted">from ${BPS.money(i.price)} each</p>
                <div class="qty-stepper" role="group" aria-label="Quantity for ${BPS.esc(i.name)}" style="margin-top:10px">
                  <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
                  <input type="number" min="1" max="100000" value="${i.qty}" data-qty-input aria-label="Quantity">
                  <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
                </div>
                <textarea data-notes maxlength="500" placeholder="Customisation notes (size, colour, text, artwork link…)" aria-label="Notes for ${BPS.esc(i.name)}">${BPS.esc(i.notes || '')}</textarea>
                <button type="button" class="link-btn" data-remove style="margin-top:8px">Remove</button>
              </div>
              <div class="line-total">from ${BPS.money(i.qty * i.price)}</div>
            </article>`).join('')}
          <a class="link-btn" href="products.html">← Continue shopping</a>
        </div>
        <aside class="summary-card">
          <h2>Order summary</h2>
          <div class="sum-row"><span>Items</span><span>${BPS.cart.count()}</span></div>
          <div class="sum-row total"><span>Estimated total</span><span>from ${BPS.money(total)}</span></div>
          <a class="btn btn-primary btn-block" href="checkout.html">Order on WhatsApp</a>
          <p class="summary-note">These are starting prices. Delivery charges and the final price are confirmed by our team before production. No payment is taken on this website. You send your order to us on WhatsApp.</p>
        </aside>
      </div>`;
  }

  root.addEventListener('click', e => {
    const line = e.target.closest('.cart-line');
    if (!line) return;
    const id = line.dataset.id;
    const q = e.target.closest('[data-qty]');
    if (q) { const it = items.find(i => i.id === id); BPS.cart.setQty(id, it.qty + parseInt(q.dataset.qty, 10)); return; }
    if (e.target.closest('[data-remove]')) BPS.cart.remove(id);
  });
  root.addEventListener('change', e => {
    const line = e.target.closest('.cart-line');
    if (!line) return;
    if (e.target.matches('[data-qty-input]')) BPS.cart.setQty(line.dataset.id, e.target.value);
    if (e.target.matches('[data-notes]')) BPS.cart.setNotes(line.dataset.id, e.target.value);
  });

  let busy = false;
  document.addEventListener('bps:cart', () => {
    // Re-render on any cart change, but keep typing in notes intact.
    if (busy || (document.activeElement && document.activeElement.matches('[data-notes]'))) return;
    render();
  });

  (async function init() {
    try { await BPS.cart.refresh(); } catch (e) { BPS.toast("Couldn't refresh prices. Showing saved prices.", 'error'); }
    render();
  })();
})();
