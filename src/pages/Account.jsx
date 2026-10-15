import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, PageSection, StateBox } from '../components/PageHero.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { supabase } from '../lib/supabase.js';
import { errMsg, fmtDate, PHONE_RE } from '../lib/utils.js';

const TABS = ['wishlist', 'enquiries', 'profile'];

function Wishlist() {
  const { wishlist } = useAuth();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const { data, error: err } = await supabase.from('wishlist')
      .select('product_id, products(id,slug,name,price_from,image_url,is_active,categories(slug,name))').order('created_at', { ascending: false });
    if (err) { setError(errMsg(err)); return; }
    setProducts(data.map(r => r.products).filter(p => p && p.is_active));
  }, []);
  // Reload when hearts are toggled (wishlist set changes).
  useEffect(() => { load(); }, [load, wishlist]);

  if (error) return <StateBox title="Something went wrong" action={<button className="btn btn-primary" onClick={load}>Try again</button>}>{error}</StateBox>;
  if (!products) return <div className="sk-block" style={{ minHeight: 180 }} />;
  if (!products.length) return <StateBox title="Nothing saved yet" action={<Link className="btn btn-primary" to="/products">Explore Products</Link>}>Tap the heart on any product to save it here.</StateBox>;
  return <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}

function Enquiries() {
  const { user } = useAuth();
  const { openEnquiry, enquiryVersion } = useUi();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const { data, error: err } = await supabase.from('enquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (err) setError(errMsg(err)); else setRows(data);
  }, [user.id]);
  useEffect(() => { load(); }, [load, enquiryVersion]);

  if (error) return <StateBox title="Something went wrong" action={<button className="btn btn-primary" onClick={load}>Try again</button>}>{error}</StateBox>;
  if (!rows) return <div className="sk-block" style={{ minHeight: 180 }} />;
  if (!rows.length) return <StateBox title="No enquiries yet" action={<button className="btn btn-primary" onClick={() => openEnquiry('Get a Custom Quote')}>Send an enquiry</button>}>Enquiries you send while logged in will appear here.</StateBox>;
  return (
    <>
      <div className="panel-head"><h2>My Enquiries</h2><button className="btn btn-primary btn-sm" onClick={() => openEnquiry('Get a Custom Quote')}>New enquiry</button></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Type</th><th>Product</th><th>Qty</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(q => (
              <tr key={q.id}>
                <td data-label="Date">{fmtDate(q.created_at)}</td>
                <td data-label="Type">{q.enquiry_type}{q.message && <><br /><small style={{ color: '#64748b' }}>{q.message.slice(0, 140)}</small></>}</td>
                <td data-label="Product">{q.product_interest || '-'}</td>
                <td data-label="Qty">{q.quantity || '-'}</td>
                <td data-label="Status"><span className={'badge ' + q.status}>{q.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Profile() {
  const { user, profile, setProfile } = useAuth();
  const [name, setName] = useState(profile ? profile.full_name || '' : '');
  const [phone, setPhone] = useState(profile ? profile.phone || '' : '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const say = (type, text) => setMsg({ type, text });

  const save = async e => {
    e.preventDefault();
    if (phone.trim() && !PHONE_RE.test(phone.trim())) return say('error', 'Please enter a valid phone number.');
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() || null, phone: phone.trim() || null }).eq('id', user.id);
    setBusy(false);
    if (error) return say('error', error.message);
    setProfile({ ...profile, full_name: name.trim(), phone: phone.trim() });
    say('ok', 'Profile saved.');
  };
  const changePassword = async e => {
    e.preventDefault();
    if (password.length < 8) return say('error', 'Your password must be at least 8 characters.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return say('error', error.message);
    setPassword(''); say('ok', 'Password updated.');
  };

  return (
    <>
      {msg.type === 'error' && <p className="form-error" role="alert">{msg.text}</p>}
      {msg.type === 'ok' && <p className="form-ok" role="status">{msg.text}</p>}
      <form onSubmit={save} noValidate style={{ maxWidth: 520 }}>
        <div className="field"><label htmlFor="pfEmail">Email</label><input id="pfEmail" value={user.email} disabled /><span className="hint">Your login email.</span></div>
        <div className="field"><label htmlFor="pfName">Full name</label><input id="pfName" maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label htmlFor="pfPhone">Phone</label><input id="pfPhone" type="tel" maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>Save changes</button>
      </form>
      <hr style={{ margin: '28px 0', border: 0, borderTop: '1.5px dashed #e3e8ef' }} />
      <form onSubmit={changePassword} noValidate style={{ maxWidth: 520 }}>
        <h2 style={{ fontSize: '1.2rem' }}>Change password</h2>
        <div className="field"><label htmlFor="pwNew">New password</label><input id="pwNew" type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /><span className="hint">At least 8 characters.</span></div>
        <button className="btn btn-secondary" type="submit">Update password</button>
      </form>
    </>
  );
}

export default function Account() {
  const { tab: tabParam } = useParams();
  const tab = TABS.includes(tabParam) ? tabParam : 'wishlist';
  const navigate = useNavigate();
  const { user, isAdmin, ready, signOut } = useAuth();
  useEffect(() => { document.title = 'My Account | Bhima Printing Solutions'; }, []);

  if (!ready) return <><PageHero title="My Account" /><PageSection><div className="sk-block" style={{ minHeight: 260 }} /></PageSection></>;
  if (!user) {
    return (
      <>
        <PageHero title="My Account" subtitle="Your wishlist, enquiries and profile." />
        <PageSection><StateBox title="Please log in" action={<Link className="btn btn-primary" to="/login?next=/account">Log in or sign up</Link>}>Log in to see your wishlist, enquiries and profile.</StateBox></PageSection>
      </>
    );
  }
  const label = { wishlist: 'Wishlist', enquiries: 'My Enquiries', profile: 'Profile' };
  return (
    <>
      <PageHero title="My Account" subtitle="Your wishlist, enquiries and profile." />
      <PageSection>
        <div className="dash">
          <nav className="dash-nav" role="tablist" aria-label="Account sections">
            {TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} onClick={() => navigate('/account/' + t)}>{label[t]}</button>)}
            {isAdmin && <Link to="/admin">Admin Dashboard →</Link>}
            <button type="button" onClick={async () => { await signOut(); navigate('/'); }}>Log out</button>
          </nav>
          <div className="panel" role="tabpanel">
            {tab !== 'enquiries' && <h2>{label[tab]}</h2>}
            {tab === 'wishlist' && <Wishlist />}
            {tab === 'enquiries' && <Enquiries />}
            {tab === 'profile' && <Profile />}
          </div>
        </div>
      </PageSection>
    </>
  );
}
