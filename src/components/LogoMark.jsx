// Bhima Print Solutions logomark: the CMYK-rainbow "print swoosh" crop of the
// brand's illustrated B artwork (public/images/logo-mark.png).
export function LogoMark({ size = 46 }) {
  return (
    <img className="logo-svg" src="/images/logo-mark.png" width={size} height={size}
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
