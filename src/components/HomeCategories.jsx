import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../lib/data.js';
import { imgUrl } from '../lib/utils.js';

// Category tiles on the home page, driven by the `categories` table.
export function HomeCategories() {
  const go = useNavigate();
  const [cats, setCats] = useState(null);

  useEffect(() => {
    let on = true;
    fetchCategories().then(c => on && setCats(c)).catch(() => on && setCats([]));
    return () => { on = false; };
  }, []);

  if (!cats) {
    return (
      <div className="categories-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => <div className="category-card skeleton" key={i}><div className="category-img-container" /><div className="sk-line" /></div>)}
      </div>
    );
  }
  return (
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
  );
}
