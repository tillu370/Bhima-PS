import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHero, PageSection } from '../components/PageHero.jsx';
import { ProductCard, ProductSkeletons } from '../components/ProductCard.jsx';
import { fetchCategories } from '../lib/data.js';
import { supabase } from '../lib/supabase.js';
import { errMsg } from '../lib/utils.js';
import { useScrollReveal } from '../lib/useScrollReveal.js';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'all';
  const q = params.get('q') || '';
  const [sort, setSort] = useState('order');
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [c, res] = await Promise.all([
        fetchCategories(),
        supabase.from('products').select('id,slug,name,description,price_from,image_url,created_at,sort_order,categories(slug,name)').eq('is_active', true).order('sort_order')
      ]);
      if (res.error) throw res.error;
      setCats(c); setProducts(res.data); setState('ok');
    } catch (e) { setError(errMsg(e)); setState('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = products.filter(p => {
      const inCat = cat === 'all' || (p.categories && p.categories.slug === cat);
      const hay = (p.name + ' ' + (p.description || '') + ' ' + (p.categories ? p.categories.name : '')).toLowerCase();
      return inCat && (!term || hay.includes(term));
    });
    if (sort === 'price-asc') out.sort((a, b) => a.price_from - b.price_from);
    else if (sort === 'price-desc') out.sort((a, b) => b.price_from - a.price_from);
    else if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'new') out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return out;
  }, [products, cat, q, sort]);

  const setCat = slug => {
    const p = new URLSearchParams(params);
    if (slug === 'all') p.delete('cat'); else p.set('cat', slug);
    setParams(p);
  };
  const reset = () => setParams({});

  useScrollReveal('.products-grid .product-card:not(.skeleton)', [state, cat, q, sort, list.length]);
  const current = cats.find(c => c.slug === cat);
  useEffect(() => { document.title = (current ? current.name : 'All Products') + ' | Bhima Printing Solutions'; }, [current]);

  return (
    <>
      <PageHero title="All Products" subtitle="Everything you need to print, personalise and promote." crumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]} />
      <PageSection>
        <div className="catalog-bar">
          <div className="filter-pills" role="group" aria-label="Filter products by category">
            {[{ slug: 'all', name: 'All' }, ...cats].map(c => (
              <button key={c.slug} className={'pill-btn' + (c.slug === cat ? ' active' : '')} aria-pressed={c.slug === cat} onClick={() => setCat(c.slug)}>{c.name}</button>
            ))}
          </div>
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort products">
            <option value="order">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A-Z</option>
            <option value="new">Newest</option>
          </select>
        </div>

        {state === 'ok' && <p className="result-count" aria-live="polite">{list.length} product{list.length === 1 ? '' : 's'}{q ? ` for "${q}"` : ''}</p>}
        {state === 'loading' && <div className="products-grid"><ProductSkeletons /></div>}
        {state === 'ok' && list.length > 0 && <div className="products-grid">{list.map(p => <ProductCard key={p.id} product={p} />)}</div>}
        {state === 'ok' && list.length === 0 && (
          <div className="state-box">
            <h3>No products found</h3>
            <p>{q ? 'Try a different search word or category.' : 'There are no products in this category yet.'}</p>
            <button className="btn btn-primary" onClick={reset}>Show all products</button>
          </div>
        )}
        {state === 'error' && (
          <div className="state-box">
            <h3>We couldn&apos;t load products</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={load}>Try again</button>
          </div>
        )}
      </PageSection>
    </>
  );
}
