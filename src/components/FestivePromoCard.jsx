import { useNavigate } from 'react-router-dom';

export function FestivePromoCard({ config, preview = false, onNavigate }) {
  const navigate = useNavigate();
  const festivalId = config?.festival_id || config?.theme_id || 'diwali';
  const isChristmas = festivalId === 'christmas';
  const go = path => {
    if (preview) return;
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  return (
    <div className={'promo-card promo-festive ' + (isChristmas ? 'promo-xmas' : 'promo-diwali')}>
      <div className="promo-content">
        <span className="promo-eyebrow-pill">
          <span aria-hidden="true">✦</span>
          {config?.promo_eyebrow || 'FESTIVE SPECIALS'}
        </span>
        <h2 className="promo-title">{config?.promo_title || 'Make Every Gift a Little More Special'}</h2>
        <p className="promo-desc">{config?.promo_description || 'Discover personalised mugs, photo keepsakes, custom prints and thoughtful festive gifts.'}</p>
        <button
          type="button"
          className="btn-festive-promo"
          onClick={() => go(config?.promo_cta_link || '/products?cat=photo-frames')}
          aria-disabled={preview || undefined}
        >
          {config?.promo_cta_label || 'Explore the Collection'}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
      <div className="promo-visual">
        <img
          loading="lazy"
          decoding="async"
          src={config?.promo_image || '/images/festive/diwali/promo-diwali-giftboxes.png'}
          alt={isChristmas ? 'Personalised Christmas gifts and hampers' : 'Personalised festive gifts and hampers'}
          className="promo-img"
        />
      </div>
    </div>
  );
}
