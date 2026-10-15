export const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const fmtDate = d =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#eef2f6"/><text x="200" y="210" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#94a3b8">No image</text></svg>');

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
