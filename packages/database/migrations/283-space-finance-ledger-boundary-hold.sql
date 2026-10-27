-- 283-space-finance-ledger-boundary-hold.sql
-- P0 #1502: legacy 223/231 space purchase, project contributions and property
-- tax directly update account_balances without balanced ledger_postings.
-- Suspend SQL mutations (including SECURITY DEFINER owner invocations) until
-- atomic economy_post_transaction settlement and replay receipts are certified.
-- Forward-only: never rewrite applied migrations 223/231 or historical balances.
-- Depends on migration 282 (PR #1564); do not deploy out of sequence.
BEGIN;

CREATE OR REPLACE FUNCTION public.space_purchase(
  p_actor uuid, p_space_type text, p_name text, p_idempotency_key uuid
)
RETURNS TABLE(space_id uuid, space_type text, name text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'space purchase ledger settlement unavailable';
END;
$$;

CREATE OR REPLACE FUNCTION public.city_project_contribute(
  p_actor uuid, p_project_id uuid, p_amount numeric, p_idempotency_key uuid
)
RETURNS TABLE(contribution_id uuid, accepted_amount numeric, project_current_wld text, project_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'city project ledger settlement unavailable';
END;
$$;

CREATE OR REPLACE FUNCTION public.space_pay_property_tax(
  p_actor uuid, p_space_id uuid, p_days integer, p_idempotency_key uuid
)
RETURNS TABLE(receipt_id uuid, space_id uuid, days_paid integer, total_wld numeric, new_paid_until timestamptz, paid_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'space property tax ledger settlement unavailable';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.space_purchase(uuid, text, text, uuid) FROM PUBLIC, moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.city_project_contribute(uuid, uuid, numeric, uuid) FROM PUBLIC, moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.space_pay_property_tax(uuid, uuid, integer, uuid) FROM PUBLIC, moneyverse_app;

-- Legacy app DML grants permit bypass of the disabled SQL functions. Preserve
-- read access, but remove broad mutations; use an owner-scoped function for
-- the existing layout-only update flow.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_spaces FROM moneyverse_app;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.city_projects FROM moneyverse_app;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.city_project_contributions FROM moneyverse_app;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.space_property_tax_payments FROM moneyverse_app;

CREATE OR REPLACE FUNCTION public.space_update_layout(
  p_actor uuid, p_space_id uuid, p_layout jsonb
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_actor IS NULL OR p_space_id IS NULL OR p_layout IS NULL
    OR pg_catalog.jsonb_typeof(p_layout) <> 'object'
    OR pg_catalog.octet_length(p_layout::text) > 65536 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid space layout';
  END IF;

  UPDATE public.user_spaces
  SET layout = p_layout, updated_at = pg_catalog.clock_timestamp()
  WHERE id = p_space_id AND user_id = p_actor;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.space_update_layout(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.space_update_layout(uuid, uuid, jsonb) TO moneyverse_app;

COMMIT;
