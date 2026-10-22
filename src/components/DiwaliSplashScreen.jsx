import { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark.jsx';
import { getFestiveTheme, isSplashSeenInSession, markSplashSeenInSession } from '../lib/diwaliThemeData.js';

function SplashIcon({ type }) {
  if (type === 'star') {
    return (
      <svg viewBox="0 0 24 24" width="54" height="54" fill="#E8C872" aria-hidden="true">
        <path d="M12 2l2.2 6.8H21l-5.4 3.9 2.1 6.8L12 15.6 6.3 19.5 8.4 12.7 3 8.8h6.8z" />
      </svg>
    );
  }
  if (type === 'sun') {
    return (
      <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="#F3D27A" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="#F59E0B" stroke="#F3D27A" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (type === 'spark') {
    return (
      <svg viewBox="0 0 24 24" width="54" height="54" fill="#E8C872" aria-hidden="true">
        <path d="M12 2l1.4 7.2L21 12l-7.6 2.8L12 22l-1.4-7.2L3 12l7.6-2.8z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="54" height="54" fill="none" aria-hidden="true">
      <path d="M12 2C12 2 8.5 7 8.5 10C8.5 12 10 13.5 12 13.5C14 13.5 15.5 12 15.5 10C15.5 7 12 2 12 2Z" fill="#F59E0B" />
      <path d="M3 13C3.8 17.5 7.5 20.5 12 20.5C16.5 20.5 20.2 17.5 21 13C21 13 18 15 12 15C6 15 3 13 3 13Z" fill="#D8A84E" />
    </svg>
  );
}

export function DiwaliSplashScreen({ isDiwali, config }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const festivalId = config?.festival_id || config?.theme_id || 'diwali';
  const theme = getFestiveTheme(festivalId);

  useEffect(() => {
    if (!isDiwali || !config?.splash_enabled) return;
    if (isSplashSeenInSession(festivalId)) return;

    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const closeTimer = setTimeout(() => {
      setVisible(false);
      markSplashSeenInSession(festivalId);
    }, 2550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [isDiwali, config?.splash_enabled, festivalId]);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      markSplashSeenInSession(festivalId);
    }, 300);
  };

  if (!visible) return null;

  const bgUrl = config?.splash_image || theme.splash;

  return (
    <div
      className={'festive-splash-overlay' + (fading ? ' fade-out' : '')}
      style={{ backgroundImage: 'url("' + bgUrl + '")' }}
      role="dialog"
      aria-modal="true"
      aria-label={theme.name + ' festive welcome'}
    >
      <div className="festive-splash-scrim" />

      <div className="festive-splash-content">
        <div className="festive-splash-logo-box">
          <div className="logo-mark">
            <LogoMark id="festive-splash" />
          </div>
          <span className="brand-name">Bhima Print Solutions</span>
        </div>

        <div className="festive-splash-icon">
          <SplashIcon type={theme.icon} />
        </div>

        <span className="festive-splash-eyebrow">{theme.splashEyebrow}</span>
        <h1 className="festive-splash-headline">
          {theme.splashHeadline} <br />
          <span className="gold-gradient-text">{theme.splashHighlight}</span>
        </h1>
        <p className="festive-splash-subtext">{theme.splashSubtext}</p>

        <div className="festive-splash-loader-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div className="festive-splash-loader-progress" />
        </div>
      </div>

      <button className="festive-splash-skip-btn" onClick={dismiss} aria-label="Skip to website">
        Skip ✕
      </button>
    </div>
  );
}
