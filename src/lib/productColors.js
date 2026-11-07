// Colour variants: apparel products (T-shirts etc.) can offer several colours, each with its own
// swatch and product photo. A "colors" entry looks like { name, hex, image_url, image_url_2 }.
export const APPAREL_CATEGORY_SLUGS = ['t-shirts', 'apparel-cushions', 'pillows'];
export const isApparelCategory = slug => !!slug && APPAREL_CATEGORY_SLUGS.some(s => slug === s || slug.includes('shirt'));

export const emptyColor = () => ({ name: '', hex: '#111827', image_url: '', image_url_2: '' });

// Normalises whatever is stored in the DB (null, a bare array, or odd shapes) into a clean array.
export const normalizeColors = colors => (Array.isArray(colors) ? colors.filter(c => c && c.name) : []);
