// Backward-compatible bridge to unified festiveThemeData.js
export {
  FESTIVALS,
  buildDefaultFestivalConfig,
  DEFAULT_FESTIVE_STATE,
  getCachedFestiveState,
  fetchFestiveState,
  saveFestiveState,
  useFestiveTheme,
  getFestiveTheme
} from './festiveThemeData.js';

import {
  useFestiveTheme,
  buildDefaultFestivalConfig,
  setFestivePreviewOverride,
  FESTIVALS as _FESTIVALS
} from './festiveThemeData.js';

export const DEFAULT_DIWALI_CONFIG = buildDefaultFestivalConfig('diwali');

export function useDiwaliTheme() {
  const { isFestive, activeThemeId, festivalMeta, activeConfig, isPreview, setPreview, reload } = useFestiveTheme();
  const fallbackMeta = _FESTIVALS.find(f => f.id === activeThemeId);
  const theme = festivalMeta || fallbackMeta || { id: activeThemeId || 'diwali', name: 'Diwali' };
  return {
    config: activeConfig || DEFAULT_DIWALI_CONFIG,
    theme,
    isDiwali: isFestive, // Active whenever any festive theme is enabled
    activeThemeId,
    isPreview,
    setPreview: (val) => setFestivePreviewOverride(val ? (typeof val === 'string' ? val : 'diwali') : 'none'),
    reload
  };
}

export function isSplashSeenInSession(festivalId = 'festive') {
  try {
    return sessionStorage.getItem(`bps_${festivalId}_splash_seen`) === '1';
  } catch (e) {
    return false;
  }
}

export function markSplashSeenInSession(festivalId = 'festive') {
  try {
    sessionStorage.setItem(`bps_${festivalId}_splash_seen`, '1');
  } catch (e) {}
}
