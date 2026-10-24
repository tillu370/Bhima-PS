import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { errMsg, fmtDate, hasPrice, imgUrl, money } from '../lib/utils.js';
import { TSHIRT_COLORS } from '../data/tshirtColors.js';
import { buildProductEnquiryMessage, buildWhatsAppUrl } from '../lib/whatsappData.js';
import { applyDiscountPercent, bestCampaignForProduct, useActiveDiscountCampaigns } from '../lib/discountData.js';
import { frameTierLabel } from '../lib/frameTiers.js';

const Stars = ({ value, size = 16 }) => (
  <span className="stars" aria-hidden="true">
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} viewBox="0 0 24 24" width={size} height={size} fill={i < Math.round(value) ? '#f7a81b' : 'none'} stroke="#f7a81b" strokeWidth="1.5">
        <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.8 7.1-.7z" />
      </svg>
    ))}
  </span>
);

// Reviews are admin-managed only (see Admin > Reviews) — customers can read approved
// reviews here but there is no submission form: creating, editing or publishing a
// review is enforced server-side (RLS) as an admin-only action, not just hidden in the UI.
function Reviews({ productId }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('reviews').select('*').eq('product_id', productId).eq('status', 'approved').order('created_at', { ascending: false });
    if (err) { setError(errMsg(err)); setRows([]); return; }
    setRows(data || []);
  }, [productId]);
  useEffect(() => { setRows(null); load(); }, [load]);

  const avg = rows && rows.length ? rows.reduce((n, r) => n + r.rating, 0) / rows.length : 0;

  return (
    <section className="reviews-section">
      <div className="reviews-head">
        <h2>Reviews{rows && rows.length ? <> <Stars value={avg} size={18} /> <span className="reviews-avg">{avg.toFixed(1)} ({rows.length})</span></> : null}</h2>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {rows === null && <div className="sk-block" style={{ minHeight: 100 }} />}
      {rows && rows.length === 0 && <p className="muted">No reviews yet.</p>}
      {rows && rows.length > 0 && (
        <ul className="review-list">
          {rows.map(r => (
            <li key={r.id} className="review-item">
              <div className="review-item-head"><Stars value={r.rating} /><strong>{r.name}</strong><span className="muted">{fmtDate(r.created_at)}</span></div>
              {r.comment && <p>{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const { wishlist, toggleWishlist } = useAuth();
  const { toast, openEnquiry } = useUi();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState('loading'); // loading | ok | missing | error
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const load = useCallback(async () => {
    setState('loading'); setQty(1);
    try {
      const { data, error: err } = await supabase.from('products')
        .select('id,slug,name,description,price_from,image_url,category_id,frame_tier,categories(id,slug,name,image_url)').eq('slug', slug).eq('is_active', true).maybeSingle();
      if (err) throw err;
      if (!data) { setState('missing'); document.title = 'Product not found | Bhima Print Solutions'; return; }
      setP(data); setState('ok');
      if (data.slug === 't-shirt-printing' || data.categories?.slug === 't-shirts') {
        setSelectedColor(TSHIRT_COLORS[0]);
      } else {
        setSelectedColor(null);
      }
      document.title = data.name + ' | Bhima Print Solutions';
      if (data.categories) {
        const r = await supabase.from('products').select('id,slug,name,price_from,image_url,categories!inner(slug,name,image_url)')
          .eq('is_active', true).eq('categories.slug', data.categories.slug).neq('id', data.id).limit(4);
        setRelated(r.data || []);
      } else setRelated([]);
    } catch (e) { setError(errMsg(e)); setState('error'); }
  }, [slug]);
  useEffect(() => { load(); }, [load]);

  const clamp = v => Math.max(1, Math.min(100000, parseInt(v, 10) || 1));
  const wished = p ? wishlist.has(p.id) : false;

  const isTshirt = p?.slug === 't-shirt-printing' || p?.categories?.slug === 't-shirts';
  const displayImage = (isTshirt && selectedColor?.image) || imgUrl(p?.image_url, p?.categories?.image_url);
  const campaigns = useActiveDiscountCampaigns();
  const campaign = p && hasPrice(p.price_from) ? bestCampaignForProduct(p, campaigns) : null;
  const discountedPrice = campaign ? applyDiscountPercent(p.price_from, campaign.percent) : null;

  const handleAdd = (andCheckout = false) => {
    const q = clamp(qty);
    if (isTshirt && selectedColor) {
      cart.addCustom(p, q, '', {
        color: { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex, image: selectedColor.image },
        preview: selectedColor.image
      });
    } else {
      cart.add(p, q);
    }
    toast(`Added ${q} × "${p.name}" to your cart`);
    if (andCheckout) navigate('/checkout');
    else { setAdded(true); setTimeout(() => setAdded(false), 1300); }
  };

  const wish = async () => {
    const r = await toggleWishlist(p.id);
    if (r.status === 'login') { toast('Please log in to save items to your wishlist.'); setTimeout(() => navigate('/login?next=' + encodeURIComponent('/product/' + slug)), 900); }
    else if (r.status === 'error') toast(errMsg(r.error), 'error');
    else toast(r.status === 'added' ? 'Saved to your wishlist' : 'Removed from wishlist');
  };

  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }, { label: p ? p.name : 'Product' }];
  return (
    <>
      <PageHero crumbs={crumbs} />
      <PageSection>
        {state === 'loading' && <div className="pd-grid"><div className="sk-block" style={{ aspectRatio: '1/1', borderRadius: 28 }} /><div><div className="sk-line" /><div className="sk-line short" /><div className="sk-block" /></div></div>}
        {state === 'missing' && <StateBox title="Product not found" action={<Link className="btn btn-primary" to="/products">Browse all products</Link>}>It may have been removed or the link is incorrect.</StateBox>}
        {state === 'error' && <StateBox title="We couldn't load this product" action={<button className="btn btn-primary" onClick={load}>Try again</button>}>{error}</StateBox>}
        {state === 'ok' && p && (
          <>
            <div className="pd-grid">
              <div className="pd-image" style={isTshirt ? { aspectRatio: '5 / 4' } : undefined}>
                <img src={displayImage} alt={p.name} style={isTshirt ? { objectFit: 'contain' } : undefined} />
              </div>
              <div className="pd-info">
                {p.categories && <Link className="eyebrow" to={`/products?cat=${encodeURIComponent(p.categories.slug)}`}>{p.categories.name}</Link>}
                {p.frame_tier && <span className="frame-tier-badge">{frameTierLabel(p.frame_tier)}</span>}
                <h1>{p.name}</h1>
                {campaign
                  ? <div className="pd-price"><span>Starting from</span><strong>{money(discountedPrice)}</strong> <s className="product-price-strike">{money(p.price_from)}</s> <span className="discount-badge discount-badge-inline">{Math.round(campaign.percent)}% OFF</span></div>
                  : hasPrice(p.price_from)
                    ? <div className="pd-price"><span>Starting from</span><strong>{money(p.price_from)}</strong></div>
                    : <div className="pd-price"><span>Price</span><strong>On request</strong></div>}
                <p className="pd-desc">{p.description}</p>
                <p className="pd-note">{hasPrice(p.price_from) ? 'This is a starting price. Final price depends on quantity, size and finish. We confirm it with you before we begin printing.' : 'Send us the quantity and your design or photo and we reply with the price on WhatsApp before we begin.'}</p>

                {isTshirt && (
                  <div style={{ margin: '14px 0 18px', padding: '14px 16px', background: '#f8fafc', borderRadius: 16, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)' }}>Available Colours ({TSHIRT_COLORS.length})</span>
                      {selectedColor && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.78rem', background: '#fff', padding: '3px 10px', borderRadius: 999, border: '1px solid var(--border-light)' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedColor.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                          <strong>{selectedColor.name}</strong>
                          <code style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedColor.hex}</code>
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {TSHIRT_COLORS.map(c => {
                        const isSel = selectedColor?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedColor(c)}
                            title={`${c.name} (${c.hex})`}
                            aria-label={`Select ${c.name} (${c.hex})`}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: c.hex,
                              border: isSel ? '2.5px solid var(--teal-button, #0d9488)' : (c.hex === '#ffffff' ? '1.5px solid #cbd5e1' : '1px solid rgba(0,0,0,0.15)'),
                              boxShadow: isSel ? '0 0 0 3px rgba(13, 148, 136, 0.25)' : 'none',
                              cursor: 'pointer',
                              padding: 0,
                              transform: isSel ? 'scale(1.15)' : 'scale(1)',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pd-actions">
                  <div className="qty-stepper" role="group" aria-label="Quantity">
                    <button type="button" onClick={() => setQty(q => clamp(q - 1))} aria-label="Decrease quantity">−</button>
                    <input type="number" min="1" max="100000" value={qty} onChange={e => setQty(e.target.value === '' ? '' : clamp(e.target.value))} onBlur={() => setQty(clamp(qty))} aria-label="Quantity" />
                    <button type="button" onClick={() => setQty(q => clamp(q + 1))} aria-label="Increase quantity">+</button>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleAdd(false)}>{added ? 'Added ✓' : 'Add to Cart'}</button>
                  <button className={'wish-big' + (wished ? ' active' : '')} onClick={wish} aria-label="Save to wishlist" aria-pressed={wished}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </button>
                </div>
                <div className="pd-actions">
                  <Link className="btn btn-teal-pill" to={"/customize/" + encodeURIComponent(p.slug)}>Customise &amp; Preview</Link>
                  <button className="btn btn-secondary" onClick={() => handleAdd(true)}>Buy Now</button>
                  <button className="btn btn-secondary" onClick={() => openEnquiry('Question about ' + p.name, { product: p.name })}>Ask About This Product</button>
                  <a className="btn btn-secondary" href={buildWhatsAppUrl(buildProductEnquiryMessage(p.name))} target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>
                </div>
              </div>
            </div>
            <Reviews productId={p.id} />
            {related.length > 0 && (
              <section className="related">
                <h2>You might also like</h2>
                <div className="products-grid">{related.map(r => <ProductCard key={r.id} product={r} />)}</div>
              </section>
            )}
          </>
        )}
      </PageSection>
    </>
  );
}
