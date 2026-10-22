import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

export const FESTIVALS = [
  {
    id: 'diwali',
    name: 'Diwali',
    tagline: 'Festival of Lights',
    season: 'Oct - Nov',
    thumb: '/images/festive/diwali/hero-diwali-gifts-1.png',
    primaryColor: '#100B25',
    secondaryColor: '#241044',
    accentColor: '#D8A84E',
    highlightColor: '#F3D58A',
    badgeText: 'Diwali Festive Theme',
    defaultStartDate: '2026-10-15',
    defaultEndDate: '2026-11-15',
    heroImages: [
      { id: 'diwali-gifts-1', name: 'Diwali Gifts Showcase (Classic)', path: '/images/festive/diwali/hero-diwali-gifts-1.png', desc: 'Custom mugs, photo frames, coasters, water bottle & lanterns.' },
      { id: 'diwali-gifts-2', name: 'Festive Apparel & Gift Boxes', path: '/images/festive/diwali/hero-diwali-gifts-2.png', desc: 'Custom printed festive T-shirt, diary, pen & photo frame.' },
      { id: 'diwali-diya', name: 'Luxury Diya Celebration', path: '/images/festive/diwali/hero-diwali-diya.png', desc: 'Wide scene with central golden diya, marigolds & royal purple backdrop.' }
    ],
    promoImages: [
      { id: 'diwali-promo-boxes', name: 'Luxury Diwali Gift Boxes', path: '/images/festive/diwali/promo-diwali-giftboxes.png', desc: 'Elegant purple & gold gift boxes with diyas and golden ribbons.' },
      { id: 'diwali-promo-diya', name: 'Golden Diya Ambience', path: '/images/festive/diwali/hero-diwali-diya.png', desc: 'Golden diya and lanterns lighting up festive gifts.' }
    ],
    splashImage: '/images/festive/diwali/splash-diwali-vertical.png',
    patternImage: '/images/festive/diwali/pattern-diwali-mandala.png',
    decorationImage: '/images/festive/diwali/diya-mandala-isolated.png',
    defaultEyebrow: 'FESTIVE COLLECTION',
    defaultHeadline: 'This Diwali, Gift Happiness',
    defaultDescription: 'Personalised gifts, custom prints and memorable keepsakes for your loved ones.',
    defaultCtaLabel: 'Explore Diwali Collection',
    defaultCtaLink: '/products',
    defaultPromoEyebrow: 'DIWALI SPECIALS',
    defaultPromoTitle: 'Personalised Diwali Gift Hampers',
    defaultPromoDesc: 'Custom ceramic mugs, engraved wooden frames & luxury corporate hampers crafted with love.',
    defaultPromoCta: 'Shop Diwali Gifts',
    defaultAnnouncementText: 'Diwali Specials | Personalised Gifts & Custom Prints',
    defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'christmas',
    name: 'Christmas',
    tagline: 'Season of Joy & Giving',
    season: 'Dec - Jan',
    thumb: '/images/festive/christmas/christmas-hero.png',
    primaryColor: '#0B2B1E',
    secondaryColor: '#4A0E17',
    accentColor: '#D4AF37',
    highlightColor: '#E8C872',
    badgeText: 'Christmas Festive Theme',
    defaultStartDate: '2026-12-01',
    defaultEndDate: '2026-12-31',
    heroImages: [
      { id: 'xmas-hero-1', name: 'Candlelight Gifts & Pine', path: '/images/festive/christmas/christmas-hero.png', desc: 'Luxury wrapped presents, candlelight lanterns, golden baubles and pine.' },
      { id: 'xmas-hero-2', name: 'Bokeh Tree & Lantern Display', path: '/images/festive/christmas/christmas-gifts-banner.png', desc: 'Warm glowing Christmas tree, festive gift boxes and lantern illumination.' }
    ],
    promoImages: [
      { id: 'xmas-promo-1', name: 'Luxury Christmas Gift Boxes', path: '/images/festive/christmas/christmas-gifts-banner.png', desc: 'Evergreen & burgundy gift hampers with satin ribbons.' },
      { id: 'xmas-promo-2', name: 'Evergreen Hearthside Presents', path: '/images/festive/christmas/christmas-hero.png', desc: 'Warm candles, pine cones, and gold-ribboned gift boxes.' }
    ],
    splashImage: '/images/festive/christmas/christmas-splash.png',
    patternImage: '/images/festive/christmas/christmas-pattern.png',
    decorationImage: '/images/festive/christmas/christmas-decoration.png',
    defaultEyebrow: 'CHRISTMAS COLLECTION',
    defaultHeadline: 'Make Christmas More Personal',
    defaultDescription: 'Thoughtful personalised gifts that make every holiday celebration special.',
    defaultCtaLabel: 'Explore Christmas Gifts',
    defaultCtaLink: '/products',
    defaultPromoEyebrow: 'HOLIDAY SPECIALS',
    defaultPromoTitle: 'Personalised Christmas Hampers',
    defaultPromoDesc: 'Custom ceramic holiday mugs, warm engraved wooden frames & luxury corporate gift boxes.',
    defaultPromoCta: 'Shop Christmas Gifts',
    defaultAnnouncementText: 'Christmas Specials | Personalised Holiday Gifts & Prints',
    defaultAnnouncementCta: 'Explore Gifts'
  },
  {
    id: 'new-year',
    name: 'New Year',
    tagline: 'Fresh Starts & Grand Celebrations',
    season: 'Dec - Jan',
    thumb: '/images/festive/new-year/new-year-hero.png',
    primaryColor: '#0B132B',
    secondaryColor: '#1C2541',
    accentColor: '#E0B042',
    highlightColor: '#F6D884',
    badgeText: 'New Year Festive Theme',
    defaultStartDate: '2026-12-28',
    defaultEndDate: '2027-01-10',
    heroImages: [
      { id: 'ny-hero-1', name: 'Golden Celebration & Midnight Fireworks', path: '/images/festive/new-year/new-year-hero.png', desc: 'Custom diary, pen, marble mug, bottle and midnight fireworks background.' },
      { id: 'ny-hero-2', name: 'New Year Toast & Gift Collection', path: '/images/festive/new-year/new-year-gifts-banner.png', desc: 'Festive gift boxes with golden ribbons, confetti and celebratory lighting.' }
    ],
    promoImages: [
      { id: 'ny-promo-1', name: 'New Year Keepsakes & Gift Boxes', path: '/images/festive/new-year/new-year-gifts-banner.png', desc: 'Midnight navy & gold luxury gift boxes with festive streamers.' },
      { id: 'ny-promo-2', name: 'Golden Sparkle Showcase', path: '/images/festive/new-year/new-year-hero.png', desc: 'Customised stationery and corporate New Year sets.' }
    ],
    splashImage: '/images/festive/new-year/new-year-splash.png',
    patternImage: '/images/festive/new-year/new-year-pattern.png',
    decorationImage: '/images/festive/new-year/new-year-decoration.png',
    defaultEyebrow: 'NEW YEAR SPECIALS',
    defaultHeadline: 'Celebrate New Beginnings in Style',
    defaultDescription: 'Customised diaries, engraved corporate sets, personalised calendars and bespoke gifts.',
    defaultCtaLabel: 'Explore New Year Gifts',
    defaultCtaLink: '/products',
    defaultPromoEyebrow: 'NEW YEAR HAMPERS',
    defaultPromoTitle: 'Corporate & Personalised Sets',
    defaultPromoDesc: 'Start the year with branded desk planners, metallic tumblers, and executive pens.',
    defaultPromoCta: 'View New Year Sets',
    defaultAnnouncementText: 'New Year Specials | Custom Planners, Calendars & Keepsakes',
    defaultAnnouncementCta: 'Shop New Year'
  },
  {
    id: 'sankranthi',
    name: 'Sankranthi',
    tagline: 'Harvest Festival & Warm Traditions',
    season: 'January',
    thumb: '/images/festive/sankranthi/sankranthi-hero.png',
    primaryColor: '#78350F',
    secondaryColor: '#B45309',
    accentColor: '#F59E0B',
    highlightColor: '#FDE68A',
    badgeText: 'Sankranthi Festive Theme',
    defaultStartDate: '2027-01-10',
    defaultEndDate: '2027-01-20',
    heroImages: [
      { id: 'sankranthi-hero-1', name: 'Sankranthi Harvest & Festive Gifts', path: '/images/festive/sankranthi/sankranthi-hero.png', desc: 'Traditional pots, marigolds, sugarcane, custom printed mugs, frames & notebooks.' },
      { id: 'sankranthi-hero-2', name: 'Kites & Traditional Treats Showcase', path: '/images/festive/sankranthi/sankranthi-gifts-banner.png', desc: 'Festive gift boxes with traditional patterns and golden harvest glow.' }
    ],
    promoImages: [
      { id: 'sankranthi-promo-1', name: 'Festive Harvest Gift Hampers', path: '/images/festive/sankranthi/sankranthi-gifts-banner.png', desc: 'Handcrafted gift sets for Sankranthi celebrations with friends & family.' },
      { id: 'sankranthi-promo-2', name: 'Golden Harvest Celebration', path: '/images/festive/sankranthi/sankranthi-hero.png', desc: 'Custom printed festive mugs, frames and brass accents.' }
    ],
    splashImage: '/images/festive/sankranthi/sankranthi-splash.png',
    patternImage: '/images/festive/sankranthi/sankranthi-pattern.png',
    decorationImage: '/images/festive/sankranthi/sankranthi-decoration.png',
    defaultEyebrow: 'HARVEST SPECIALS',
    defaultHeadline: 'Celebrate Sankranthi with Personalised Warmth',
    defaultDescription: 'Custom printed photo mugs, traditional engraved wooden frames and festive corporate gifts.',
    defaultCtaLabel: 'Explore Sankranthi Gifts',
    defaultCtaLink: '/products',
    defaultPromoEyebrow: 'SANKRANTHI SPECIALS',
    defaultPromoTitle: 'Traditional Festive Hampers',
    defaultPromoDesc: 'Celebrate harvest traditions with customized ceramic mugs, photo frames and family keepsakes.',
    defaultPromoCta: 'Shop Festive Gifts',
    defaultAnnouncementText: 'Sankranthi Specials | Custom Photo Gifts & Traditional Keepsakes',
    defaultAnnouncementCta: 'Explore Collection'
  }
];

