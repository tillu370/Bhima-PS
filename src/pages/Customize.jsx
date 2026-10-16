import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Canvas, Circle, FabricImage, IText, Path, Polygon, Rect } from 'fabric';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { ProductSkeletons } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { colourName, contrastText, paletteForSlug, startColour, templateFor, VB } from '../lib/mockups.js';
import { supabase } from '../lib/supabase.js';
import { errMsg } from '../lib/utils.js';

const FONTS = [
  ['Outfit', 'Outfit'], ['Plus Jakarta Sans', 'Plus Jakarta Sans'], ['Caveat', 'Caveat (handwriting)'],
  ['Georgia', 'Georgia (serif)'], ['Times New Roman', 'Times New Roman'], ['Arial Black', 'Arial Black'],
  ['Courier New', 'Courier New'], ['Brush Script MT', 'Brush Script']
];
const CONTROLS = {
  cornerStyle: 'circle', cornerColor: '#ffffff', cornerStrokeColor: '#0f7f7a', borderColor: '#0f7f7a',
  transparentCorners: false, cornerSize: 12, touchCornerSize: 30, padding: 4, borderScaleFactor: 2
};
const MAX_UPLOAD = 5 * 1024 * 1024;
const TABS = [['product', 'Colour'], ['image', 'Image'], ['text', 'Text'], ['shapes', 'Shapes']];
const STAR = Array.from({ length: 10 }, (_, i) => { const a = (i * 36 - 90) * Math.PI / 180, r = i % 2 ? 22 : 50; return { x: r * Math.cos(a), y: r * Math.sin(a) }; });
const HEART = 'M 0 -22 C -22 -52 -70 -26 -46 10 L 0 56 L 46 10 C 70 -26 22 -52 0 -22 Z';

const kindOf = o => (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox' ? 'text' : o.type === 'image' ? 'image' : 'shape');
const svgImage = markup => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
});

const loadImg = url => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not load the product photo.'));
  img.src = url;
});
const defaultOpts = t => Object.fromEntries((t.groups || []).map(g => [g.key, g.options[0].key]));
const isWhite = c => c.toLowerCase() === '#ffffff';

