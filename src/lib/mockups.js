// Product mock-ups for the design studio. Each template is a plain SVG string (so the same markup
// is used on screen and when exporting the preview image), a print area in the 600x600 viewBox,
// and a colour palette. Products are matched to a template by slug; anything else uses "generic".

export const VB = 600;

const PALETTES = {
  fabric: ['#ffffff', '#111827', '#0b1b3f', '#dc2626', '#facc15', '#16a34a', '#0f7f7a', '#ec4899', '#f97316', '#9ca3af'],
  ceramic: ['#ffffff', '#111827', '#0b1b3f', '#dc2626', '#facc15', '#16a34a', '#0ea5e9', '#ec4899'],
  frame: ['#111827', '#ffffff', '#d9b68a', '#8a5a3c', '#facc15', '#9ca3af', '#0b1b3f'],
  wood: ['#d9b68a', '#b98a58', '#8a5a3c', '#5b3a24', '#111827', '#f3e5d0'],
  metal: ['#9ca3af', '#111827', '#0b1b3f', '#d4af37', '#dc2626', '#ffffff'],
  plastic: ['#ffffff', '#111827', '#0b1b3f', '#dc2626', '#facc15', '#16a34a', '#0ea5e9', '#ec4899'],
  leather: ['#8a5a3c', '#111827', '#5b3a24', '#b45309', '#0b1b3f', '#7f1d1d']
};

// ---- colour helpers
const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
export function shade(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = amt < 0 ? 0 : 255;
  const t = Math.abs(amt);
  return '#' + [r, g, b].map(c => clamp(c + (f - c) * t).toString(16).padStart(2, '0')).join('');
}
const gloss = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`;
const cyl = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".28" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>`;
const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}">${inner}</svg>`;
const drop = `<filter id="ds" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#0b1b3f" flood-opacity=".22"/></filter>`;

