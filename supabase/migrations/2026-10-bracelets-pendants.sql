-- ==========================================================================
-- BHIMA PRINT SOLUTIONS - ADD BRACELETS & NAME PENDANTS
-- Two new individual categories, each with a starter product. Images are
-- left null so the storefront shows the branded placeholder tile until
-- photos are uploaded from the admin dashboard.
-- ==========================================================================

do $$
declare
  v_cat_bracelets uuid;
  v_cat_pendants uuid;
begin

  insert into public.categories (slug, name, description, sort_order, is_active)
  values ('bracelets', 'Bracelets', 'Customized bracelets for gifting and everyday wear', 19, true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order
  returning id into v_cat_bracelets;

  insert into public.categories (slug, name, description, sort_order, is_active)
  values ('name-pendants', 'Name Pendants', 'Name pendant chains personalised with your name or initials', 20, true)
  on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order
  returning id into v_cat_pendants;

  insert into public.products (name, slug, category_id, sort_order, description, is_active)
  values ('Customized Bracelets', 'customized-bracelets', v_cat_bracelets, 0, 'Bracelets customized with your name, initials or a message.', true)
  on conflict (slug) do update set category_id = excluded.category_id, description = excluded.description;

  insert into public.products (name, slug, category_id, sort_order, description, is_active)
  values ('Name Pendant Chain', 'name-pendant-chain', v_cat_pendants, 0, 'A pendant chain engraved with your name, initials or a short message.', true)
  on conflict (slug) do update set category_id = excluded.category_id, description = excluded.description;

end $$;
