import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Fallback shown only until the admin publishes real reviews (Admin > Reviews),
// so the homepage never looks empty on a fresh install.
const FALLBACK = [
  { id: 'f1', rating: 5, comment: "Excellent quality and super fast service. Our college fest banners came out perfect!", name: 'Rohit Varma', role: 'ANITS, Vizag' },
  { id: 'f2', rating: 5, comment: "Loved the personalised mugs! Great print quality and packaging. Highly recommended!", name: 'Priya Reddy', role: 'Customer' },
  { id: 'f3', rating: 5, comment: "Professional team, easy process and on-time delivery. We've been doing our corporate orders with them regularly!", name: 'Suresh Kumar', role: 'Business Owner' }
];

const initials = name => (name || '')
  .trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

// "What Our Customers Say" cards on the home page. Pulls the best approved
// reviews across all products so admins can manage this section from
// Admin > Reviews (add/edit/publish) instead of it being hardcoded.
export function HomeTestimonials() {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    let on = true;
    supabase.from('reviews').select('id,name,rating,comment,products(name)')
      .eq('status', 'approved').order('rating', { ascending: false }).order('created_at', { ascending: false }).limit(10)
      .then(({ data, error }) => { if (on && !error) setReviews(data || []); })
      .catch(() => {});
    return () => { on = false; };
  }, []);

  const shown = reviews && reviews.length ? reviews.map(r => ({
    id: r.id, rating: r.rating, comment: r.comment, name: r.name, role: r.products ? r.products.name : 'Customer'
  })) : FALLBACK;

  return (
    <div className="testimonial-cards-container" role="region" aria-label="Approved customer reviews" tabIndex={0}>
      {shown.map(r => (
        <div className="testimonial-card" key={r.id}>
          <div className="stars-row">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
          {r.comment && <p className="review-quote">"{r.comment}"</p>}
          <div className="reviewer-meta">
            <span className="reviewer-avatar" aria-hidden="true">{initials(r.name)}</span>
            <div>
              <h4 className="reviewer-name">{r.name}</h4>
              <p className="reviewer-role">{r.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