/**
 * Returns theme-specific rendering data for the hero banner, splash screen,
 * and promotional components. Maps festival IDs to visual + copy details
 * that the shared DiwaliHeroBanner and DiwaliSplashScreen components consume.
 *
 * @param {string} themeId — 'diwali' | 'christmas' | 'new-year' | 'sankranthi'
 * @returns {object} Theme rendering config
 */
export function getFestiveTheme(themeId) {
  const THEME_RENDER_DATA = {
    diwali: {
      id: 'diwali',
      name: 'Diwali',
      icon: 'diya',
      layout: 'left',
      objectPosition: 'center right',
      heroBannerOptions: [
        { path: '/images/festive/diwali/hero-diwali-gifts-1.png', layout: 'left' },
        { path: '/images/festive/diwali/hero-diwali-gifts-2.png', layout: 'left' },
        { path: '/images/festive/diwali/hero-diwali-diya.png', layout: 'center' }
      ],
      pattern: '/images/festive/diwali/pattern-diwali-mandala.png',
      cornerAccent: '/images/festive/diwali/diya-mandala-isolated.png',
      splash: '/images/festive/diwali/splash-diwali-vertical.png',
      splashEyebrow: 'SHUBH DEEPAVALI',
      splashHeadline: 'Celebrate the Festival',
      splashHighlight: 'of Lights',
      splashSubtext: 'Personalised gifts & custom prints crafted with love for your celebrations.',
      defaults: {
        hero_eyebrow: 'FESTIVE COLLECTION',
        hero_headline: 'This Diwali, Gift Happiness',
        hero_description: 'Personalised gifts, custom prints and memorable keepsakes for your loved ones.',
        hero_cta_label: 'Explore Diwali Collection',
        hero_cta_link: '/products',
        hero_secondary_cta_label: 'Shop Personalised Prints',
        hero_secondary_cta_link: '/products'
      }
    },
    christmas: {
      id: 'christmas',
      name: 'Christmas',
      icon: 'star',
      layout: 'left',
      objectPosition: 'center right',
      heroBannerOptions: [
        { path: '/images/festive/christmas/christmas-hero.png', layout: 'left' },
        { path: '/images/festive/christmas/christmas-gifts-banner.png', layout: 'left' }
      ],
      pattern: '/images/festive/christmas/christmas-pattern.png',
      cornerAccent: '/images/festive/christmas/christmas-decoration.png',
      splash: '/images/festive/christmas/christmas-splash.png',
      splashEyebrow: 'MERRY CHRISTMAS',
      splashHeadline: 'Season of Joy',
      splashHighlight: '& Giving',
      splashSubtext: 'Thoughtful personalised gifts that make every holiday celebration special.',
      defaults: {
        hero_eyebrow: 'CHRISTMAS COLLECTION',
        hero_headline: 'Make Christmas More Personal',
        hero_description: 'Thoughtful personalised gifts that make every holiday celebration special.',
        hero_cta_label: 'Explore Christmas Gifts',
        hero_cta_link: '/products',
        hero_secondary_cta_label: 'Shop Holiday Prints',
        hero_secondary_cta_link: '/products'
      }
    },
    'new-year': {
      id: 'new-year',
      name: 'New Year',
      icon: 'spark',
      layout: 'left',
      objectPosition: 'center center',
      heroBannerOptions: [
        { path: '/images/festive/new-year/new-year-hero.png', layout: 'left' },
        { path: '/images/festive/new-year/new-year-gifts-banner.png', layout: 'left' }
      ],
      pattern: '/images/festive/new-year/new-year-pattern.png',
      cornerAccent: '/images/festive/new-year/new-year-decoration.png',
      splash: '/images/festive/new-year/new-year-splash.png',
      splashEyebrow: 'HAPPY NEW YEAR',
      splashHeadline: 'Welcome',
      splashHighlight: 'New Beginnings',
      splashSubtext: 'Custom planners, calendars & bespoke gifts to start the year in style.',
      defaults: {
        hero_eyebrow: 'NEW YEAR SPECIALS',
        hero_headline: 'Celebrate New Beginnings in Style',
        hero_description: 'Customised diaries, engraved corporate sets, personalised calendars and bespoke gifts.',
        hero_cta_label: 'Explore New Year Gifts',
        hero_cta_link: '/products',
        hero_secondary_cta_label: 'Shop Corporate Sets',
        hero_secondary_cta_link: '/products'
      }
    },
    sankranthi: {
      id: 'sankranthi',
      name: 'Sankranthi',
      icon: 'sun',
      layout: 'left',
      objectPosition: 'center center',
      heroBannerOptions: [
        { path: '/images/festive/sankranthi/sankranthi-hero.png', layout: 'left' },
        { path: '/images/festive/sankranthi/sankranthi-gifts-banner.png', layout: 'left' }
      ],
      pattern: '/images/festive/sankranthi/sankranthi-pattern.png',
      cornerAccent: '/images/festive/sankranthi/sankranthi-decoration.png',
      splash: '/images/festive/sankranthi/sankranthi-splash.png',
      splashEyebrow: 'HAPPY SANKRANTHI',
      splashHeadline: 'Celebrate the',
      splashHighlight: 'Harvest Festival',
      splashSubtext: 'Traditional gifts, custom photo mugs & festive keepsakes for family warmth.',
      defaults: {
        hero_eyebrow: 'HARVEST SPECIALS',
        hero_headline: 'Celebrate Sankranthi with Personalised Warmth',
        hero_description: 'Custom printed photo mugs, traditional engraved wooden frames and festive corporate gifts.',
        hero_cta_label: 'Explore Sankranthi Gifts',
        hero_cta_link: '/products',
        hero_secondary_cta_label: 'Shop Festive Gifts',
        hero_secondary_cta_link: '/products'
      }
    }
  };

  return THEME_RENDER_DATA[themeId] || THEME_RENDER_DATA.diwali;
}

