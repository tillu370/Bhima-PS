import { useState } from 'react';
import { FAQS } from '../data/faqs.js';

// Accessible accordion: one open at a time, aria-expanded / aria-controls, keyboard operable (buttons).
export function FaqGrid() {
  const [open, setOpen] = useState(-1);
  const col = items => (
    <div className="faq-col">
      {items.map(({ q, a, i }) => (
        <div className={'faq-item' + (open === i ? ' active' : '')} key={i}>
          <button className="faq-question" id={`faq-q-${i}`} aria-expanded={open === i} aria-controls={`faq-a-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{q}</span>
            <span className="faq-toggle-icon" aria-hidden="true">+</span>
          </button>
          <div className="faq-answer" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
            <p>{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
  const withIdx = FAQS.map((f, i) => ({ ...f, i }));
  return (
    <div className="faq-grid">
      {col(withIdx.slice(0, 4))}
      {col(withIdx.slice(4))}
    </div>
  );
}
