import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

let catPromise = null;
export function fetchCategories() {
  if (!catPromise) {
    catPromise = supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data, error }) => {
        if (error) { catPromise = null; throw error; }
        return data;
      });
  }
  return catPromise;
}

export function useCategories() {
  const [cats, setCats] = useState([]);
  useEffect(() => { let on = true; fetchCategories().then(c => on && setCats(c)).catch(() => {}); return () => { on = false; }; }, []);
  return cats;
}