export function buildDefaultFestivalConfig(festivalId) {
  const f = FESTIVALS.find(x => x.id === festivalId) || FESTIVALS[0];
  return {
    festival_id: f.id,
    enabled: false,
    auto_schedule: false,
    start_date: f.defaultStartDate,
    end_date: f.defaultEndDate,
    splash_enabled: true,
    texture_enabled: true,
    hero_image: f.heroImages[0]?.path || f.thumb,
    hero_eyebrow: f.defaultEyebrow,
    hero_headline: f.defaultHeadline,
    hero_description: f.defaultDescription,
    hero_cta_label: f.defaultCtaLabel,
    hero_cta_link: f.defaultCtaLink,
    promo_image: f.promoImages[0]?.path || f.thumb,
    promo_eyebrow: f.defaultPromoEyebrow,
    promo_title: f.defaultPromoTitle,
    promo_description: f.defaultPromoDesc,
    promo_cta_label: f.defaultPromoCta,
    promo_cta_link: '/products?cat=photo-frames',
    announcement_text: f.defaultAnnouncementText,
    announcement_cta_label: f.defaultAnnouncementCta,
    announcement_cta_link: '/products',
    splash_image: f.splashImage,
    pattern_image: f.patternImage,
    decoration_image: f.decorationImage,
    updated_at: new Date().toISOString()
  };
}

