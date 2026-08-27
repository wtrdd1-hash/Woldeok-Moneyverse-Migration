-- Shop data is read and changed only through the narrow commands below. The
-- web process uses one shared database role, so direct table access would let
-- a request choose a price, forge a receipt, or inspect another user's order
-- history.
BEGIN;

-- Preserve the amount paid at the time of purchase.  `shop_items.price` is a
-- mutable catalogue value and must never be used to reinterpret an old
-- receipt.  Existing prototype rows remain readable to a future migration;
-- only receipts made through shop_purchase receive an idempotency key.
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS request_hash bytea,
  ADD COLUMN IF NOT EXISTS paid_amount bigint;

CREATE UNIQUE INDEX IF NOT EXISTS purchases_idempotency_key_key
  ON public.purchases (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.purchases'::regclass
      AND conname = 'purchases_paid_amount_positive'
  ) THEN
    ALTER TABLE public.purchases
      ADD CONSTRAINT purchases_paid_amount_positive
      CHECK (paid_amount IS NULL OR paid_amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.purchases'::regclass
      AND conname = 'purchases_idempotent_receipt_complete'
  ) THEN
    ALTER TABLE public.purchases
      ADD CONSTRAINT purchases_idempotent_receipt_complete
      CHECK (
        idempotency_key IS NULL
        OR (
          request_hash IS NOT NULL
          AND octet_length(request_hash) = 32
          AND paid_amount IS NOT NULL
          AND paid_amount > 0
        )
      );
  END IF;
END;
$do$;

