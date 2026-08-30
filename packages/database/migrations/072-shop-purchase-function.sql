-- Buying from the catalogue.
--
-- Follows the idempotency template from 045: validate, lock on the key, look
-- for a receipt, refuse one that belongs to somebody else with 28000, then do
-- the work. Cash is credited and the sink debited, which in this schema moves
-- value away from the member (init/001 line 37 adds a debit, subtracts a
-- credit).

BEGIN;

-- How often an item may be bought.
--
-- Only the self-contained codes are enforced here. `level_5`, `stage_based`,
-- `business_owned`, `state_based` and `timed` all depend on progression and
-- business state that the progression stack owns; they are accepted and NOT
-- enforced yet, which is recorded here rather than left for a reader to
-- discover. The vocabulary CHECK in 071 is what stops a typo from joining
-- that list by accident.
CREATE OR REPLACE FUNCTION public.shop_assert_purchase_limit(
  p_actor uuid,
  p_catalog uuid,
  p_limit text,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_allowed integer;
  v_taken integer;
  v_since timestamptz;
BEGIN
  IF p_limit IN ('once', 'account_one', 'permanent') THEN
    SELECT coalesce(sum(purchase_row.quantity), 0) INTO v_taken
    FROM public.shop_purchases AS purchase_row
    WHERE purchase_row.user_id = p_actor AND purchase_row.catalog_id = p_catalog;

    IF v_taken + p_quantity > 1 THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this item may be held once';
    END IF;
    RETURN;
  END IF;

  IF p_limit ~ '^daily_[0-9]{1,2}$' THEN
    v_allowed := pg_catalog.substr(p_limit, 7)::integer;
    v_since := date_trunc('day', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')
      AT TIME ZONE 'Asia/Seoul';
  ELSIF p_limit ~ '^weekly_[0-9]{1,2}$' THEN
    v_allowed := pg_catalog.substr(p_limit, 8)::integer;
    v_since := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')
      AT TIME ZONE 'Asia/Seoul';
  ELSE
    RETURN;
  END IF;

  SELECT coalesce(sum(purchase_row.quantity), 0) INTO v_taken
  FROM public.shop_purchases AS purchase_row
  WHERE purchase_row.user_id = p_actor
    AND purchase_row.catalog_id = p_catalog
    AND purchase_row.purchased_at >= v_since;

  IF v_taken + p_quantity > v_allowed THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'the purchase limit for this item is reached';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.shop_purchase_catalog(
  p_key uuid,
  p_actor uuid,
  p_catalog uuid,
  p_quantity integer
)
RETURNS TABLE(purchase_id uuid, amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_price bigint;
  v_stock integer;
  v_limit text;
  v_cash uuid;
  v_sink uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL
    OR p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid shop purchase';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:shop-catalog-purchase:' || p_key::text, 0)
  );

  -- Aliased and qualified. `transaction_id` is an OUT parameter as well as a
  -- column of this table, and plpgsql defaults to variable_conflict = error:
  -- unqualified, this raised 42702 on every call, first purchase included.
  -- The amount comes from the stored row too -- computing it from the
  -- caller's p_quantity meant a replay could report a price never charged.
  SELECT purchase_row.id, purchase_row.user_id,
         purchase_row.unit_price * purchase_row.quantity, purchase_row.transaction_id
  INTO purchase_id, v_owner, amount, transaction_id
  FROM public.shop_purchases AS purchase_row
  WHERE purchase_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'shop receipt belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  SELECT catalog_row.base_price, inventory_row.quantity, catalog_row.purchase_limit
  INTO v_price, v_stock, v_limit
  FROM public.shop_catalog AS catalog_row
  JOIN public.shop_inventory AS inventory_row ON inventory_row.catalog_id = catalog_row.id
  WHERE catalog_row.id = p_catalog
    AND catalog_row.active
    AND (inventory_row.starts_at IS NULL OR inventory_row.starts_at <= pg_catalog.clock_timestamp())
    AND (inventory_row.ends_at IS NULL OR inventory_row.ends_at > pg_catalog.clock_timestamp())
  FOR UPDATE OF catalog_row, inventory_row;

  IF v_price IS NULL OR (v_stock IS NOT NULL AND v_stock < p_quantity) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop item is unavailable';
  END IF;

  PERFORM public.shop_assert_purchase_limit(p_actor, p_catalog, v_limit, p_quantity);

  SELECT account_row.id INTO v_cash
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_sink
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active shop accounts required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key,
    'SHOP_CATALOG_PURCHASE',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_price * p_quantity, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_sink, 'amount', v_price * p_quantity, 'direction', 'debit')
    ),
    'shop.catalog.purchased',
    pg_catalog.jsonb_build_object('catalogId', p_catalog, 'quantity', p_quantity)
  ) INTO transaction_id;

  INSERT INTO public.shop_purchases (
    idempotency_key, user_id, catalog_id, quantity, unit_price, transaction_id
  ) VALUES (p_key, p_actor, p_catalog, p_quantity, v_price, transaction_id)
  RETURNING shop_purchases.id INTO purchase_id;

  IF v_stock IS NOT NULL THEN
    UPDATE public.shop_inventory AS inventory_row
    SET quantity = inventory_row.quantity - p_quantity
    WHERE inventory_row.catalog_id = p_catalog;
  END IF;

  INSERT INTO public.user_items (user_id, catalog_id, quantity)
  VALUES (p_actor, p_catalog, p_quantity)
  ON CONFLICT (user_id, catalog_id) DO UPDATE
  SET quantity = user_items.quantity + excluded.quantity;

  amount := v_price * p_quantity;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.shop_assert_purchase_limit(uuid, uuid, text, integer)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.shop_assert_purchase_limit(uuid, uuid, text, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer) TO moneyverse_app;

COMMIT;
