import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Supabase session, profile (role), and the signed-in user's wishlist.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wishlist, setWishlist] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  const loadUserData = useCallback(async sess => {
    if (!sess) { setProfile(null); setWishlist(new Set()); return; }
    const [p, w] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sess.user.id).maybeSingle(),
      supabase.from('wishlist').select('product_id')
    ]);
    setProfile(p.data || null);
    setWishlist(new Set((w.data || []).map(r => r.product_id)));
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession()
      .then(async ({ data }) => {
        if (!alive) return;
        setSession(data.session);
        await loadUserData(data.session);
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      // Defer: calling Supabase inside this callback can deadlock the auth client.
      setTimeout(async () => { if (!alive) return; setSession(sess); await loadUserData(sess); }, 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setWishlist(new Set());
  }, []);

  // Returns 'login' when the visitor must sign in first, otherwise 'added' | 'removed' | 'error'.
  const toggleWishlist = useCallback(async productId => {
    if (!session) return { status: 'login' };
    const had = wishlist.has(productId);
    const { error } = had
      ? await supabase.from('wishlist').delete().eq('product_id', productId)
      : await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: productId });
    if (error) return { status: 'error', error };
    setWishlist(cur => { const n = new Set(cur); if (had) n.delete(productId); else n.add(productId); return n; });
    return { status: had ? 'removed' : 'added' };
  }, [session, wishlist]);

  const value = useMemo(() => ({
    session, user: session ? session.user : null, profile, setProfile,
    isAdmin: !!(profile && profile.role === 'admin'), wishlist, toggleWishlist, signOut, ready
  }), [session, profile, wishlist, toggleWishlist, signOut, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