export const DEFAULT_FESTIVE_STATE = {
  active_festival_id: 'none', // 'none' | 'diwali' | 'christmas' | 'new-year' | 'sankranthi'
  themes: {
    diwali: buildDefaultFestivalConfig('diwali'),
    christmas: buildDefaultFestivalConfig('christmas'),
    'new-year': buildDefaultFestivalConfig('new-year'),
    sankranthi: buildDefaultFestivalConfig('sankranthi')
  },
  updated_at: new Date().toISOString()
};

const STORAGE_KEY = 'bps_festive_theme_system';
const PREVIEW_KEY = 'bps_festive_preview_override';
const PREVIEW_DRAFT_KEY = 'bps_festive_preview_draft';

function mergeFestiveState(parsed = {}) {
  return {
    ...DEFAULT_FESTIVE_STATE,
    ...parsed,
    themes: Object.fromEntries(FESTIVALS.map(festival => [
      festival.id,
      {
        ...buildDefaultFestivalConfig(festival.id),
        ...(parsed.themes?.[festival.id] || {})
      }
    ]))
  };
}

export function getCachedFestiveState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeFestiveState(parsed);
    }
  } catch (e) {}
  return DEFAULT_FESTIVE_STATE;
}

export function getFestivePreviewOverride() {
  try {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('festive_preview')
        || params.get('diwali_preview')
        || params.get('christmas_preview')
        || params.get('newyear_preview')
        || params.get('sankranthi_preview');
      if (p === 'diwali' || p === 'christmas' || p === 'new-year' || p === 'sankranthi') return p;
      if (p === 'true' || p === '1') {
        const search = window.location.search;
        if (search.includes('christmas')) return 'christmas';
        if (search.includes('newyear')) return 'new-year';
        if (search.includes('sankranthi')) return 'sankranthi';
        return 'diwali';
      }
      if (p === 'false' || p === '0' || p === 'none') return 'none';
    }
    const raw = sessionStorage.getItem(PREVIEW_KEY);
    if (raw) return raw;
  } catch (e) {}
  return null;
}

