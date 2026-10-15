// Bhima Printing Solutions logomark: a geometric "B" on a navy-to-teal tile with a mustard
// full stop (the print "dot"), echoing the brand's CMYK / halftone motif.
export function LogoMark({ size = 46, id = 'lm' }) {
  return (
    <svg className="logo-svg" width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Bhima Printing Solutions logo">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b1b3f" />
          <stop offset="1" stopColor="#0f7f7a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${id}-bg)`} />
      <path d="M0 40 L8 48 H0 Z" fill="#ffffff" opacity=".08" />
      <path d="M15.5 12.5v23M15.5 12.5H25a5.75 5.75 0 0 1 0 11.5H15.5M15.5 24H26.5a5.75 5.75 0 0 1 0 11.5H15.5"
        fill="none" stroke="#ffffff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36.5" cy="34.5" r="3.2" fill="#f7a81b" />
    </svg>
  );
}

// Two-line wordmark: BHIMA over PRINTING SOLUTIONS.
export function Wordmark() {
  return (
    <div className="logo-text">
      <span className="brand-name">BHIMA</span>
      <span className="brand-sub">PRINTING SOLUTIONS</span>
    </div>
  );
}
