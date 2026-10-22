import { Link } from 'react-router-dom';
import { useUi } from '../context/UiContext.jsx';
import { FESTIVALS } from '../lib/festiveThemeData.js';
import { getFestiveTheme } from '../lib/diwaliThemeData.js';
import { SafeImage } from './SafeImage.jsx';

export function DiwaliHeroBanner({ config, preview = false }) {
  const { openEnquiry } = useUi();
  const theme = FESTIVALS.find(festival => festival.id === (config?.festival_id || config?.theme_id)) || FESTIVALS[0];
  const renderData = getFestiveTheme(theme.id);
  const heroImg = config?.hero_image || theme.heroImages[0]?.path || theme.thumb;
  const fallbackHeroImg = theme.heroImages.find(image => image.path !== heroImg)?.path;
  const selectedHero = renderData.heroBannerOptions.find(option => option.path === heroImg);
  const layout = config?.hero_layout || selectedHero?.layout || renderData.layout;
  const eyebrow = config?.hero_eyebrow || theme.defaultEyebrow;
  const headline = config?.hero_headline || theme.defaultHeadline;
  const description = config?.hero_description || theme.defaultDescription;
  const ctaLabel = config?.hero_cta_label || theme.defaultCtaLabel;
  const ctaLink = config?.hero_cta_link || theme.defaultCtaLink;
  const secondaryCtaLabel = config?.hero_secondary_cta_label || 'Shop Personalised Prints';
  const secondaryCtaLink = config?.hero_secondary_cta_link || '/products';
  const showTexture = config?.texture_enabled !== false;
  const pattern = config?.texture_pattern || config?.pattern_image || renderData.pattern || theme.patternImage;

  return (
    <section
      className={'festive-hero-banner-section is-' + (layout === 'center' ? 'center' : 'left')}
      aria-label={theme.name + ' festive showcase'}
    >
      <SafeImage
        src={heroImg}
        fallbackSrc={fallbackHeroImg}
        alt={theme.name + ' personalised gifts collection'}
        className="festive-hero-bg-image"
        style={{ objectPosition: config?.hero_object_position || renderData.objectPosition || 'center center' }}
        width="1672"
        height="941"
        fetchpriority="high"
      />

      {/* Atmospheric gradient scrim: rich purple-burgundy atmosphere on left, clear over gifts on right */}
      <div className="festive-hero-gradient-scrim" />

      {/* Soft warm diya ambient aura */}
      <div className="festive-hero-glow-aura" aria-hidden="true" />

      {/* Subtle mandala texture overlay */}
      {showTexture && (
        <div
          className="festive-hero-texture-overlay"
          style={{ backgroundImage: 'url("' + pattern + '")' }}
          aria-hidden="true"
        />
      )}

      {/* Refined Rangoli gold corner detailing (Diwali specific) */}
      {theme.id === 'diwali' && (
        <>
          <div className="festive-rangoli-corner top-left" aria-hidden="true">
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
              <path d="M 0 0 L 80 0 C 60 10, 50 30, 40 40 C 30 50, 10 60, 0 80 Z" fill="rgba(198, 163, 87, 0.08)" />
              <path d="M 4 4 L 60 4 C 45 15, 35 25, 25 35 C 15 45, 4 60, 4 60 Z" stroke="#C6A357" strokeWidth="1" strokeDasharray="2 3" opacity="0.65" />
              <circle cx="20" cy="20" r="4" fill="#C6A357" opacity="0.75" />
              <circle cx="10" cy="10" r="2.5" fill="#F4DCA1" />
            </svg>
          </div>

          <div className="festive-rangoli-corner bottom-right" aria-hidden="true">
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
              <path d="M 80 80 L 0 80 C 20 70, 30 50, 40 40 C 50 30, 70 20, 80 0 Z" fill="rgba(198, 163, 87, 0.08)" />
              <path d="M 76 76 L 20 76 C 35 65, 45 55, 55 45 C 65 35, 76 20, 76 20 Z" stroke="#C6A357" strokeWidth="1" strokeDasharray="2 3" opacity="0.65" />
              <circle cx="60" cy="60" r="4" fill="#C6A357" opacity="0.75" />
              <circle cx="70" cy="70" r="2.5" fill="#F4DCA1" />
            </svg>
          </div>
        </>
      )}

      {(config?.decoration_image || renderData.cornerAccent || theme.decorationImage) && (
        <SafeImage src={config?.decoration_image || renderData.cornerAccent || theme.decorationImage} fallbackSrc={renderData.cornerAccent} alt="" aria-hidden="true" className="festive-hero-corner" />
      )}

      <div className="container festive-hero-container">
        <div className="festive-hero-content">
          <div className="festive-hero-eyebrow">
            <span className="spark-dot" aria-hidden="true" />
            <span>{eyebrow}</span>
            <span className="spark-dot" aria-hidden="true" />
          </div>

          <h1 className="festive-hero-title">
            <span className="festive-hero-title-highlight">{headline}</span>
          </h1>

          <p className="festive-hero-desc">{description}</p>

          <div className="festive-hero-actions">
            <Link to={ctaLink} className="btn-festive-primary" onClick={preview ? e => e.preventDefault() : undefined}>
              <span>{ctaLabel}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <Link to={secondaryCtaLink} className="btn-festive-secondary" onClick={preview ? e => e.preventDefault() : undefined}>
              <span>{secondaryCtaLabel}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <button
              type="button"
              className="btn-festive-enquiry-pill"
              onClick={() => { if (!preview) openEnquiry(theme.name + ' Corporate & Custom Bulk Gifting'); }}
              aria-label="Request bulk or corporate quote"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Bulk / Corporate Quote</span>
            </button>
          </div>

          <div className="festive-hero-features">
            <div className="festive-feature-item">
              {theme.id === 'christmas' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.2 6.8H21l-5.4 3.9 2.1 6.8L12 15.6 6.3 19.5 8.4 12.7 3 8.8h6.8z" />
                </svg>
              ) : theme.id === 'sankranthi' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : theme.id === 'new-year' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l1.4 7.2L21 12l-7.6 2.8L12 22l-1.4-7.2L3 12l7.6-2.8z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C12 2 9 6.5 9 9C9 10.7 10.3 12 12 12C13.7 12 15 10.7 15 9C15 6.5 12 2 12 2Z" />
                  <path d="M4 14C4.8 17.5 8 20 12 20C16 20 19.2 17.5 20 14C20 14 17 15.5 12 15.5C7 15.5 4 14 4 14Z" />
                </svg>
              )}
              <span>Handcrafted Quality</span>
            </div>
            <div className="festive-feature-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Guaranteed Festive Delivery</span>
            </div>
            <div className="festive-feature-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Free Custom Design Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
