import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { A } from '../components/A.jsx';
import { HomeProducts } from '../components/HomeProducts.jsx';
import { HomeCategories } from '../components/HomeCategories.jsx';
import { FaqGrid } from '../components/FaqGrid.jsx';
import { useUi } from '../context/UiContext.jsx';
import { useScrollReveal } from '../lib/useScrollReveal.js';
import { useHeroParallax } from '../lib/useHeroParallax.js';

const MARQUEE = ['Mug Printing', 'T Shirt Printing', 'Pillow Printing', 'Photo Frames', 'LED Frames', 'Photo Wall Clocks', 'Wood Engraving', 'Laser Gifts', 'Photo Key Chains', 'Corporate Gift Sets', 'Customised Pens', 'Name Boards', 'Water Bottles', 'Photo Badges'];

// Home page sections (markup converted from the original static page).
export default function Home() {
  const go = useNavigate();
  const { openEnquiry } = useUi();
  const kd = fn => e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
  useHeroParallax();
  useScrollReveal('.section-header, .category-card, .promo-card, .why-left, .why-card, .corporate-card, .step-card, .testimonials-grid, .testimonial-card, .bottom-cta-card');
  useEffect(() => { document.title = 'Bhima Print Solutions | Custom Printing for Every Idea'; }, []);
  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <section className="hero-section">
        <div className="hero-outer-container">
          <div className="hero-sticker" aria-hidden="true">Made to<br />order</div>
          <div className="hero-swatch" aria-hidden="true"><i className="c" /><i className="m" /><i className="y" /><i className="k" /><span>CMYK</span></div>
          {/* Left Column: Copy, CTAs, Highlights with Curved Arrow */}
          <div className="hero-left-wrapper">
            {/* Curved Doodle Arrow on far left */}
            <div className="hero-curved-arrow">
              <svg viewBox="0 0 60 140" fill="none" stroke="#009688" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 8 130 C 2 70, 8 26, 48 10" />
                <polyline points="36 6, 52 10, 48 26" />
              </svg>
            </div>

            <div className="hero-left-content">
              
              <div className="hero-eyebrow">YOUR IDEAS, OUR PRINT.</div>
              <h1 className="hero-title">
                <span className="w" style={{ '--i': 0 }}>Make</span>{' '}<span className="w" style={{ '--i': 1 }}>It</span>{' '}<span className="w" style={{ '--i': 2 }}>Real</span><br />
                <span className="highlight-teal squiggle"><span className="w" style={{ '--i': 3 }}>With</span>{' '}<span className="w" style={{ '--i': 4 }}>Print.</span></span>
              </h1>
              <p className="hero-desc">
                Custom printing solutions for businesses, creators, <br />
                celebrations and everything in between.
              </p>

              <div className="hero-buttons">
                <A href="/products" className="btn btn-mustard-pill">
                  Explore Products
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </A>
                <button className="btn btn-quote-pill" onClick={() => openEnquiry('Get a Fast Custom Quote')}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Get a Quote
                </button>
              </div>

              {/* 4 Service Highlights */}
              <p className="hero-note" aria-hidden="true">
                <svg viewBox="0 0 54 34" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 28C14 30 30 24 40 10" /><path d="M31 9l10 0-2 10" /></svg>
                Ideas. Design. Print. Repeat.
              </p>
              <div className="hero-trust-badges">
                <div className="trust-badge-item">
                  <div className="badge-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009688" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <span>High-Quality Prints</span>
                </div>
                <div className="trust-badge-item">
                  <div className="badge-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009688" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></svg>
                  </div>
                  <span>Custom Designs</span>
                </div>
                <div className="trust-badge-item">
                  <div className="badge-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009688" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <span>Bulk Orders</span>
                </div>
                <div className="trust-badge-item">
                  <div className="badge-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009688" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                  <span>On-Time Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Supplied bhima-hero.png with Carousel Controls */}
          <div className="hero-right-wrapper">
            <div className="hero-image-stage">
              <img src="/images/bhima-hero.jpg" alt="Bhima Print Solutions Merchandise Showcase" className="hero-product-img" width="1024" height="576" fetchpriority="high" />
          
              </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(n => MARQUEE.map(t => <span key={n + t} className="marquee-item">{t}<i>✦</i></span>))}
        </div>
      </div>

      {/* ==================== EXPLORE OUR CATEGORIES ==================== */}
      <section className="categories-section" id="categories">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow ">What we print</span>
              <h2 className="section-title">Explore Our Categories</h2>
              <p className="section-subtitle">Everything you need to print, personalise and promote.</p>
            </div>
            <A href="/categories" className="view-all-link">
              View All Categories
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </A>
          </div>

          {/* 8 Categories Grid */}
          <HomeCategories />
        
        </div>
      </section>

      {/* ==================== TWIN PROMO BANNERS ==================== */}
      <section className="promo-banners-section">
        <div className="container promo-grid">
          {/* Left Banner: Custom T-Shirts (Mint Green) */}
          <div className="promo-card promo-mint">
            <div className="promo-content">
              <h2 className="promo-title">Custom<br />T-Shirts</h2>
              <p className="promo-desc">For teams, events, colleges and brands.</p>
              <button className="btn btn-dark-teal" onClick={() => go('/products?cat=apparel-cushions')}>
                Explore Apparel
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="promo-visual">
              <img loading="lazy" decoding="async" src="/images/t-shirt-printing.jpg" alt="Custom T-Shirts Mockup" className="promo-img" />
            </div>
          </div>

          {/* Right Banner: Personalised Gifts (Warm Peach) */}
          <div className="promo-card promo-peach">
            <div className="promo-content">
              <h2 className="promo-title">Personalised<br />Gifts</h2>
              <p className="promo-desc">Make every moment extra special.</p>
              <button className="btn btn-dark-teal" onClick={() => go('/products?cat=frames-clocks')}>
                Explore Gifts
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="promo-visual">
              <img loading="lazy" decoding="async" src="/images/cat-frames-clocks.jpg" alt="Personalised Mugs and Frames" className="promo-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BEST SELLING PRODUCTS ==================== */}
      <HomeProducts />

      {/* ==================== WHY CHOOSE BHIMA PRINT SOLUTIONS ==================== */}
      <section className="why-choose-section" id="why-choose">
        <div className="container why-container">
          <div className="why-left">
            <span className="eyebrow ">Why us</span>
              <h2 className="why-heading">
              Why<br />
              Choose<br />
              Bhima Print<br />
              Solutions?
            </h2>
            <p className="why-desc">
              We combine creativity, quality and reliability to deliver prints that make an impact.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="why-grid">
            {/* Card 1: Premium Quality Prints */}
            <div className="why-card">
              <div className="why-icon-box icon-orange">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3h12l4 6-10 12L2 9z"/>
                </svg>
              </div>
              <h3 className="why-card-title">Premium Quality Prints</h3>
              <p className="why-card-desc">Sharp, vibrant and long-lasting.</p>
            </div>

            {/* Card 2: Full Customisation */}
            <div className="why-card">
              <div className="why-icon-box icon-coral">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 10-10c0-4-3-4-5-4s-3.5 1.5-5 1.5-2.5-1-2.5-2.5 1.5-2.5 2.5-2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="7.5" cy="14.5" r="1.5"/>
                </svg>
              </div>
              <h3 className="why-card-title">Full Customisation</h3>
              <p className="why-card-desc">Design it your way.</p>
            </div>

            {/* Card 3: Bulk Order Support */}
            <div className="why-card">
              <div className="why-icon-box icon-cyan">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              </div>
              <h3 className="why-card-title">Bulk Order Support</h3>
              <p className="why-card-desc">For businesses, events and institutions.</p>
            </div>

            {/* Card 4: On-Time Delivery */}
            <div className="why-card">
              <div className="why-icon-box icon-green">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h3 className="why-card-title">On-Time Delivery</h3>
              <p className="why-card-desc">Because your time matters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRINT SOLUTIONS FOR YOUR BUSINESS ==================== */}
      <section className="corporate-banner-section" id="for-business">
        <div className="container">
          <div className="corporate-card">
            <div className="corp-left">
              <span className="eyebrow">For business</span>
              <h2 className="corp-title">
                Printing Solutions<br />
                For Your Business
              </h2>
              <p className="corp-desc">
                From office essentials to large-scale brand campaigns, we provide complete printing support for companies, colleges and organisations.
              </p>

              <ul className="corp-checklist">
                <li>
                  <span className="check-icon">✓</span>
                  <span>Custom bulk orders</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Corporate merchandise</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Event materials & signage</span>
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  <span>Dedicated support</span>
                </li>
              </ul>

              <button className="btn btn-teal-pill" onClick={() => openEnquiry('Business Inquiry & Bulk Order')}>
                Discuss Your Requirements
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>

            <div className="corp-right">
              <div className="corp-img-wrapper">
                <img loading="lazy" decoding="async" src="/images/cat-corporate-gifts.jpg" alt="Corporate Merchandise Branding" className="corp-main-img" />
                <div className="corp-badge"><strong>Bulk orders welcome</strong><span>Custom bulk orders · Dedicated support</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="text-center">
            <span className="eyebrow ">Simple process</span>
              <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get your prints in just a few simple steps.</p>
          </div>

          <div className="steps-wrapper">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-num-badge">01</div>
              <div className="step-illustration step-ill-1">
                <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#6366f1" strokeWidth="2.5">
                  <path d="M12 16h32a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H24l-8 8v-8h-4a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z"/>
                  <line x1="20" y1="26" x2="36" y2="26"/>
                  <line x1="20" y1="34" x2="28" y2="34"/>
                </svg>
              </div>
              <h3 className="step-title">Tell Us Your Idea</h3>
              <p className="step-desc">Share your requirements and product details.</p>
            </div>

            <div className="step-connector-arrow">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-num-badge">02</div>
              <div className="step-illustration step-ill-2">
                <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#0284c7" strokeWidth="2.5">
                  <path d="M44 10l10 10-28 28H16V38l28-28z"/>
                  <circle cx="20" cy="18" r="8"/>
                  <line x1="16" y1="48" x2="48" y2="48"/>
                </svg>
              </div>
              <h3 className="step-title">Design & Confirm</h3>
              <p className="step-desc">We finalise artwork, materials and pricing.</p>
            </div>

            <div className="step-connector-arrow">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-num-badge">03</div>
              <div className="step-illustration step-ill-3">
                <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <path d="M10 20l22-10 22 10v24l-22 10-22-10V20z"/>
                  <polyline points="10 20 32 30 54 20"/>
                  <line x1="32" y1="30" x2="32" y2="54"/>
                </svg>
              </div>
              <h3 className="step-title">Get It Printed</h3>
              <p className="step-desc">Sit back and we'll take care of the rest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHAT OUR CUSTOMERS SAY ==================== */}
      <section className="testimonials-section">
        <div className="container"><div className="testimonials-grid">
          {/* Dark Blue Highlight Card */}
          <div className="testimonial-hero-card">
            <span className="eyebrow on-dark">Reviews</span>
              <h2 className="testi-hero-title">What Our<br />Customers Say</h2>
            <p className="testi-hero-subtitle">Real feedback from people who print with us.</p>
            <button className="btn btn-outline-white" onClick={() => openEnquiry('Share Your Feedback')}>
              Share Your Feedback
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          {/* 3 Testimonial Cards */}
          <div className="testimonial-cards-container">
            {/* Review 1 */}
            <div className="testimonial-card">
              <div className="stars-row">
                ★★★★★
              </div>
              <p className="review-quote">
                "Excellent quality and super fast service. Our college fest banners came out perfect!"
              </p>
              <div className="reviewer-meta">
                <span className="reviewer-avatar" aria-hidden="true">RV</span>
                <div>
                  <h4 className="reviewer-name">Rohit Varma</h4>
                  <p className="reviewer-role">ANITS, Vizag</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="testimonial-card">
              <div className="stars-row">
                ★★★★★
              </div>
              <p className="review-quote">
                "Loved the personalised mugs! Great print quality and packaging. Highly recommended!"
              </p>
              <div className="reviewer-meta">
                <span className="reviewer-avatar" aria-hidden="true">PR</span>
                <div>
                  <h4 className="reviewer-name">Priya Reddy</h4>
                  <p className="reviewer-role">Customer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="testimonial-card">
              <div className="stars-row">
                ★★★★★
              </div>
              <p className="review-quote">
                "Professional team, easy process and on-time delivery. We've been doing our corporate orders with them regularly!"
              </p>
              <div className="reviewer-meta">
                <span className="reviewer-avatar" aria-hidden="true">SK</span>
                <div>
                  <h4 className="reviewer-name">Suresh Kumar</h4>
                  <p className="reviewer-role">Business Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ==================== FREQUENTLY ASKED QUESTIONS ==================== */}
      <section className="faqs-section" id="faqs">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="eyebrow ">Good to know</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">Find answers to common questions.</p>
            </div>
            <A href="#footer" className="view-all-link" onClick={e => { e.preventDefault(); openEnquiry('Ask a Question'); }}>
              Still have questions?
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </A>
          </div>

          {/* 2-column FAQ Accordion Grid */}
          <FaqGrid />
              </div>
      </section>

      {/* ==================== GOT AN IDEA? LET'S PRINT IT CTA BANNER ==================== */}
      <section className="bottom-cta-section">
        <div className="container">
          <div className="bottom-cta-card"><span className="blob b1" aria-hidden="true"></span><span className="blob b2" aria-hidden="true"></span>
            <div className="cta-left">
              <h2 className="cta-title">
                Got an idea? <span className="cta-highlight">Let's print it.</span>
              </h2>
              <p className="cta-desc">
                Tell us what you're making. We'll help you take the next step.
              </p>
            </div>

            <div className="cta-arrow-doodle">
              <svg viewBox="0 0 120 50" width="100" height="40" fill="none" stroke="#004346" strokeWidth="2">
                <path d="M10 25 C 40 5, 70 45, 105 25" strokeDasharray="3,3"/>
                <polygon points="100,18 115,25 104,32" fill="#004346"/>
              </svg>
            </div>

            <button className="btn btn-dark-teal cta-btn" onClick={() => openEnquiry('General Custom Print Enquiry')}>
              Start Your Enquiry
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </section>

  
    </>
  );
}
