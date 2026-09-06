-- Restore the sale row for every active catalogue item.
--
-- The long-lived production catalogue retained all product definitions, but
-- its shop_inventory rows were missing.  The v2 read model intentionally
-- joins inventory so that an item cannot be sold without an explicit stock
-- policy; consequently the store correctly returned zero products.  Rebuild
-- only missing policies.  Existing quantities, sale windows and operator
-- changes are left untouched.

BEGIN;

INSERT INTO public.shop_inventory (
  catalog_id,
  quantity,
  restock_rule,
  starts_at,
  ends_at,
  baseline_quantity
)
SELECT catalogue.id,
       CASE
         WHEN catalogue.is_limited
           THEN coalesce(catalogue.current_stock, catalogue.max_stock, 0)
         ELSE NULL
       END,
       'none',
       NULL,
       NULL,
       CASE
         WHEN catalogue.is_limited
           THEN coalesce(catalogue.current_stock, catalogue.max_stock, 0)
         ELSE NULL
       END
FROM public.shop_catalog AS catalogue
WHERE catalogue.active
ON CONFLICT (catalog_id) DO NOTHING;

COMMIT;