export function getFestivePreviewDraft() {
  try {
    const raw = sessionStorage.getItem(PREVIEW_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setFestivePreviewOverride(val, draftConfig = null) {
  try {
    if (!val || val === 'none') {
      sessionStorage.removeItem(PREVIEW_KEY);
      sessionStorage.removeItem(PREVIEW_DRAFT_KEY);
    } else {
      sessionStorage.setItem(PREVIEW_KEY, val);
      if (draftConfig) sessionStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify({ festivalId: val, config: draftConfig }));
      else sessionStorage.removeItem(PREVIEW_DRAFT_KEY);
    }
    window.dispatchEvent(new CustomEvent('bps_festive_preview_changed', {
      detail: { festivalId: val, draftConfig }
    }));
  } catch (e) {}
}

/**
 * Evaluates which festival should be active on the storefront.
 * Returns: 'none' | 'diwali' | 'christmas' | 'new-year' | 'sankranthi'
 */
export function resolveActiveFestiveTheme(state = DEFAULT_FESTIVE_STATE, previewOverride = null, now = new Date()) {
  if (previewOverride && previewOverride !== 'none' && FESTIVALS.some(f => f.id === previewOverride)) {
    return previewOverride;
  }

  if (!state || !state.themes) return 'none';

  // 1. Check if an active festival is manually specified and enabled
  if (state.active_festival_id && state.active_festival_id !== 'none') {
    const target = state.themes[state.active_festival_id];
    if (target && target.enabled) {
      return state.active_festival_id;
    }
  }

  // 2. Check if any festival is manually enabled
  for (const f of FESTIVALS) {
    const conf = state.themes[f.id];
    if (conf && conf.enabled) {
      return f.id;
    }
  }

  // 3. Check auto scheduling for each festival
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  for (const f of FESTIVALS) {
    const conf = state.themes[f.id];
    if (conf && conf.auto_schedule && conf.start_date && conf.end_date) {
      if (today >= conf.start_date && today <= conf.end_date) {
        return f.id;
      }
    }
  }

  return 'none';
}

export async function fetchFestiveState() {
  try {
    const { data, error } = await supabase
      .from('site_festival_theme')
      .select('*')
      .eq('id', 'festive_master')
      .maybeSingle();

    if (!error && data && data.config_json) {
      const parsed = typeof data.config_json === 'string' ? JSON.parse(data.config_json) : data.config_json;
      const merged = { ...mergeFestiveState(parsed), updated_at: data.updated_at || new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    }

    // Preserve an installation that still has the original single-Diwali row.
    if (!error && !data) {
      const { data: legacy } = await supabase
        .from('site_festival_theme')
        .select('*')
        .eq('id', 'diwali')
        .maybeSingle();
      if (legacy) {
        const legacyConfig = typeof legacy.config_json === 'string'
          ? JSON.parse(legacy.config_json || '{}')
          : (legacy.config_json || {});
        const legacyThemeSource = legacyConfig.themes?.diwali || legacyConfig;
        const defaultDiwali = buildDefaultFestivalConfig('diwali');
        const legacyTheme = {
          ...defaultDiwali,
          ...legacyThemeSource,
          festival_id: 'diwali',
          enabled: legacyThemeSource.enabled ?? !!legacy.is_active,
          hero_headline: legacyThemeSource.hero_headline || legacy.banner_title || defaultDiwali.hero_headline,
          hero_description: legacyThemeSource.hero_description || legacy.banner_text || defaultDiwali.hero_description,
          hero_cta_label: legacyThemeSource.hero_cta_label || legacy.button_text || defaultDiwali.hero_cta_label,
          hero_cta_link: legacyThemeSource.hero_cta_link || legacy.button_link || defaultDiwali.hero_cta_link,
          announcement_text: legacyThemeSource.announcement_text || legacy.banner_text || defaultDiwali.announcement_text
        };
        const migrated = mergeFestiveState({
          active_festival_id: legacy.is_active ? 'diwali' : 'none',
          themes: { ...DEFAULT_FESTIVE_STATE.themes, diwali: legacyTheme }
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        } catch (e) {}
        return migrated;
      }
    }
  } catch (err) {}
  return getCachedFestiveState();
}

export async function saveFestiveState(newState) {
  const payload = {
    ...mergeFestiveState(newState),
    updated_at: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('bps_festive_state_updated', { detail: payload }));
  } catch (e) {}

  try {
    const activeId = resolveActiveFestiveTheme(payload);
    const activeConf = payload.themes[activeId] || payload.themes.diwali;

    const { error } = await supabase
      .from('site_festival_theme')
      .upsert({
        id: 'festive_master',
        is_active: activeId !== 'none',
        theme_id: activeId,
        banner_title: activeConf.hero_headline,
        banner_text: activeConf.hero_description,
        button_text: activeConf.hero_cta_label,
        button_link: activeConf.hero_cta_link,
        show_banner: activeId !== 'none',
        config_json: payload,
        updated_at: payload.updated_at
      }, { onConflict: 'id' });

    if (error) {
      return { success: false, warning: `Saved in this browser, but publishing failed: ${error.message || 'database rejected the update'}`, data: payload };
    }
    return { success: true, data: payload };
  } catch (err) {
    return { success: false, warning: `Saved in this browser, but publishing failed: ${err?.message || 'database is unavailable'}`, data: payload };
  }
}

/**
 * Unified React hook for the storefront & layout
 */
export function useFestiveTheme() {
  const [state, setState] = useState(getCachedFestiveState);
  const [preview, setPreview] = useState(getFestivePreviewOverride);
  const [previewDraft, setPreviewDraft] = useState(getFestivePreviewDraft);

  useEffect(() => {
    fetchFestiveState().then(fresh => {
      if (fresh) setState(fresh);
    });

    const onStateUpdate = e => {
      if (e?.detail) setState(e.detail);
      else setState(getCachedFestiveState());
    };
    const onPreviewChange = e => {
      if (e?.detail && typeof e.detail === 'object') {
        setPreview(e.detail.festivalId ?? getFestivePreviewOverride());
        setPreviewDraft(e.detail.draftConfig ? { festivalId: e.detail.festivalId, config: e.detail.draftConfig } : null);
      } else {
        setPreview(e?.detail ?? getFestivePreviewOverride());
        setPreviewDraft(getFestivePreviewDraft());
      }
    };
    const onStorage = e => {
      if (e.key === STORAGE_KEY) setState(getCachedFestiveState());
    };

    window.addEventListener('bps_festive_state_updated', onStateUpdate);
    window.addEventListener('bps_festive_preview_changed', onPreviewChange);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('bps_festive_state_updated', onStateUpdate);
      window.removeEventListener('bps_festive_preview_changed', onPreviewChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const activeThemeId = resolveActiveFestiveTheme(state, preview);
  const isFestive = activeThemeId !== 'none';
  const festivalMeta = FESTIVALS.find(f => f.id === activeThemeId) || null;
  const activeConfig = isFestive
    ? (previewDraft?.festivalId === activeThemeId
      ? { ...(state.themes[activeThemeId] || buildDefaultFestivalConfig(activeThemeId)), ...previewDraft.config }
      : (state.themes[activeThemeId] || buildDefaultFestivalConfig(activeThemeId)))
    : null;

  return {
    state,
    activeThemeId,
    isFestive,
    festivalMeta,
    activeConfig,
    isPreview: !!preview && preview !== 'none',
    previewTheme: preview,
    setPreview: setFestivePreviewOverride,
    reload: () => setState(getCachedFestiveState())
  };
}