-- Remove the broad prototype grants.  Catalog reads and user purchase history
-- now have to pass through the SECURITY DEFINER read models, and all writes
-- through shop_purchase.
REVOKE ALL PRIVILEGES ON TABLE public.shop_items, public.purchases
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.shop_list_active_items(
  p_limit integer DEFAULT 60
)
RETURNS TABLE(
  item_id uuid,
  name text,
  description text,
  price bigint,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'catalog limit must be between 1 and 100';
  END IF;

  RETURN QUERY
  SELECT
    item_row.id,
    item_row.name,
    item_row.description,
    item_row.price,
    item_row.created_at
  FROM public.shop_items AS item_row
  WHERE item_row.active
    AND item_row.price > 0
  ORDER BY item_row.created_at DESC, item_row.id DESC
  LIMIT p_limit;
END;
$$;

-- The only purchase-history query available to the application role. The
-- caller receives rows for exactly the user ID supplied by the authenticated
-- session boundary; inactive accounts yield no rows rather than becoming a
-- profile-discovery endpoint.
CREATE OR REPLACE FUNCTION public.shop_list_my_purchases(
  p_user_id uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  purchase_id uuid,
  item_id uuid,
  item_name text,
  transaction_id uuid,
  paid_amount bigint,
  purchased_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'valid user and limit are required';
  END IF;

  RETURN QUERY
  SELECT
    purchase_row.id,
    purchase_row.item_id,
    item_row.name,
    purchase_row.transaction_id,
    purchase_row.paid_amount,
    purchase_row.created_at
  FROM public.purchases AS purchase_row
  JOIN public.shop_items AS item_row ON item_row.id = purchase_row.item_id
  JOIN public.users AS user_row ON user_row.id = purchase_row.user_id
  WHERE purchase_row.user_id = p_user_id
    AND user_row.status = 'active'::public.user_status
  ORDER BY purchase_row.created_at DESC, purchase_row.id DESC
  LIMIT p_limit;
END;
$$;

-- Purchases deliberately receive no client-controlled amount or source
-- account.  The database reads the active item's current positive price,
-- debits the actor's cash wallet, credits the system sink, records a ledger
-- receipt, and creates the purchase receipt in one transaction.
CREATE OR REPLACE FUNCTION public.shop_purchase(
  p_idempotency_key uuid,
  p_actor_user_id uuid,
  p_item_id uuid
)
RETURNS TABLE(
  purchase_id uuid,
  transaction_id uuid,
  amount bigint,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_request_hash bytea;
  v_existing_purchase_id uuid;
  v_existing_user_id uuid;
  v_existing_item_id uuid;
  v_existing_transaction_id uuid;
  v_existing_amount bigint;
  v_existing_hash bytea;
  v_price bigint;
  v_cash_account_id uuid;
  v_sink_account_id uuid;
  v_transaction_id uuid;
  v_purchase_id uuid;
BEGIN
  IF p_idempotency_key IS NULL OR p_actor_user_id IS NULL OR p_item_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'purchase identity is required';
  END IF;

  -- The hash identifies a requested item and actor, not its mutable price.
  -- A lost response can therefore be replayed even after catalog changes,
  -- while reusing a key for another actor or item fails closed.
  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'actorUserId', p_actor_user_id::text,
      'itemId', p_item_id::text
    )::text,
    'sha256'
  );

  SELECT
    purchase_row.id,
    purchase_row.user_id,
    purchase_row.item_id,
    purchase_row.transaction_id,
    purchase_row.paid_amount,
    purchase_row.request_hash
  INTO
    v_existing_purchase_id,
    v_existing_user_id,
    v_existing_item_id,
    v_existing_transaction_id,
    v_existing_amount,
    v_existing_hash
  FROM public.purchases AS purchase_row
  WHERE purchase_row.idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor_user_id
      OR v_existing_item_id IS DISTINCT FROM p_item_id
      OR v_existing_hash IS DISTINCT FROM v_request_hash
      OR v_existing_amount IS NULL
      OR v_existing_amount <= 0 THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different purchase';
    END IF;

    RETURN QUERY SELECT
      v_existing_purchase_id,
      v_existing_transaction_id,
      v_existing_amount,
      true;
    RETURN;
  END IF;

  -- FOR SHARE prevents a concurrent catalog update from changing the price
  -- or active flag after we read it but before the ledger receipt is made.
  SELECT item_row.price
  INTO v_price
  FROM public.shop_items AS item_row
  WHERE item_row.id = p_item_id
    AND item_row.active
    AND item_row.price > 0
  FOR SHARE;

  IF v_price IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active shop item required';
  END IF;

  -- Lock the active actor and account rows before composing the fixed
  -- postings. economy_post_transaction revalidates active account status and
  -- balance while taking its own deterministic account locks.
  SELECT account_row.id
  INTO v_cash_account_id
  FROM public.accounts AS account_row
  JOIN public.users AS user_row ON user_row.id = account_row.owner_user_id
  WHERE account_row.owner_user_id = p_actor_user_id
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
    AND user_row.status = 'active'::public.user_status
  FOR UPDATE OF account_row, user_row;

  SELECT account_row.id
  INTO v_sink_account_id
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash_account_id IS NULL OR v_sink_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  -- Only this SECURITY DEFINER function can choose the shopping posting
  -- shape. The app role has no EXECUTE privilege on economy_post_transaction.
  SELECT public.economy_post_transaction(
    p_idempotency_key,
    'SHOP_PURCHASE',
    p_actor_user_id,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'accountId', v_cash_account_id,
        'amount', v_price,
        'direction', 'credit'
      ),
      pg_catalog.jsonb_build_object(
        'accountId', v_sink_account_id,
        'amount', v_price,
        'direction', 'debit'
      )
    ),
    'shop.purchase.completed',
    pg_catalog.jsonb_build_object(
      'userId', p_actor_user_id,
      'itemId', p_item_id,
      'amount', v_price
    )
  ) INTO v_transaction_id;

  -- The partial unique index waits for a simultaneous request with the same
  -- key. Re-read and validate the resulting receipt so concurrent identical
  -- retries return one result rather than a uniqueness error.
  INSERT INTO public.purchases (
    user_id,
    item_id,
    transaction_id,
    idempotency_key,
    request_hash,
    paid_amount
  ) VALUES (
    p_actor_user_id,
    p_item_id,
    v_transaction_id,
    p_idempotency_key,
    v_request_hash,
    v_price
  )
  ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  RETURNING id INTO v_purchase_id;

  IF v_purchase_id IS NULL THEN
    SELECT
      purchase_row.id,
      purchase_row.user_id,
      purchase_row.item_id,
      purchase_row.transaction_id,
      purchase_row.paid_amount,
      purchase_row.request_hash
    INTO
      v_existing_purchase_id,
      v_existing_user_id,
      v_existing_item_id,
      v_existing_transaction_id,
      v_existing_amount,
      v_existing_hash
    FROM public.purchases AS purchase_row
    WHERE purchase_row.idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF NOT FOUND
      OR v_existing_user_id IS DISTINCT FROM p_actor_user_id
      OR v_existing_item_id IS DISTINCT FROM p_item_id
      OR v_existing_hash IS DISTINCT FROM v_request_hash
      OR v_existing_transaction_id IS DISTINCT FROM v_transaction_id
      OR v_existing_amount IS NULL
      OR v_existing_amount <= 0 THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different purchase';
    END IF;

    RETURN QUERY SELECT
      v_existing_purchase_id,
      v_existing_transaction_id,
      v_existing_amount,
      true;
    RETURN;
  END IF;

  RETURN QUERY SELECT v_purchase_id, v_transaction_id, v_price, false;
END;
$$;

ALTER FUNCTION public.shop_list_active_items(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_list_my_purchases(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_purchase(uuid, uuid, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.shop_list_active_items(integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_list_my_purchases(uuid, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_purchase(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.shop_list_active_items(integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_list_my_purchases(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_purchase(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
