import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar.jsx';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { CartDrawer } from './CartDrawer.jsx';
import { EnquiryModal } from './EnquiryModal.jsx';
import { FloatingActions, ScrollProgress } from './FloatingActions.jsx';
import { PastelCanvas } from './PastelCanvas.jsx';
import { DealOfTheDayModal } from './DealOfTheDayModal.jsx';
import { DiwaliSplashScreen } from './DiwaliSplashScreen.jsx';
import { useDiwaliTheme } from '../lib/diwaliThemeData.js';
import { useUi } from '../context/UiContext.jsx';

// On route change: jump to the #hash target if there is one, otherwise to the top.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return undefined; }
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); clearInterval(t); }
      else if (++tries > 20) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [pathname, hash]);
  return null;
}

function Toast() {
  const { toastState } = useUi();
  return (
    <div className={'toast' + (toastState.show ? ' show' : '') + (toastState.type === 'error' ? ' error' : '')} role="status" aria-live="polite">
      {toastState.msg}
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { config, theme, isDiwali, isPreview, setPreview } = useDiwaliTheme();

  useEffect(() => {
    if (isDiwali) {
      document.body.setAttribute('data-festive-theme', theme.id || 'diwali');
      if (theme.id === 'diwali') document.body.setAttribute('data-diwali-theme', 'active');
      else document.body.removeAttribute('data-diwali-theme');
    } else {
      document.body.removeAttribute('data-festive-theme');
      document.body.removeAttribute('data-diwali-theme');
    }
  }, [isDiwali, theme.id]);

  return (
    <>
      <PastelCanvas />
      <DiwaliSplashScreen isDiwali={isDiwali} config={config} />
      <ScrollProgress />
      <a className="skip-link" href="#main">Skip to content</a>
      <TopBar />
      <Header />
      <main id="main" key={pathname} className="page-enter"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <EnquiryModal />
      <FloatingActions />
      <DealOfTheDayModal />

      {/* Floating Preview Exit Banner if Admin is previewing Diwali theme */}
      {isPreview && (
        <aside className="diwali-preview-bar" aria-label="Storefront Preview Status">
          <span>✦ Storefront Preview: {theme.name} Theme Active</span>
          <button
            type="button"
            className="diwali-preview-exit-btn"
            onClick={() => setPreview(null)}
          >
            Exit Preview
          </button>
        </aside>
      )}

      <Toast />
      <ScrollManager />
    </>
  );
}
