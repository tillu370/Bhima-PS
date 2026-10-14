/** My Account: wishlist, enquiries, profile. */
(function () {
  'use strict';
  const root = document.getElementById('accountRoot');
  let tab = (location.hash || '#wishlist').slice(1);
  if (!['wishlist', 'enquiries', 'profile'].includes(tab)) tab = 'wishlist';
  let counts = {};

  async function init() {
    await BPS.ready;
    if (!BPS.user()) {
      root.innerHTML = `<div class="state-box"><h2>Please log in</h2><p>Log in to see your wishlist, enquiries and profile.</p><a class="btn btn-primary" href="login.html?next=account.html">Log in or sign up</a></div>`;
      return;
    }
    root.innerHTML = `
      <div class="dash">
        <nav class="dash-nav" role="tablist" aria-label="Account sections">
          <button role="tab" data-tab="wishlist">Wishlist <span class="count" id="cWish" hidden></span></button>
          <button role="tab" data-tab="enquiries">My Enquiries</button>
          <button role="tab" data-tab="profile">Profile</button>
          ${BPS.isAdmin() ? '<a href="admin.html">Admin Dashboard →</a>' : ''}
          <button type="button" id="logoutBtn">Log out</button>
        </nav>
        <div id="panel" class="panel" role="tabpanel" tabindex="-1"></div>
      </div>`;
    root.querySelector('.dash-nav').addEventListener('click', e => {
      const t = e.target.closest('[data-tab]');
      if (t) { tab = t.dataset.tab; history.replaceState(null, '', '#' + tab); show(); }
    });
    document.getElementById('logoutBtn').onclick = () => BPS.signOut();
    show();
  }

  function setBusy(html) { document.getElementById('panel').innerHTML = html; }
  function loading() { setBusy('<div class="sk-block" style="min-height:180px"></div>'); }
  function fail(e, retry) {
    setBusy(`<div class="state-box"><h3>Something went wrong</h3><p>${BPS.esc(BPS.errMsg(e))}</p><button class="btn btn-primary" id="retry">Try again</button></div>`);
    document.getElementById('retry').onclick = retry;
  }

  function show() {
    root.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    ({ wishlist: showWishlist, enquiries: showEnquiries, profile: showProfile })[tab]();
  }

  /* --------------------------------------------------------------- wishlist */
  async function showWishlist() {
    loading();
    const { data, error } = await BPS.sb.from('wishlist').select('product_id, products(id,slug,name,price_from,image_url,is_active,categories(slug,name))').order('created_at', { ascending: false });
    if (error) return fail(error, showWishlist);
    const products = data.map(r => r.products).filter(p => p && p.is_active);
    const badge = document.getElementById('cWish');
    badge.textContent = products.length; badge.hidden = !products.length;
    if (!products.length) {
      return setBusy(`<h2>Wishlist</h2><div class="state-box"><h3>Nothing saved yet</h3><p>Tap the heart on any product to save it here.</p><a class="btn btn-primary" href="products.html">Explore Products</a></div>`);
    }
    setBusy(`<h2>Wishlist</h2><div class="products-grid" id="wGrid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${products.map(BPS.productCard).join('')}</div>`);
    document.getElementById('wGrid').onclick = async e => {
      const add = e.target.closest('[data-add]');
      if (add) { BPS.addToCart(products.find(x => x.id === add.dataset.add), add); return; }
      const wish = e.target.closest('[data-wish]');
      if (wish) { await BPS.wishlist.toggle(wish.dataset.wish, wish); showWishlist(); }
    };
  }

  /* ------------------------------------------------------------- enquiries */
  async function showEnquiries() {
    loading();
    const { data, error } = await BPS.sb.from('enquiries').select('*').eq('user_id', BPS.user().id).order('created_at', { ascending: false });
    if (error) return fail(error, showEnquiries);
    if (!data.length) {
      return setBusy(`<h2>My Enquiries</h2><div class="state-box"><h3>No enquiries yet</h3><p>Enquiries you send while logged in will appear here.</p><button class="btn btn-primary" id="newEnq">Send an enquiry</button></div>`),
        (document.getElementById('newEnq').onclick = () => BPS.openEnquiryModal('Get a Custom Quote'));
    }
    setBusy(`<div class="panel-head"><h2>My Enquiries</h2><button class="btn btn-primary btn-sm" id="newEnq">New enquiry</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>Product</th><th>Qty</th><th>Status</th></tr></thead><tbody>
      ${data.map(q => `<tr><td>${BPS.fmtDate(q.created_at)}</td><td>${BPS.esc(q.enquiry_type)}${q.message ? `<br><small style="color:#64748b">${BPS.esc(q.message.slice(0, 140))}</small>` : ''}</td><td>${BPS.esc(q.product_interest || '-')}</td><td>${q.quantity || '-'}</td><td><span class="badge ${q.status}">${q.status}</span></td></tr>`).join('')}
      </tbody></table></div>`);
    document.getElementById('newEnq').onclick = () => BPS.openEnquiryModal('Get a Custom Quote');
  }

  /* --------------------------------------------------------------- profile */
  function showProfile() {
    const p = BPS.profile || {};
    setBusy(`
      <h2>Profile</h2>
      <p class="form-error" id="pfError" role="alert" hidden></p><p class="form-ok" id="pfOk" role="status" hidden></p>
      <form id="profileForm" novalidate style="max-width:520px">
        <div class="field"><label for="pfEmail">Email</label><input id="pfEmail" value="${BPS.esc(BPS.user().email)}" disabled><span class="hint">Your login email.</span></div>
        <div class="field"><label for="pfName">Full name</label><input id="pfName" maxlength="100" value="${BPS.esc(p.full_name || '')}"></div>
        <div class="field"><label for="pfPhone">Phone</label><input id="pfPhone" type="tel" maxlength="20" value="${BPS.esc(p.phone || '')}"></div>
        <button class="btn btn-primary" type="submit" id="pfSave">Save changes</button>
      </form>
      <hr style="margin:28px 0;border:0;border-top:1.5px dashed #e3e8ef">
      <form id="pwForm" novalidate style="max-width:520px">
        <h2 style="font-size:1.2rem">Change password</h2>
        <div class="field"><label for="pwNew">New password</label><input id="pwNew" type="password" minlength="8" autocomplete="new-password"><span class="hint">At least 8 characters.</span></div>
        <button class="btn btn-secondary" type="submit">Update password</button>
      </form>`);
    const err = document.getElementById('pfError'), ok = document.getElementById('pfOk');
    const say = (el, m) => { err.hidden = true; ok.hidden = true; el.textContent = m; el.hidden = false; };
    document.getElementById('profileForm').onsubmit = async e => {
      e.preventDefault();
      const full_name = document.getElementById('pfName').value.trim(), phone = document.getElementById('pfPhone').value.trim();
      if (phone && !/^[+0-9][0-9 +\-]{6,18}$/.test(phone)) return say(err, 'Please enter a valid phone number.');
      const btn = document.getElementById('pfSave'); btn.disabled = true;
      const { error } = await BPS.sb.from('profiles').update({ full_name: full_name || null, phone: phone || null }).eq('id', BPS.user().id);
      btn.disabled = false;
      if (error) return say(err, error.message);
      BPS.profile = { ...BPS.profile, full_name, phone };
      say(ok, 'Profile saved.');
    };
    document.getElementById('pwForm').onsubmit = async e => {
      e.preventDefault();
      const pw = document.getElementById('pwNew').value;
      if (pw.length < 8) return say(err, 'Your password must be at least 8 characters.');
      const { error } = await BPS.sb.auth.updateUser({ password: pw });
      if (error) return say(err, error.message);
      document.getElementById('pwNew').value = '';
      say(ok, 'Password updated.');
    };
  }

  init();
})();
