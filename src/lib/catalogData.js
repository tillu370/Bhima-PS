// ==========================================================================
// BHIMA PRINT SOLUTIONS - 18 INDIVIDUAL CATEGORIES
// Split from compound categories into distinct individual categories.
// ==========================================================================

export const INDIVIDUAL_CATEGORIES = [
  {
    id: 'cat-mugs',
    slug: 'mugs',
    name: 'Mugs',
    description: 'Mugs printed with your photo, name or design',
    image_url: '/images/mug-printing.jpg',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'cat-bottles',
    slug: 'bottles',
    name: 'Bottles',
    description: 'Water bottles personalised with a name, photo or logo',
    image_url: '/images/water-bottles.jpg',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'cat-tshirts',
    slug: 't-shirts',
    name: 'T-Shirts',
    description: 'T-shirts printed with your custom design for teams & events',
    image_url: '/images/t-shirt-printing.jpg',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'cat-pillows',
    slug: 'pillows',
    name: 'Pillows',
    description: 'Pillows printed with your photos or a personal message',
    image_url: '/images/pillow-printing.jpg',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'cat-photo-frames',
    slug: 'photo-frames',
    name: 'Photo Frames',
    description: 'Photo and wooden frames with your pictures printed in',
    image_url: '/images/photo-frames.jpg',
    sort_order: 5,
    is_active: true
  },
  {
    id: 'cat-led-frames',
    slug: 'led-frames',
    name: 'LED Frames',
    description: 'LED photo frames that illuminate and glow with your picture',
    image_url: '/images/led-frames.jpg',
    sort_order: 6,
    is_active: true
  },
  {
    id: 'cat-wall-clocks',
    slug: 'wall-clocks',
    name: 'Wall Clocks',
    description: 'Wall clocks customised with your photo on the dial',
    image_url: '/images/photo-wall-clocks.jpg',
    sort_order: 7,
    is_active: true
  },
  {
    id: 'cat-wood-engraving',
    slug: 'wood-engraving',
    name: 'Wood Engraving',
    description: 'Names, designs and messages precision engraved on natural wood',
    image_url: '/images/wood-engraving.jpg',
    sort_order: 8,
    is_active: true
  },
  {
    id: 'cat-laser-gifts',
    slug: 'laser-gifts',
    name: 'Laser Gifts',
    description: 'Gift items engraved with laser: names, dates and custom designs',
    image_url: '/images/laser-gifts.jpg',
    sort_order: 9,
    is_active: true
  },
  {
    id: 'cat-name-boards',
    slug: 'name-boards',
    name: 'Name Boards',
    description: 'Name boards for office desks, doors and modern homes',
    image_url: '/images/name-boards.jpg',
    sort_order: 10,
    is_active: true
  },
  {
    id: 'cat-key-chains',
    slug: 'key-chains',
    name: 'Key Chains',
    description: 'Photo and laser engraved key chains for keepsakes and gifts',
    image_url: '/images/photo-key-chains.jpg',
    sort_order: 11,
    is_active: true
  },
  {
    id: 'cat-fridge-magnets',
    slug: 'fridge-magnets',
    name: 'Fridge Magnets',
    description: 'Fridge magnets with your photos for keepsakes & gifts',
    image_url: '/images/photo-fridge-magnets.jpg',
    sort_order: 12,
    is_active: true
  },
  {
    id: 'cat-badges',
    slug: 'badges',
    name: 'Badges',
    description: 'Badges with your photo, for events, teams and promotions',
    image_url: '/images/photo-badges.jpg',
    sort_order: 13,
    is_active: true
  },
  {
    id: 'cat-corporate-gift-sets',
    slug: 'corporate-gift-sets',
    name: 'Corporate Gift Sets',
    description: 'Executive gift sets for employees, clients and corporate events',
    image_url: '/images/corporate-gift-sets.jpg',
    sort_order: 14,
    is_active: true
  },
  {
    id: 'cat-customised-pens',
    slug: 'customised-pens',
    name: 'Customised Pens',
    description: 'Pens customised with name or company logo for gifting & promotions',
    image_url: '/images/customised-pens.jpg',
    sort_order: 15,
    is_active: true
  },
  {
    id: 'cat-pen-stands',
    slug: 'pen-stands',
    name: 'Pen Stands',
    description: 'Desk pen stands customised with logo or name for office desks',
    image_url: '/images/pen-stands.jpg',
    sort_order: 16,
    is_active: true
  },
  {
    id: 'cat-wallet-cards',
    slug: 'wallet-cards',
    name: 'Wallet Cards',
    description: 'Wallet cards with your photo, message or personal details',
    image_url: '/images/wallet-cards.jpg',
    sort_order: 17,
    is_active: true
  },
  {
    id: 'cat-leather-products',
    slug: 'leather-products',
    name: 'Leather Products',
    description: 'Premium leather products personalised for corporate and personal gifting',
    image_url: '/images/leather-products.jpg',
    sort_order: 18,
    is_active: true
  }
];

// Product slug to individual category mapping
export const PRODUCT_TO_CATEGORY = {
  'mug-printing': { slug: 'mugs', name: 'Mugs' },
  'water-bottles': { slug: 'bottles', name: 'Bottles' },
  't-shirt-printing': { slug: 't-shirts', name: 'T-Shirts' },
  'pillow-printing': { slug: 'pillows', name: 'Pillows' },
  'photo-frames': { slug: 'photo-frames', name: 'Photo Frames' },
  'wood-photo-frames': { slug: 'photo-frames', name: 'Photo Frames' },
  'led-frames': { slug: 'led-frames', name: 'LED Frames' },
  'photo-wall-clocks': { slug: 'wall-clocks', name: 'Wall Clocks' },
  'wood-engraving': { slug: 'wood-engraving', name: 'Wood Engraving' },
  'laser-gifts': { slug: 'laser-gifts', name: 'Laser Gifts' },
  'name-boards': { slug: 'name-boards', name: 'Name Boards' },
  'laser-key-chains': { slug: 'key-chains', name: 'Key Chains' },
  'photo-key-chains': { slug: 'key-chains', name: 'Key Chains' },
  'photo-fridge-magnets': { slug: 'fridge-magnets', name: 'Fridge Magnets' },
  'photo-badges': { slug: 'badges', name: 'Badges' },
  'corporate-gift-sets': { slug: 'corporate-gift-sets', name: 'Corporate Gift Sets' },
  'customised-pens': { slug: 'customised-pens', name: 'Customised Pens' },
  'pen-stands': { slug: 'pen-stands', name: 'Pen Stands' },
  'wallet-cards': { slug: 'wallet-cards', name: 'Wallet Cards' },
  'leather-products': { slug: 'leather-products', name: 'Leather Products' }
};

// Maps any product to ensure it has its dedicated individual category
export function adaptProductCategory(product) {
  if (!product) return product;
  const mapped = PRODUCT_TO_CATEGORY[product.slug];
  if (mapped) {
    return {
      ...product,
      categories: mapped
    };
  }
  return product;
}
