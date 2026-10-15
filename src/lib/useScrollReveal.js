import { useEffect } from 'react';

// Fades sections in as they scroll into view. Skipped for reduced-motion users.
// Several components can use it at once, so the root class is reference-counted.
let users = 0;
export function useScrollReveal(selector, deps = []) {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;
    users += 1;
    root.classList.add('js-reveal');
    const timers = [];
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const t = en.target;
      t.classList.add('in');
      io.unobserve(t);
      timers.push(setTimeout(() => { t.classList.remove('reveal', 'in'); t.style.removeProperty('--d'); }, 1400));
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const els = [...document.querySelectorAll(selector)];
    els.forEach(el => {
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min([...el.parentElement.children].indexOf(el), 7) * 0.06 + 's');
      io.observe(el);
    });
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      els.forEach(el => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); });
      users -= 1;
      if (users <= 0) { users = 0; root.classList.remove('js-reveal'); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...deps]);
}
