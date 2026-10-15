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
// ---- shared lighting. Every gradient/filter here is colour independent (shading is black/white with
// opacity), so the same ids can safely appear in several inline SVGs on one page.
const DEFS = `<defs>
<radialGradient id="bgr" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9e1ea"/></radialGradient>
<filter id="bl" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="11"/></filter>
<filter id="bl3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="bl6" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="nz" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .9 0"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .45" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .25 0 0 0 0 .13 0 0 0 0 .05 1.5 0 0 0 -.45"/></filter>
<linearGradient id="cylH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".09" stop-color="#000" stop-opacity=".16"/><stop offset=".27" stop-color="#fff" stop-opacity=".4"/><stop offset=".36" stop-color="#fff" stop-opacity=".1"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity=".1"/><stop offset=".92" stop-color="#000" stop-opacity=".26"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<linearGradient id="cylV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".12" stop-color="#000" stop-opacity=".12"/><stop offset=".3" stop-color="#fff" stop-opacity=".42"/><stop offset=".4" stop-color="#fff" stop-opacity=".08"/><stop offset=".7" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<linearGradient id="ambV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<linearGradient id="diag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".34" stop-color="#fff" stop-opacity=".12"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="puff" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
<linearGradient id="metalH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".14" stop-color="#fff" stop-opacity=".25"/><stop offset=".24" stop-color="#fff" stop-opacity=".65"/><stop offset=".34" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset=".74" stop-color="#fff" stop-opacity=".28"/><stop offset=".84" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
</defs>`;
const svg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}">${DEFS}${inner}</svg>`;
const bg = `<rect width="${VB}" height="${VB}" fill="url(#bgr)"/>`;
const floor = (cx, cy, rx, ry, o = 0.3) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0b1b3f" opacity="${o}" filter="url(#bl)"/>`;
const streak = (x, y, w, h, o = 0.6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#fff" opacity="${o}" filter="url(#bl3)"/>`;

const MUG = 'M130 142 L420 142 L408 468 Q406 486 388 486 L162 486 Q144 486 142 468 Z';
const TEE = 'M205 72 C225 104 262 116 300 116 C338 116 375 104 395 72 L472 98 L562 212 L490 252 L452 220 L452 522 Q452 540 434 540 L166 540 Q148 540 148 522 L148 220 L110 252 L38 212 L128 98 Z';
const BOTTLE = 'M215 190 Q215 160 245 152 L355 152 Q385 160 385 190 L385 520 Q385 548 357 548 L243 548 Q215 548 215 520 Z';
const PILLOW = 'M88 128 C250 92 350 92 512 128 C546 270 546 330 512 472 C350 508 250 508 88 472 C54 330 54 270 88 128 Z';

export const TEMPLATES = {
  tshirt: {
    label: 'T-shirt', area: { x: 215, y: 165, w: 170, h: 220 }, palette: 'fabric', colour: '#ffffff',
    photo: '/mockups/tshirt.jpg', mask: '/mockups/tshirt-mask.png', shade: '/mockups/tshirt-shade.jpg',
    base: () => '', overlay: () => ''
  },
  mug: {
    label: 'Mug', area: { x: 252, y: 175, w: 228, h: 275 }, palette: 'ceramic', colour: '#ffffff',
    photo: '/mockups/mug.jpg', mask: '/mockups/mug-mask.png', shade: '/mockups/mug-shade.jpg',
    base: () => '', overlay: () => ''
  },
  bottle: {
    label: 'Water bottle', area: { x: 262, y: 235, w: 96, h: 280 }, palette: 'metal', colour: '#ffffff',
    photo: '/mockups/bottle.jpg', mask: '/mockups/bottle-mask.png', shade: '/mockups/bottle-shade.jpg',
    base: () => '', overlay: () => ''
  },
  pillow: {
    label: 'Pillow', area: { x: 180, y: 170, w: 240, h: 240 }, palette: 'fabric', colour: '#ffffff',
    photo: '/mockups/pillow.jpg', mask: '/mockups/pillow-mask.png', shade: '/mockups/pillow-shade.jpg',
    base: () => '', overlay: () => ''
  },
  frame: {
    label: 'Photo frame', area: { x: 145, y: 148, w: 305, h: 315 }, palette: 'frame', colour: '#8a5a3c',
    photo: '/mockups/frame.jpg', shade: '/mockups/frame-shade.jpg',
    base: () => '', overlay: () => ''
  },
  clock: {
    label: 'Wall clock', area: { x: 130, y: 130, w: 340, h: 340, round: true }, palette: 'frame', colour: '#111827',
    base: c => svg(`${bg}${floor(300, 556, 200, 14, 0.3)}<circle cx="300" cy="302" r="246" fill="#0b1b3f" opacity=".25" filter="url(#bl)"/><circle cx="300" cy="300" r="244" fill="${c}"/><circle cx="300" cy="300" r="244" fill="url(#diag)"/><circle cx="300" cy="300" r="220" fill="${shade(c, 0.12)}"/><circle cx="300" cy="300" r="212" fill="${shade(c, -0.4)}" opacity=".5"/><circle cx="300" cy="300" r="206" fill="#fdfdfb"/>`),
    overlay: c => svg(`${Array.from({ length: 12 }, (_, i) => { const a = (i * 30 - 90) * Math.PI / 180; return `<line x1="${300 + 192 * Math.cos(a)}" y1="${300 + 192 * Math.sin(a)}" x2="${300 + 172 * Math.cos(a)}" y2="${300 + 172 * Math.sin(a)}" stroke="#1f2937" stroke-width="${i % 3 === 0 ? 8 : 4}" stroke-linecap="round"/>`; }).join('')}<g filter="url(#bl3)" opacity=".35"><line x1="303" y1="305" x2="303" y2="195" stroke="#000" stroke-width="10" stroke-linecap="round"/><line x1="303" y1="305" x2="375" y2="350" stroke="#000" stroke-width="7" stroke-linecap="round"/></g><line x1="300" y1="300" x2="300" y2="190" stroke="#1f2937" stroke-width="10" stroke-linecap="round"/><line x1="300" y1="300" x2="372" y2="345" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/><line x1="300" y1="318" x2="300" y2="150" stroke="#dc2626" stroke-width="3" stroke-linecap="round" transform="rotate(130 300 300)"/><circle cx="300" cy="300" r="11" fill="#dc2626"/><circle cx="300" cy="300" r="206" fill="url(#glare)" opacity=".7"/>`)
  },
  board: {
    label: 'Name board', area: { x: 70, y: 205, w: 460, h: 200 }, palette: 'wood', colour: '#d9b68a',
    base: c => svg(`${bg}${floor(300, 462, 270, 18, 0.3)}<rect x="40" y="170" width="520" height="270" rx="14" fill="${c}"/><rect x="40" y="170" width="520" height="270" rx="14" fill="url(#grain)" opacity=".6"/><rect x="40" y="170" width="520" height="270" rx="14" fill="none" stroke="${shade(c, -0.35)}" stroke-width="3"/>${[[62, 192], [538, 192], [62, 418], [538, 418]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${shade(c, -0.5)}"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="3" fill="#fff" opacity=".35"/>`).join('')}`),
    overlay: () => svg(`<rect x="40" y="170" width="520" height="270" rx="14" fill="url(#ambV)" opacity=".7"/><rect x="40" y="170" width="520" height="270" rx="14" fill="url(#diag)" opacity=".45"/>`)
  },
  keychain: {
    label: 'Key chain', area: { x: 215, y: 190, w: 170, h: 240 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 480, 130, 14, 0.3)}<circle cx="300" cy="104" r="46" fill="none" stroke="#9ca3af" stroke-width="12"/><circle cx="300" cy="104" r="46" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/><rect x="272" y="140" width="56" height="34" rx="8" fill="#b6bcc6"/><rect x="195" y="165" width="210" height="290" rx="32" fill="${c}"/><rect x="195" y="165" width="210" height="290" rx="32" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`),
    overlay: () => svg(`<rect x="195" y="165" width="210" height="290" rx="32" fill="url(#diag)"/><path d="M200 170 L330 170 L200 360 Z" fill="url(#glare)" opacity=".5"/><circle cx="300" cy="190" r="9" fill="#d0d4db" opacity=".0"/>`)
  },
  badge: {
    label: 'Badge', area: { x: 125, y: 125, w: 350, h: 350, round: true }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 540, 190, 14, 0.3)}<circle cx="300" cy="302" r="236" fill="#0b1b3f" opacity=".2" filter="url(#bl)"/><circle cx="300" cy="300" r="234" fill="#c0c6d0"/><circle cx="300" cy="300" r="234" fill="url(#metalH)" opacity=".7"/><circle cx="300" cy="300" r="224" fill="${c}"/>`),
    overlay: () => svg(`<circle cx="300" cy="300" r="224" fill="url(#diag)"/><circle cx="300" cy="300" r="224" fill="url(#glare)" opacity=".8"/>`)
  },
  magnet: {
    label: 'Fridge magnet', area: { x: 118, y: 150, w: 364, h: 300 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 470, 230, 14, 0.3)}<rect x="100" y="132" width="400" height="338" rx="20" fill="${c}"/><rect x="100" y="132" width="400" height="338" rx="20" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>`),
    overlay: () => svg(`<rect x="100" y="132" width="400" height="338" rx="20" fill="url(#diag)"/><path d="M104 136 L360 136 L104 400 Z" fill="url(#glare)" opacity=".6"/><rect x="100" y="132" width="400" height="338" rx="20" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`)
  },
  pen: {
    label: 'Pen', area: { x: 150, y: 281, w: 300, h: 38 }, palette: 'metal', colour: '#0b1b3f',
    base: c => svg(`${bg}${floor(300, 345, 260, 10, 0.3)}<path d="M472 272 L566 300 L472 328 Z" fill="${shade(c, -0.4)}"/><path d="M548 294 L566 300 L548 306 Z" fill="#c9ced6"/><rect x="40" y="266" width="440" height="68" rx="34" fill="${c}"/><rect x="40" y="266" width="86" height="68" rx="34" fill="${shade(c, -0.3)}"/><rect x="56" y="246" width="12" height="56" rx="6" fill="#c9ced6"/>`),
    overlay: () => svg(`<rect x="40" y="266" width="440" height="68" rx="34" fill="url(#cylV)"/>${streak(70, 276, 380, 8, 0.6)}`)
  },
  card: {
    label: 'Wallet card', area: { x: 90, y: 215, w: 420, h: 250 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 495, 250, 14, 0.3)}<rect x="70" y="195" width="460" height="290" rx="26" fill="${c}"/><rect x="70" y="195" width="460" height="290" rx="26" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`),
    overlay: () => svg(`<rect x="70" y="195" width="460" height="290" rx="26" fill="url(#diag)"/><path d="M72 198 L330 198 L72 440 Z" fill="url(#glare)" opacity=".55"/>`)
  },
  stand: {
    label: 'Pen stand', area: { x: 205, y: 215, w: 190, h: 200 }, palette: 'metal', colour: '#0b1b3f',
    base: c => svg(`${bg}${floor(300, 470, 150, 16, 0.34)}<rect x="185" y="168" width="230" height="298" rx="22" fill="${c}"/><ellipse cx="300" cy="170" rx="115" ry="17" fill="${shade(c, 0.12)}"/><ellipse cx="300" cy="173" rx="104" ry="12" fill="${shade(c, -0.6)}"/>`),
    overlay: () => svg(`<rect x="185" y="170" width="230" height="296" rx="22" fill="url(#cylH)"/><rect x="185" y="170" width="230" height="296" rx="22" fill="url(#ambV)" opacity=".7"/>${streak(215, 190, 12, 250, 0.5)}`)
  },
  wallet: {
    label: 'Leather item', area: { x: 140, y: 190, w: 320, h: 230 }, palette: 'leather', colour: '#8a5a3c',
    base: c => svg(`${bg}${floor(300, 462, 250, 16, 0.32)}<rect x="100" y="150" width="400" height="300" rx="28" fill="${c}"/><rect x="100" y="150" width="400" height="300" rx="28" filter="url(#nz)" opacity=".5"/><rect x="118" y="168" width="364" height="264" rx="20" fill="none" stroke="${shade(c, 0.5)}" stroke-width="3" stroke-dasharray="9 7"/><rect x="100" y="150" width="400" height="300" rx="28" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>`),
    overlay: () => svg(`<rect x="100" y="150" width="400" height="300" rx="28" fill="url(#diag)" opacity=".8"/><rect x="100" y="150" width="400" height="300" rx="28" filter="url(#nz)" opacity=".18"/>`)
  },
  generic: {
    label: 'Product', area: { x: 130, y: 130, w: 340, h: 340 }, palette: 'plastic', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 508, 230, 16, 0.3)}<rect x="100" y="100" width="400" height="400" rx="26" fill="${c}"/><rect x="100" y="100" width="400" height="400" rx="26" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`),
    overlay: () => svg(`<rect x="100" y="100" width="400" height="400" rx="26" fill="url(#diag)"/><path d="M104 104 L330 104 L104 330 Z" fill="url(#glare)" opacity=".5"/>`)
  }
};


