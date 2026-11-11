import { useEffect, useRef } from 'react';
import { supabase } from './supabase.js';

const SESSION_KEY = 'bps_wa_session_id';
const HEARTBEAT_MS = 60_000; // how often an active, visible tab re-touches the session

// One random id per browser, kept in localStorage so it survives a closed tab
// and reload. This id - not anything in memory - is what the inactivity
// scheduler on the server trusts, matching the "don't rely on beforeunload" rule.
export function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (e) {
    return 'nostorage-' + Math.random().toString(36).slice(2);
  }
}

// Heartbeat while the tab is visible. Hidden/backgrounded tabs stop pinging,
// so a visitor who switches away still counts toward the inactivity timer -
// a closed or background tab is not proof of continued engagement.
let heartbeatStarted = false;
export function useActivityHeartbeat(enabled = true) {
  const timerRef = useRef(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const ping = () => { touchSession().catch(() => {}); };
    const start = () => {
      if (document.visibilityState !== 'visible') return;
      ping();
      if (!timerRef.current) timerRef.current = setInterval(ping, HEARTBEAT_MS);
    };
    const stop = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
    const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop());

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [enabled]);
}

// Links the current session to a customer once a phone number is known (e.g.
// right after a consent-bearing form submit). Safe to call again later;
// touch_session only sets customer_id when it was previously null.
export async function touchSession(phone) {
  try {
    await supabase.rpc('touch_session', { p_session_id: getSessionId(), p_phone: phone || null });
  } catch (e) { /* offline or not migrated yet: no-op */ }
}

// Called on every consent-bearing form (enquiry, checkout, signup, account
// profile). Only ever sets marketing_consent = true when the box was ticked -
// never resets an existing "true" back to false just because someone
// resubmitted the form with the box unticked out of habit.
export async function saveWhatsAppConsent(phone, name, consent, source) {
  try {
    const { error } = await supabase.rpc('save_whatsapp_consent', { p_phone: phone, p_name: name, p_consent: !!consent, p_source: source });
    if (error) return { success: false, error: error.message };
    await touchSession(phone);
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || 'Could not save your preference.' };
  }
}

// Self-service opt-out (STOP link on the privacy page). Immediately blocks
// future promotional sends for that phone number.
export async function whatsappOptOut(phone) {
  try {
    const { error } = await supabase.rpc('whatsapp_opt_out', { p_phone: phone });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || 'Could not process your request.' };
  }
}

// Checkout completed: this session should never receive an abandonment nudge.
export async function markSessionConverted() {
  try {
    await supabase.rpc('mark_session_converted', { p_session_id: getSessionId() });
  } catch (e) { /* no-op */ }
}
