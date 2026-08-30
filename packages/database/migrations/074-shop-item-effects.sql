-- Consuming an item.
--
-- Every relation is aliased and every column qualified. `catalog_id`,
-- `remaining_quantity` and `expires_at` are OUT parameters as well as column
-- names, and plpgsql defaults to variable_conflict = error -- an earlier
-- revision referenced three of them unqualified and raised 42702 on every
-- call, so no item could ever be consumed.

BEGIN;

CREATE OR REPLACE FUNCTION public.shop_use_item(
  p_key uuid,
  p_actor uuid,
  p_catalog uuid
)
RETURNS TABLE(
  catalog_id uuid,
  remaining_quantity integer,
  expires_at timestamptz,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_quantity integer;
  v_kind public.shop_effect_kind;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid item use';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:shop-use:' || p_key::text, 0)
  );

  SELECT receipt_row.user_id, receipt_row.catalog_id, receipt_row.expires_at
  INTO v_owner, catalog_id, expires_at
  FROM public.item_effect_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'item effect belongs to another user';
    END IF;

    -- The catalogue entry the receipt names, not the one the caller repeated.
    SELECT item_row.quantity INTO remaining_quantity
    FROM public.user_items AS item_row
    WHERE item_row.user_id = p_actor AND item_row.catalog_id = catalog_id;

    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT item_row.quantity, catalog_row.effect_kind
  INTO v_quantity, v_kind
  FROM public.user_items AS item_row
  JOIN public.shop_catalog AS catalog_row ON catalog_row.id = item_row.catalog_id
  WHERE item_row.user_id = p_actor AND item_row.catalog_id = p_catalog
  FOR UPDATE OF item_row;

  IF v_quantity IS NULL OR v_quantity < 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'item is not owned';
  END IF;

  IF v_kind <> 'convenience' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'item cannot be consumed';
  END IF;

  UPDATE public.user_items AS item_row
  SET quantity = item_row.quantity - 1
  WHERE item_row.user_id = p_actor AND item_row.catalog_id = p_catalog
  RETURNING item_row.quantity INTO remaining_quantity;

  INSERT INTO public.item_effect_receipts (user_id, catalog_id, idempotency_key)
  VALUES (p_actor, p_catalog, p_key);

  catalog_id := p_catalog;
  expires_at := NULL;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.shop_use_item(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_use_item(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_use_item(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