/* ------------------------------------------------------------ product picker */
function Picker() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    document.title = 'Design Studio | Bhima Print Solutions';
    supabase.from('products').select('id,slug,name,image_url').eq('is_active', true).order('sort_order')
      .then(({ data, error: e }) => { if (e) setError(errMsg(e)); else setProducts(data); });
  }, []);
  return (
    <>
      <PageHero title="Design Studio" subtitle="Pick a product, add your logo, photo or text, change colours, and see it before you order." crumbs={[{ label: 'Home', to: '/' }, { label: 'Design Studio' }]} />
      <PageSection>
        {error && <StateBox title="We couldn't load products">{error}</StateBox>}
        {!products && !error && <div className="products-grid"><ProductSkeletons n={8} /></div>}
        {products && (
          <div className="picker-grid">
            {products.map(p => (
              <Link className="picker-card" to={'/customize/' + encodeURIComponent(p.slug)} key={p.id}>
                <div className="picker-mock">
                  {templateFor(p.slug).photo && <img className="mockup-photo" src={templateFor(p.slug).photo} alt="" loading="lazy" />}
                  <div className="mockup-base" dangerouslySetInnerHTML={{ __html: templateFor(p.slug).base(startColour(p.slug)) }} />
                  <div className="mockup-overlay" dangerouslySetInnerHTML={{ __html: templateFor(p.slug).overlay(startColour(p.slug)) }} />
                </div>
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
  const baseTpl = useMemo(() => templateFor(slug), [slug]);
  const [opt, setOpt] = useState(() => defaultOpts(templateFor(slug)));
  const tpl = useMemo(() => (baseTpl.resolve ? baseTpl.resolve(opt) : baseTpl), [baseTpl, opt]);
  const tplRef = useRef(tpl);
  tplRef.current = tpl;
  const palette = useMemo(() => paletteForSlug(slug), [slug]);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [state, setState] = useState('loading');
  const [colour, setColour] = useState(startColour(slug));
  const [bg, setBg] = useState(null);
  const [tab, setTab] = useState('product');
  const [sel, setSel] = useState(null);
  const [count, setCount] = useState(0);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [draft, setDraft] = useState(null); // a saved design found for this product, offered before it is loaded

  const canvasEl = useRef(null);
  const areaRef = useRef(null);
  const historyRef = useRef([]); // stack of canvas JSON snapshots, oldest first
  const histIdxRef = useRef(-1); // index of the current snapshot
  const restoringRef = useRef(false); // true while undo/redo/draft-load is applying a snapshot (skip re-recording it)
  const fab = useRef(null);
  const files = useRef(new Map()); // fabric image object -> original File

  /* ---- load product + list for the switcher */
  useEffect(() => {
    let on = true;
    setState('loading'); setOpt(defaultOpts(templateFor(slug))); setColour(startColour(slug)); setBg(null); setSel(null); setCount(0); setError('');
    Promise.all([
      supabase.from('products').select('id,slug,name,description,price_from,image_url').eq('slug', slug).eq('is_active', true).maybeSingle(),
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

  /* ---- keep React in sync with the fabric selection */
  const sync = useCallback(() => {
    const c = fab.current;
    if (!c) return;
    setCount(c.getObjects().length);
    const o = c.getActiveObject();
    if (!o) { setSel(null); return; }
    const k = kindOf(o);
    setSel({
      kind: k, fill: typeof o.fill === 'string' ? o.fill : '#0f7f7a', fontFamily: o.fontFamily, fontSize: o.fontSize,
      bold: o.fontWeight === 'bold' || o.fontWeight === 700, italic: o.fontStyle === 'italic', text: o.text,
      angle: Math.round(((o.angle % 360) + 360) % 360), size: Math.round((o.getScaledWidth() / tplRef.current.area.w) * 100)
    });
  }, []);

  /* ---- undo / redo: a stack of canvas snapshots (not pushed while a snapshot is being restored) */
  const snapshot = useCallback(() => {
    const c = fab.current;
    if (!c || restoringRef.current) return;
    const json = JSON.stringify(c.toJSON(['selectable']));
    const next = historyRef.current.slice(0, histIdxRef.current + 1);
    if (next[next.length - 1] === json) return;
    next.push(json);
    if (next.length > 50) next.shift();
    historyRef.current = next;
    histIdxRef.current = next.length - 1;
    setCanUndo(histIdxRef.current > 0);
    setCanRedo(false);
  }, []);
  const applyHistory = useCallback(idx => {
    const c = fab.current;
    const json = historyRef.current[idx];
    if (!c || json == null) return;
    restoringRef.current = true;
    c.loadFromJSON(JSON.parse(json)).then(() => {
      c.requestRenderAll();
      restoringRef.current = false;
      histIdxRef.current = idx;
      setCanUndo(idx > 0);
      setCanRedo(idx < historyRef.current.length - 1);
      sync();
    });
  }, [sync]);
  const undo = () => applyHistory(Math.max(0, histIdxRef.current - 1));
  const redo = () => applyHistory(Math.min(historyRef.current.length - 1, histIdxRef.current + 1));

  const draftKey = `bps_draft_${slug}`;

  /* ---- create the fabric canvas once the stage is on screen */
  useEffect(() => {
    if (state !== 'ok' || !canvasEl.current) return undefined;
    const c = new Canvas(canvasEl.current, { width: tplRef.current.area.w, height: tplRef.current.area.h, preserveObjectStacking: true, selection: false, backgroundColor: undefined });
    fab.current = c;
    ['selection:created', 'selection:updated', 'selection:cleared', 'object:modified', 'object:added', 'object:removed', 'text:changed']
      .forEach(ev => c.on(ev, sync));
    ['object:modified', 'object:added', 'object:removed', 'text:changed'].forEach(ev => c.on(ev, snapshot));
    historyRef.current = []; histIdxRef.current = -1; restoringRef.current = false;
    snapshot(); // baseline: an empty canvas, so the first real change can still be undone
    setCanUndo(false); setCanRedo(false);
    // offer a previously saved draft for this product, instead of loading it automatically
    try { setDraft(localStorage.getItem(draftKey) ? JSON.parse(localStorage.getItem(draftKey)) : null); } catch (e) { setDraft(null); }
    const fit = () => {
      const a = areaRef.current;
      if (a && fab.current) fab.current.setDimensions({ width: a.clientWidth + 'px', height: a.clientHeight + 'px' }, { cssOnly: true });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(areaRef.current);
    const onKey = e => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
        if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) { e.preventDefault(); redo(); return; }
      }
      const o = c.getActiveObject();
      if (!o || o.isEditing) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); c.remove(o); c.discardActiveObject(); c.requestRenderAll(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      ro.disconnect();
      c.dispose();
      fab.current = null;
      files.current.clear();
    };
  }, [state, baseTpl, sync, snapshot, draftKey]);

  /* switching style or placement changes the print area: resize the canvas and carry the design across */
  useEffect(() => {
    const c = fab.current;
    if (!c) return;
    const { w, h } = tpl.area;
    if (c.width === w && c.height === h) return;
    const rx = w / c.width, ry = h / c.height, r = Math.min(rx, ry);
    c.getObjects().forEach(o => { o.set({ left: o.left * rx, top: o.top * ry, scaleX: o.scaleX * r, scaleY: o.scaleY * r }); o.setCoords(); });
    c.setDimensions({ width: w, height: h }, { backstoreOnly: true });
    const a = areaRef.current;
    if (a) c.setDimensions({ width: a.clientWidth + 'px', height: a.clientHeight + 'px' }, { cssOnly: true });
    c.requestRenderAll();
    sync();
  }, [tpl, sync]);

  useEffect(() => {
    const c = fab.current;
    if (!c) return;
    c.backgroundColor = bg || undefined;
    c.requestRenderAll();
  }, [bg, state]);

  /* ---- adding things */
  const place = obj => {
    const c = fab.current;
    obj.set({ ...CONTROLS });
    c.add(obj);
    c.centerObject(obj);
    obj.setCoords();
    c.setActiveObject(obj);
    c.requestRenderAll();
    sync();
  };
  const addText = () => {
    // Dark text is invisible on a navy mug or a black bottle, so pick light or dark ink to match the current colour.
    place(new IText('Your text', { fontFamily: 'Outfit', fontSize: Math.max(18, Math.round(tpl.area.w / 6)), fontWeight: 'bold', fill: contrastText(colour), textAlign: 'center', originX: 'center', originY: 'center' }));
    setTab('text');
  };
  const addImage = async file => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) { toast('Please choose a PNG, JPG, WebP or GIF image.', 'error'); return; }
    if (file.size > MAX_UPLOAD) { toast('That image is larger than 5 MB. Please choose a smaller one.', 'error'); return; }
    try {
      // A data URL (not a blob: URL) so the image is embedded when the canvas is saved as a draft or for undo/redo.
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(new Error('Could not read the file.'));
        r.readAsDataURL(file);
      });
      const img = await FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
      img.scaleToWidth(Math.min(tpl.area.w * 0.7, img.width));
      if (img.getScaledHeight() > tpl.area.h * 0.9) img.scaleToHeight(tpl.area.h * 0.9);
      files.current.set(img, file);
      place(img);
    } catch (e) { toast('We could not read that image. Try another file.', 'error'); }
  };
  const addShape = kind => {
    const fill = '#0f7f7a';
    const s = Math.min(tpl.area.w, tpl.area.h) * 0.35;
    let o;
    if (kind === 'rect') o = new Rect({ width: s * 1.3, height: s, rx: 8, ry: 8, fill });
    else if (kind === 'circle') o = new Circle({ radius: s / 2, fill });
    else if (kind === 'star') { o = new Polygon(STAR, { fill: '#f7a81b' }); o.scaleToWidth(s); }
    else { o = new Path(HEART, { fill: '#ec4899' }); o.scaleToWidth(s); }
    place(o);
  };

  /* ---- editing the selected layer */
  const active = () => fab.current && fab.current.getActiveObject();
  const change = (props, after) => {
    const o = active();
    if (!o) return;
    o.set(props);
    if (after) after(o);
    o.setCoords();
    fab.current.requestRenderAll();
    sync();
  };
  const setSize = pct => change({}, o => { o.scaleToWidth((tpl.area.w * pct) / 100); });
  const del = () => { const c = fab.current, o = active(); if (!o) return; c.remove(o); c.discardActiveObject(); c.requestRenderAll(); sync(); };
  const dup = async () => {
    const c = fab.current, o = active();
    if (!o) return;
    const copy = await o.clone();
    if (files.current.has(o)) files.current.set(copy, files.current.get(o));
    copy.set({ left: o.left + 16, top: o.top + 16, ...CONTROLS });
    c.add(copy); c.setActiveObject(copy); c.requestRenderAll(); sync();
  };
  const order = fn => { const c = fab.current, o = active(); if (!o) return; fn(c, o); c.requestRenderAll(); sync(); };

  /* ---- export */
  const composite = async () => {
    const c = fab.current;
    c.discardActiveObject();
    c.requestRenderAll();
    const size = 900, k = size / VB;
    const out = document.createElement('canvas');
    out.width = size; out.height = size;
    const ctx = out.getContext('2d');
    const photo = tpl.photo ? await loadImg(tpl.photo) : null;
    if (photo) {
      ctx.drawImage(photo, 0, 0, size, size);
      if (!isWhite(colour) && tpl.mask) {
        const t = document.createElement('canvas');
        t.width = size; t.height = size;
        const tc = t.getContext('2d');
        tc.fillStyle = colour; tc.fillRect(0, 0, size, size);
        tc.globalCompositeOperation = 'destination-in';
        tc.drawImage(await loadImg(tpl.mask), 0, 0, size, size);
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(t, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
      }
    } else {
      ctx.drawImage(await svgImage(tpl.base(colour)), 0, 0, size, size);
    }
    const a = tpl.area;
    ctx.save();
    if (a.round) { ctx.beginPath(); ctx.ellipse((a.x + a.w / 2) * k, (a.y + a.h / 2) * k, (a.w / 2) * k, (a.h / 2) * k, 0, 0, Math.PI * 2); ctx.clip(); }
    ctx.drawImage(c.toCanvasElement(Math.max(2, Math.ceil((a.w * k) / a.w))), a.x * k, a.y * k, a.w * k, a.h * k);
    ctx.restore();
    if (photo && tpl.shade) {
      // The product photo's own light and shadow, multiplied over the artwork so it looks printed on.
      ctx.save();
      ctx.beginPath(); ctx.rect(a.x * k, a.y * k, a.w * k, a.h * k); ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(await loadImg(tpl.shade), 0, 0, size, size);
      ctx.restore();
    }
    const ov = tpl.overlay(colour);
    if (ov) ctx.drawImage(await svgImage(ov), 0, 0, size, size);
    return new Promise((resolve, reject) => out.toBlob(b => (b ? resolve(b) : reject(new Error('Could not create the preview image.'))), 'image/png'));
  };
  const upload = async (blob, kind, ext) => {
    const d = new Date();
    const path = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/${kind}-${crypto.randomUUID()}.${ext}`;
    const { error: e } = await supabase.storage.from('design-uploads').upload(path, blob, { contentType: blob.type || 'image/png' });
    if (e) throw e;
    return supabase.storage.from('design-uploads').getPublicUrl(path).data.publicUrl;
  };
  const download = async () => {
    setError(''); setBusy('download');
    try {
      const blob = await composite();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}-design.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { setError(errMsg(e)); }
    setBusy('');
  };
  const addToCart = async goCheckout => {
    setError('');
    const c = fab.current;
    if (!c.getObjects().length) { setError('Add a logo, photo or some text first.'); return; }
    setBusy('cart');
    try {
      const preview = await composite();
      const previewUrl = await upload(preview, 'preview', 'png');
      const used = c.getObjects().filter(o => files.current.has(o)).map(o => files.current.get(o));
      const assets = [];
      for (const f of [...new Set(used)]) assets.push(await upload(f, 'original', f.type.split('/')[1].replace('jpeg', 'jpg')));
      const texts = c.getObjects().filter(o => kindOf(o) === 'text').map(o => ({ text: o.text, font: o.fontFamily, colour: o.fill }));
      cart.addCustom(product, Math.max(1, parseInt(qty, 10) || 1), notes, {
        preview: previewUrl, assets, colour, colourName: colourName(colour), background: bg, texts, template: tpl.label
      });
      try { localStorage.removeItem(draftKey); } catch (e2) { /* ignore */ }
      toast('Your design was added to the cart');
      navigate(goCheckout ? '/checkout' : '/cart');
    } catch (e) {
      setError('We could not save your design: ' + errMsg(e) + ' You can still download the preview and send it on WhatsApp.');
    }
    setBusy('');
  };

  /* ---- save the design in this browser so it can be picked up again later */
  const saveDraft = () => {
    const c = fab.current;
    if (!c || !c.getObjects().length) { toast('Add something to your design first.', 'error'); return; }
    try {
      localStorage.setItem(draftKey, JSON.stringify({ opt, colour, bg, qty, notes, json: c.toJSON(['selectable']) }));
      setDraft(JSON.parse(localStorage.getItem(draftKey)));
      toast('Design saved. Come back to this product any time to continue it.');
    } catch (e) {
      toast('This design is too large to save in the browser. Download the preview instead.', 'error');
    }
  };
  const loadDraft = () => {
    if (!draft) return;
    setOpt(draft.opt || defaultOpts(baseTpl)); setColour(draft.colour || startColour(slug)); setBg(draft.bg ?? null);
    if (draft.qty) setQty(draft.qty);
    if (draft.notes) setNotes(draft.notes);
    const c = fab.current;
    if (c && draft.json) {
      restoringRef.current = true;
      c.loadFromJSON(draft.json).then(() => {
        c.requestRenderAll();
        restoringRef.current = false;
        snapshot();
        sync();
      });
    }
    setDraft(null);
  };
  const discardDraft = () => { try { localStorage.removeItem(draftKey); } catch (e) { /* ignore */ } setDraft(null); };

  /* ---- render */
  if (state === 'loading') return <><PageHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Design Studio', to: '/customize' }, { label: '…' }]} /><PageSection><div className="sk-block" style={{ minHeight: 420 }} /></PageSection></>;
  if (state === 'missing') return <><PageHero title="Design Studio" /><PageSection><StateBox title="Product not found" action={<Link className="btn btn-primary" to="/customize">Choose a product</Link>}>It may have been removed.</StateBox></PageSection></>;
  if (state === 'error') return <><PageHero title="Design Studio" /><PageSection><StateBox title="We couldn't load the studio">{error}</StateBox></PageSection></>;

  const area = tpl.area;
  const pct = n => (n / VB) * 100 + '%';
  const overlay = tpl.overlay(colour);

  return (
    <>
      <PageHero title={'Design your ' + product.name} subtitle="Add your logo, photo or text, change the colours, then add it to your cart. We confirm the price and finalise the artwork on WhatsApp."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Design Studio', to: '/customize' }, { label: product.name }]} />
      <PageSection>
        {draft && (
          <div className="draft-banner studio-draft-banner">
            <strong>You have a saved design</strong> for this product from an earlier visit.
            <button type="button" className="btn btn-secondary btn-sm" onClick={loadDraft}>Continue it</button>
            <button type="button" className="link-btn" onClick={discardDraft}>Discard</button>
          </div>
        )}
        <div className="studio">
          {/* ------------------------------------------------ stage */}
          <div className="studio-stage">
            <div className="stage-toolbar">
              <button type="button" onClick={undo} disabled={!canUndo} aria-label="Undo">↺ Undo</button>
              <button type="button" onClick={redo} disabled={!canRedo} aria-label="Redo">↻ Redo</button>
            </div>
            <div className="mockup" style={{ aspectRatio: '1 / 1' }}>
              {tpl.photo && <img className="mockup-photo" src={tpl.photo} alt="" />}
              {tpl.photo && tpl.mask && !isWhite(colour) && <div className="mockup-tint" style={{ background: colour, WebkitMaskImage: `url(${tpl.mask})`, maskImage: `url(${tpl.mask})` }} />}
              {tpl.base && <div className="mockup-base" dangerouslySetInnerHTML={{ __html: tpl.base(colour) }} />}
              <div ref={areaRef} className={'print-area' + (area.round ? ' round' : '')}
                style={{ left: pct(area.x), top: pct(area.y), width: pct(area.w), height: pct(area.h) }}>
                <canvas ref={canvasEl} />
                {count === 0 && <div className="area-hint" aria-hidden="true">Your design goes here</div>}
              </div>
              {tpl.photo && tpl.shade && <img className="mockup-shade" src={tpl.shade} alt="" style={{ clipPath: `inset(${pct(area.y)} ${pct(VB - area.x - area.w)} ${pct(VB - area.y - area.h)} ${pct(area.x)})` }} />}
              {overlay && <div className="mockup-overlay" dangerouslySetInnerHTML={{ __html: overlay }} />}
            </div>
            <p className="studio-note">The dashed box is the print area. Drag to move, use the corner handles to resize or rotate.</p>

            {sel && (
              <div className="layer-bar" role="group" aria-label="Selected layer">
                <label>Size <input type="range" min="8" max="220" value={Math.min(220, Math.max(8, sel.size))} onChange={e => setSize(+e.target.value)} /></label>
                <label>Rotate <input type="range" min="0" max="359" value={sel.angle} onChange={e => change({ angle: +e.target.value })} /></label>
                <div className="layer-btns">
                  <button type="button" onClick={dup}>Duplicate</button>
                  <button type="button" onClick={() => order((c, o) => c.bringObjectToFront(o))}>To front</button>
                  <button type="button" onClick={() => order((c, o) => c.sendObjectToBack(o))}>To back</button>
                  <button type="button" onClick={() => order((c, o) => c.centerObject(o))}>Centre</button>
                  <button type="button" className="danger" onClick={del}>Delete</button>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------ panel */}
          <div className="studio-panel">
            <label className="field" htmlFor="prodSwitch" style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: '.92rem' }}>Product</span>
              <select id="prodSwitch" value={slug} onChange={e => navigate('/customize/' + e.target.value)}>
                {allProducts.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>

            {baseTpl.groups && (
              <div className="opt-groups">
                {baseTpl.groups.map(g => (
                  <div className="opt-group" role="radiogroup" aria-label={g.label} key={g.key}>
                    <span>{g.label}</span>
                    {g.options.map(o => <button key={o.key} type="button" role="radio" aria-checked={opt[g.key] === o.key} className={opt[g.key] === o.key ? 'on' : ''} onClick={() => setOpt(v => ({ ...v, [g.key]: o.key }))}>{o.label}</button>)}
                  </div>
                ))}
              </div>
            )}

            <div className="tabs studio-tabs" role="tablist" aria-label="Design tools">
              {TABS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>)}
            </div>

            {tab === 'product' && (
              <div className="tool">
                <h3>{tpl.label} colour: <b>{colourName(colour)}</b></h3>
                <div className="swatches">
                  {palette.map(c => (
                    <button type="button" key={c} className={'swatch' + (c.toLowerCase() === colour.toLowerCase() ? ' on' : '')} style={{ background: c }} title={colourName(c)} aria-label={colourName(c)} aria-pressed={c.toLowerCase() === colour.toLowerCase()} onClick={() => setColour(c)} />
                  ))}
                  <label className="swatch custom" title="Any colour"><input type="color" value={colour} onChange={e => setColour(e.target.value)} aria-label="Pick any colour" /><span>+</span></label>
                </div>
                <h3 style={{ marginTop: 18 }}>Print area background</h3>
                <div className="swatches">
                  <button type="button" className={'swatch none' + (!bg ? ' on' : '')} onClick={() => setBg(null)} aria-label="No background" aria-pressed={!bg} title="None">∅</button>
                  {['#ffffff', '#111827', '#fde68a', '#bae6fd', '#fbcfe8'].map(c => <button type="button" key={c} className={'swatch' + (bg === c ? ' on' : '')} style={{ background: c }} onClick={() => setBg(c)} aria-label={'Background ' + colourName(c)} aria-pressed={bg === c} />)}
                  <label className="swatch custom" title="Any colour"><input type="color" value={bg || '#ffffff'} onChange={e => setBg(e.target.value)} aria-label="Pick background colour" /><span>+</span></label>
                </div>
              </div>
            )}

            {tab === 'image' && (
              <div className="tool">
                <h3>Add your logo or photo</h3>
                <label className="drop">
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => { addImage(e.target.files[0]); e.target.value = ''; }} />
                  <strong>Choose an image</strong><span>PNG, JPG, WebP or GIF, up to 5 MB</span>
                </label>
                <p className="hint-text">A PNG with a transparent background works best for logos. We print from your original file, so use the highest quality you have.</p>
              </div>
            )}

            {tab === 'text' && (
              <div className="tool">
                <h3>Add text</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addText}>+ Add text</button>
                {sel && sel.kind === 'text' ? (
                  <div className="text-tools">
                    <label className="field"><span>Text</span><input value={sel.text || ''} onChange={e => change({ text: e.target.value })} maxLength={120} /></label>
                    <label className="field"><span>Font</span>
                      <select value={sel.fontFamily} onChange={e => change({ fontFamily: e.target.value })}>{FONTS.map(([v, l]) => <option key={v} value={v} style={{ fontFamily: v }}>{l}</option>)}</select></label>
                    <div className="row-inline">
                      <label className="field grow"><span>Colour</span><input type="color" value={/^#/.test(sel.fill) ? sel.fill : '#111827'} onChange={e => change({ fill: e.target.value })} /></label>
                      <button type="button" className={'toggle' + (sel.bold ? ' on' : '')} onClick={() => change({ fontWeight: sel.bold ? 'normal' : 'bold' })} aria-pressed={sel.bold}><b>B</b></button>
                      <button type="button" className={'toggle' + (sel.italic ? ' on' : '')} onClick={() => change({ fontStyle: sel.italic ? 'normal' : 'italic' })} aria-pressed={sel.italic}><i>I</i></button>
                    </div>
                  </div>
                ) : <p className="hint-text">Add text, then double-click it on the preview to type, or select it to change the font and colour.</p>}
              </div>
            )}

            {tab === 'shapes' && (
              <div className="tool">
                <h3>Add a shape</h3>
                <div className="shape-row">
                  {[['rect', 'Rectangle'], ['circle', 'Circle'], ['star', 'Star'], ['heart', 'Heart']].map(([k, l]) => <button type="button" key={k} className="btn btn-secondary btn-sm" onClick={() => addShape(k)}>{l}</button>)}
                </div>
                {sel && sel.kind === 'shape' && (
                  <label className="field" style={{ marginTop: 14 }}><span>Shape colour</span><input type="color" value={/^#/.test(sel.fill) ? sel.fill : '#0f7f7a'} onChange={e => change({ fill: e.target.value })} /></label>
                )}
              </div>
            )}

            {/* ------------------------------------------------ order box */}
            <div className="order-box">
              <div className="order-row">
                <div className="qty-stepper" role="group" aria-label="Quantity">
                  <button type="button" onClick={() => setQty(q => Math.max(1, (parseInt(q, 10) || 1) - 1))} aria-label="Decrease quantity">−</button>
                  <input type="number" min="1" max="100000" value={qty} onChange={e => setQty(e.target.value)} onBlur={() => setQty(Math.max(1, parseInt(qty, 10) || 1))} aria-label="Quantity" />
                  <button type="button" onClick={() => setQty(q => Math.min(100000, (parseInt(q, 10) || 1) + 1))} aria-label="Increase quantity">+</button>
                </div>
                <span className="order-price">{product.price_from == null ? 'Price on request' : 'from ₹' + Number(product.price_from).toLocaleString('en-IN')}</span>
              </div>
              <label className="field" style={{ marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: '.9rem' }}>Notes for us (optional)</span>
                <textarea rows={2} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Size, quantity per design, deadline…" /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="button" className="btn btn-primary btn-block" disabled={!!busy} onClick={() => addToCart(false)}>{busy === 'cart' ? 'Saving your design…' : 'Add to cart'}</button>
              <div className="order-links">
                <button type="button" className="link-btn" disabled={!!busy} onClick={() => addToCart(true)}>Add &amp; order on WhatsApp</button>
                <button type="button" className="link-btn" disabled={!!busy} onClick={download}>{busy === 'download' ? 'Preparing…' : 'Download preview'}</button>
                <button type="button" className="link-btn" disabled={!!busy} onClick={saveDraft}>Save design for later</button>
              </div>
              <p className="hint-text">Your design preview and image files are saved so we can print exactly what you see. Final artwork is confirmed with you on WhatsApp.</p>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}

export default function Customize() {
  const { slug } = useParams();
  return slug ? <Studio key={slug} slug={slug} /> : <Picker />;
}
