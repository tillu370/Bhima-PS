/** Login, sign-up, password reset (Supabase Auth, email + password). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const err = $('authError'), ok = $('authOk');
  const next = BPS.safeNext(BPS.qs('next'));
  const recovering = /type=recovery/.test(location.hash);

  function say(el, msg) { err.hidden = true; ok.hidden = true; if (msg) { el.textContent = msg; el.hidden = false; } }
  function setTab(which) {
    const login = which === 'login';
    $('tabLogin').setAttribute('aria-selected', String(login));
    $('tabSignup').setAttribute('aria-selected', String(!login));
    $('paneLogin').hidden = !login; $('paneSignup').hidden = login; $('paneReset').hidden = true;
    say(err, '');
  }
  $('tabLogin').onclick = () => setTab('login');
  $('tabSignup').onclick = () => setTab('signup');
  if (location.hash === '#signup') setTab('signup');

  $('paneLogin').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('loginEmail').value.trim(), password = $('loginPassword').value;
    if (!email || !password) return say(err, 'Enter your email and password.');
    const btn = $('loginBtn'); btn.disabled = true; btn.textContent = 'Logging in…';
    const { error } = await BPS.sb.auth.signInWithPassword({ email, password });
    btn.disabled = false; btn.textContent = 'Log in';
    if (error) return say(err, error.message === 'Email not confirmed' ? 'Please confirm your email first. Check your inbox for the confirmation link.' : error.message);
    location.href = next;
  });

  $('paneSignup').addEventListener('submit', async e => {
    e.preventDefault();
    const full_name = $('suName').value.trim(), phone = $('suPhone').value.trim(), email = $('suEmail').value.trim(), password = $('suPassword').value;
    if (full_name.length < 2) return say(err, 'Please enter your full name.');
    if (!/^[+0-9][0-9 +\-]{6,18}$/.test(phone)) return say(err, 'Please enter a valid phone number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return say(err, 'Please enter a valid email address.');
    if (password.length < 8) return say(err, 'Your password must be at least 8 characters.');
    const btn = $('signupBtn'); btn.disabled = true; btn.textContent = 'Creating account…';
    const { data, error } = await BPS.sb.auth.signUp({ email, password, options: { data: { full_name, phone } } });
    btn.disabled = false; btn.textContent = 'Create account';
    if (error) return say(err, error.message);
    if (data.session) { location.href = next; return; }
    setTab('login');
    say(ok, 'Account created. Please check your email and click the confirmation link, then log in.');
  });

  $('forgotBtn').onclick = async () => {
    const email = $('loginEmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return say(err, 'Enter your email above, then click "Forgot your password?" again.');
    const { error } = await BPS.sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    if (error) return say(err, error.message);
    say(ok, 'If an account exists for that email, a reset link has been sent.');
  };

  $('paneReset').addEventListener('submit', async e => {
    e.preventDefault();
    const password = $('newPassword').value;
    if (password.length < 8) return say(err, 'Your password must be at least 8 characters.');
    const { error } = await BPS.sb.auth.updateUser({ password });
    if (error) return say(err, error.message);
    say(ok, 'Password updated. Taking you to your account…');
    setTimeout(() => (location.href = 'account.html'), 1200);
  });

  // Password-recovery link opens this page with a recovery session.
  BPS.sb.auth.onAuthStateChange(evt => {
    if (evt === 'PASSWORD_RECOVERY') {
      $('authTabs').hidden = true; $('paneLogin').hidden = true; $('paneSignup').hidden = true; $('paneReset').hidden = false;
    }
  });

  BPS.ready.then(() => {
    if (BPS.user() && !recovering) {
      say(ok, 'You are already logged in.');
      setTimeout(() => (location.href = next), 600);
    }
  });
})();
