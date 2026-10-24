import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

// Older saved theme configs used this placeholder; mergeFestiveState upgrades it.
const TRANSPARENT_PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7';

// Public festive artwork supplied with the project. URL-encode spaces so the
// same paths resolve on both the local Windows dev server and Linux hosting.
const FESTIVE_ASSETS = {
  'republic-day': {
    hero: '/images/festive/Republic%20Day%201.png',
    promo: '/images/festive/Republic%20Day%202.png',
    pattern: '/images/festive/Republic%20Day%203.png'
  },
  'independence-day': {
    hero: '/images/festive/Independence%20day%202.png',
    pattern: '/images/festive/Independence%20day%203.png'
  },
  'vinayaka-chavithi': {
    hero: '/images/festive/Vinayak%20Chavithi%201.png',
    promo: '/images/festive/Vinayak%20Chavithi%202.png',
    pattern: '/images/festive/Vinayak%20Chavithi%203.png'
  },
  dasara: {
    hero: '/images/festive/Dasara%201.png',
    promo: '/images/festive/Dasara%202.png',
    pattern: '/images/festive/Dasara%203.png'
  },
  holi: {
    hero: '/images/festive/Holi%201.png',
    promo: '/images/festive/Holi%202.png',
    pattern: '/images/festive/Holi%203.png'
  },
  'valentines-day': {
    hero: '/images/festive/Feb%2014%201.png',
    promo: '/images/festive/Feb%2014%202.png',
    pattern: '/images/festive/Feb%2014%203.png'
  },
  'raksha-bandhan': {
    hero: '/images/festive/Rakshabandhan%201.png',
    promo: '/images/festive/Rakshabandhan%202.png',
    pattern: '/images/festive/Rakshabandhan%203.png'
  }
};

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
    defaultPromoCtaLink: '/products?cat=corporate-gift-sets',
    defaultAnnouncementText: 'Diwali Specials | Personalised Gifts & Custom Prints',
    defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'christmas',
    name: 'Christmas',
    tagline: 'Season of Joy & Giving',
    season: 'Dec - Jan',
    thumb: '/images/festive/christmas/christmas-hero.png',
    primaryColor: '#123B2D',
    secondaryColor: '#792C3A',
    accentColor: '#D5B36A',
    highlightColor: '#FFF8EE',
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
    defaultPromoCtaLink: '/products?cat=mugs',
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
    defaultPromoCtaLink: '/products?cat=customised-pens',
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
    defaultPromoCtaLink: '/products?cat=photo-frames',
    defaultAnnouncementText: 'Sankranthi Specials | Custom Photo Gifts & Traditional Keepsakes',
    defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'republic-day',
    name: 'Republic Day',
    tagline: 'Tricolour Pride & Patriotic Gifting',
    season: '26 January',
    thumb: FESTIVE_ASSETS['republic-day'].hero,
    primaryColor: '#16543A', secondaryColor: '#E1842B', accentColor: '#B68A42', highlightColor: '#DDF0E2',
    badgeText: 'Republic Day Theme',
    defaultStartDate: '2027-01-20', defaultEndDate: '2027-01-27',
    heroImages: [{ id: 'rd-hero-1', name: 'India Gate Tricolour Gift Showcase', path: FESTIVE_ASSETS['republic-day'].hero, desc: 'Personalised gift collection framed by elegant tricolour accents and India Gate.' }],
    promoImages: [{ id: 'rd-promo-1', name: 'Republic Day Gift Showcase', path: FESTIVE_ASSETS['republic-day'].promo, desc: 'Custom corporate and personal patriotic gifts.' }],
    splashImage: FESTIVE_ASSETS['republic-day'].hero,
    patternImage: FESTIVE_ASSETS['republic-day'].pattern, decorationImage: null,
    defaultEyebrow: 'REPUBLIC DAY SPECIALS', defaultHeadline: 'Celebrate Republic Day with Custom Prints',
    defaultDescription: 'Patriotic mugs, t-shirts, badges and corporate gifts personalised for the occasion.',
    defaultCtaLabel: 'Explore Republic Day Gifts', defaultCtaLink: '/products',
    defaultPromoEyebrow: 'TRICOLOUR SPECIALS', defaultPromoTitle: 'Patriotic Custom Gifts',
    defaultPromoDesc: 'Custom printed mugs, badges and corporate sets for Republic Day celebrations.',
    defaultPromoCta: 'Shop Republic Day Gifts', defaultPromoCtaLink: '/products',
    defaultAnnouncementText: 'Republic Day Specials | Patriotic Custom Prints & Gifts', defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'independence-day',
    name: 'Independence Day',
    tagline: 'Freedom Fest & National Pride',
    season: '15 August',
    thumb: FESTIVE_ASSETS['independence-day'].hero,
    primaryColor: '#104B35', secondaryColor: '#D97724', accentColor: '#B99754', highlightColor: '#D9E9D8',
    badgeText: 'Independence Day Theme',
    defaultStartDate: '2027-08-08', defaultEndDate: '2027-08-16',
    heroImages: [{ id: 'id-hero-1', name: 'Freedom & India Gate Showcase', path: FESTIVE_ASSETS['independence-day'].hero, desc: 'Patriotic personalised gift showcase with refined tricolour details.' }],
    promoImages: [{ id: 'id-promo-1', name: 'Freedom Fest Gift Showcase', path: FESTIVE_ASSETS['independence-day'].hero, desc: 'Custom corporate and personal Independence Day gifts.' }],
    splashImage: FESTIVE_ASSETS['independence-day'].hero,
    patternImage: FESTIVE_ASSETS['independence-day'].pattern, decorationImage: null,
    defaultEyebrow: 'INDEPENDENCE DAY SPECIALS', defaultHeadline: 'Celebrate Freedom with Custom Prints',
    defaultDescription: 'Patriotic mugs, t-shirts, badges and corporate gifts personalised for the occasion.',
    defaultCtaLabel: 'Explore Independence Day Gifts', defaultCtaLink: '/products',
    defaultPromoEyebrow: 'FREEDOM FEST SPECIALS', defaultPromoTitle: 'Patriotic Custom Gifts',
    defaultPromoDesc: 'Custom printed mugs, badges and corporate sets for Independence Day celebrations.',
    defaultPromoCta: 'Shop Independence Day Gifts', defaultPromoCtaLink: '/products',
    defaultAnnouncementText: 'Independence Day Specials | Patriotic Custom Prints & Gifts', defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'vinayaka-chavithi',
    name: 'Vinayaka Chavithi',
    tagline: 'Ganesh Chaturthi Blessings',
    season: 'Aug - Sep',
    thumb: FESTIVE_ASSETS['vinayaka-chavithi'].hero,
    primaryColor: '#75402B', secondaryColor: '#CF792D', accentColor: '#4C7049', highlightColor: '#F3D899',
    badgeText: 'Vinayaka Chavithi Theme',
    defaultStartDate: '2027-08-25', defaultEndDate: '2027-09-10',
    heroImages: [{ id: 'vc-hero-1', name: 'Vinayaka Chavithi Gifts', path: FESTIVE_ASSETS['vinayaka-chavithi'].hero, desc: 'Respectful festive gift showcase with a warm ivory canvas.' }],
    promoImages: [{ id: 'vc-promo-1', name: 'Festive Gift Hampers', path: FESTIVE_ASSETS['vinayaka-chavithi'].promo, desc: 'Custom gift hampers for the festival.' }],
    splashImage: FESTIVE_ASSETS['vinayaka-chavithi'].hero,
    patternImage: FESTIVE_ASSETS['vinayaka-chavithi'].pattern, decorationImage: null,
    defaultEyebrow: 'FESTIVE SPECIALS', defaultHeadline: 'Celebrate Vinayaka Chavithi with Personalised Gifts',
    defaultDescription: 'Custom printed mugs, photo frames and festive corporate gifts for the celebration.',
    defaultCtaLabel: 'Explore Festive Gifts', defaultCtaLink: '/products',
    defaultPromoEyebrow: 'VINAYAKA CHAVITHI SPECIALS', defaultPromoTitle: 'Festive Custom Gifts',
    defaultPromoDesc: 'Celebrate with customised ceramic mugs, photo frames and family keepsakes.',
    defaultPromoCta: 'Shop Festive Gifts', defaultPromoCtaLink: '/products',
    defaultAnnouncementText: 'Vinayaka Chavithi Specials | Custom Photo Gifts & Keepsakes', defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'dasara',
    name: 'Dasara',
    tagline: 'Victory of Good over Evil',
    season: 'Sep - Oct',
    thumb: FESTIVE_ASSETS.dasara.hero,
    primaryColor: '#64233D', secondaryColor: '#842C3D', accentColor: '#B68A42', highlightColor: '#F2E2BF',
    badgeText: 'Dasara Theme',
    defaultStartDate: '2027-09-20', defaultEndDate: '2027-10-05',
    heroImages: [{ id: 'ds-hero-1', name: 'Dasara Gift Showcase', path: FESTIVE_ASSETS.dasara.hero, desc: 'Premium festive keepsakes in a warm ivory and antique gold setting.' }],
    promoImages: [{ id: 'ds-promo-1', name: 'Dasara Hampers', path: FESTIVE_ASSETS.dasara.promo, desc: 'Custom gift hampers for Dasara.' }],
    splashImage: FESTIVE_ASSETS.dasara.hero,
    patternImage: FESTIVE_ASSETS.dasara.pattern, decorationImage: null,
    defaultEyebrow: 'DASARA SPECIALS', defaultHeadline: 'Celebrate Dasara with Personalised Gifts',
    defaultDescription: 'Custom printed mugs, photo frames and festive corporate gifts for the celebration.',
    defaultCtaLabel: 'Explore Dasara Gifts', defaultCtaLink: '/products',
    defaultPromoEyebrow: 'DASARA SPECIALS', defaultPromoTitle: 'Festive Custom Gifts',
    defaultPromoDesc: 'Celebrate with customised ceramic mugs, photo frames and family keepsakes.',
    defaultPromoCta: 'Shop Festive Gifts', defaultPromoCtaLink: '/products',
    defaultAnnouncementText: 'Dasara Specials | Custom Photo Gifts & Keepsakes', defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'holi',
    name: 'Holi',
    tagline: 'Festival of Colours',
    season: 'March',
    thumb: FESTIVE_ASSETS.holi.hero,
    primaryColor: '#653D91', secondaryColor: '#D95791', accentColor: '#178A8D', highlightColor: '#E7B735',
    badgeText: 'Holi Theme',
    defaultStartDate: '2027-03-10', defaultEndDate: '2027-03-20',
    heroImages: [{ id: 'holi-hero-1', name: 'Holi Colourful Gift Showcase', path: FESTIVE_ASSETS.holi.hero, desc: 'Bright personalised gift showcase with soft colour-powder details.' }],
    promoImages: [{ id: 'holi-promo-1', name: 'Colourful Gift Hampers', path: FESTIVE_ASSETS.holi.promo, desc: 'Custom gift hampers for Holi.' }],
    splashImage: FESTIVE_ASSETS.holi.hero,
    patternImage: FESTIVE_ASSETS.holi.pattern, decorationImage: null,
    defaultEyebrow: 'HOLI SPECIALS', defaultHeadline: 'Celebrate Holi with Colourful Custom Gifts',
    defaultDescription: 'Custom printed mugs, t-shirts and festive corporate gifts for the celebration.',
    defaultCtaLabel: 'Explore Holi Gifts', defaultCtaLink: '/products',
    defaultPromoEyebrow: 'HOLI SPECIALS', defaultPromoTitle: 'Colourful Custom Gifts',
    defaultPromoDesc: 'Celebrate with customised mugs, t-shirts and festive keepsakes.',
    defaultPromoCta: 'Shop Holi Gifts', defaultPromoCtaLink: '/products',
    defaultAnnouncementText: 'Holi Specials | Colourful Custom Prints & Gifts', defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'valentines-day',
    name: "Valentine's Day",
    tagline: 'Love & Personalised Gifting',
    season: '14 February',
    thumb: FESTIVE_ASSETS['valentines-day'].hero,
    primaryColor: '#76233F', secondaryColor: '#B94868', accentColor: '#C77B91', highlightColor: '#E9D5AE',
    badgeText: "Valentine's Day Theme",
    defaultStartDate: '2027-02-07', defaultEndDate: '2027-02-15',
    heroImages: [{ id: 'val-hero-1', name: 'Valentine Gift Collection', path: FESTIVE_ASSETS['valentines-day'].hero, desc: 'Romantic personalised gifts in a blush and rose setting.' }],
    promoImages: [{ id: 'val-promo-1', name: 'Romantic Gift Sets', path: FESTIVE_ASSETS['valentines-day'].promo, desc: 'Custom romantic gift sets.' }],
    splashImage: FESTIVE_ASSETS['valentines-day'].hero,
    patternImage: FESTIVE_ASSETS['valentines-day'].pattern, decorationImage: null,
    defaultEyebrow: "VALENTINE'S SPECIALS", defaultHeadline: 'Gift Love, Personalised',
    defaultDescription: 'Custom printed mugs, photo frames and couple gifts for your special someone.',
    defaultCtaLabel: "Explore Valentine's Gifts", defaultCtaLink: '/products',
    defaultPromoEyebrow: "VALENTINE'S SPECIALS", defaultPromoTitle: 'Romantic Custom Gifts',
    defaultPromoDesc: 'Celebrate love with customised mugs, photo frames and couple keepsakes.',
    defaultPromoCta: "Shop Valentine's Gifts", defaultPromoCtaLink: '/products',
    defaultAnnouncementText: "Valentine's Specials | Romantic Custom Prints & Gifts", defaultAnnouncementCta: 'Explore Collection'
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    tagline: 'Bonds of Love',
    season: 'Aug',
    thumb: FESTIVE_ASSETS['raksha-bandhan'].hero,
    primaryColor: '#742B31', secondaryColor: '#AE512C', accentColor: '#B68A42', highlightColor: '#F1D28E',
    badgeText: 'Raksha Bandhan Theme',
    defaultStartDate: '2027-08-10', defaultEndDate: '2027-08-20',
    heroImages: [{ id: 'rb-hero-1', name: 'Raksha Bandhan Gift Collection', path: FESTIVE_ASSETS['raksha-bandhan'].hero, desc: 'Warm sibling keepsakes with marigold and antique gold details.' }],
    promoImages: [{ id: 'rb-promo-1', name: 'Rakhi Gift Hampers', path: FESTIVE_ASSETS['raksha-bandhan'].promo, desc: 'Custom gift hampers for Raksha Bandhan.' }],
    splashImage: FESTIVE_ASSETS['raksha-bandhan'].hero,
    patternImage: FESTIVE_ASSETS['raksha-bandhan'].pattern, decorationImage: null,
    defaultEyebrow: 'RAKSHA BANDHAN SPECIALS', defaultHeadline: 'Celebrate Raksha Bandhan with Personalised Gifts',
    defaultDescription: 'Custom printed mugs, photo frames and festive gifts for siblings.',
    defaultCtaLabel: 'Explore Rakhi Gifts', defaultCtaLink: '/products',
    defaultPromoEyebrow: 'RAKSHA BANDHAN SPECIALS', defaultPromoTitle: 'Rakhi Custom Gifts',
    defaultPromoDesc: 'Celebrate sibling bonds with customised mugs, photo frames and keepsakes.',
    defaultPromoCta: 'Shop Rakhi Gifts', defaultPromoCtaLink: '/products',
    defaultAnnouncementText: 'Raksha Bandhan Specials | Custom Photo Gifts & Keepsakes', defaultAnnouncementCta: 'Explore Collection'
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

  for (const f of FESTIVALS) {
    if (THEME_RENDER_DATA[f.id]) continue;
    THEME_RENDER_DATA[f.id] = {
      id: f.id,
      name: f.name,
      icon: 'spark',
      layout: 'left',
      objectPosition: 'center center',
      heroBannerOptions: f.heroImages.map(h => ({ path: h.path, layout: 'left' })),
      pattern: f.patternImage,
      cornerAccent: null,
      splash: f.splashImage,
      splashEyebrow: f.badgeText.toUpperCase(),
      splashHeadline: f.name,
      splashHighlight: f.tagline,
      splashSubtext: f.defaultDescription,
      defaults: {
        hero_eyebrow: f.defaultEyebrow,
        hero_headline: f.defaultHeadline,
        hero_description: f.defaultDescription,
        hero_cta_label: f.defaultCtaLabel,
        hero_cta_link: f.defaultCtaLink,
        hero_secondary_cta_label: 'Shop Personalised Prints',
        hero_secondary_cta_link: '/products'
      }
    };
  }

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
    promo_cta_link: f.defaultPromoCtaLink || '/products',
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
  active_festival_id: 'none', // 'none' | one of FESTIVALS[].id
  manual_override: false,
  themes: Object.fromEntries(FESTIVALS.map(f => [f.id, buildDefaultFestivalConfig(f.id)])),
  updated_at: new Date().toISOString()
};

