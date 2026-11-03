import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, ProductSkeletons } from './ProductCard.jsx';
import { fetchCategories } from '../lib/data.js';
import { supabase } from '../lib/supabase.js';
import { errMsg } from '../lib/utils.js';
import { useScrollReveal } from '../lib/useScrollReveal.js';

// "Best Selling Products" section on the home page: featured products from Supabase.
// Not every category has a product marked "featured" yet, so picking a category
// pill with none falls back to that category's regular products instead of
// showing an empty grid for a category that does have products.
export function HomeProducts() {
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('all');
  const [state, setState] = useState('loading'); // loading | ok | error
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState({}); // slug -> products[], for categories with no featured items
  const [loadingFallbackFor, setLoadingFallbackFor] = useState(null); // slug currently being fetched, or null

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [c, res] = await Promise.all([
        fetchCategories(),
        supabase.from('products').select('id,slug,name,price_from,image_url,image_url_2,is_featured,category_id,categories(id,slug,name,image_url)')
          .eq('is_active', true).eq('is_featured', true).order('sort_order')
      ]);
      if (res.error) throw res.error;
      setCats(c); setProducts(res.data); setState('ok');
    } catch (e) { setError(errMsg(e)); setState('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // "All" shows a curated top 8; a chosen category shows every featured product in it,
  // since limiting to the top 8 first (before filtering) could hide a category entirely.
  const filtered = products.filter(p => active === 'all' || (p.categories && p.categories.slug === active));
  const needsFallback = active !== 'all' && state === 'ok' && filtered.length === 0 && !fallback[active];

  useEffect(() => {
    if (!needsFallback) return;
    let on = true;
    setLoadingFallbackFor(active);
    supabase.from('products').select('id,slug,name,price_from,image_url,image_url_2,is_featured,category_id,categories!inner(id,slug,name,image_url)')
      .eq('is_active', true).eq('categories.slug', active).order('sort_order').limit(8)
      .then(({ data, error: err }) => {
        if (!on) return;
        setLoadingFallbackFor(cur => (cur === active ? null : cur));
        if (!err) setFallback(cur => ({ ...cur, [active]: data || [] }));
      });
    return () => { on = false; };
  }, [needsFallback, active]);

  const fallbackLoading = needsFallback && loadingFallbackFor === active;
  const shown = active === 'all' ? filtered.slice(0, 8) : (filtered.length ? filtered : (fallback[active] || []));

  useScrollReveal('.products-section .product-card:not(.skeleton)', [state, active, products.length, shown.length]);
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
          {(state === 'loading' || fallbackLoading) && <ProductSkeletons />}
          {state === 'ok' && !fallbackLoading && shown.map(p => <ProductCard key={p.id} product={p} eager />)}
        </div>
        {state === 'ok' && !fallbackLoading && !shown.length && <div className="products-state"><p>No products in this category yet.</p></div>}
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
