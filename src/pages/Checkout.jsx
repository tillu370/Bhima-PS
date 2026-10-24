import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { supabase } from '../lib/supabase.js';
import { buildWhatsAppUrl } from '../lib/whatsappData.js';
import { eachText, lineText, PHONE_RE, totalText } from '../lib/utils.js';

const WA_ICON = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

// Checkout = send the cart to Bhima Print on WhatsApp. No login, no payment. The order is also saved to the
// `orders` table so the team can track it; if saving fails the WhatsApp message is still sent.
const newRef = () => 'BPS-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const designLines = d =>
  (d.color ? `\n   Colour: ${d.color.name} (${d.color.hex})` : '') +
  (d.sizes && Object.keys(d.sizes).length ? `\n   Sizes: ${Object.entries(d.sizes).map(([s, n]) => `${s} × ${n}`).join(', ')}` : '') +
  (d.assets?.length ? `\n   Uploaded file${d.assets.length > 1 ? 's' : ''}: ${d.assets.join(' , ')}` : '\n   No file uploaded yet — we will follow up to collect the logo/design.');

export default function Checkout() {
  const cart = useCart();
  const { user, profile, ready: authReady } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [f, setF] = useState({ name: '', phone: '', address: '', notes: '' });
  const [error, setError] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    document.title = 'Checkout | Bhima Print Solutions';
    cart.refresh().catch(() => {}).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (profile) setF(cur => ({ ...cur, name: cur.name || profile.full_name || '', phone: cur.phone || profile.phone || '' }));
  }, [profile]);

  const set = k => e => setF(cur => ({ ...cur, [k]: e.target.value }));

  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (f.name.trim().length < 2) return setError('Please enter your name.');
    if (!PHONE_RE.test(f.phone.trim())) return setError('Please enter a valid phone number.');
    const ref = newRef();
    const lines = cart.items.map((i, n) => `${n + 1}. ${i.name} × ${i.qty} (${eachText(i)})` + (i.design ? designLines(i.design) : '') + (i.notes ? `\n   Notes: ${i.notes}` : ''));
    const msg = [
      `Hello Bhima Print Solutions, I would like to order / get a price for (order ${ref}):`, '',
      ...lines, '',
      `Estimated total: ${totalText(cart)}`, '',
      `Name: ${f.name.trim()}`, `Phone: ${f.phone.trim()}`,
      f.address.trim() ? `Address: ${f.address.trim()}` : null,
      f.notes.trim() ? `Notes: ${f.notes.trim()}` : null
    ].filter(x => x !== null).join('\n');
    const url = buildWhatsAppUrl(msg);
    setBusy(true);
    try {
      const { error: err } = await supabase.from('orders').insert({
        ref, user_id: user ? user.id : null, name: f.name.trim(), phone: f.phone.trim(),
        address: f.address.trim() || null, notes: f.notes.trim() || null,
        items: cart.items.map(i => ({ id: i.id, slug: i.slug, name: i.name, qty: i.qty, price: i.price, notes: i.notes || '', design: i.design || null })),
        est_total: cart.hasPriced ? cart.subtotal : null
      });
      if (err) console.warn('Order was not saved:', err.message);
    } catch (e2) { console.warn('Order was not saved:', e2); }
    setBusy(false);
    setLink(url);
    // The cart is kept until the customer has actually sent the message.
    const w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
  };

  return (
    <>
      <PageHero title="Checkout" subtitle="Send your order to us on WhatsApp. We confirm the final price with you before we start printing." />
      <PageSection>
        {!ready || !authReady ? <div className="sk-block" style={{ minHeight: 260 }} /> : cart.items.length === 0 ? (
          <StateBox title="Your cart is empty" action={<Link className="btn btn-primary" to="/products">Explore Products</Link>}>Add something to your cart first.</StateBox>
        ) : (
          <div className="cart-layout">
            <form className="form-card" onSubmit={submit} noValidate>
              <h2>Your details</h2>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="field-row">
                <div className="field"><label htmlFor="coName">Full name *</label><input id="coName" required maxLength={100} autoComplete="name" value={f.name} onChange={set('name')} /></div>
                <div className="field"><label htmlFor="coPhone">Phone *</label><input id="coPhone" type="tel" required maxLength={20} autoComplete="tel" value={f.phone} onChange={set('phone')} /></div>
              </div>
              <div className="field"><label htmlFor="coAddress">Delivery address</label><textarea id="coAddress" maxLength={300} autoComplete="street-address" placeholder="House / flat no., street, area, city, PIN code" value={f.address} onChange={set('address')} /></div>
              <div className="field"><label htmlFor="coNotes">Notes</label><textarea id="coNotes" maxLength={1000} placeholder="Delivery timeline, artwork details, anything we should know" value={f.notes} onChange={set('notes')} /></div>
              <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={WA_ICON} /></svg>
                {busy ? 'Preparing…' : 'Send Order on WhatsApp'}
              </button>
            </form>
            <aside className="summary-card">
              <h2>Your items</h2>
              {cart.items.map(i => <div className="mini-item" key={i.lineId || i.id}><span>{i.name}{i.design ? (i.design.color ? ` (${i.design.color.name})` : " (customised)") : ""} × {i.qty}</span><span>{lineText(i)}</span></div>)}
              <div className="sum-row total"><span>Estimated total</span><span style={{ textAlign: 'right' }}>{totalText(cart)}</span></div>
              <p className="summary-note">This opens WhatsApp with your order already written. Press Send there. We reply with the price, delivery and payment details before we start printing. No payment is taken on this website.</p>
              {link && (
                <p className="form-ok" role="status">
                  WhatsApp should be open now. If it did not open, <a className="link-btn" href={link} target="_blank" rel="noopener noreferrer">tap here</a>. After you send it,{' '}
                  <button type="button" className="link-btn" onClick={() => { cart.clear(); navigate('/products'); }}>clear your cart</button>.
                </p>
              )}
              <Link className="link-btn" to="/cart">← Edit cart</Link>
            </aside>
          </div>
        )}
      </PageSection>
    </>
  );
}