export const TEMPLATES = {
  tshirt: {
    label: 'T-shirt', area: { x: 205, y: 150, w: 190, h: 270 }, palette: 'fabric', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><path d="M200 60 L120 90 L40 190 L110 240 L150 210 L150 520 L450 520 L450 210 L490 240 L560 190 L480 90 L400 60 C380 100 220 100 200 60 Z" fill="${c}"/><path d="M200 60 L120 90 L40 190 L110 240 L150 210 L150 520 L450 520 L450 210 L490 240 L560 190 L480 90 L400 60 C380 100 220 100 200 60 Z" fill="url(#g)"/></g><path d="M214 68 C240 112 360 112 386 68" fill="none" stroke="${shade(c, -0.28)}" stroke-width="10" stroke-linecap="round"/>`),
    overlay: () => ''
  },
  mug: {
    label: 'Mug', area: { x: 160, y: 190, w: 230, h: 230 }, palette: 'ceramic', colour: '#ffffff',
    base: c => svg(`<defs>${cyl('c')}${drop}</defs><g filter="url(#ds)"><path d="M420 200 C530 200 530 410 420 410" fill="none" stroke="${shade(c, -0.12)}" stroke-width="40" stroke-linecap="round"/><rect x="130" y="130" width="290" height="350" rx="26" fill="${c}"/><rect x="130" y="130" width="290" height="350" rx="26" fill="url(#c)"/></g><ellipse cx="275" cy="134" rx="145" ry="15" fill="${shade(c, -0.16)}"/>`),
    overlay: () => ''
  },
  bottle: {
    label: 'Water bottle', area: { x: 235, y: 235, w: 130, h: 215 }, palette: 'metal', colour: '#9ca3af',
    base: c => svg(`<defs>${cyl('c')}${drop}</defs><g filter="url(#ds)"><rect x="262" y="60" width="76" height="62" rx="14" fill="${shade(c, -0.32)}"/><rect x="250" y="118" width="100" height="40" rx="12" fill="${shade(c, -0.1)}"/><rect x="215" y="150" width="170" height="390" rx="42" fill="${c}"/><rect x="215" y="150" width="170" height="390" rx="42" fill="url(#c)"/></g>`),
    overlay: () => ''
  },
  pillow: {
    label: 'Pillow', area: { x: 150, y: 150, w: 300, h: 300 }, palette: 'fabric', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><path d="M90 130 C260 90 340 90 510 130 C540 280 540 320 510 470 C340 510 260 510 90 470 C60 320 60 280 90 130 Z" fill="${c}"/><path d="M90 130 C260 90 340 90 510 130 C540 280 540 320 510 470 C340 510 260 510 90 470 C60 320 60 280 90 130 Z" fill="url(#g)"/></g>`),
    overlay: () => ''
  },
  frame: {
    label: 'Photo frame', area: { x: 135, y: 135, w: 330, h: 330 }, palette: 'frame', colour: '#8a5a3c',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><rect x="80" y="80" width="440" height="440" rx="10" fill="${c}"/><rect x="80" y="80" width="440" height="440" rx="10" fill="url(#g)"/><rect x="120" y="120" width="360" height="360" fill="${shade(c, -0.3)}"/><rect x="132" y="132" width="336" height="336" fill="#ffffff"/></g>`),
    overlay: () => ''
  },
  clock: {
    label: 'Wall clock', area: { x: 130, y: 130, w: 340, h: 340, round: true }, palette: 'frame', colour: '#111827',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><circle cx="300" cy="300" r="240" fill="${c}"/><circle cx="300" cy="300" r="240" fill="url(#g)"/><circle cx="300" cy="300" r="205" fill="#ffffff"/></g>`),
    overlay: c => svg(`${Array.from({ length: 12 }, (_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return `<line x1="${300 + 188 * Math.cos(a)}" y1="${300 + 188 * Math.sin(a)}" x2="${300 + 170 * Math.cos(a)}" y2="${300 + 170 * Math.sin(a)}" stroke="${shade(c, -0.1)}" stroke-width="${i % 3 === 0 ? 8 : 4}" stroke-linecap="round"/>`; }).join('')}<line x1="300" y1="300" x2="300" y2="190" stroke="${shade(c, -0.1)}" stroke-width="10" stroke-linecap="round"/><line x1="300" y1="300" x2="372" y2="345" stroke="${shade(c, -0.1)}" stroke-width="7" stroke-linecap="round"/><circle cx="300" cy="300" r="12" fill="#dc2626"/>`)
  },
  board: {
    label: 'Name board', area: { x: 70, y: 205, w: 460, h: 200 }, palette: 'wood', colour: '#d9b68a',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><rect x="40" y="170" width="520" height="270" rx="16" fill="${c}"/><rect x="40" y="170" width="520" height="270" rx="16" fill="url(#g)"/><circle cx="62" cy="192" r="6" fill="${shade(c, -0.4)}"/><circle cx="538" cy="192" r="6" fill="${shade(c, -0.4)}"/><circle cx="62" cy="418" r="6" fill="${shade(c, -0.4)}"/><circle cx="538" cy="418" r="6" fill="${shade(c, -0.4)}"/></g>`),
    overlay: () => ''
  },
  keychain: {
    label: 'Key chain', area: { x: 215, y: 190, w: 170, h: 240 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><circle cx="300" cy="110" r="44" fill="none" stroke="#9ca3af" stroke-width="12"/><rect x="270" y="140" width="60" height="30" rx="8" fill="#9ca3af"/><rect x="195" y="165" width="210" height="290" rx="30" fill="${c}"/><rect x="195" y="165" width="210" height="290" rx="30" fill="url(#g)"/></g>`),
    overlay: () => ''
  },
  badge: {
    label: 'Badge', area: { x: 125, y: 125, w: 350, h: 350, round: true }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><circle cx="300" cy="300" r="230" fill="${c}"/><circle cx="300" cy="300" r="230" fill="url(#g)"/><circle cx="300" cy="300" r="210" fill="none" stroke="${shade(c, -0.18)}" stroke-width="4"/></g>`),
    overlay: () => ''
  },
  magnet: {
    label: 'Fridge magnet', area: { x: 118, y: 150, w: 364, h: 300 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><rect x="100" y="130" width="400" height="340" rx="22" fill="${c}"/><rect x="100" y="130" width="400" height="340" rx="22" fill="url(#g)"/></g>`),
    overlay: () => ''
  },
  pen: {
    label: 'Pen', area: { x: 150, y: 281, w: 300, h: 38 }, palette: 'metal', colour: '#0b1b3f',
    base: c => svg(`<defs>${cyl('c')}${drop}</defs><g filter="url(#ds)"><path d="M470 270 L560 300 L470 330 Z" fill="${shade(c, -0.35)}"/><rect x="40" y="268" width="440" height="64" rx="32" fill="${c}"/><rect x="40" y="268" width="440" height="64" rx="32" fill="url(#c)" transform="rotate(90 260 300) translate(0 0)" opacity="0"/><rect x="40" y="268" width="90" height="64" rx="32" fill="${shade(c, -0.25)}"/><rect x="60" y="248" width="14" height="60" rx="7" fill="${shade(c, -0.2)}"/></g>`),
    overlay: () => ''
  },
  card: {
    label: 'Wallet card', area: { x: 90, y: 215, w: 420, h: 250 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><rect x="70" y="195" width="460" height="290" rx="28" fill="${c}"/><rect x="70" y="195" width="460" height="290" rx="28" fill="url(#g)"/></g>`),
    overlay: () => ''
  },
  stand: {
    label: 'Pen stand', area: { x: 205, y: 215, w: 190, h: 200 }, palette: 'metal', colour: '#0b1b3f',
    base: c => svg(`<defs>${cyl('c')}${drop}</defs><g filter="url(#ds)"><rect x="185" y="170" width="230" height="290" rx="26" fill="${c}"/><rect x="185" y="170" width="230" height="290" rx="26" fill="url(#c)"/></g><ellipse cx="300" cy="172" rx="115" ry="14" fill="${shade(c, -0.35)}"/>`),
    overlay: () => ''
  },
  wallet: {
    label: 'Leather item', area: { x: 140, y: 190, w: 320, h: 230 }, palette: 'leather', colour: '#8a5a3c',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><rect x="100" y="150" width="400" height="300" rx="30" fill="${c}"/><rect x="100" y="150" width="400" height="300" rx="30" fill="url(#g)"/><rect x="116" y="166" width="368" height="268" rx="22" fill="none" stroke="${shade(c, 0.45)}" stroke-width="3" stroke-dasharray="10 8"/></g>`),
    overlay: () => ''
  },
  generic: {
    label: 'Product', area: { x: 130, y: 130, w: 340, h: 340 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`<defs>${gloss('g')}${drop}</defs><g filter="url(#ds)"><rect x="100" y="100" width="400" height="400" rx="28" fill="${c}"/><rect x="100" y="100" width="400" height="400" rx="28" fill="url(#g)"/></g>`),
    overlay: () => ''
  }
};

