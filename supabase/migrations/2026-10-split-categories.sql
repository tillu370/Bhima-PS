-- ==========================================================================
-- BHIMA PRINT SOLUTIONS - SPLIT CATEGORIES MIGRATION
-- Separates compound categories into individual distinct categories:
-- Mugs, Bottles, T-Shirts, Pillows, Photo Frames, LED Frames, Wall Clocks,
-- Wood Engraving, Laser Gifts, Name Boards, Key Chains, Fridge Magnets, Badges,
-- Corporate Gift Sets, Customised Pens, Pen Stands, Wallet Cards, Leather Products.
-- ==========================================================================

do $$
declare
  v_cat_mugs uuid;
  v_cat_bottles uuid;
  v_cat_tshirts uuid;
  v_cat_pillows uuid;
  v_cat_frames uuid;
  v_cat_led uuid;
  v_cat_wood_frames uuid;
  v_cat_clocks uuid;
  v_cat_wood_engr uuid;
  v_cat_laser_gifts uuid;
  v_cat_name_boards uuid;
  v_cat_keychains uuid;
  v_cat_magnets uuid;
  v_cat_badges uuid;
  v_cat_corp_sets uuid;
  v_cat_pens uuid;
  v_cat_pen_stands uuid;
  v_cat_wallet_cards uuid;
  v_cat_leather uuid;
begin

  -- 1. Insert new split categories if they don't already exist
  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('mugs', 'Mugs', 'Mugs printed with your photo, name or design', 1, '/images/mug-printing.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_mugs;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('bottles', 'Bottles', 'Water bottles personalised with a name, photo or logo', 2, '/images/water-bottles.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_bottles;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('t-shirts', 'T-Shirts', 'T-shirts printed with your custom design for teams & events', 3, '/images/t-shirt-printing.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_tshirts;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('pillows', 'Pillows', 'Pillows printed with your photos or a personal message', 4, '/images/pillow-printing.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_pillows;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('photo-frames', 'Photo Frames', 'Photo and wooden frames with your pictures printed in', 5, '/images/photo-frames.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_frames;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('led-frames', 'LED Frames', 'LED photo frames that illuminate and glow with your picture', 6, '/images/led-frames.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_led;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('wall-clocks', 'Wall Clocks', 'Wall clocks customised with your photo on the dial', 7, '/images/photo-wall-clocks.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_clocks;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('wood-engraving', 'Wood Engraving', 'Names, designs and messages precision engraved on natural wood', 8, '/images/wood-engraving.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_wood_engr;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('laser-gifts', 'Laser Gifts', 'Gift items engraved with laser: names, dates and custom designs', 9, '/images/laser-gifts.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_laser_gifts;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('name-boards', 'Name Boards', 'Name boards for office desks, doors and modern homes', 10, '/images/name-boards.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_name_boards;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('key-chains', 'Key Chains', 'Photo and laser engraved key chains for keepsakes and gifts', 11, '/images/photo-key-chains.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_keychains;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('fridge-magnets', 'Fridge Magnets', 'Fridge magnets with your photos for keepsakes & gifts', 12, '/images/photo-fridge-magnets.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_magnets;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('badges', 'Badges', 'Badges with your photo, for events, teams and promotions', 13, '/images/photo-badges.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_badges;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('corporate-gift-sets', 'Corporate Gift Sets', 'Executive gift sets for employees, clients and corporate events', 14, '/images/corporate-gift-sets.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_corp_sets;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('customised-pens', 'Customised Pens', 'Pens customised with name or company logo for gifting & promotions', 15, '/images/customised-pens.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_pens;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('pen-stands', 'Pen Stands', 'Desk pen stands customised with logo or name for office desks', 16, '/images/pen-stands.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_pen_stands;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('wallet-cards', 'Wallet Cards', 'Wallet cards with your photo, message or personal details', 17, '/images/wallet-cards.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_wallet_cards;

  insert into public.categories (slug, name, description, sort_order, image_url, is_active)
  values
    ('leather-products', 'Leather Products', 'Premium leather products personalised for corporate and personal gifting', 18, '/images/leather-products.jpg', true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, image_url = excluded.image_url, sort_order = excluded.sort_order
  returning id into v_cat_leather;

  -- 2. Re-assign products to their respective new individual category
  update public.products set category_id = v_cat_mugs where slug = 'mug-printing';
  update public.products set category_id = v_cat_bottles where slug = 'water-bottles';
  update public.products set category_id = v_cat_tshirts where slug = 't-shirt-printing';
  update public.products set category_id = v_cat_pillows where slug = 'pillow-printing';
  update public.products set category_id = v_cat_frames where slug in ('photo-frames', 'wood-photo-frames');
  update public.products set category_id = v_cat_led where slug = 'led-frames';
  update public.products set category_id = v_cat_clocks where slug = 'photo-wall-clocks';
  update public.products set category_id = v_cat_wood_engr where slug = 'wood-engraving';
  update public.products set category_id = v_cat_laser_gifts where slug = 'laser-gifts';
  update public.products set category_id = v_cat_name_boards where slug = 'name-boards';
  update public.products set category_id = v_cat_keychains where slug in ('photo-key-chains', 'laser-key-chains');
  update public.products set category_id = v_cat_magnets where slug = 'photo-fridge-magnets';
  update public.products set category_id = v_cat_badges where slug = 'photo-badges';
  update public.products set category_id = v_cat_corp_sets where slug = 'corporate-gift-sets';
  update public.products set category_id = v_cat_pens where slug = 'customised-pens';
  update public.products set category_id = v_cat_pen_stands where slug = 'pen-stands';
  update public.products set category_id = v_cat_wallet_cards where slug = 'wallet-cards';
  update public.products set category_id = v_cat_leather where slug = 'leather-products';

  -- 3. Deactivate old combined categories
  update public.categories set is_active = false where slug in (
    'mugs-bottles', 'apparel-cushions', 'frames-clocks',
    'laser-wood', 'keychains-magnets', 'corporate-gifts'
  );

end $$;
