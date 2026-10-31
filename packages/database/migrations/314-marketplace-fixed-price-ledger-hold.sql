-- P0 financial integrity: migration 232's fixed-price listing fee and purchase
-- paths wrote account_balances without economy ledger postings. Preserve the
-- signatures and replace the bodies with fail-closed guards until a separately
-- reviewed idempotent double-entry settlement is available. Never edit 232.
BEGIN;

CREATE OR REPLACE FUNCTION public.marketplace_create_listing(
  p_actor uuid, p_item_code text, p_quantity integer, p_price_wld text,
  p_idempotency_key text, p_description text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'marketplace listing unavailable pending ledger-backed settlement';
END;
$function$;

CREATE OR REPLACE FUNCTION public.marketplace_buy_listing(
  p_actor uuid, p_listing_id uuid, p_idempotency_key text
)
RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'marketplace purchase unavailable pending ledger-backed settlement';
END;
$function$;

-- In addition to the safe bodies, remove direct application/public invocation.
-- Future re-enablement must use a new reviewed migration, not an ad hoc grant.
REVOKE ALL ON FUNCTION public.marketplace_create_listing(uuid,text,integer,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.marketplace_create_listing(uuid,text,integer,text,text,text) FROM moneyverse_app;
REVOKE ALL ON FUNCTION public.marketplace_buy_listing(uuid,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.marketplace_buy_listing(uuid,uuid,text) FROM moneyverse_app;

COMMIT;
