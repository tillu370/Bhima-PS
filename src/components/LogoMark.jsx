// Bhima Print Solutions logomark: the full illustrated CMYK "B" artwork
// (public/images/logo-mark.png), shown uncropped at a fixed height with
// its natural (taller-than-wide) aspect ratio.
export function LogoMark({ size = 46 }) {
  return (
    <img className="logo-svg" src="/images/logo-mark.png" height={size}
      alt="Bhima Print Solutions logo" />
  );
}

// Two-line wordmark: BHIMA over PRINT SOLUTIONS.
export function Wordmark() {
  return (
    <div className="logo-text">
      <span className="brand-name">BHIMA</span>
      <span className="brand-sub">PRINT SOLUTIONS</span>
    </div>
  );
}
