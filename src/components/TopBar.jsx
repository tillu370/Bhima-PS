import { A } from './A.jsx';
import { SOCIAL, whatsappUrl } from '../lib/config.js';

export function TopBar() {
  return (
    <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-left">
            <span className="highlight-badge">
              <svg className="icon-sparkle" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2L14.39 8.26L21 9.27L16.2 13.97L17.34 20.5L12 17.27L6.66 20.5L7.8 13.97L3 9.27L9.61 8.26L12 2Z"/>
              </svg>
              Custom Printing For Every Idea
            </span>
            <div className="top-features">
              <span className="feature-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                Bulk Orders
              </span>
              <span className="separator">|</span>
              <span className="feature-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Fast Delivery
              </span>
              <span className="separator">|</span>
              <span className="feature-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                Quality Assured
              </span>
            </div>
          </div>
          <div className="top-bar-right">
            <span className="follow-text">Follow Us:</span>
            <div className="social-icons">
              {SOCIAL.instagram && (<A href={SOCIAL.instagram} aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </A>)}
              <A href={whatsappUrl('Hello Bhima Print Solutions')} aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.101-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.176.2-.351.226-.652.075-.301-.151-1.272-.469-2.423-1.496-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.201.05-.377-.025-.527-.075-.151-.677-1.632-.928-2.235-.245-.587-.494-.507-.677-.517l-.578-.01c-.2 0-.527.075-.803.377s-1.054 1.029-1.054 2.509 1.079 2.911 1.229 3.112c.151.201 2.124 3.243 5.144 4.549.718.311 1.279.497 1.716.636.722.23 1.378.197 1.898.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.434 5.176L2 22l4.981-1.397C8.423 21.492 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </A>
              {SOCIAL.youtube && (<A href={SOCIAL.youtube} aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </A>)}
              {SOCIAL.linkedin && (<A href={SOCIAL.linkedin} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </A>)}
            </div>
          </div>
        </div>
      </div>
  );
}
