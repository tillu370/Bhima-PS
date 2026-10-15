import { Link } from 'react-router-dom';

export function PageHero({ title, subtitle, crumbs }) {
  return (
    <section className="page-hero">
      <div className="container">
        {crumbs && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i}>{i > 0 && <span> / </span>}{c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}</span>
            ))}
          </nav>
        )}
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}

export function StateBox({ title, children, action }) {
  return (
    <div className="state-box">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function PageSection({ children }) {
  return <section className="page-section"><div className="container">{children}</div></section>;
}
