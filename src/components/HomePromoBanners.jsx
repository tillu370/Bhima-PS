import { useNavigate } from 'react-router-dom';
import { FestivePromoCard } from './FestivePromoCard.jsx';
import { SafeImage } from './SafeImage.jsx';

export function HomePromoBanners({ isFestive, config, preview = false }) {
  const navigate = useNavigate();
  const go = path => { if (!preview) navigate(path); };

  return (
    <section className="promo-banners-section">
      <div className="container promo-grid">
        <div className="promo-card promo-mint">
          <div className="promo-content">
            <h2 className="promo-title">Custom<br />T-Shirts</h2>
            <p className="promo-desc">For teams, events, colleges and brands.</p>
            <button className="btn btn-dark-teal" onClick={() => go('/products?cat=t-shirts')} aria-disabled={preview || undefined}>
              Explore Apparel
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
          <div className="promo-visual">
            <SafeImage loading="lazy" decoding="async" src="/images/t-shirt-printing.jpg" alt="Custom T-Shirts Mockup" className="promo-img" />
          </div>
        </div>

        {isFestive ? <FestivePromoCard config={config} preview={preview} onNavigate={go} /> : (
          <div className="promo-card promo-peach">
            <div className="promo-content">
              <h2 className="promo-title">Personalised<br />Gifts</h2>
              <p className="promo-desc">Make every moment extra special.</p>
              <button className="btn btn-dark-teal" onClick={() => go('/products?cat=photo-frames')} aria-disabled={preview || undefined}>
                Explore Gifts
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="promo-visual">
              <SafeImage loading="lazy" decoding="async" src="/images/cat-frames-clocks.jpg" alt="Personalised Mugs and Frames" className="promo-img" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
