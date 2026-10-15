import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, ProductSkeletons } from './ProductCard.jsx';
import { fetchCategories } from '../lib/data.js';
import { supabase } from '../lib/supabase.js';
import { errMsg } from '../lib/utils.js';

// "Best Selling Products" section on the home page: featured products from Supabase.
export function HomeProducts() {
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('all');
  const [state, setState] = useState('loading'); // loading | ok | error
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [c, res] = await Promise.all([
        fetchCategories(),
        supabase.from('products').select('id,slug,name,price_from,image_url,categories(slug,name)')
          .eq('is_active', true).eq('is_featured', true).order('sort_order').limit(8)
      ]);
      if (res.error) throw res.error;
      setCats(c); setProducts(res.data); setState('ok');
    } catch (e) { setError(errMsg(e)); setState('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = products.filter(p => active === 'all' || (p.categories && p.categories.slug === active));

  return (
    <section className="products-section" id="products">
      <div className="container">
        <div className="products-header">
          <div>
            <span className="eyebrow">Customer favourites</span>
            <h2 className="section-title">Best Selling Products</h2>
            <p className="section-subtitle">Popular choices loved by our customers.</p>
          </div>
          <div className="filter-pills" role="group" aria-label="Filter products by category">
            {[{ slug: 'all', name: 'All' }, ...cats].map(c => (
              <button key={c.slug} className={'pill-btn' + (c.slug === active ? ' active' : '')} aria-pressed={c.slug === active} onClick={() => setActive(c.slug)}>{c.name}</button>
            ))}
          </div>
        </div>

        <div className="products-grid" aria-live="polite">
          {state === 'loading' && <ProductSkeletons />}
          {state === 'ok' && shown.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {state === 'ok' && !shown.length && <div className="products-state"><p>No products in this category yet.</p></div>}
        {state === 'error' && (
          <div className="products-state">
            <p>We couldn&apos;t load products right now. {error}</p>
            <button className="btn btn-primary" onClick={load}>Try again</button>
          </div>
        )}
        <div className="center-cta"><Link className="btn btn-teal-pill" to="/products">View All Products</Link></div>
      </div>
    </section>
  );
}
