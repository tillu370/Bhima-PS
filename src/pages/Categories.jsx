import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHero, PageSection } from '../components/PageHero.jsx';
import { fetchCategories } from '../lib/data.js';
import { imgUrl } from '../lib/utils.js';
import { errMsg } from '../lib/utils.js';
import { useScrollReveal } from '../lib/useScrollReveal.js';

export default function Categories() {
  const go = useNavigate();
  const [cats, setCats] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    fetchCategories().then(setCats).catch(e => setError(errMsg(e)));
  };
  useEffect(load, []);
  useEffect(() => { document.title = 'All Categories | Bhima Print Solutions'; }, []);

  useScrollReveal('.categories-grid .category-card:not(.skeleton)', [cats]);

  return (
    <>
      <PageHero title="All Categories" subtitle="Everything we print, personalise and promote." crumbs={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
      <PageSection>
        {!cats && !error && (
          <div className="categories-grid" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => <div className="category-card skeleton" key={i}><div className="category-img-container" /><div className="sk-line" /></div>)}
          </div>
        )}
        {error && (
          <div className="state-box">
            <h3>We couldn&apos;t load categories</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={load}>Try again</button>
          </div>
        )}
        {cats && cats.length > 0 && (
          <div className="categories-grid">
            {cats.map(c => {
              const open = () => go('/products?cat=' + encodeURIComponent(c.slug));
              return (
                <div className="category-card" key={c.id} role="link" tabIndex={0} aria-label={`Browse ${c.name}`}
                  onClick={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}>
                  <div className="category-img-container"><img loading="lazy" decoding="async" src={imgUrl(c.image_url, c.slug)} alt={c.name} /></div>
                  <h3 className="category-name">{c.name}</h3>
                  <p className="category-desc">{c.description}</p>
                  <div className="category-arrow-btn" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {cats && cats.length === 0 && (
          <div className="state-box">
            <h3>No categories yet</h3>
            <p>Check back soon.</p>
          </div>
        )}
      </PageSection>
    </>
  );
}
