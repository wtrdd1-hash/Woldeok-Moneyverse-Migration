-- The two read models Store 2.0 has been calling since 114 shipped without them.
--
-- a882c61 rewrote `ShopCatalogRepository.catalog()` and `.holdings()` to call
-- `shop_catalog_list_v2` and `shop_my_items_v2`, and 114 -- the migration
-- that came with it -- added the cosmetic columns those names promise but
-- never created the functions. So GET /api/v1/shop/catalog, /public-catalog
-- and /holdings have answered 42883 "function does not exist" on every
-- database that has run 114, and with them the shop page and the inventory.
-- This is the third time this repository has shipped a read path with no
-- function behind it (AGENTS.md §1); the shape of the fix is 047's and 095's.
--
-- A first attempt at these functions was 935551b, reverted the same hour.
-- That version also retired two careers from the work catalogue, which is a
-- product decision and is not repeated here.
--
-- `shop_my_items_v2` carries everything 107's `shop_my_items` does as well as
-- the cosmetics. The catalogue page (frontend /shop/catalog) reads the same
-- holdings route for a holding's upkeep, arrears and suspension, and a v2 that
-- dropped those would have quietly blanked that panel while fixing this one.

BEGIN;

CREATE OR REPLACE FUNCTION public.shop_catalog_list_v2(p_actor uuid)
RETURNS TABLE(
  catalog_id uuid,
  code text,
  name text,
  description text,
  category text,
  price bigint,
  quantity integer,
  purchase_limit text,
  effect_kind public.shop_effect_kind,
  maintenance_cost bigint,
  sale_ends_at timestamptz,
  rarity text,
  animation_css text,
  preview_data jsonb,
  max_stock integer,
  is_limited boolean,
  user_owned_quantity integer,
  user_is_equipped boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  -- The same rows and order as 075's shop_catalog_list, so a listing does
  -- not change shape between the two. A NULL actor is the public catalogue:
  -- the LEFT JOIN then matches nothing and every item reads as unowned.
  SELECT catalogue.id,
         catalogue.code,
         catalogue.name,
         catalogue.description,
         catalogue.category,
         catalogue.base_price,
         inventory.quantity,
         catalogue.purchase_limit,
         catalogue.effect_kind,
         catalogue.maintenance_cost,
         catalogue.sale_ends_at,
         catalogue.rarity,
         catalogue.animation_css,
         catalogue.preview_data,
         catalogue.max_stock,
         catalogue.is_limited,
         coalesce(held.quantity, 0),
         coalesce(held.is_equipped, false)
  FROM public.shop_catalog AS catalogue
  JOIN public.shop_inventory AS inventory ON inventory.catalog_id = catalogue.id
  LEFT JOIN public.user_items AS held
    ON p_actor IS NOT NULL AND held.user_id = p_actor AND held.catalog_id = catalogue.id
  WHERE catalogue.active
    AND (inventory.starts_at IS NULL OR inventory.starts_at <= pg_catalog.clock_timestamp())
    AND (inventory.ends_at IS NULL OR inventory.ends_at > pg_catalog.clock_timestamp())
  ORDER BY catalogue.category, catalogue.base_price, catalogue.code
$$;

CREATE OR REPLACE FUNCTION public.shop_my_items_v2(p_actor uuid)
RETURNS TABLE(
  catalog_id uuid,
  code text,
  name text,
  description text,
  category text,
  quantity integer,
  acquired_at timestamptz,
  expires_at timestamptz,
  effect_kind public.shop_effect_kind,
  rarity text,
  animation_css text,
  preview_data jsonb,
  is_equipped boolean,
  equipped_slot text,
  serial_number integer,
  durable boolean,
  weekly_cost bigint,
  effect_expires_at timestamptz,
  unpaid_weeks integer,
  arrears_due bigint,
  arrears_cap bigint,
  suspended boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  -- 107's shop_my_items, column for column, with the cosmetics beside it.
  SELECT held.catalog_id,
         catalogue.code,
         catalogue.name,
         catalogue.description,
         catalogue.category,
         held.quantity,
         held.acquired_at,
         held.expires_at,
         catalogue.effect_kind,
         catalogue.rarity,
         catalogue.animation_css,
         catalogue.preview_data,
         held.is_equipped,
         held.equipped_slot,
         held.serial_number,
         (catalogue.holding_duration_days IS NOT NULL OR catalogue.maintenance_cost > 0),
         catalogue.maintenance_cost * held.quantity,
         (SELECT max(receipt.expires_at)
          FROM public.item_effect_receipts AS receipt
          WHERE receipt.user_id = held.user_id
            AND receipt.catalog_id = held.catalog_id
            AND receipt.expires_at > pg_catalog.clock_timestamp()),
         coalesce(owed.unpaid_weeks, 0),
         coalesce(owed.amount_due, 0),
         catalogue.maintenance_cost * held.quantity * public.shop_upkeep_grace_weeks(),
         coalesce(owed.suspended, false)
  FROM public.user_items AS held
  JOIN public.shop_catalog AS catalogue ON catalogue.id = held.catalog_id
  LEFT JOIN public.shop_upkeep_arrears AS owed
    ON owed.user_id = held.user_id AND owed.catalog_id = held.catalog_id
  WHERE held.user_id = p_actor
    AND held.quantity > 0
    AND (held.expires_at IS NULL OR held.expires_at > pg_catalog.clock_timestamp())
  ORDER BY held.acquired_at DESC, held.catalog_id
$$;

ALTER FUNCTION public.shop_catalog_list_v2(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_my_items_v2(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.shop_catalog_list_v2(uuid),
  public.shop_my_items_v2(uuid)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.shop_catalog_list_v2(uuid),
  public.shop_my_items_v2(uuid)
TO moneyverse_app;

-- Restated, as 047 restates its revoke: a read arrives as a function and
-- never as a grant on the tables behind it.
REVOKE ALL PRIVILEGES ON TABLE
  public.shop_catalog,
  public.shop_inventory,
  public.user_items,
  public.item_effect_receipts
FROM PUBLIC, moneyverse_app;

COMMIT;
