-- ==========================================================================
-- BHIMA PRINT SOLUTIONS - ADD 10 MUGS CATEGORY PRODUCTS
-- Exactly 10 products corresponding to all 10 images in Mugs Images:
-- 1.  MUG.jpg.jpeg   -> Romantic Floral Heart Couple Ceramic Mug
-- 2.  MUG2.jpg.jpeg  -> Magic Heat-Sensitive Color Changing Mug
-- 3.  MUG3.jpg.jpeg  -> Rose Petals Red Heart-Handle Mug
-- 4.  MUG4.jpg.jpeg  -> Romantic Couple Red Heart-Handle Mug
-- 5.  MUG5.jpg.jpeg  -> Dual-Tone Inside-Color Ceramic Mug (Red)
-- 6.  MUG6.jpg.jpeg  -> Frosted Glass Doodle & Quote Mug
-- 7.  MUG7.jpg.jpeg  -> Ceramic Jar Mug with Golden Mirror Lid
-- 8.  MUG8.jpg.jpeg  -> Frosted Gradient Ombré Glass Mugs
-- 9.  MUG9.jpg.jpeg  -> Classic Panoramic White Photo Mug
-- 10. MUG10.jpg.jpeg -> Glitter Sparkle Shimmer Magic Mug
-- ==========================================================================

do $$
declare
  v_cat_mugs uuid;
begin
  -- Retrieve or ensure the Mugs category exists
  select id into v_cat_mugs from public.categories where slug = 'mugs' limit 1;

  if v_cat_mugs is null then
    insert into public.categories (slug, name, description, sort_order, image_url, is_active)
    values ('mugs', 'Mugs', 'Mugs printed with your photo, name or design', 1, '/images/mugs/classic-white-photo-mug.jpg', true)
    returning id into v_cat_mugs;
  else
    update public.categories
    set image_url = '/images/mugs/classic-white-photo-mug.jpg'
    where id = v_cat_mugs and (image_url is null or image_url = '/images/mug-printing.jpg');
  end if;

  -- 1. MUG.jpg.jpeg: Romantic Floral Heart Couple Ceramic Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'romantic-floral-couple-mug',
    v_cat_mugs,
    'Romantic Floral Heart Couple Ceramic Mug',
    'Elegant white ceramic mug decorated with delicate watercolor florals, gold heart frame, and romantic calligraphy. Ideal anniversary, wedding, or Valentine celebration keepsake.',
    229,
    '/images/mugs/romantic-floral-couple-mug.jpg',
    null,
    1,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 2. MUG2.jpg.jpeg: Magic Heat-Sensitive Color Changing Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'magic-color-changing-mug',
    v_cat_mugs,
    'Magic Heat-Sensitive Color Changing Mug',
    'Fascinating heat-activated thermochromic magic mug. Appears sleek matte black when cold, and magically transforms to reveal your custom photo or message when hot beverage is poured in.',
    349,
    '/images/mugs/magic-color-changing-mug.jpg',
    null,
    2,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 3. MUG3.jpg.jpeg: Rose Petals Red Heart-Handle Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'rose-petals-heart-handle-mug',
    v_cat_mugs,
    'Rose Petals Red Heart-Handle Mug',
    'Charming ceramic mug featuring a sculpted red heart handle, rich red interior, and your special portrait framed by drifting red rose petals.',
    299,
    '/images/mugs/rose-petals-heart-handle-mug.jpg',
    null,
    3,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 4. MUG4.jpg.jpeg: Romantic Couple Red Heart-Handle Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'couple-heart-handle-mug',
    v_cat_mugs,
    'Romantic Couple Red Heart-Handle Mug',
    'Express your love with this couple photo mug featuring a cutout red heart handle, vibrant red rim and interior, and high-gloss portrait print.',
    299,
    '/images/mugs/couple-heart-handle-mug.jpg',
    null,
    4,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 5. MUG5.jpg.jpeg: Dual-Tone Inside-Color Ceramic Mug (Red)
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'dual-tone-inside-color-mug',
    v_cat_mugs,
    'Dual-Tone Inside-Color Ceramic Mug',
    'Two-tone ceramic mug featuring a vibrant crimson red interior and matching colored C-handle, contrasted against a crisp white exterior. Vivid sublimation print.',
    249,
    '/images/mugs/dual-tone-inside-color-mug.jpg',
    null,
    5,
    true,
    false
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 6. MUG6.jpg.jpeg: Frosted Glass Doodle & Quote Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'frosted-glass-doodle-mug',
    v_cat_mugs,
    'Frosted Glass Doodle & Quote Mug',
    'Premium semi-translucent frosted glass mug featuring quirky pop-art typographic doodles, speech bubbles, and customizable quotes. Perfect for iced coffees and green tea.',
    299,
    '/images/mugs/frosted-glass-doodle-mug.jpg',
    null,
    6,
    true,
    false
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 7. MUG7.jpg.jpeg: Ceramic Jar Mug with Golden Mirror Lid
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'ceramic-jar-mug-mirror-lid',
    v_cat_mugs,
    'Ceramic Jar Mug with Mirror Lid',
    'Luxurious tall ribbed ceramic travel/desk jar mug with a sparkling gold reflective mirror screw-top lid. Keeps beverages hot and dust-free while showcasing custom motifs.',
    399,
    '/images/mugs/ceramic-jar-mug-mirror-lid.jpg',
    null,
    7,
    true,
    false
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 8. MUG8.jpg.jpeg: Frosted Gradient Ombré Glass Mugs
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'frosted-gradient-glass-mugs',
    v_cat_mugs,
    'Frosted Gradient Ombré Glass Mugs',
    'Vibrant collection of frosted glass mugs featuring soothing gradient ombré color transitions in lime green, arctic blue, and sunset violet. Modern, tactile, and stylish.',
    329,
    '/images/mugs/frosted-gradient-glass-mugs.jpg',
    null,
    8,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 9. MUG9.jpg.jpeg: Classic Panoramic White Photo Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'classic-white-photo-mug',
    v_cat_mugs,
    'Classic White Panoramic Photo Mug',
    'High-grade 325ml glossy white ceramic coffee mug with vibrant edge-to-edge panoramic photo printing. Microwave and dishwasher safe, ideal for family photos or daily use.',
    199,
    '/images/mugs/classic-white-photo-mug.jpg',
    null,
    9,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

  -- 10. MUG10.jpg.jpeg: Glitter Sparkle Shimmer Magic Mug
  insert into public.products (slug, category_id, name, description, price_from, image_url, image_url_2, sort_order, is_active, is_featured)
  values (
    'glitter-sparkle-magic-mug',
    v_cat_mugs,
    'Glitter Sparkle Shimmer Magic Mug',
    'Eye-catching sparkling glitter-finish ceramic mug that glimmers with fine stardust accents. Paired with high-definition digital portrait printing for an enchanting keepsake.',
    379,
    '/images/mugs/glitter-sparkle-magic-mug.jpg',
    null,
    10,
    true,
    true
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price_from = excluded.price_from,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

end $$;
