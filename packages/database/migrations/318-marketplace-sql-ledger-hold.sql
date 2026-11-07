-- P0 #2191: migration 232 marketplace settlement writes account_balances
-- directly without an atomic double-entry ledger transaction. NestJS service
-- holds do not protect direct SQL/function invocations. This forward migration
-- disables all three monetary function bodies, including owner invocation.
-- Do not alter applied 232 or historical ledger/balance rows. A future
-- ledger-backed, idempotent implementation requires a separate migration.
BEGIN;

CREATE OR REPLACE FUNCTION public.marketplace_create_listing(
  p_actor uuid, p_item_code text, p_quantity integer, p_price_wld text,
  p_idempotency_key text, p_description text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $hold$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'marketplace listing ledger settlement unavailable';
END;
$hold$;

CREATE OR REPLACE FUNCTION public.marketplace_buy_listing(
  p_actor uuid, p_listing_id uuid, p_idempotency_key text
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $hold$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'marketplace purchase ledger settlement unavailable';
END;
$hold$;

CREATE OR REPLACE FUNCTION public.marketplace_bid_auction(
  p_actor uuid, p_actor_name text, p_auction_id uuid, p_bid_wld text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $hold$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'marketplace bid ledger settlement unavailable';
END;
$hold$;

REVOKE EXECUTE ON FUNCTION public.marketplace_create_listing(uuid, text, integer, text, text, text) FROM PUBLIC, moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.marketplace_buy_listing(uuid, uuid, text) FROM PUBLIC, moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.marketplace_bid_auction(uuid, text, uuid, text) FROM PUBLIC, moneyverse_app;

-- Production's historical app-role grants permit direct balance and ledger
-- mutation even after disabling marketplace functions. Retain SELECT rights
-- and the migrator-owned SECURITY DEFINER settlement functions; remove direct
-- app DML, TRUNCATE, REFERENCES and TRIGGER (including PUBLIC grants) at the monetary boundary.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.account_balances FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.accounts FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.ledger_transactions FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.ledger_postings FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.outbox_events FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.audit_logs FROM PUBLIC, moneyverse_app;

COMMIT;
