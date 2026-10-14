/** Checkout = send the cart to Bhima Print on WhatsApp. No login, no payment, nothing is stored. */
(function () {
  'use strict';
  const root = document.getElementById('checkoutRoot');

  function gate(title, text, btn) {
    root.innerHTML = `<div class="state-box"><h2>${title}</h2><p>${text}</p>${btn}</div>`;
  }

  async function init() {
    let items = BPS.cart.items();
    if (!items.length) return gate('Your cart is empty', 'Add something to your cart first.', `<a class="btn btn-primary" href="products.html">Explore Products</a>`);
    try { items = await BPS.cart.refresh(); } catch (e) { /* keep saved prices */ }
    if (!items.length) return gate('Your cart is empty', 'The items in your cart are no longer available.', `<a class="btn btn-primary" href="products.html">Explore Products</a>`);
    await BPS.ready;
    render(items);
  }

  function render(items) {
    const prof = BPS.profile || {};
    const total = items.reduce((n, i) => n + i.qty * i.price, 0);
    root.innerHTML = `
      <div class="cart-layout">
        <form class="form-card" id="checkoutForm" novalidate>
          <h2>Your details</h2>
          <p class="form-error" id="coError" role="alert" hidden></p>
          <div class="field-row">
            <div class="field"><label for="coName">Full name *</label><input id="coName" required maxlength="100" autocomplete="name" value="${BPS.esc(prof.full_name || '')}"></div>
            <div class="field"><label for="coPhone">Phone *</label><input id="coPhone" type="tel" required maxlength="20" autocomplete="tel" value="${BPS.esc(prof.phone || '')}"></div>
          </div>
          <div class="field"><label for="coAddress">Delivery address</label><textarea id="coAddress" maxlength="300" autocomplete="street-address" placeholder="House / flat no., street, area, city, PIN code"></textarea></div>
          <div class="field"><label for="coNotes">Notes</label><textarea id="coNotes" maxlength="1000" placeholder="Delivery timeline, artwork details, anything we should know"></textarea></div>
          <button class="btn btn-primary btn-block" type="submit" id="placeBtn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send Order on WhatsApp
          </button>
        </form>
        <aside class="summary-card">
          <h2>Your items</h2>
          ${items.map(i => `<div class="mini-item"><span>${BPS.esc(i.name)} × ${i.qty}</span><span>from ${BPS.money(i.qty * i.price)}</span></div>`).join('')}
          <div class="sum-row total"><span>Estimated total</span><span>from ${BPS.money(total)}</span></div>
          <p class="summary-note">This opens WhatsApp with your order already written. Press Send there. We reply to confirm the final price, delivery and payment before we start printing. No payment is taken on this website.</p>
          <a class="link-btn" href="cart.html">← Edit cart</a>
        </aside>
      </div>`;
    document.getElementById('checkoutForm').addEventListener('submit', e => submit(e, items, total));
  }

  function submit(e, items, total) {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const err = document.getElementById('coError');
    const fail = m => { err.textContent = m; err.hidden = false; };
    err.hidden = true;
    if (v('coName').length < 2) return fail('Please enter your name.');
    if (!/^[+0-9][0-9 +\-]{6,18}$/.test(v('coPhone'))) return fail('Please enter a valid phone number.');

    const lines = items.map((i, n) =>
      `${n + 1}. ${i.name} × ${i.qty} (from ${BPS.money(i.price)} each)` + (i.notes ? `\n   Notes: ${i.notes}` : ''));
    const msg = [
      'Hello Bhima Print Solutions, I would like to order:',
      '',
      ...lines,
      '',
      `Estimated total: from ${BPS.money(total)} (starting prices)`,
      '',
      `Name: ${v('coName')}`,
      `Phone: ${v('coPhone')}`,
      v('coAddress') ? `Address: ${v('coAddress')}` : null,
      v('coNotes') ? `Notes: ${v('coNotes')}` : null
    ].filter(x => x !== null).join('\n');

    // Keep the cart until the customer has actually sent the message; they can clear it from the cart page.
    const w = window.open(BPS.whatsappUrl(msg), '_blank', 'noopener');
    if (!w) location.href = BPS.whatsappUrl(msg);
    root.querySelector('.summary-note').insertAdjacentHTML('afterend',
      '<p class="form-ok" role="status">WhatsApp should be open now. If it did not open, <a class="link-btn" href="' + BPS.esc(BPS.whatsappUrl(msg)) + '" target="_blank" rel="noopener">tap here</a>. After you send it, <button type="button" class="link-btn" id="clearCart">clear your cart</button>.</p>');
    document.getElementById('clearCart').onclick = () => { BPS.cart.clear(); location.href = 'products.html'; };
  }
  init();
})();
