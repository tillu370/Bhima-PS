import { A } from './A.jsx';
import { LogoMark, Wordmark } from './LogoMark.jsx';
import { SOCIAL, whatsappUrl } from '../lib/config.js';

export function Footer() {
  return (
    <footer className="main-footer" id="footer">
        <div className="footer-wordmark" aria-hidden="true">BHIMA</div>
        
        <div className="container footer-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <div className="brand-logo footer-logo">
              <div className="logo-mark"><LogoMark id="ftr" /></div>
              <Wordmark />
            </div>
            <p className="footer-desc">
              Ideas into print. Serving businesses, creators and communities with high-quality, customised printing solutions.
            </p>
            <div className="footer-social-icons">
              {SOCIAL.instagram && (<A href={SOCIAL.instagram} aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </A>)}
              <A href={whatsappUrl('Hello Bhima Print Solutions')} aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.101-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.176.2-.351.226-.652.075-.301-.151-1.272-.469-2.423-1.496-.897-.8-1.503-1.789-1.68-2.09-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.201.05-.377-.025-.527-.075-.151-.677-1.632-.928-2.235-.245-.587-.494-.507-.677-.517l-.578-.01c-.2 0-.527.075-.803.377s-1.054 1.029-1.054 2.509 1.079 2.911 1.229 3.112c.151.201 2.124 3.243 5.144 4.549.718.311 1.279.497 1.716.636.722.23 1.378.197 1.898.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.434 5.176L2 22l4.981-1.397C8.423 21.492 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </A>
              {SOCIAL.linkedin && (<A href={SOCIAL.linkedin} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </A>)}
            </div>
          </div>
    
          {/* Col 2: Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul>
              <li><A href="/products">All Products</A></li>
              <li><A href="/#why-choose">About Us</A></li>
              <li><A href="/#for-business">For Business</A></li>
              <li><A href="#footer">Contact</A></li>
            </ul>
          </div>
    
          {/* Col 3: Help & Support */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Help & Support</h4>
            <ul>
              <li><A href="/#faqs">FAQs</A></li>
              <li><A href="/#how-it-works">Design Help</A></li>
              <li><A href={whatsappUrl('Hello Bhima Print Solutions, I would like an update on my order.')}>Order Help (WhatsApp)</A></li>
              <li><A href="/info/shipping">Shipping &amp; Delivery</A></li>
            </ul>
          </div>
    
          {/* Col 4: Contact Us */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="contact-info-list">
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <A href="tel:+919491811360">+91 94918 11360</A>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <A href="mailto:bhimaxerox1@gmail.com">bhimaxerox1@gmail.com</A>
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Visakhapatnam, India</span>
              </li>
            </ul>
          </div>
        </div>
    
        {/* Copyright Sub-footer */}
        <div className="sub-footer">
          <div className="container sub-footer-content">
            <p>© {new Date().getFullYear()} Bhima Print Solutions. All rights reserved.</p>
            <A href="#" className="to-top" aria-label="Back to top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top <span aria-hidden="true">↑</span></A>
            <div className="sub-footer-links">
              <A href="/info/privacy">Privacy Policy</A>
              <span className="sub-separator">•</span>
              <A href="/info/terms">Terms &amp; Conditions</A>
            </div>
          </div>
        </div>
      </footer>
  );
}
