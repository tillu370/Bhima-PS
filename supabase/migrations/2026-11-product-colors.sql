-- Colour variants for apparel products (e.g. T-shirts): each entry is
-- {"name": "Navy", "hex": "#0b1b3f", "image_url": "...", "image_url_2": "..."}.
-- Shown as swatches on the product page and in the Design Studio; picking one swaps the photo shown.
alter table public.products add column if not exists colors jsonb;
