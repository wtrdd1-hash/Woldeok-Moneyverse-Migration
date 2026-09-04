-- Complete the Store 2.0 read boundary and retire tasks from careers that the
-- eight-career selector no longer offers.

BEGIN;

UPDATE public.work_task_catalog
SET active = false,
    updated_at = pg_catalog.clock_timestamp()
WHERE job_type IN (
  'carrier'::public.work_job_type,
  'technician'::public.work_job_type
)
  AND active;

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
    ON held.user_id = p_actor AND held.catalog_id = catalogue.id
  WHERE catalogue.active
    AND (inventory.starts_at IS NULL OR inventory.starts_at <= pg_catalog.clock_timestamp())
    AND (inventory.ends_at IS NULL OR inventory.ends_at > pg_catalog.clock_timestamp())
    AND (catalogue.sale_ends_at IS NULL OR catalogue.sale_ends_at > pg_catalog.clock_timestamp())
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
  serial_number integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
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
         held.serial_number
  FROM public.user_items AS held
  JOIN public.shop_catalog AS catalogue ON catalogue.id = held.catalog_id
  WHERE held.user_id = p_actor
    AND held.quantity > 0
    AND (held.expires_at IS NULL OR held.expires_at > pg_catalog.clock_timestamp())
  ORDER BY held.acquired_at DESC, held.catalog_id
$$;

ALTER FUNCTION public.shop_catalog_list_v2(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_my_items_v2(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_catalog_list_v2(uuid),
  public.shop_my_items_v2(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_catalog_list_v2(uuid),
  public.shop_my_items_v2(uuid) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.shop_catalog, public.shop_inventory,
  public.user_items FROM PUBLIC, moneyverse_app;

COMMIT;
