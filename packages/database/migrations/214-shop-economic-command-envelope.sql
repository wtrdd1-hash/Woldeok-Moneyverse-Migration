-- 214-shop-economic-command-envelope.sql
-- Update version: v2026.09.19.280
-- P0 ECON-233-02: adopt the common economic command envelope for catalogue purchases.
-- The existing inventory, purchase-limit, pricing and ledger policy remains authoritative in a private delegate.

BEGIN;

ALTER FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
  RENAME TO shop_purchase_catalog_policy_v213;

REVOKE ALL ON FUNCTION public.shop_purchase_catalog_policy_v213(uuid, uuid, uuid, integer)
FROM PUBLIC, moneyverse_app;

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
  v_command uuid;
  v_replayed boolean;
  v_command_tx uuid;
  v_result jsonb;
  v_purchase uuid;
  v_amount bigint;
  v_tx uuid;
  v_policy_replayed boolean;
  v_hash bytea;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL OR p_quantity IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop command identity is required';
  END IF;

  v_hash := public.digest(
    pg_catalog.convert_to(p_catalog::text || ':' || p_quantity::text, 'UTF8'),
    'sha256'
  );

  SELECT c.command_id, c.replayed, c.ledger_transaction_id, c.result_snapshot
    INTO v_command, v_replayed, v_command_tx, v_result
  FROM public.economic_command_claim(
    p_actor,
    'shop.catalog.purchase',
    p_catalog::text,
    p_key,
    v_hash,
    NULL
  ) AS c;

  IF v_replayed THEN
    IF v_result IS NULL
       OR v_result->>'purchaseId' IS NULL
       OR v_result->>'amount' IS NULL
       OR v_command_tx IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'shop economic command snapshot is incomplete';
    END IF;

    RETURN QUERY SELECT
      (v_result->>'purchaseId')::uuid,
      (v_result->>'amount')::bigint,
      v_command_tx,
      true;
    RETURN;
  END IF;

  SELECT p.purchase_id, p.amount, p.transaction_id, p.replayed
    INTO v_purchase, v_amount, v_tx, v_policy_replayed
  FROM public.shop_purchase_catalog_policy_v213(p_key, p_actor, p_catalog, p_quantity) AS p;

  IF v_purchase IS NULL OR v_amount IS NULL OR v_tx IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'shop purchase policy returned an incomplete result';
  END IF;

  v_result := pg_catalog.jsonb_build_object(
    'purchaseId', v_purchase,
    'amount', v_amount,
    'catalogId', p_catalog,
    'quantity', p_quantity
  );
  PERFORM public.economic_command_complete(v_command, v_tx, v_result);

  RETURN QUERY SELECT v_purchase, v_amount, v_tx, v_policy_replayed;
END;
$$;

ALTER FUNCTION public.shop_purchase_catalog_policy_v213(uuid, uuid, uuid, integer)
OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
TO moneyverse_app;

COMMIT;
