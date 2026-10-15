import { useEffect } from 'react';

// Moves the hero photo and sticker slightly with the pointer. Desktop mouse only, skipped for reduced motion.
export function useHeroParallax() {
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px) and (hover: hover) and (prefers-reduced-motion: no-preference)');
    const hero = document.querySelector('.hero-section');
    if (!hero || !mq.matches) return undefined;
    let raf = 0;
    const move = e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
    };
    const reset = () => { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); };
    hero.addEventListener('mousemove', move);
    hero.addEventListener('mouseleave', reset);
    return () => { hero.removeEventListener('mousemove', move); hero.removeEventListener('mouseleave', reset); if (raf) cancelAnimationFrame(raf); };
  }, []);
}
