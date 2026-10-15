import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHero, PageSection } from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { EMAIL_RE, PHONE_RE } from '../lib/utils.js';

// Only allow same-site paths after login.
const safeNext = n => (n && /^\/(?!\/)[A-Za-z0-9_\-/?=&#%.]*$/.test(n) ? n : '/account');

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const next = safeNext(params.get('next'));
  const recovering = useRef(/type=recovery/.test(window.location.hash));
  const [tab, setTab] = useState(window.location.hash === '#signup' ? 'signup' : 'login');
  const [recovery, setRecovery] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ name: '', phone: '', email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { document.title = 'Log in or Sign up | Bhima Print Solutions'; }, []);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(evt => { if (evt === 'PASSWORD_RECOVERY') setRecovery(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (ready && user && !recovering.current && !recovery) {
      setMsg({ type: 'ok', text: 'You are already logged in.' });
      const t = setTimeout(() => navigate(next, { replace: true }), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [ready, user, recovery, navigate, next]);

  const say = (type, text) => setMsg({ type, text });
  const switchTab = t => { setTab(t); say('', ''); };

  const doLogin = async e => {
    e.preventDefault();
    if (!login.email || !login.password) return say('error', 'Enter your email and password.');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: login.email.trim(), password: login.password });
    setBusy(false);
    if (error) return say('error', error.message === 'Email not confirmed' ? 'Please confirm your email first. Check your inbox for the confirmation link.' : error.message);
    navigate(next, { replace: true });
  };

  const doSignup = async e => {
    e.preventDefault();
    const { name, phone, email, password } = signup;
    if (name.trim().length < 2) return say('error', 'Please enter your full name.');
    if (!PHONE_RE.test(phone.trim())) return say('error', 'Please enter a valid phone number.');
    if (!EMAIL_RE.test(email.trim())) return say('error', 'Please enter a valid email address.');
    if (password.length < 8) return say('error', 'Your password must be at least 8 characters.');
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), phone: phone.trim() } } });
    setBusy(false);
    if (error) return say('error', error.message);
    if (data.session) { navigate(next, { replace: true }); return; }
    setTab('login');
    say('ok', 'Account created. Please check your email and click the confirmation link, then log in.');
  };

  const forgot = async () => {
    if (!EMAIL_RE.test(login.email.trim())) return say('error', 'Enter your email above, then click "Forgot your password?" again.');
    const { error } = await supabase.auth.resetPasswordForEmail(login.email.trim(), { redirectTo: window.location.origin + '/login' });
    if (error) return say('error', error.message);
    say('ok', 'If an account exists for that email, a reset link has been sent.');
  };

  const doReset = async e => {
    e.preventDefault();
    if (newPassword.length < 8) return say('error', 'Your password must be at least 8 characters.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return say('error', error.message);
    say('ok', 'Password updated. Taking you to your account…');
    setTimeout(() => navigate('/account'), 1200);
  };

  return (
    <>
      <PageHero title="Welcome" subtitle="Log in to save your favourites and send enquiries faster." />
      <PageSection>
        <div className="auth-wrap">
          <div className="form-card">
            {!recovery && (
              <div className="tabs" role="tablist" aria-label="Account">
                <button type="button" role="tab" aria-selected={tab === 'login'} onClick={() => switchTab('login')}>Log in</button>
                <button type="button" role="tab" aria-selected={tab === 'signup'} onClick={() => switchTab('signup')}>Sign up</button>
              </div>
            )}
            {msg.type === 'error' && <p className="form-error" role="alert">{msg.text}</p>}
            {msg.type === 'ok' && <p className="form-ok" role="status">{msg.text}</p>}

            {!recovery && tab === 'login' && (
              <form onSubmit={doLogin} noValidate>
                <div className="field"><label htmlFor="loginEmail">Email</label><input id="loginEmail" type="email" autoComplete="email" required value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} /></div>
                <div className="field"><label htmlFor="loginPassword">Password</label><input id="loginPassword" type="password" autoComplete="current-password" required value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} /></div>
                <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
                <p className="auth-alt"><button type="button" className="link-btn" onClick={forgot}>Forgot your password?</button></p>
              </form>
            )}

            {!recovery && tab === 'signup' && (
              <form onSubmit={doSignup} noValidate>
                <div className="field"><label htmlFor="suName">Full name</label><input id="suName" autoComplete="name" maxLength={100} required value={signup.name} onChange={e => setSignup({ ...signup, name: e.target.value })} /></div>
                <div className="field"><label htmlFor="suPhone">Phone</label><input id="suPhone" type="tel" autoComplete="tel" maxLength={20} required value={signup.phone} onChange={e => setSignup({ ...signup, phone: e.target.value })} /></div>
                <div className="field"><label htmlFor="suEmail">Email</label><input id="suEmail" type="email" autoComplete="email" required value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} /></div>
                <div className="field"><label htmlFor="suPassword">Password</label><input id="suPassword" type="password" autoComplete="new-password" minLength={8} required value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} /><span className="hint">At least 8 characters.</span></div>
                <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
              </form>
            )}

            {recovery && (
              <form onSubmit={doReset} noValidate>
                <h2>Set a new password</h2>
                <div className="field"><label htmlFor="newPassword">New password</label><input id="newPassword" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                <button className="btn btn-primary btn-block" type="submit">Update password</button>
              </form>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}
