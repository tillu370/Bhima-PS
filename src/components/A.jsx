import { Link } from 'react-router-dom';

// Anchor that uses client-side routing for in-site paths ("/products", "/#faqs") and a normal <a> otherwise.
export function A({ href, children, ...rest }) {
  if (typeof href === 'string' && /^\/(?!\/)/.test(href)) return <Link to={href} {...rest}>{children}</Link>;
  const external = typeof href === 'string' && /^https?:/.test(href);
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  );
}
