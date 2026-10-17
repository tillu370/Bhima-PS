-- Adds a second product image, shown on hover in the product grid.
alter table public.products add column if not exists image_url_2 text;
