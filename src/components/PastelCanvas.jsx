import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFestiveTheme } from '../lib/festiveThemeData.js';

const PASTEL_THEMES = [
  { id: 'mint', name: 'Pastel Mint', color: '#ebf6f0', dotClass: 'pastel-dot-mint', desc: 'Fresh & Modern' },
  { id: 'peach', name: 'Warm Peach', color: '#fff1e6', dotClass: 'pastel-dot-peach', desc: 'Cozy & Welcoming' },
  { id: 'cream', name: 'Warm Cream', color: '#faf5eb', dotClass: 'pastel-dot-cream', desc: 'Classic Stationery' },
  { id: 'sky', name: 'Powder Sky', color: '#edf4fa', dotClass: 'pastel-dot-sky', desc: 'Crisp & Airy' },
  { id: 'lavender', name: 'Soft Lavender', color: '#f4f0fa', dotClass: 'pastel-dot-lavender', desc: 'Elegant & Gentle' },
];

export function PastelCanvas() {
  const { isFestive } = useFestiveTheme();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('bps_pastel_theme') || 'mint';
  });

  useEffect(() => {
    if (!isAdmin) {
      document.body.setAttribute('data-pastel-theme', activeTheme);
      localStorage.setItem('bps_pastel_theme', activeTheme);
    }
  }, [activeTheme, isAdmin]);

  // Hide decorative pastel patterns on Admin Dashboard and during active festive themes
  if (isAdmin || isFestive) return null;

  return (
    <>
      {/* Ambient background container fixed behind page content */}
      <div className="pastel-canvas-container" aria-hidden="true">
        {/* Fine subtle dotted grid */}
        <div className="pastel-grid-pattern" />

        {/* Organic floating pastel gradient blobs */}
        <div className="pastel-orb pastel-orb-1" />
        <div className="pastel-orb pastel-orb-2" />
        <div className="pastel-orb pastel-orb-3" />
        <div className="pastel-orb pastel-orb-4" />
        <div className="pastel-orb pastel-orb-5" />

        {/* Subtle decorative leaf / curve SVG accents on borders */}
        <svg className="pastel-decoration pastel-deco-top-left" viewBox="0 0 100 100" fill="none">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.25" />
          <path d="M10 60 Q 30 20 70 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
        </svg>

        <svg className="pastel-decoration pastel-deco-mid-right" viewBox="0 0 120 120" fill="none">
          <path d="M20 100 C 60 80, 80 40, 100 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
          <circle cx="85" cy="45" r="5" fill="currentColor" opacity="0.2" />
          <circle cx="45" cy="85" r="4" fill="currentColor" opacity="0.18" />
        </svg>

        <svg className="pastel-decoration pastel-deco-bottom-left" viewBox="0 0 100 100" fill="none">
          <path d="M30 10 C 20 50, 60 70, 90 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
          <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.18" />
        </svg>
      </div>

      {/* Floating Pastel Palette Switcher */}
      <aside className="pastel-switcher-bar" aria-label="Pastel background selector" title="Try another pastel color">
        <span className="pastel-switcher-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a7 7 0 0 0 0 14v6" />
          </svg>
          <span>Pastel:</span>
        </span>
        {PASTEL_THEMES.map(theme => (
          <button
            key={theme.id}
            type="button"
            className={`pastel-dot-btn ${theme.dotClass} ${activeTheme === theme.id ? 'active' : ''}`}
            onClick={() => setActiveTheme(theme.id)}
            title={`${theme.name} (${theme.desc})`}
            aria-label={`Select ${theme.name}`}
          />
        ))}
      </aside>
    </>
  );
}
