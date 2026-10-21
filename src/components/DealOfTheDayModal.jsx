import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCurrentDeal, isDealDismissedToday, dismissDealToday, DEFAULT_DEAL } from '../lib/dealData.js';
import { whatsappUrl } from '../lib/config.js';
import { imgUrl, money } from '../lib/utils.js';

export function DealOfTheDayModal() {
  const [deal, setDeal] = useState(DEFAULT_DEAL);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Load deal from Supabase / cache
  useEffect(() => {
    let alive = true;
    fetchCurrentDeal().then(d => {
      if (!alive) return;
      if (d) setDeal(d);
      setMounted(true);
      // Auto open if active and not dismissed today
      if (d && d.is_active && !isDealDismissedToday(d)) {
        const timer = setTimeout(() => {
          if (alive) setIsOpen(true);
        }, 1800);
        return () => clearTimeout(timer);
      }
    });

    const onDealUpdate = e => {
      if (e.detail) {
        setDeal(e.detail);
      }
    };
    window.addEventListener('bps_deal_updated', onDealUpdate);

    return () => {
      alive = false;
      window.removeEventListener('bps_deal_updated', onDealUpdate);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape' && isOpen) close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const close = () => {
    if (dontShowToday) {
      dismissDealToday(deal);
    }
    setIsOpen(false);
  };

  const handleClaimWhatsApp = () => {
    const text = `Hello Bhima Print Solutions! I would like to claim today's Deal of the Day:\n\n*${deal.title}*\nPrice: ${money(deal.deal_price)} (was ${money(deal.original_price)})\nDiscount: ${deal.discount_tag || 'Special Offer'}\n\nPlease confirm availability and let me know how to proceed!`;
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
    close();
  };

  const handleViewProduct = () => {
    close();
    if (deal.product_slug) {
      navigate('/product/' + encodeURIComponent(deal.product_slug));
    } else {
      navigate('/products');
    }
  };

  if (!deal || !deal.is_active) {
    return null;
  }

  const hasSavings = deal.original_price && deal.deal_price && Number(deal.original_price) > Number(deal.deal_price);
  const savingsAmount = hasSavings ? Number(deal.original_price) - Number(deal.deal_price) : 0;

  return (
    <>
      {/* ================= FLOATING BLINKING DEAL TRIGGER BADGE ================= */}
      <aside
        className="deal-floating-trigger"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(true); } }}
        aria-label="View Today's Deal of the Day"
        title="Click to view Today's Special Deal!"
      >
        <span className="deal-beacon-pulse" aria-hidden="true" />
        <span className="deal-trigger-icon" aria-hidden="true">🔥</span>
        <div className="deal-trigger-text">
          <span className="deal-trigger-tag">DEAL OF THE DAY</span>
          <span className="deal-trigger-title">
            {deal.discount_tag ? deal.discount_tag : 'Special Offer'}
          </span>
        </div>
      </aside>

      {/* ================= MODAL POPUP DIALOG ================= */}
      {isOpen && (
        <div
          className="deal-modal-backdrop active"
          onClick={e => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dealModalTitle"
        >
          <div className="deal-modal-card" ref={modalRef}>
            {/* Close Button */}
            <button
              type="button"
              className="deal-modal-close-btn"
              onClick={close}
              aria-label="Close Deal of the Day"
            >
              ✕
            </button>

            {/* Glowing Blinking Header Badge */}
            <div className="deal-modal-top-badge">
              <span className="deal-blinking-pill">
                <span className="deal-blinking-dot" />
                <span className="deal-blinking-text">{deal.badge_text || '🔥 DEAL OF THE DAY'}</span>
                <span className="deal-shimmer-sweep" />
              </span>
              <span className="deal-timer-hint">⏰ Today Only</span>
            </div>

            <div className="deal-modal-content-grid">
              {/* Product Visual */}
              <div className="deal-modal-media">
                <img
                  src={imgUrl(deal.image_url)}
                  alt={deal.title}
                  className="deal-product-img"
                />
                {deal.discount_tag && (
                  <div className="deal-discount-sticker" aria-label={`Discount ${deal.discount_tag}`}>
                    <span>{deal.discount_tag}</span>
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="deal-modal-details">
                <h3 id="dealModalTitle" className="deal-modal-heading">
                  {deal.title}
                </h3>

                {deal.subtitle && (
                  <p className="deal-modal-subtitle">
                    {deal.subtitle}
                  </p>
                )}

                {/* Price Display */}
                <div className="deal-price-card">
                  <div className="deal-price-main">
                    <span className="deal-price-label">Today's Special:</span>
                    <strong className="deal-current-price">{money(deal.deal_price)}</strong>
                    {deal.original_price && (
                      <span className="deal-orig-price">{money(deal.original_price)}</span>
                    )}
                  </div>
                  {hasSavings && (
                    <div className="deal-savings-badge">
                      You Save {money(savingsAmount)}
                    </div>
                  )}
                </div>

                {deal.banner_note && (
                  <div className="deal-urgency-note">
                    {deal.banner_note}
                  </div>
                )}

                {/* Call to Actions */}
                <div className="deal-modal-actions">
                  <button
                    type="button"
                    className="btn btn-deal-claim"
                    onClick={handleClaimWhatsApp}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.101-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.176.2-.351.226-.652.075-.301-.151-1.272-.469-2.423-1.496-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.201.05-.377-.025-.527-.075-.151-.677-1.632-.928-2.235-.245-.587-.494-.507-.677-.517l-.578-.01c-.2 0-.527.075-.803.377s-1.054 1.029-1.054 2.509 1.079 2.911 1.229 3.112c.151.201 2.124 3.243 5.144 4.549.718.311 1.279.497 1.716.636.722.23 1.378.197 1.898.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.434 5.176L2 22l4.981-1.397C8.423 21.492 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                    </svg>
                    <span>{deal.button_text || 'Claim Deal on WhatsApp'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-deal-view"
                    onClick={handleViewProduct}
                  >
                    View Product Details →
                  </button>
                </div>

                {/* Snooze Checkbox */}
                <div className="deal-modal-footer">
                  <label className="deal-checkbox-label">
                    <input
                      type="checkbox"
                      checked={dontShowToday}
                      onChange={e => setDontShowToday(e.target.checked)}
                    />
                    <span>Don't show this deal again today</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
