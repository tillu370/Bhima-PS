import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

const DEFAULT_NUMBER = '919491811360';
const STORAGE_KEY = 'bps_whatsapp_number';

// A WhatsApp number must be digits only, country code included, 7-15 digits (E.164 without the '+').
export const PHONE_DIGITS_RE = /^[0-9]{7,15}$/;

export function normalizeWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits;
}

export function validateWhatsAppNumber(raw) {
  const digits = normalizeWhatsAppNumber(raw);
  if (!digits) return 'Enter a WhatsApp number.';
  if (!PHONE_DIGITS_RE.test(digits)) return 'Enter a valid number with country code (7-15 digits, e.g. 919491811360 for +91 94918 11360).';
  return '';
}

export function getCachedWhatsAppNumber() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && PHONE_DIGITS_RE.test(cached)) return cached;
  } catch (e) { /* ignore */ }
  return DEFAULT_NUMBER;
}

function setCachedWhatsAppNumber(number) {
  try {
    localStorage.setItem(STORAGE_KEY, number);
    window.dispatchEvent(new CustomEvent('bps_whatsapp_updated', { detail: number }));
  } catch (e) { /* ignore */ }
}

export async function fetchWhatsAppNumber() {
  try {
    const { data, error } = await supabase.from('site_settings').select('whatsapp_number').eq('id', 'global').maybeSingle();
    if (!error && data && PHONE_DIGITS_RE.test(data.whatsapp_number || '')) {
      setCachedWhatsAppNumber(data.whatsapp_number);
      return data.whatsapp_number;
    }
  } catch (err) { /* offline or table not yet migrated: fall back to cache */ }
  return getCachedWhatsAppNumber();
}

export async function saveWhatsAppNumber(rawNumber) {
  const err = validateWhatsAppNumber(rawNumber);
  if (err) return { success: false, error: err };
  const number = normalizeWhatsAppNumber(rawNumber);
  try {
    const { error } = await supabase.from('site_settings').upsert({ id: 'global', whatsapp_number: number, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    setCachedWhatsAppNumber(number);
    return { success: true, number };
  } catch (e) {
    return { success: false, error: e?.message || 'Could not save. Please try again.' };
  }
}

// Fire-and-forget refresh so the cached number stays current across the app.
let primed = false;
export function primeWhatsAppNumber() {
  if (primed) return;
  primed = true;
  fetchWhatsAppNumber().catch(() => {});
}

export function buildWhatsAppUrl(text) {
  const number = getCachedWhatsAppNumber();
  return 'https://wa.me/' + number + (text ? '?text=' + encodeURIComponent(text) : '');
}

export function buildGeneralEnquiryMessage() {
  return "Hi, I'm interested in BHIMA PRINT SOLUTIONS products. Please share more details.";
}

export function buildProductEnquiryMessage(productName) {
  return `Hi, I'm interested in ${productName}. Please share the price, available options, and delivery details.`;
}

export function useWhatsAppNumber() {
  const [number, setNumber] = useState(getCachedWhatsAppNumber);
  useEffect(() => {
    let on = true;
    fetchWhatsAppNumber().then(n => { if (on) setNumber(n); });
    const onUpdate = e => setNumber(e.detail || getCachedWhatsAppNumber());
    window.addEventListener('bps_whatsapp_updated', onUpdate);
    return () => { on = false; window.removeEventListener('bps_whatsapp_updated', onUpdate); };
  }, []);
  return number;
}