const BY_SLUG = {
  'mug-printing': 'mug', 'water-bottles': 'bottle', 't-shirt-printing': 'tshirt', 'pillow-printing': 'pillow',
  'photo-frames': 'frame', 'led-frames': 'frame', 'wood-photo-frames': 'frame', 'photo-wall-clocks': 'clock',
  'wood-engraving': 'board', 'laser-gifts': 'board', 'name-boards': 'board', 'laser-key-chains': 'keychain',
  'photo-key-chains': 'keychain', 'photo-fridge-magnets': 'magnet', 'photo-badges': 'badge', 'customised-pens': 'pen',
  'pen-stands': 'stand', 'wallet-cards': 'card', 'leather-products': 'wallet', 'corporate-gift-sets': 'generic'
};

export const templateFor = slug => TEMPLATES[BY_SLUG[slug]] || TEMPLATES.generic;
export const templateKey = slug => (BY_SLUG[slug] && TEMPLATES[BY_SLUG[slug]] ? BY_SLUG[slug] : 'generic');
export const paletteFor = t => PALETTES[t.palette] || PALETTES.plastic;

// Slug-specific starting colour (wood boards, LED frames).
export function startColour(slug) {
  const t = templateFor(slug);
  if (slug === 'led-frames') return '#111827';
  if (slug === 'wood-photo-frames') return '#b98a58';
  if (slug === 'laser-gifts') return '#5b3a24';
  if (slug === 'name-boards') return '#111827';
  return t.colour;
}
export function paletteForSlug(slug) {
  const t = templateFor(slug);
  if (slug === 'wood-photo-frames') return PALETTES.wood.concat(['#111827']);
  return paletteFor(t);
}

export const COLOUR_NAMES = {
  '#ffffff': 'White', '#111827': 'Black', '#0b1b3f': 'Navy', '#dc2626': 'Red', '#facc15': 'Yellow', '#16a34a': 'Green',
  '#0f7f7a': 'Teal', '#ec4899': 'Pink', '#f97316': 'Orange', '#9ca3af': 'Grey', '#0ea5e9': 'Sky blue', '#d9b68a': 'Light wood',
  '#b98a58': 'Oak', '#8a5a3c': 'Walnut', '#5b3a24': 'Dark wood', '#f3e5d0': 'Cream', '#d4af37': 'Gold', '#b45309': 'Tan', '#7f1d1d': 'Maroon'
};
export const colourName = hex => COLOUR_NAMES[hex.toLowerCase()] || hex.toUpperCase();