const STORAGE_KEY = 'bps_festive_theme_system';
const PREVIEW_KEY = 'bps_festive_preview_override';
const PREVIEW_DRAFT_KEY = 'bps_festive_preview_draft';

function mergeFestiveState(parsed = {}) {
  return {
    ...DEFAULT_FESTIVE_STATE,
    ...parsed,
    themes: Object.fromEntries(FESTIVALS.map(festival => {
      const defaults = buildDefaultFestivalConfig(festival.id);
      const saved = parsed.themes?.[festival.id] || {};
      const config = { ...defaults, ...saved };

      // Earlier drafts for these seven themes stored generated gradient SVGs or
      // a transparent pixel. Upgrade those defaults to the supplied artwork,
      // while leaving any real, individually chosen image path untouched.
      const supplied = FESTIVE_ASSETS[festival.id];
      if (supplied) {
        for (const [key, path] of [
          ['hero_image', supplied.hero],
          ['promo_image', supplied.promo || supplied.hero],
          ['splash_image', supplied.hero],
          ['pattern_image', supplied.pattern]
        ]) {
          if (!saved[key] || saved[key].startsWith('data:image/svg+xml') || saved[key] === TRANSPARENT_PX) {
            config[key] = path;
          }
        }
      }

      // Replace the old shared destination while preserving links customized in the admin.
      if (saved.promo_cta_link === '/products?cat=photo-frames') {
        config.promo_cta_link = defaults.promo_cta_link;
      }

      return [festival.id, config];
    }))
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
      if (FESTIVALS.some(festival => festival.id === p)) return p;
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
 * Returns: 'none' | one of FESTIVALS[].id
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

  // A deliberate admin deactivation suppresses scheduled themes until an
  // auto-schedule is explicitly enabled again.
  if (state.manual_override) return 'none';

  // 2. Check if any festival is manually enabled
  for (const f of FESTIVALS) {
    const conf = state.themes[f.id];
    if (conf && conf.enabled) {
      return f.id;
    }
  }

  // 3. Resolve overlapping schedules by preferring the most recently starting
  // window, then the shorter window. FESTIVALS order is the final stable tie-break.
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const scheduled = [];
  for (const [order, f] of FESTIVALS.entries()) {
    const conf = state.themes[f.id];
    if (conf && conf.auto_schedule && conf.start_date && conf.end_date) {
      if (today >= conf.start_date && today <= conf.end_date) {
        scheduled.push({ id: f.id, start: conf.start_date, end: conf.end_date, order });
      }
    }
  }

  const duration = item => Date.parse(item.end + 'T00:00:00Z') - Date.parse(item.start + 'T00:00:00Z');
  scheduled.sort((a, b) => b.start.localeCompare(a.start) || duration(a) - duration(b) || a.order - b.order);
  if (scheduled.length) return scheduled[0].id;

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
