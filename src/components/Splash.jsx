import { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark.jsx';
import { useFestiveTheme } from '../lib/festiveThemeData.js';

const KEY = 'bps_splash_seen';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let seen = false;
try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* storage blocked: show once per load */ }

// Intro shown once per browser session: logo pops in, CMYK bar draws, then the curtain lifts.
// The hero animations wait for it through the --intro-delay CSS variable.
export default function Splash() {
  const { isFestive, activeConfig } = useFestiveTheme();
  const festiveSplashEnabled = isFestive && !!activeConfig?.splash_enabled;
  const [phase, setPhase] = useState(seen || reduced() || festiveSplashEnabled ? 'off' : 'in'); // in -> out -> off

  // The festive welcome is the page intro while a festival splash is enabled.
  // If the theme loads after this component, dismiss the generic intro before
  // the festive overlay appears so two full-screen splashes never stack.
  useEffect(() => {
    if (!festiveSplashEnabled) return;
    setPhase('off');
    document.body.style.overflow = '';
    document.documentElement.style.setProperty('--intro-delay', '0s');
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
  }, [festiveSplashEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    if (phase === 'off' || festiveSplashEnabled) { root.style.setProperty('--intro-delay', '0s'); return undefined; }
    root.style.setProperty('--intro-delay', '1.55s');
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setPhase('out'), 1350);
    const t2 = setTimeout(() => {
      setPhase('off');
      document.body.style.overflow = '';
      root.style.setProperty('--intro-delay', '0s');
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    }, 2150);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ''; };
  }, [phase === 'off', festiveSplashEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'off' || festiveSplashEnabled) return null;
  return (
    <div className={'splash' + (phase === 'out' ? ' out' : '')} aria-hidden="true">
      <div className="splash-inner">
        <div className="splash-mark"><LogoMark size={96} id="spl" /></div>
        <div className="splash-name">
          {'BHIMA'.split('').map((c, i) => <span key={i} style={{ '--i': i }}>{c === ' ' ? ' ' : c}</span>)}
        </div>
        <div className="splash-sub">PRINT SOLUTIONS</div>
        <div className="splash-bar"><i /><i /><i /><i /></div>
      </div>
    </div>
  );
}
