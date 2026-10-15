import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { useDialog } from '../lib/useDialog.js';
import { EMAIL_RE, errMsg, PHONE_RE } from '../lib/utils.js';

const EMPTY = { name: '', phone: '', email: '', product: '', qty: '', notes: '' };

// Enquiry form: saved to the Supabase `enquiries` table. Success is shown only after the insert succeeds.
export function EnquiryModal() {
  const { enquiry, closeEnquiry, enquirySent } = useUi();
  const { user, profile } = useAuth();
  const ref = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');
  useDialog(enquiry.open, closeEnquiry, ref);

  useEffect(() => {
    if (!enquiry.open) return;
    setError(''); setDoneMsg('');
    setForm(f => ({
      ...f,
      name: f.name || (profile && profile.full_name) || '',
      phone: f.phone || (profile && profile.phone) || '',
      email: f.email || (user && user.email) || '',
      product: enquiry.product || f.product
    }));
    const t = setTimeout(() => { const el = ref.current && ref.current.querySelector('#enqName'); if (el) el.focus(); }, 60);
    return () => clearTimeout(t);
  }, [enquiry.open, enquiry.product, user, profile]);

  useEffect(() => {
    if (!enquiry.open || products.length) return;
    supabase.from('products').select('name').eq('is_active', true).order('sort_order')
      .then(({ data }) => setProducts((data || []).map(p => p.name)));
  }, [enquiry.open, products.length]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    const name = form.name.trim(), phone = form.phone.trim(), email = form.email.trim();
    if (name.length < 2) return setError('Please enter your name.');
    if (!PHONE_RE.test(phone)) return setError('Please enter a valid phone number (digits, spaces, + or -).');
    if (email && !EMAIL_RE.test(email)) return setError('Please enter a valid email address.');
    const qty = parseInt(form.qty, 10);
    setBusy(true);
    const { error: err } = await supabase.from('enquiries').insert({
      user_id: user ? user.id : null, name, phone, email: email || null,
      enquiry_type: enquiry.title.slice(0, 120), product_interest: form.product || null,
      quantity: Number.isFinite(qty) && qty > 0 ? qty : null, message: form.notes.trim() || null
    });
    setBusy(false);
    if (err) return setError('We could not send your enquiry: ' + errMsg(err));
    setForm(EMPTY);
    enquirySent();
    setDoneMsg(`Thank you, ${name}. Our team will contact you on ${phone}.`);
  };

  const options = [...products, 'Bulk corporate merchandise', 'Something else'];
  return (
    <div className={'modal-overlay' + (enquiry.open ? ' active' : '')} aria-hidden={!enquiry.open} onClick={e => { if (e.target === e.currentTarget) closeEnquiry(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle" ref={ref}>
        <div className="modal-header">
          <h3 id="modalTitle">{enquiry.title}</h3>
          <button className="modal-close" onClick={closeEnquiry} aria-label="Close enquiry form">✕</button>
        </div>
        {doneMsg ? (
          <div className="enquiry-success">
            <div className="success-tick" aria-hidden="true">✓</div>
            <h4>Enquiry received</h4>
            <p>{doneMsg}</p>
            <button type="button" className="btn btn-primary btn-block" onClick={closeEnquiry}>Done</button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={submit} noValidate>
            <div className="form-group"><label htmlFor="enqName">Your Name *</label>
              <input id="enqName" value={form.name} onChange={set('name')} required maxLength={100} placeholder="e.g. Anand Sharma" autoComplete="name" /></div>
            <div className="form-group"><label htmlFor="enqPhone">Phone Number *</label>
              <input id="enqPhone" type="tel" value={form.phone} onChange={set('phone')} required maxLength={20} inputMode="tel" placeholder="+91 98765 43210" autoComplete="tel" /></div>
            <div className="form-group"><label htmlFor="enqEmail">Email Address</label>
              <input id="enqEmail" type="email" value={form.email} onChange={set('email')} maxLength={200} placeholder="yourname@company.com" autoComplete="email" /></div>
            <div className="form-group"><label htmlFor="enqProduct">Product of Interest</label>
              <select id="enqProduct" value={form.product} onChange={set('product')}>
                <option value="">Select (optional)</option>
                {options.map(n => <option key={n} value={n}>{n}</option>)}
              </select></div>
            <div className="form-group"><label htmlFor="enqQty">Approximate Quantity</label>
              <input id="enqQty" type="number" min="1" max="10000000" value={form.qty} onChange={set('qty')} placeholder="e.g. 100" /></div>
            <div className="form-group"><label htmlFor="enqNotes">Specific Requirements / Notes</label>
              <textarea id="enqNotes" rows={3} maxLength={3000} value={form.notes} onChange={set('notes')} placeholder="Tell us sizes, material, delivery timeline..." /></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Sending…' : 'Send Enquiry'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
