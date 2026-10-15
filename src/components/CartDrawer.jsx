import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { useDialog } from '../lib/useDialog.js';
import { eachText, imgUrl, totalText } from '../lib/utils.js';

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUi();
  const cart = useCart();
  const ref = useRef(null);
  const close = () => setCartOpen(false);
  useDialog(cartOpen, close, ref);
  useEffect(() => { if (cartOpen && ref.current) ref.current.querySelector('.close-drawer-btn').focus(); }, [cartOpen]);

  const empty = cart.items.length === 0;
  return (
    <>
      <div className={'cart-drawer-overlay' + (cartOpen ? ' active' : '')} onClick={close} />
      <aside ref={ref} className={'cart-drawer' + (cartOpen ? ' active' : '')} role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden={!cartOpen}>
        <div className="cart-drawer-header">
          <h3 id="cartTitle">Your Cart ({cart.count})</h3>
          <button className="close-drawer-btn" onClick={close} aria-label="Close cart">✕</button>
        </div>
        <div className="cart-drawer-body">
          {empty ? (
            <div className="empty-cart-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1.5" aria-hidden="true"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              <p>Your cart is empty.</p>
              <Link to="/products" className="btn btn-primary" onClick={close}>Explore Products</Link>
            </div>
          ) : cart.items.map(i => (
            <div className="cart-item-row" key={i.lineId || i.id}>
              <img className="cart-thumb" src={imgUrl(i.image)} alt="" />
              <div className="cart-item-main">
                <Link className="cart-item-title" to={'/product/' + encodeURIComponent(i.slug)} onClick={close}>{i.name}</Link>
                <div className="cart-item-price">{eachText(i)}{i.design && <span className="custom-chip">Customised</span>}</div>
                <div className="qty-stepper" role="group" aria-label={`Quantity for ${i.name}`}>
                  <button type="button" onClick={() => cart.setQty(i.lineId || i.id, i.qty - 1)} aria-label="Decrease quantity">−</button>
                  <span aria-live="polite">{i.qty}</span>
                  <button type="button" onClick={() => cart.setQty(i.lineId || i.id, i.qty + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
              <button className="cart-remove" onClick={() => cart.remove(i.lineId || i.id)} aria-label={`Remove ${i.name}`}>✕</button>
            </div>
          ))}
        </div>
        <div className="cart-drawer-footer">
          <div className="cart-subtotal"><span>Estimated total:</span><strong>{empty ? '-' : totalText(cart)}</strong></div>
          <p className="cart-note">We confirm prices on WhatsApp before production.</p>
          <Link className="btn btn-secondary btn-block" to="/cart" onClick={close}>View Cart</Link>
          <Link className={'btn btn-primary btn-block btn-checkout' + (empty ? ' disabled' : '')} to="/checkout" aria-disabled={empty} onClick={e => { if (empty) e.preventDefault(); else close(); }}>Order on WhatsApp</Link>
        </div>
      </aside>
    </>
  );
}
