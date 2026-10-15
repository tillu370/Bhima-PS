import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { errMsg, imgUrl, money } from '../lib/utils.js';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const { wishlist, toggleWishlist } = useAuth();
  const { toast, openEnquiry } = useUi();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState('loading'); // loading | ok | missing | error
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const load = useCallback(async () => {
    setState('loading'); setQty(1);
    try {
      const { data, error: err } = await supabase.from('products')
        .select('id,slug,name,description,price_from,image_url,categories(slug,name)').eq('slug', slug).eq('is_active', true).maybeSingle();
      if (err) throw err;
      if (!data) { setState('missing'); document.title = 'Product not found | Bhima Printing Solutions'; return; }
      setP(data); setState('ok');
      document.title = data.name + ' | Bhima Printing Solutions';
      if (data.categories) {
        const r = await supabase.from('products').select('id,slug,name,price_from,image_url,categories!inner(slug,name)')
          .eq('is_active', true).eq('categories.slug', data.categories.slug).neq('id', data.id).limit(4);
        setRelated(r.data || []);
      } else setRelated([]);
    } catch (e) { setError(errMsg(e)); setState('error'); }
  }, [slug]);
  useEffect(() => { load(); }, [load]);

  const clamp = v => Math.max(1, Math.min(100000, parseInt(v, 10) || 1));
  const wished = p ? wishlist.has(p.id) : false;

  const wish = async () => {
    const r = await toggleWishlist(p.id);
    if (r.status === 'login') { toast('Please log in to save items to your wishlist.'); setTimeout(() => navigate('/login?next=' + encodeURIComponent('/product/' + slug)), 900); }
    else if (r.status === 'error') toast(errMsg(r.error), 'error');
    else toast(r.status === 'added' ? 'Saved to your wishlist' : 'Removed from wishlist');
  };

  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }, { label: p ? p.name : 'Product' }];
  return (
    <>
      <PageHero crumbs={crumbs} />
      <PageSection>
        {state === 'loading' && <div className="pd-grid"><div className="sk-block" style={{ aspectRatio: '1/1', borderRadius: 28 }} /><div><div className="sk-line" /><div className="sk-line short" /><div className="sk-block" /></div></div>}
        {state === 'missing' && <StateBox title="Product not found" action={<Link className="btn btn-primary" to="/products">Browse all products</Link>}>It may have been removed or the link is incorrect.</StateBox>}
        {state === 'error' && <StateBox title="We couldn't load this product" action={<button className="btn btn-primary" onClick={load}>Try again</button>}>{error}</StateBox>}
        {state === 'ok' && p && (
          <>
            <div className="pd-grid">
              <div className="pd-image"><img src={imgUrl(p.image_url)} alt={p.name} /></div>
              <div className="pd-info">
                {p.categories && <Link className="eyebrow" to={`/products?cat=${encodeURIComponent(p.categories.slug)}`}>{p.categories.name}</Link>}
                <h1>{p.name}</h1>
                <div className="pd-price"><span>Starting from</span><strong>{money(p.price_from)}</strong></div>
                <p className="pd-desc">{p.description}</p>
                <p className="pd-note">This is a starting price. Final price depends on quantity, size and finish. We confirm it with you before we begin printing.</p>
                <div className="pd-actions">
                  <div className="qty-stepper" role="group" aria-label="Quantity">
                    <button type="button" onClick={() => setQty(q => clamp(q - 1))} aria-label="Decrease quantity">−</button>
                    <input type="number" min="1" max="100000" value={qty} onChange={e => setQty(e.target.value === '' ? '' : clamp(e.target.value))} onBlur={() => setQty(clamp(qty))} aria-label="Quantity" />
                    <button type="button" onClick={() => setQty(q => clamp(q + 1))} aria-label="Increase quantity">+</button>
                  </div>
                  <button className="btn btn-primary" onClick={() => { cart.add(p, clamp(qty)); toast(`Added ${clamp(qty)} × "${p.name}" to your cart`); setAdded(true); setTimeout(() => setAdded(false), 1300); }}>{added ? 'Added ✓' : 'Add to Cart'}</button>
                  <button className={'wish-big' + (wished ? ' active' : '')} onClick={wish} aria-label="Save to wishlist" aria-pressed={wished}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </button>
                </div>
                <div className="pd-actions">
                  <button className="btn btn-secondary" onClick={() => { cart.add(p, clamp(qty)); navigate('/checkout'); }}>Buy Now</button>
                  <button className="btn btn-secondary" onClick={() => openEnquiry('Question about ' + p.name, { product: p.name })}>Ask About This Product</button>
                </div>
              </div>
            </div>
            {related.length > 0 && (
              <section className="related">
                <h2>You might also like</h2>
                <div className="products-grid">{related.map(r => <ProductCard key={r.id} product={r} />)}</div>
              </section>
            )}
          </>
        )}
      </PageSection>
    </>
  );
}
