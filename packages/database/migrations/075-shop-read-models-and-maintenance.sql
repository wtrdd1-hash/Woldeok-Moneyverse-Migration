BEGIN;

-- Item effects are intentionally a closed vocabulary.  Storing arbitrary
-- multipliers would make it possible to add a wagering or market advantage
-- without a schema review.
--
-- `?|` only looks at top-level keys, so `{"bonus": {"casinoOdds": 2}}` walked
-- straight through the constraint it was written to fail. This walks the
-- document.
CREATE OR REPLACE FUNCTION public.shop_effect_is_permitted(p_effect jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_forbidden constant text[] := ARRAY['casinoOdds', 'stockReturn', 'competitionMultiplier'];
  v_key text;
BEGIN
  IF p_effect IS NULL THEN
    RETURN false;
  END IF;

  IF pg_catalog.jsonb_typeof(p_effect) = 'object' THEN
    FOR v_key IN
      SELECT keys.effect_key FROM pg_catalog.jsonb_object_keys(p_effect) AS keys(effect_key)
    LOOP
      IF v_key = ANY (v_forbidden) THEN
        RETURN false;
      END IF;
      IF NOT public.shop_effect_is_permitted(p_effect -> v_key) THEN
        RETURN false;
      END IF;
    END LOOP;
  ELSIF pg_catalog.jsonb_typeof(p_effect) = 'array' THEN
    IF EXISTS (
      SELECT 1 FROM pg_catalog.jsonb_array_elements(p_effect) AS element(value)
      WHERE NOT public.shop_effect_is_permitted(element.value)
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

ALTER FUNCTION public.shop_effect_is_permitted(jsonb) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_effect_is_permitted(jsonb)
  FROM PUBLIC, moneyverse_app;

ALTER TABLE public.shop_catalog
  ADD CONSTRAINT shop_catalog_effect_shape_check CHECK (
    jsonb_typeof(effect) = 'object' AND public.shop_effect_is_permitted(effect)
  );

ALTER TABLE public.shop_catalog
  ADD COLUMN maintenance_cost bigint NOT NULL DEFAULT 0 CHECK (maintenance_cost >= 0),
  ADD COLUMN required_progression_code text,
  ADD COLUMN sale_ends_at timestamptz;

UPDATE public.shop_catalog SET maintenance_cost = CASE code
  WHEN 'used_bicycle' THEN 100 WHEN 'scooter' THEN 300 WHEN 'cargo_van' THEN 900
  WHEN 'personal_storage' THEN 400 WHEN 'workshop_lease' THEN 700
  WHEN 'office_lease' THEN 1500 ELSE maintenance_cost END;

CREATE TABLE public.shop_maintenance_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  catalog_id uuid NOT NULL REFERENCES public.shop_catalog(id),
  maintenance_week date NOT NULL,
  amount bigint NOT NULL CHECK (amount > 0),
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  UNIQUE (user_id, catalog_id, maintenance_week)
);

REVOKE ALL PRIVILEGES ON TABLE public.shop_catalog, public.shop_inventory,
  public.shop_purchases, public.user_items, public.item_effect_receipts,
  public.shop_maintenance_receipts FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.shop_catalog_list(p_actor uuid)
RETURNS TABLE(catalog_id uuid, code text, name text, description text, category text,
  price bigint, quantity integer, purchase_limit text, effect_kind public.shop_effect_kind,
  maintenance_cost bigint, sale_ends_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT c.id, c.code, c.name, c.description, c.category, c.base_price, i.quantity,
         c.purchase_limit, c.effect_kind, c.maintenance_cost, c.sale_ends_at
  FROM public.shop_catalog c JOIN public.shop_inventory i ON i.catalog_id = c.id
  WHERE c.active AND (i.starts_at IS NULL OR i.starts_at <= clock_timestamp())
    AND (i.ends_at IS NULL OR i.ends_at > clock_timestamp())
  ORDER BY c.category, c.base_price, c.code
$$;

CREATE OR REPLACE FUNCTION public.shop_my_items(p_actor uuid)
RETURNS TABLE(catalog_id uuid, code text, name text, quantity integer, acquired_at timestamptz,
  expires_at timestamptz, effect_kind public.shop_effect_kind)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT i.catalog_id, c.code, c.name, i.quantity, i.acquired_at, i.expires_at, c.effect_kind
  FROM public.user_items i JOIN public.shop_catalog c ON c.id = i.catalog_id
  WHERE i.user_id = p_actor AND i.quantity > 0
  ORDER BY i.acquired_at DESC, i.catalog_id
$$;

ALTER FUNCTION public.shop_catalog_list(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_my_items(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_catalog_list(uuid), public.shop_my_items(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_catalog_list(uuid), public.shop_my_items(uuid)
  TO moneyverse_app;

COMMIT;
