import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { useCategories } from '../lib/data.js';
import { LogoMark, Wordmark } from './LogoMark.jsx';

const STATIC_CATS = [
  { slug: 'mugs-bottles', name: 'Mugs & Bottles' }, { slug: 'apparel-cushions', name: 'T-Shirts & Pillows' },
  { slug: 'frames-clocks', name: 'Photo Frames & Clocks' }, { slug: 'laser-wood', name: 'Laser & Wood Engraving' },
  { slug: 'keychains-magnets', name: 'Key Chains, Magnets & Badges' }, { slug: 'corporate-gifts', name: 'Corporate & Office Gifts' }
];

export function Header() {
  const { user, isAdmin } = useAuth();
  const cart = useCart();
  const { setCartOpen } = useUi();
  const loaded = useCategories();
  const cats = loaded.length ? loaded : STATIC_CATS;
  const loc = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onProducts = loc.pathname === '/products';
  const urlQ = new URLSearchParams(loc.search).get('q') || '';
  const [q, setQ] = useState(urlQ);

  useEffect(() => { if (onProducts) setQ(urlQ); }, [onProducts, urlQ]);
  useEffect(() => { setMenu(false); }, [loc.pathname, loc.search]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') setMenu(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  const go = (value, replace) => {
    const p = new URLSearchParams(onProducts ? loc.search : '');
    if (value) p.set('q', value); else p.delete('q');
    navigate('/products' + (p.toString() ? '?' + p : ''), { replace });
  };
  const onChange = v => { setQ(v); if (onProducts) go(v.trim(), true); };
  const onSubmit = e => { e.preventDefault(); go(q.trim(), false); setMenu(false); };

  const accountHref = user ? '/account' : '/login';
  const accountLabel = user ? 'My account' : 'Log in or sign up';

  return (
    <>
      <header className={'main-header' + (scrolled ? ' scrolled' : '')}>
        <div className="container nav-container">
          <Link to="/" className="brand-logo" aria-label="Bhima Print Solutions home">
            <div className="logo-mark"><LogoMark id="hdr" /></div>
            <Wordmark />
          </Link>

          <nav className="nav-links" aria-label="Main">
            <div className="nav-item dropdown">
              <Link to="/products" className="nav-link" aria-haspopup="true">
                Products
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </Link>
              <div className="dropdown-menu">
                {cats.map(c => <Link key={c.slug} to={`/products?cat=${encodeURIComponent(c.slug)}`}>{c.name}</Link>)}
              </div>
            </div>
            <Link to="/#for-business" className="nav-link">For Business</Link>
            <Link to="/#how-it-works" className="nav-link">Design Help</Link>
            <Link to="/#why-choose" className="nav-link">About Us</Link>
            <a href="#footer" className="nav-link">Contact</a>
          </nav>

          <div className="header-actions">
            <form className="search-box" role="search" onSubmit={onSubmit}>
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="search" value={q} onChange={e => onChange(e.target.value)} placeholder="Search for products..." autoComplete="off" aria-label="Search products" />
            </form>
            <Link className={'icon-btn' + (user ? ' logged-in' : '')} to={accountHref} aria-label={accountLabel}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </Link>
            <button className="icon-btn cart-btn" aria-label="Open cart" aria-haspopup="dialog" onClick={() => setCartOpen(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              <span className="cart-badge" aria-live="polite">{cart.count}</span>
            </button>
            <button className={'mobile-menu-btn' + (menu ? ' open' : '')} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobileNav" onClick={() => setMenu(m => !m)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <nav className="mobile-nav" id="mobileNav" aria-label="Mobile" hidden={!menu}>
        <div className="container">
          <form className="mobile-search" role="search" onSubmit={onSubmit}>
            <input type="search" value={q} onChange={e => onChange(e.target.value)} placeholder="Search for products..." autoComplete="off" aria-label="Search products" />
          </form>
          <Link to="/products">All Products</Link>
          <Link to="/#for-business">For Business</Link>
          <Link to="/#how-it-works">Design Help</Link>
          <Link to="/#why-choose">About Us</Link>
          <a href="#footer" onClick={() => setMenu(false)}>Contact</a>
          <Link to={accountHref}>{user ? (isAdmin ? 'My Account (Admin)' : 'My Account') : 'Log in / Sign up'}</Link>
        </div>
      </nav>
    </>
  );
}
