-- v2026.10.15.683 Treasury: controlled fiscal evidence only. No WLD settlement enabled.
BEGIN;

CREATE OR REPLACE FUNCTION public.treasury_admin_reconciliation(p_actor uuid)
RETURNS TABLE (
  total_vaults_balance_wld text,
  total_ledger_net_flow_wld text,
  discrepancy_amount_wld text,
  journal_integrity_issues integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='treasury operator permission required';
  END IF;

  RETURN QUERY
  WITH ordered_journal AS (
    SELECT
      l.vault_id,
      l.amount_wld::numeric AS recorded_amount,
      l.balance_before::numeric AS balance_before,
      l.balance_after::numeric AS balance_after,
      lag(l.balance_after::numeric) OVER (
        PARTITION BY l.vault_id ORDER BY l.created_at, l.id
      ) AS previous_balance_after
    FROM public.system_treasury_ledger l
  ),
  fiscal_journal AS (
    SELECT
      vault_id,
      count(*) AS entry_count,
      coalesce(sum(balance_after - balance_before), 0) AS net_flow,
      count(*) FILTER (
        WHERE (previous_balance_after IS NOT NULL AND previous_balance_after <> balance_before)
           OR abs(balance_after - balance_before) <> recorded_amount
      ) AS integrity_issues
    FROM ordered_journal
    GROUP BY vault_id
  )
  SELECT
    coalesce(sum(v.balance_wld::numeric), 0)::text,
    coalesce(sum(coalesce(j.net_flow, 0)), 0)::text,
    coalesce(sum(abs(v.balance_wld::numeric - coalesce(j.net_flow, 0))), 0)::text,
    coalesce(sum(
      coalesce(j.integrity_issues, 0)
      + CASE WHEN j.entry_count IS NULL AND v.balance_wld::numeric <> 0 THEN 1 ELSE 0 END
    ), 0)::integer
  FROM public.system_treasury_vaults v
  LEFT JOIN fiscal_journal j ON j.vault_id=v.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.treasury_admin_reconciliation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.treasury_admin_reconciliation(uuid) FROM moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_admin_reconciliation(uuid) TO moneyverse_app;

-- Both historical donation functions bypass canonical idempotent settlement,
-- and 269's ledger_transactions.tx_type / ledger_postings.balance_after columns
-- do not exist. Never return a false successful money receipt.
CREATE OR REPLACE FUNCTION public.treasury_user_donate(p_user_id uuid, p_amount_wld text, p_memo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000',
    MESSAGE='Treasury donation paused until idempotent Economy Core settlement is verified';
END;
$function$;

CREATE OR REPLACE FUNCTION public.treasury_deposit_donation(p_user_id uuid, p_amount_wld bigint, p_message text DEFAULT NULL, p_is_anonymous boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000',
    MESSAGE='Treasury donation paused until idempotent Economy Core settlement is verified';
END;
$function$;

REVOKE ALL ON FUNCTION public.treasury_user_donate(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.treasury_deposit_donation(uuid, bigint, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_user_donate(uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_deposit_donation(uuid, bigint, text, boolean) TO moneyverse_app;

COMMIT;
