-- ==========================================================================
-- BHIMA PRINT SOLUTIONS - QUANTITY DISCOUNT TIERS
-- Adds a jsonb column on categories holding bulk-quantity discount tiers,
-- e.g. [{"min_qty": 2, "percent": 15}, {"min_qty": 3, "percent": 20}].
-- The storefront looks this up per category; a null column means no
-- discount. Only "Mugs" gets a rule for now.
-- ==========================================================================

alter table public.categories add column if not exists qty_discount_tiers jsonb;

update public.categories
set qty_discount_tiers = '[{"min_qty": 2, "percent": 15}, {"min_qty": 3, "percent": 20}]'::jsonb
where slug = 'mugs';
