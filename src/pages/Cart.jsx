import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { imgUrl, money } from '../lib/utils.js';

export default function Cart() {
  const cart = useCart();
  const { toast } = useUi();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = 'Your Cart | Bhima Printing Solutions';
    cart.refresh().catch(() => toast("Couldn't refresh prices. Showing saved prices.", 'error')).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHero title="Your Cart" subtitle="Check your items, then send your order on WhatsApp." />
      <PageSection>
        {!ready ? <div className="sk-block" style={{ minHeight: 220 }} /> : cart.items.length === 0 ? (
          <StateBox title="Your cart is empty" action={<Link className="btn btn-primary" to="/products">Explore Products</Link>}>Browse our products and add something you like.</StateBox>
        ) : (
          <div className="cart-layout">
            <div>
              {cart.items.map(i => (
                <article className="cart-line" key={i.id}>
                  <img src={imgUrl(i.image)} alt="" />
                  <div>
                    <h3><Link to={'/product/' + encodeURIComponent(i.slug)}>{i.name}</Link></h3>
                    <p className="muted">from {money(i.price)} each</p>
                    <div className="qty-stepper" role="group" aria-label={`Quantity for ${i.name}`} style={{ marginTop: 10 }}>
                      <button type="button" onClick={() => cart.setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">−</button>
                      <input type="number" min="1" max="100000" value={i.qty} onChange={e => cart.setQty(i.id, e.target.value)} aria-label="Quantity" />
                      <button type="button" onClick={() => cart.setQty(i.id, i.qty + 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <textarea maxLength={500} value={i.notes || ''} onChange={e => cart.setNotes(i.id, e.target.value)} placeholder="Customisation notes (size, colour, text, artwork link…)" aria-label={`Notes for ${i.name}`} />
                    <button type="button" className="link-btn" style={{ marginTop: 8 }} onClick={() => cart.remove(i.id)}>Remove</button>
                  </div>
                  <div className="line-total">from {money(i.qty * i.price)}</div>
                </article>
              ))}
              <Link className="link-btn" to="/products">← Continue shopping</Link>
            </div>
            <aside className="summary-card">
              <h2>Order summary</h2>
              <div className="sum-row"><span>Items</span><span>{cart.count}</span></div>
              <div className="sum-row total"><span>Estimated total</span><span>from {money(cart.subtotal)}</span></div>
              <Link className="btn btn-primary btn-block" to="/checkout">Order on WhatsApp</Link>
              <p className="summary-note">These are starting prices. Delivery charges and the final price are confirmed by our team before production. No payment is taken on this website. You send your order to us on WhatsApp.</p>
            </aside>
          </div>
        )}
      </PageSection>
    </>
  );
}
