import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { ProductSkeletons } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { errMsg, imgUrl } from '../lib/utils.js';

const MAX_UPLOAD = 15 * 1024 * 1024;
const ACCEPT = /^(image\/(png|jpe?g|webp|gif)|application\/pdf)$/;

// Size/quantity breakdown, by category slug. A product in a category not listed here
// just gets a plain quantity stepper instead (e.g. a mug doesn't need sizes).
import { TSHIRT_COLORS } from '../data/tshirtColors.js';

const SIZE_SETS = {
  't-shirts': ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
};

/* ------------------------------------------------------------ product picker */
function Picker() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    document.title = 'Design Studio | Bhima Print Solutions';
    supabase.from('products').select('id,slug,name,image_url,categories(slug,name,image_url)').eq('is_active', true).order('sort_order')
      .then(({ data, error: e }) => { if (e) setError(errMsg(e)); else setProducts(data); });
  }, []);
  return (
    <>
      <PageHero title="Design Studio" subtitle="Pick a product, upload your logo or design, choose sizes and quantity, and we'll take it from there." crumbs={[{ label: 'Home', to: '/' }, { label: 'Design Studio' }]} />
      <PageSection>
        {error && <StateBox title="We couldn't load products">{error}</StateBox>}
        {!products && !error && <div className="products-grid"><ProductSkeletons n={8} /></div>}
        {products && (
          <div className="picker-grid">
            {products.map(p => (
              <Link className="picker-card" to={'/customize/' + encodeURIComponent(p.slug)} key={p.id}>
                <div className="picker-mock"><img className="mockup-photo" src={imgUrl(p.image_url, p.categories?.image_url)} alt="" loading="lazy" /></div>
                <strong>{p.name}</strong>
                <span>Start designing →</span>
              </Link>
            ))}
          </div>
        )}
      </PageSection>
    </>
  );
}

