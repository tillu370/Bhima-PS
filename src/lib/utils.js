export const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const fmtDate = d =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Branded tile shown until a product photo is uploaded.
export const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8ec"/><stop offset="1" stop-color="#ffe9c4"/></linearGradient>' +
  '<linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1b3f"/><stop offset="1" stop-color="#0f7f7a"/></linearGradient>' +
  '<pattern id="d" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="#f7a81b" opacity=".28"/></pattern></defs>' +
  '<rect width="400" height="400" fill="url(#g)"/><rect width="400" height="400" fill="url(#d)"/>' +
  '<g transform="translate(156 128)"><rect width="88" height="88" rx="24" fill="url(#m)"/>' +
  '<path d="M29 25v38M29 25h17a10.5 10.5 0 0 1 0 21H29M29 46h20a10.5 10.5 0 0 1 0 21H29" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 -3) scale(.98)"/>' +
  '<circle cx="66" cy="64" r="5.5" fill="#f7a81b"/></g>' +
  '<text x="200" y="262" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="21" fill="#0b1b3f">Photo coming soon</text></svg>');

// price_from is null for items priced on request.
export const hasPrice = v => v !== null && v !== undefined && v !== '';
export const priceText = v => (hasPrice(v) ? money(v) : 'On request');

// Product images are stored as "./images/x.jpg" (local) or full https URLs (uploaded to Supabase Storage).
export const imgUrl = u => {
  if (!u) return PLACEHOLDER_IMG;
  if (/^(https?:|data:|\/)/.test(u)) return u;
  return '/' + u.replace(/^\.?\/?/, '');
};

export const errMsg = e => (e && (e.message || e.error_description)) || 'Something went wrong. Please try again.';

export const slugify = s =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export const PHONE_RE = /^[+0-9][0-9 +-]{6,18}$/;
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Cart wording that works for priced items and "price on request" items.
export const eachText = i => (hasPrice(i.price) ? `from ${money(i.price)} each` : 'Price on request');
export const lineText = i => (hasPrice(i.price) ? `from ${money(i.qty * i.price)}` : 'On request');
export const totalText = cart => {
  if (!cart.hasPriced) return 'Price on request';
  return `from ${money(cart.subtotal)}` + (cart.hasUnpriced ? ' + items on request' : '');
};