// ---- T-shirt styles and print placements. Round neck front/pocket uses the product photo; the other
// styles and the back view are drawn with the same lighting as the other SVG mock-ups.
const OVER = 'M203 76 C225 106 262 116 300 116 C338 116 375 106 397 76 L462 94 L584 236 L528 296 L480 266 L488 548 Q488 560 474 560 L126 560 Q112 560 112 548 L120 266 L72 296 L16 236 L138 94 Z';
const TEE_PATH = { round: TEE, polo: TEE, oversized: OVER };
const TEE_AREAS = {
  round: { front: { x: 205, y: 170, w: 190, h: 250 }, pocket: { x: 330, y: 172, w: 58, h: 58 }, back: { x: 205, y: 160, w: 190, h: 260 } },
  oversized: { front: { x: 200, y: 180, w: 200, h: 270 }, pocket: { x: 334, y: 172, w: 62, h: 62 }, back: { x: 200, y: 165, w: 200, h: 285 } },
  polo: { front: { x: 205, y: 232, w: 190, h: 190 }, pocket: { x: 336, y: 182, w: 56, h: 56 }, back: { x: 205, y: 150, w: 190, h: 270 } }
};
const teeNeck = (style, back, c) => {
  const edge = shade(c, -0.22);
  if (style === 'polo') {
    return back
      ? `<path d="M205 72 C232 100 368 100 395 72 L395 92 C368 122 232 122 205 92 Z" fill="${shade(c, 0.05)}" stroke="${edge}" stroke-width="2"/>`
      : `<path d="M236 70 C262 92 338 92 364 70 L300 156 Z" fill="${shade(c, -0.42)}"/><path d="M212 66 L296 78 L266 170 L203 98 Z" fill="${shade(c, 0.06)}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/><path d="M388 66 L304 78 L334 170 L397 98 Z" fill="${shade(c, 0.06)}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/><rect x="288" y="118" width="24" height="100" rx="3" fill="${shade(c, -0.04)}" stroke="${edge}" stroke-width="1.5"/>${[140, 170, 200].map(y => `<circle cx="300" cy="${y}" r="4.5" fill="${shade(c, -0.35)}"/><circle cx="299" cy="${y - 1}" r="1.6" fill="#fff" opacity=".5"/>`).join('')}`;
  }
  const dy = back ? 28 : 64;
  return `<path d="M205 72 C225 ${72 + dy} 375 ${72 + dy} 395 72" fill="none" stroke="${shade(c, -0.2)}" stroke-width="16" stroke-linecap="round"/><path d="M212 74 C240 ${back ? 90 : 112} 360 ${back ? 90 : 112} 388 74 C366 ${back ? 82 : 94} 234 ${back ? 82 : 94} 212 74 Z" fill="${shade(c, back ? -0.2 : -0.42)}"/>`;
};
const teeSvg = (style, placement) => {
  const back = placement === 'back';
  const path = TEE_PATH[style];
  const area = TEE_AREAS[style][placement];
  const pocket = placement === 'pocket'
    ? c => `<path d="M${area.x - 4} ${area.y - 4} H${area.x + area.w + 4} V${area.y + area.h + 8} L${area.x + area.w / 2} ${area.y + area.h + 18} L${area.x - 4} ${area.y + area.h + 8} Z" fill="none" stroke="${shade(c, -0.25)}" stroke-width="2" stroke-dasharray="5 4"/>`
    : () => '';
  return {
    area,
    base: c => svg(`${bg}${floor(300, 566, 200, 16, 0.3)}<path d="${path}" fill="${c}"/>${teeNeck(style, back, c)}${pocket(c)}<g fill="none" stroke="${shade(c, -0.22)}" stroke-width="2" stroke-dasharray="5 4"><path d="M${style === 'oversized' ? 130 : 160} ${style === 'oversized' ? 541 : 521} L${style === 'oversized' ? 470 : 440} ${style === 'oversized' ? 541 : 521}"/></g>`),
    overlay: () => svg(`<clipPath id="teeC"><path d="${path}"/></clipPath><g clip-path="url(#teeC)"><rect width="600" height="600" fill="url(#cylH)" opacity=".5"/><rect width="600" height="600" fill="url(#ambV)"/><g fill="#000" opacity=".07" filter="url(#bl6)"><ellipse cx="230" cy="330" rx="14" ry="70" transform="rotate(8 230 330)"/><ellipse cx="372" cy="400" rx="12" ry="60" transform="rotate(-9 372 400)"/><ellipse cx="300" cy="510" rx="80" ry="10"/></g><g fill="#fff" opacity=".12" filter="url(#bl6)"><ellipse cx="260" cy="300" rx="10" ry="60" transform="rotate(8 260 300)"/><ellipse cx="342" cy="250" rx="9" ry="50" transform="rotate(-7 342 250)"/></g><rect width="600" height="600" filter="url(#nz)" opacity=".05"/></g>`)
  };
};
const photoTee = TEMPLATES.tshirt;
const TEE_STYLES = [{ key: 'round', label: 'Round neck' }, { key: 'oversized', label: 'Oversized' }, { key: 'polo', label: 'Polo' }];
const TEE_PLACEMENTS = [{ key: 'front', label: 'Front' }, { key: 'pocket', label: 'Left pocket' }, { key: 'back', label: 'Back' }];
const PHOTO_TEE_AREAS = { front: photoTee.area, pocket: { x: 326, y: 176, w: 56, h: 56 } };
TEMPLATES.tshirt = {
  ...photoTee,
  styles: TEE_STYLES,
  placements: TEE_PLACEMENTS,
  resolve(style = 'round', placement = 'front') {
    const st = TEE_STYLES.find(x => x.key === style) || TEE_STYLES[0];
    const pl = TEE_PLACEMENTS.find(x => x.key === placement) || TEE_PLACEMENTS[0];
    const label = `${st.label} T-shirt, ${pl.label.toLowerCase()}`;
    if (st.key === 'round' && pl.key !== 'back') return { ...photoTee, label, area: PHOTO_TEE_AREAS[pl.key] };
    const t = teeSvg(st.key, pl.key);
    return { label, area: t.area, palette: 'fabric', colour: '#ffffff', base: t.base, overlay: t.overlay };
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
