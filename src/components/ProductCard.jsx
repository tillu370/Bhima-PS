import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { errMsg, hasPrice, imgUrl, money } from '../lib/utils.js';

export function ProductCard({ product: p }) {
  const { wishlist, toggleWishlist } = useAuth();
  const cart = useCart();
  const { toast } = useUi();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const wished = wishlist.has(p.id);
  const href = '/product/' + encodeURIComponent(p.slug);

  const add = () => {
    cart.add(p, 1);
    toast(`Added "${p.name}" to your cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  const wish = async () => {
    const r = await toggleWishlist(p.id);
    if (r.status === 'login') { toast('Please log in to save items to your wishlist.'); setTimeout(() => navigate('/login?next=' + encodeURIComponent(location.pathname + location.search)), 900); }
    else if (r.status === 'error') toast(errMsg(r.error), 'error');
    else toast(r.status === 'added' ? 'Saved to your wishlist' : 'Removed from wishlist');
  };

  return (
    <article className="product-card" data-category={p.categories ? p.categories.name : ''}>
      <button className={'wishlist-btn' + (wished ? ' active' : '')} onClick={wish} aria-label={`Save ${p.name} to wishlist`} aria-pressed={wished}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      </button>
      <Link className="product-img-box" to={href} aria-label={`View ${p.name}`}>
        <img loading="lazy" decoding="async" src={imgUrl(p.image_url, p.categories?.slug)} alt={p.name} />
      </Link>
      <div className="product-info">
        <h3 className="product-title"><Link to={href}>{p.name}</Link></h3>
        <div className="product-bottom">
          {hasPrice(p.price_from)
            ? <span className="product-price"><strong>{money(p.price_from)}</strong> <small>onwards</small></span>
            : <span className="product-price"><strong className="on-request">Ask price</strong> <small>on request</small></span>}
          <button className={'btn-add' + (added ? ' added' : '')} onClick={add}>{added ? 'Added' : 'Add'}</button>
        </div>
      </div>
    </article>
  );
}

export function ProductSkeletons({ n = 8 }) {
  return Array.from({ length: n }, (_, i) => (
    <div className="product-card skeleton" aria-hidden="true" key={i}>
      <div className="product-img-box" /><div className="sk-line" /><div className="sk-line short" />
    </div>
  ));
}
