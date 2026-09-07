BEGIN;

-- The admin shop controller used to query shop_catalog directly through the
-- application role. That role intentionally has no table privileges, so the
-- route was both broken and outside the repository's SECURITY DEFINER model.
-- Read and write through actor-scoped functions instead; the table stays shut.
CREATE OR REPLACE FUNCTION public.admin_shop_items(p_actor uuid)
RETURNS TABLE(
  id uuid,
  code text,
  name text,
  description text,
  category text,
  base_price bigint,
  rarity text,
  animation_css text,
  preview_data jsonb,
  max_stock integer,
  current_stock integer,
  is_limited boolean,
  active boolean,
  purchase_limit text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_current_roles(p_actor)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  RETURN QUERY
  SELECT
    item.id,
    item.code,
    item.name,
    item.description,
    item.category,
    item.base_price,
    item.rarity,
    item.animation_css,
    item.preview_data,
    item.max_stock,
    item.current_stock,
    item.is_limited,
    item.active,
    item.purchase_limit,
    item.created_at
  FROM public.shop_catalog AS item
  ORDER BY
    CASE item.category
      WHEN 'frame' THEN 1
      WHEN 'background' THEN 2
      WHEN 'effect' THEN 3
      WHEN 'nameplate' THEN 4
      WHEN 'title' THEN 5
      WHEN 'badge' THEN 6
      WHEN 'season' THEN 7
      WHEN 'limited' THEN 8
      WHEN 'business' THEN 9
      WHEN 'convenience' THEN 10
      ELSE 11
    END,
    item.base_price ASC,
    item.code ASC;
END;
$$;

ALTER FUNCTION public.admin_shop_items(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_shop_items(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_shop_items(uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_shop_update_item(
  p_actor uuid,
  p_item uuid,
  p_base_price bigint,
  p_active boolean,
  p_current_stock integer,
  p_update_price boolean,
  p_update_active boolean,
  p_update_stock boolean
)
RETURNS TABLE(id uuid, name text, base_price bigint, active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_max_stock integer;
  v_limited boolean;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'operator or superadmin role required';
  END IF;

  IF p_item IS NULL OR NOT (coalesce(p_update_price, false)
    OR coalesce(p_update_active, false) OR coalesce(p_update_stock, false)) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop update requires at least one field';
  END IF;

  IF coalesce(p_update_price, false) AND (p_base_price IS NULL OR p_base_price <= 0) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop price must be a positive integer';
  END IF;

  IF coalesce(p_update_stock, false) AND p_current_stock IS NOT NULL AND p_current_stock < 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop stock cannot be negative';
  END IF;

  SELECT item.max_stock, item.is_limited
  INTO v_max_stock, v_limited
  FROM public.shop_catalog AS item
  WHERE item.id = p_item
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop item not found';
  END IF;

  IF coalesce(p_update_stock, false)
     AND v_limited
     AND v_max_stock IS NOT NULL
     AND p_current_stock IS NOT NULL
     AND p_current_stock > v_max_stock THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop stock cannot exceed max stock';
  END IF;

  RETURN QUERY
  UPDATE public.shop_catalog AS item
  SET base_price = CASE WHEN coalesce(p_update_price, false) THEN p_base_price ELSE item.base_price END,
      active = CASE WHEN coalesce(p_update_active, false) THEN p_active ELSE item.active END,
      current_stock = CASE WHEN coalesce(p_update_stock, false) THEN p_current_stock ELSE item.current_stock END,
      updated_at = pg_catalog.clock_timestamp()
  WHERE item.id = p_item
  RETURNING item.id, item.name, item.base_price, item.active;
END;
$$;

ALTER FUNCTION public.admin_shop_update_item(uuid, uuid, bigint, boolean, integer, boolean, boolean, boolean)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION
  public.admin_shop_update_item(uuid, uuid, bigint, boolean, integer, boolean, boolean, boolean)
FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION
  public.admin_shop_update_item(uuid, uuid, bigint, boolean, integer, boolean, boolean, boolean)
TO moneyverse_app;

-- Restate the boundary this migration repairs. No route gets raw table access.
REVOKE ALL PRIVILEGES ON TABLE public.shop_catalog FROM PUBLIC, moneyverse_app;

COMMIT;
