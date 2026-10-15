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
    label: 'T-shirt', area: { x: 205, y: 150, w: 190, h: 270 }, palette: 'fabric', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 552, 190, 16, 0.3)}<path d="${TEE}" fill="${c}"/><path d="M205 72 C225 138 375 138 395 72" fill="none" stroke="${shade(c, -0.2)}" stroke-width="16" stroke-linecap="round"/><path d="M212 74 C240 112 360 112 388 74 C366 94 234 94 212 74 Z" fill="${shade(c, -0.42)}"/><g fill="none" stroke="${shade(c, -0.22)}" stroke-width="2" stroke-dasharray="5 4"><path d="M160 521 L440 521"/><path d="M118 244 L148 222"/><path d="M482 244 L452 222"/></g>`),
    overlay: () => svg(`<clipPath id="teeC"><path d="${TEE}"/></clipPath><g clip-path="url(#teeC)"><rect width="600" height="600" fill="url(#cylH)" opacity=".5"/><rect width="600" height="600" fill="url(#ambV)"/><g fill="#000" opacity=".07" filter="url(#bl6)"><ellipse cx="230" cy="330" rx="14" ry="70" transform="rotate(8 230 330)"/><ellipse cx="372" cy="400" rx="12" ry="60" transform="rotate(-9 372 400)"/><ellipse cx="300" cy="500" rx="80" ry="10"/></g><g fill="#fff" opacity=".12" filter="url(#bl6)"><ellipse cx="260" cy="300" rx="10" ry="60" transform="rotate(8 260 300)"/><ellipse cx="342" cy="250" rx="9" ry="50" transform="rotate(-7 342 250)"/></g><path d="M148 222 L148 330 L170 300 Z" fill="#000" opacity=".22" filter="url(#bl3)"/><path d="M452 222 L452 330 L430 300 Z" fill="#000" opacity=".22" filter="url(#bl3)"/><rect width="600" height="600" filter="url(#nz)" opacity=".05"/></g>`)
  },
  mug: {
    label: 'Mug', area: { x: 160, y: 190, w: 230, h: 230 }, palette: 'ceramic', colour: '#ffffff',
    base: c => svg(`${bg}${floor(290, 492, 175, 20, 0.34)}<path d="M416 214 C528 204 528 408 414 398" fill="none" stroke="${shade(c, -0.22)}" stroke-width="40" stroke-linecap="round"/><path d="M416 214 C514 208 514 404 414 398" fill="none" stroke="${c}" stroke-width="30" stroke-linecap="round"/><path d="M420 222 C500 220 500 392 418 388" fill="none" stroke="#fff" stroke-width="5" opacity=".45" stroke-linecap="round"/><path d="${MUG}" fill="${c}"/><ellipse cx="275" cy="142" rx="145" ry="21" fill="${shade(c, 0.1)}"/><ellipse cx="275" cy="144" rx="132" ry="16" fill="${shade(c, -0.38)}"/><ellipse cx="275" cy="149" rx="118" ry="9" fill="${shade(c, -0.55)}" opacity=".55"/>`),
    overlay: () => svg(`<clipPath id="mugC"><path d="${MUG}"/></clipPath><g clip-path="url(#mugC)"><rect x="120" y="150" width="310" height="345" fill="url(#cylH)"/><rect x="120" y="150" width="310" height="345" fill="url(#ambV)" opacity=".8"/></g>${streak(190, 175, 15, 270, 0.55)}${streak(352, 190, 6, 240, 0.18)}`)
  },
  bottle: {
    label: 'Water bottle', area: { x: 235, y: 235, w: 130, h: 215 }, palette: 'metal', colour: '#9ca3af',
    base: c => svg(`${bg}${floor(300, 552, 120, 14, 0.34)}<rect x="258" y="52" width="84" height="66" rx="16" fill="${shade(c, -0.55)}"/><rect x="248" y="112" width="104" height="44" rx="10" fill="${shade(c, -0.15)}"/><path d="${BOTTLE}" fill="${c}"/><rect x="215" y="150" width="170" height="8" fill="${shade(c, -0.35)}" opacity=".6"/>`),
    overlay: () => svg(`<clipPath id="botC"><path d="${BOTTLE}"/></clipPath><rect x="258" y="52" width="84" height="66" rx="16" fill="url(#metalH)" opacity=".7"/><rect x="248" y="112" width="104" height="44" rx="10" fill="url(#metalH)" opacity=".6"/><g clip-path="url(#botC)"><rect x="205" y="150" width="190" height="400" fill="url(#metalH)"/><rect x="205" y="150" width="190" height="400" fill="url(#ambV)" opacity=".6"/></g>${streak(244, 175, 12, 340, 0.6)}`)
  },
  pillow: {
    label: 'Pillow', area: { x: 150, y: 150, w: 300, h: 300 }, palette: 'fabric', colour: '#ffffff',
    base: c => svg(`${bg}${floor(300, 508, 220, 20, 0.28)}<path d="${PILLOW}" fill="${c}"/><g stroke="${shade(c, -0.25)}" stroke-width="3" fill="none" opacity=".7"><path d="M92 132 C150 150 160 160 168 205"/><path d="M508 132 C450 150 440 160 432 205"/><path d="M92 468 C150 450 160 440 168 395"/><path d="M508 468 C450 450 440 440 432 395"/></g>`),
    overlay: () => svg(`<clipPath id="pilC"><path d="${PILLOW}"/></clipPath><g clip-path="url(#pilC)"><rect width="600" height="600" fill="url(#puff)"/><g fill="#000" opacity=".16" filter="url(#bl6)"><path d="M92 132 C150 150 160 160 168 205 L120 190 Z"/><path d="M508 132 C450 150 440 160 432 205 L480 190 Z"/><path d="M92 468 C150 450 160 440 168 395 L120 410 Z"/><path d="M508 468 C450 450 440 440 432 395 L480 410 Z"/></g><rect width="600" height="600" filter="url(#nz)" opacity=".12"/></g>`)
  },
  frame: {
    label: 'Photo frame', area: { x: 135, y: 135, w: 330, h: 330 }, palette: 'frame', colour: '#8a5a3c',
    base: c => svg(`${bg}${floor(300, 536, 230, 18, 0.34)}<rect x="76" y="76" width="448" height="448" rx="6" fill="${c}"/><rect x="76" y="76" width="448" height="448" rx="6" fill="url(#grain)" opacity=".5"/><path d="M76 76 L524 76 L480 120 L120 120 Z" fill="#fff" opacity=".22"/><path d="M76 76 L120 120 L120 480 L76 524 Z" fill="#fff" opacity=".1"/><path d="M524 524 L76 524 L120 480 L480 480 Z" fill="#000" opacity=".28"/><path d="M524 76 L524 524 L480 480 L480 120 Z" fill="#000" opacity=".2"/><rect x="120" y="120" width="360" height="360" fill="#f7f4ee"/>`),
    overlay: () => svg(`<path d="M135 135 L465 135 L465 148 L148 148 L148 465 L135 465 Z" fill="#000" opacity=".22" filter="url(#bl3)"/><path d="M120 120 L480 120 L240 480 L120 480 Z" fill="url(#glare)" opacity=".5"/>`)
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
