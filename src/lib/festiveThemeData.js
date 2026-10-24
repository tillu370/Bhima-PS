import { useEffect, useState } from 'react';
import { supabase } from './supabase.js';

// A 1x1 transparent pixel: used as the subtle texture-overlay pattern for
// festivals that don't have a dedicated tiling pattern image, so the overlay
// renders nothing rather than a broken image or a stretched hero photo.
const TRANSPARENT_PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7';

// Branded gradient banner used as the hero / promo / splash image for a festival
// that doesn't (yet) have dedicated photography uploaded. Renders entirely as an
// inline SVG data URI, so there is never a broken-image state on the storefront.
function festiveGradientImage(name, from, via, to, emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/><stop offset="0.55" stop-color="${via}"/><stop offset="1" stop-color="${to}"/>
      </linearGradient>
      <pattern id="d" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="23" cy="23" r="2.4" fill="#ffffff" opacity="0.14"/></pattern>
    </defs>
    <rect width="1672" height="941" fill="url(#g)"/><rect width="1672" height="941" fill="url(#d)"/>
    <text x="836" y="430" text-anchor="middle" font-family="Georgia,serif" font-size="110" fill="#ffffff" opacity="0.92">${emoji}</text>
    <text x="836" y="540" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="46" letter-spacing="4" fill="#ffffff" opacity="0.9">${name.toUpperCase()}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

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
    thumb: festiveGradientImage('Republic Day', '#FF9933', '#FFFFFF', '#128807', '🇮🇳'),
    primaryColor: '#0C2340', secondaryColor: '#FF9933', accentColor: '#128807', highlightColor: '#FFFFFF',
    badgeText: 'Republic Day Theme',
    defaultStartDate: '2027-01-20', defaultEndDate: '2027-01-27',
    heroImages: [{ id: 'rd-hero-1', name: 'Tricolour Celebration', path: festiveGradientImage('Republic Day', '#FF9933', '#FFFFFF', '#128807', '🇮🇳'), desc: 'Tricolour-inspired banner for patriotic gifting.' }],
    promoImages: [{ id: 'rd-promo-1', name: 'Patriotic Gift Sets', path: festiveGradientImage('Republic Day', '#FF9933', '#FFFFFF', '#128807', '🇮🇳'), desc: 'Custom corporate and personal patriotic gifts.' }],
    splashImage: festiveGradientImage('Republic Day', '#0C2340', '#FF9933', '#128807', '🇮🇳'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
    thumb: festiveGradientImage('Independence Day', '#FF9933', '#FFFFFF', '#128807', '⭐'),
    primaryColor: '#0C2340', secondaryColor: '#FF9933', accentColor: '#128807', highlightColor: '#FFFFFF',
    badgeText: 'Independence Day Theme',
    defaultStartDate: '2027-08-08', defaultEndDate: '2027-08-16',
    heroImages: [{ id: 'id-hero-1', name: 'Freedom Fest Celebration', path: festiveGradientImage('Independence Day', '#FF9933', '#FFFFFF', '#128807', '⭐'), desc: 'National-pride banner for Independence Day gifting.' }],
    promoImages: [{ id: 'id-promo-1', name: 'Freedom Fest Gift Sets', path: festiveGradientImage('Independence Day', '#FF9933', '#FFFFFF', '#128807', '⭐'), desc: 'Custom corporate and personal Independence Day gifts.' }],
    splashImage: festiveGradientImage('Independence Day', '#0C2340', '#FF9933', '#128807', '⭐'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
    thumb: festiveGradientImage('Vinayaka Chavithi', '#6B2737', '#C0392B', '#D4AF37', '🐘'),
    primaryColor: '#6B2737', secondaryColor: '#C0392B', accentColor: '#D4AF37', highlightColor: '#F4DCA1',
    badgeText: 'Vinayaka Chavithi Theme',
    defaultStartDate: '2027-08-25', defaultEndDate: '2027-09-10',
    heroImages: [{ id: 'vc-hero-1', name: 'Ganesh Chaturthi Blessings', path: festiveGradientImage('Vinayaka Chavithi', '#6B2737', '#C0392B', '#D4AF37', '🐘'), desc: 'Festive banner for Vinayaka Chavithi gifting.' }],
    promoImages: [{ id: 'vc-promo-1', name: 'Festive Gift Hampers', path: festiveGradientImage('Vinayaka Chavithi', '#6B2737', '#C0392B', '#D4AF37', '🐘'), desc: 'Custom gift hampers for the festival.' }],
    splashImage: festiveGradientImage('Vinayaka Chavithi', '#6B2737', '#C0392B', '#D4AF37', '🐘'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
    thumb: festiveGradientImage('Dasara', '#7A0C0C', '#B8860B', '#D4A017', '⚔️'),
    primaryColor: '#7A0C0C', secondaryColor: '#B8860B', accentColor: '#D4A017', highlightColor: '#F4DCA1',
    badgeText: 'Dasara Theme',
    defaultStartDate: '2027-09-20', defaultEndDate: '2027-10-05',
    heroImages: [{ id: 'ds-hero-1', name: 'Dasara Celebration', path: festiveGradientImage('Dasara', '#7A0C0C', '#B8860B', '#D4A017', '⚔️'), desc: 'Festive banner for Dasara gifting.' }],
    promoImages: [{ id: 'ds-promo-1', name: 'Festive Gift Hampers', path: festiveGradientImage('Dasara', '#7A0C0C', '#B8860B', '#D4A017', '⚔️'), desc: 'Custom gift hampers for Dasara.' }],
    splashImage: festiveGradientImage('Dasara', '#7A0C0C', '#B8860B', '#D4A017', '⚔️'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
    thumb: festiveGradientImage('Holi', '#E91E8C', '#2196F3', '#FFC107', '🌈'),
    primaryColor: '#7E22CE', secondaryColor: '#E91E8C', accentColor: '#FFC107', highlightColor: '#4CAF50',
    badgeText: 'Holi Theme',
    defaultStartDate: '2027-03-10', defaultEndDate: '2027-03-20',
    heroImages: [{ id: 'holi-hero-1', name: 'Festival of Colours', path: festiveGradientImage('Holi', '#E91E8C', '#2196F3', '#FFC107', '🌈'), desc: 'Colourful banner for Holi gifting.' }],
    promoImages: [{ id: 'holi-promo-1', name: 'Colourful Gift Hampers', path: festiveGradientImage('Holi', '#E91E8C', '#2196F3', '#FFC107', '🌈'), desc: 'Custom gift hampers for Holi.' }],
    splashImage: festiveGradientImage('Holi', '#E91E8C', '#2196F3', '#FFC107', '🌈'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
    thumb: festiveGradientImage("Valentine's Day", '#D81B60', '#FF6F91', '#FFC1CC', '❤️'),
    primaryColor: '#8E0038', secondaryColor: '#D81B60', accentColor: '#FF6F91', highlightColor: '#FFC1CC',
    badgeText: "Valentine's Day Theme",
    defaultStartDate: '2027-02-07', defaultEndDate: '2027-02-15',
    heroImages: [{ id: 'val-hero-1', name: 'Love & Gifting', path: festiveGradientImage("Valentine's Day", '#D81B60', '#FF6F91', '#FFC1CC', '❤️'), desc: 'Romantic banner for Valentine’s Day gifting.' }],
    promoImages: [{ id: 'val-promo-1', name: 'Romantic Gift Sets', path: festiveGradientImage("Valentine's Day", '#D81B60', '#FF6F91', '#FFC1CC', '❤️'), desc: 'Custom romantic gift sets.' }],
    splashImage: festiveGradientImage("Valentine's Day", '#8E0038', '#D81B60', '#FF6F91', '❤️'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
    thumb: festiveGradientImage('Raksha Bandhan', '#B71C1C', '#D4AF37', '#FFB300', '🩸'),
    primaryColor: '#7A0C0C', secondaryColor: '#B71C1C', accentColor: '#FFB300', highlightColor: '#F4DCA1',
    badgeText: 'Raksha Bandhan Theme',
    defaultStartDate: '2027-08-10', defaultEndDate: '2027-08-20',
    heroImages: [{ id: 'rb-hero-1', name: 'Bonds of Love', path: festiveGradientImage('Raksha Bandhan', '#B71C1C', '#D4AF37', '#FFB300', '🩸'), desc: 'Festive banner for Raksha Bandhan gifting.' }],
    promoImages: [{ id: 'rb-promo-1', name: 'Rakhi Gift Hampers', path: festiveGradientImage('Raksha Bandhan', '#B71C1C', '#D4AF37', '#FFB300', '🩸'), desc: 'Custom gift hampers for Raksha Bandhan.' }],
    splashImage: festiveGradientImage('Raksha Bandhan', '#7A0C0C', '#B71C1C', '#FFB300', '🩸'),
    patternImage: TRANSPARENT_PX, decorationImage: null,
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
      layout: 'center',
      objectPosition: 'center center',
      heroBannerOptions: f.heroImages.map(h => ({ path: h.path, layout: 'center' })),
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