/* -------------------------------------------------------------------- studio */
function Studio({ slug }) {
  const navigate = useNavigate();
  const cart = useCart();
  const { toast } = useUi();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [state, setState] = useState('loading');
  const [files, setFiles] = useState([]); // [{ file, preview }]
  const [over, setOver] = useState(false);
  const [sizes, setSizes] = useState({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState(TSHIRT_COLORS[0]);
  const inputId = 'studioFile';
  const previewsRef = useRef([]);

  useEffect(() => {
    let on = true;
    setState('loading'); setFiles([]); setSizes({}); setQty(1); setNotes(''); setError(''); setSelectedColor(TSHIRT_COLORS[0]);
    Promise.all([
      supabase.from('products').select('id,slug,name,description,price_from,image_url,categories(slug,name,image_url)').eq('slug', slug).eq('is_active', true).maybeSingle(),
      supabase.from('products').select('slug,name').eq('is_active', true).order('sort_order')
    ]).then(([p, list]) => {
      if (!on) return;
      if (p.error) { setError(errMsg(p.error)); setState('error'); return; }
      if (!p.data) { setState('missing'); return; }
      setProduct(p.data); setAllProducts(list.data || []); setState('ok');
      document.title = 'Design ' + p.data.name + ' | Bhima Print Solutions';
    }).catch(e => { if (on) { setError(errMsg(e)); setState('error'); } });
    return () => { on = false; };
  }, [slug]);

  useEffect(() => () => previewsRef.current.forEach(u => URL.revokeObjectURL(u)), []);

  const isTshirt = product?.categories?.slug === 't-shirts' || product?.slug === 't-shirt-printing' || slug === 't-shirt-printing';
  const mockupSrc = (isTshirt && selectedColor?.image) || imgUrl(product?.image_url, product?.categories?.image_url);
  const sizeList = product && SIZE_SETS[product.categories?.slug];
  const sizeTotal = sizeList ? sizeList.reduce((n, s) => n + (parseInt(sizes[s], 10) || 0), 0) : 0;

  const addFiles = list => {
    const picked = [...list].filter(f => {
      if (!ACCEPT.test(f.type)) { toast(`"${f.name}" isn't a JPG, PNG, WebP, GIF or PDF.`, 'error'); return false; }
      if (f.size > MAX_UPLOAD) { toast(`"${f.name}" is larger than 15 MB.`, 'error'); return false; }
      return true;
    }).map(file => {
      const preview = /^image\//.test(file.type) ? URL.createObjectURL(file) : null;
      if (preview) previewsRef.current.push(preview);
      return { file, preview };
    });
    if (picked.length) setFiles(f => [...f, ...picked]);
  };
  const removeFile = i => setFiles(f => f.filter((_, k) => k !== i));
  const setSize = (s, v) => setSizes(cur => ({ ...cur, [s]: v.replace(/[^0-9]/g, '').slice(0, 5) }));
  const clampQty = v => Math.max(1, Math.min(100000, parseInt(v, 10) || 1));

  const addToCart = async goCheckout => {
    setError('');
    const finalQty = sizeList ? sizeTotal : clampQty(qty);
    if (sizeList && finalQty < 1) { setError('Add at least one size and quantity.'); return; }
    setBusy(true);
    try {
      const assets = [];
      for (const { file } of files) {
        const d = new Date();
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/upload-${crypto.randomUUID()}.${ext}`;
        const { error: e } = await supabase.storage.from('design-uploads').upload(path, file, { contentType: file.type || 'application/octet-stream' });
        if (e) throw e;
        assets.push(supabase.storage.from('design-uploads').getPublicUrl(path).data.publicUrl);
      }
      const design = {
        assets,
        color: isTshirt && selectedColor ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex, image: selectedColor.image } : null,
        sizes: sizeList ? Object.fromEntries(sizeList.filter(s => parseInt(sizes[s], 10) > 0).map(s => [s, parseInt(sizes[s], 10)])) : null,
        preview: mockupSrc
      };
      cart.addCustom(product, finalQty, notes, design);
      toast('Added to your cart');
      navigate(goCheckout ? '/checkout' : '/cart');
    } catch (e) {
      setError('We could not save your upload: ' + errMsg(e) + ' You can still send it to us directly on WhatsApp.');
    }
    setBusy(false);
  };

  if (state === 'loading') return <><PageHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Design Studio', to: '/customize' }, { label: '…' }]} /><PageSection><div className="sk-block" style={{ minHeight: 420 }} /></PageSection></>;
  if (state === 'missing') return <><PageHero title="Design Studio" /><PageSection><StateBox title="Product not found" action={<Link className="btn btn-primary" to="/customize">Choose a product</Link>}>It may have been removed.</StateBox></PageSection></>;
  if (state === 'error') return <><PageHero title="Design Studio" /><PageSection><StateBox title="We couldn't load the studio">{error}</StateBox></PageSection></>;

  return (
    <>
      <PageHero title={'Design your ' + product.name} subtitle="Upload your logo or design, choose sizes and quantity, and add it to your cart. Our team finalises the artwork and price with you on WhatsApp."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Design Studio', to: '/customize' }, { label: product.name }]} />
      <PageSection>
        <div className="studio">
          <div className="studio-stage">
            <div className="mockup" style={{ aspectRatio: isTshirt ? '5 / 4' : '1 / 1', maxWidth: isTshirt ? 640 : 560 }}>
              <img className="mockup-photo" src={mockupSrc} alt={product.name} style={isTshirt ? { objectFit: 'contain' } : undefined} />
              {isTshirt && selectedColor && (
                <div className="mockup-badge">
                  <span className="mockup-badge-dot" style={{ backgroundColor: selectedColor.hex }} />
                  <span>{selectedColor.name} ({selectedColor.hex})</span>
                </div>
              )}
            </div>
            {isTshirt && (
              <div className="tshirt-thumb-strip" aria-label="Available colours">
                {TSHIRT_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={'tshirt-thumb-btn' + (selectedColor?.id === c.id ? ' active' : '')}
                    onClick={() => setSelectedColor(c)}
                    title={`${c.name} (${c.hex})`}
                    aria-label={`Select ${c.name} (${c.hex})`}
                  >
                    <span className="tshirt-thumb-dot" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            )}
            <p className="studio-note">
              {isTshirt
                ? 'High-quality 100% cotton polo t-shirt with front chest & back contact print. Choose your colour and sizes below.'
                : "Don't have a logo or design ready? No problem — add it to cart anyway and our team will create one with you."}
            </p>
          </div>

          <div className="studio-panel">
            <label className="field" htmlFor="prodSwitch" style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: '.92rem' }}>Product</span>
              <select id="prodSwitch" value={slug} onChange={e => navigate('/customize/' + e.target.value)}>
                {allProducts.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>

            {isTshirt && (
              <div className="tool tshirt-color-tool">
                <div className="tshirt-color-head">
                  <h3>T-Shirt Colour</h3>
                  <span className="tshirt-color-badge">
                    <span className="tshirt-color-indicator" style={{ backgroundColor: selectedColor.hex }} />
                    <strong>{selectedColor.name}</strong>
                    <code>{selectedColor.hex}</code>
                  </span>
                </div>
                <div className="tshirt-color-grid">
                  {TSHIRT_COLORS.map(c => {
                    const isSel = selectedColor?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={'tshirt-color-card' + (isSel ? ' active' : '')}
                        onClick={() => setSelectedColor(c)}
                        aria-pressed={isSel}
                      >
                        <span
                          className="tshirt-swatch-circle"
                          style={{
                            backgroundColor: c.hex,
                            border: c.hex === '#ffffff' ? '1.5px solid #cbd5e1' : '1.5px solid rgba(0,0,0,0.12)'
                          }}
                        />
                        <span className="tshirt-color-meta">
                          <span className="tshirt-color-name">{c.name}</span>
                          <span className="tshirt-color-hex">{c.hex}</span>
                        </span>
                        {isSel && <span className="tshirt-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="tool">
              <h3>Your logo or design (optional)</h3>
              <label
                className={'drop' + (over ? ' drag-over' : '')}
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
              >
                <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" multiple onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
                <strong>Upload your logo or artwork</strong>
                <span>JPG, PNG, WebP, GIF or PDF — up to 15 MB each</span>
              </label>
              {files.length > 0 && (
                <ul className="file-list">
                  {files.map((f, i) => (
                    <li key={i}>
                      {f.preview ? <img src={f.preview} alt="" /> : <span className="file-icon">📄</span>}
                      <span className="file-name">{f.file.name}</span>
                      <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${f.file.name}`}>✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {sizeList ? (
              <div className="tool">
                <h3>Sizes &amp; quantity</h3>
                <div className="size-grid">
                  {sizeList.map(s => (
                    <label key={s} className="size-box">
                      <span>{s}</span>
                      <input type="number" min="0" max="99999" inputMode="numeric" value={sizes[s] || ''} placeholder="0" onChange={e => setSize(s, e.target.value)} />
                    </label>
                  ))}
                </div>
                <p className="hint-text">Total quantity: <strong>{sizeTotal}</strong></p>
              </div>
            ) : (
              <div className="tool">
                <h3>Quantity</h3>
                <div className="qty-stepper" role="group" aria-label="Quantity">
                  <button type="button" onClick={() => setQty(q => clampQty(q - 1))} aria-label="Decrease quantity">−</button>
                  <input type="number" min="1" max="100000" value={qty} onChange={e => setQty(e.target.value === '' ? '' : clampQty(e.target.value))} onBlur={() => setQty(clampQty(qty))} aria-label="Quantity" />
                  <button type="button" onClick={() => setQty(q => clampQty(q + 1))} aria-label="Increase quantity">+</button>
                </div>
              </div>
            )}

            <div className="tool">
              <h3>Notes for us</h3>
              <textarea rows={3} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Company name, tagline, print position, colours — anything we should know" />
            </div>

            <div className="order-box">
              <div className="order-row">
                <span className="order-price">{product.price_from == null ? 'Price on request' : 'from ₹' + Number(product.price_from).toLocaleString('en-IN')}</span>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="button" className="btn btn-primary btn-block" disabled={!!busy} onClick={() => addToCart(false)}>{busy ? 'Saving…' : 'Add to cart'}</button>
              <div className="order-links">
                <button type="button" className="link-btn" disabled={!!busy} onClick={() => addToCart(true)}>Add &amp; order on WhatsApp</button>
              </div>
              <p className="hint-text">Your files are saved so we can print exactly what you need. Final artwork and price are confirmed with you on WhatsApp.</p>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}

/* -------------------------------------------------------------------- page */
export default function Customize() {
  const { slug } = useParams();
  return slug ? <Studio key={slug} slug={slug} /> : <Picker />;
}
