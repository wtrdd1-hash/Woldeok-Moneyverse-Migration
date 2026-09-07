BEGIN;

-- Admin Control Center monetary values used to be JSON numbers. PostgreSQL
-- preserved them exactly, but node-postgres JSON.parse rounded values above
-- 2^53 before the UI ever saw them. Actor-scope the macro read and serialize
-- every WLD/bigint value as a canonical decimal string.
CREATE OR REPLACE FUNCTION public.admin_get_macro_economy_v2(p_actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_policy record;
  v_m2_supply bigint := 0;
  v_cash_total bigint := 0;
  v_bank_total bigint := 0;
  v_faucet_today bigint := 0;
  v_sink_today bigint := 0;
  v_jobs_stat jsonb;
  v_businesses_stat jsonb;
  v_bonds_stat jsonb;
  v_loans_stat jsonb;
  v_recent_inflation_ratio numeric := 1.0;
  v_inflation_alert boolean := false;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  -- 1. Read Policy
  SELECT * INTO v_policy FROM public.admin_economy_policy_v2 WHERE id = 1;

  -- 2. M2 Supply (Cash + Bank balances of users)
  SELECT
    COALESCE(SUM(CASE WHEN a.account_type = 'USER_CASH' THEN ab.available_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN a.account_type = 'USER_BANK' THEN ab.available_amount ELSE 0 END), 0)
  INTO v_cash_total, v_bank_total
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.status = 'active';

  v_m2_supply := v_cash_total + v_bank_total;

  -- 3. Faucet vs Sink today
  -- Faucet: Mint credit (SYSTEM_MINT -> user cash/bank)
  SELECT COALESCE(SUM(p.amount), 0) INTO v_faucet_today
  FROM public.ledger_postings p
  JOIN public.accounts a ON a.id = p.account_id
  WHERE a.system_key = 'mint'
    AND p.direction = 'credit'
    AND p.created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Seoul');

  -- Sink: Sink debit (user cash -> SYSTEM_SINK)
  SELECT COALESCE(SUM(p.amount), 0) INTO v_sink_today
  FROM public.ledger_postings p
  JOIN public.accounts a ON a.id = p.account_id
  WHERE a.system_key = 'sink'
    AND p.direction = 'debit'
    AND p.created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Seoul');

  IF v_sink_today > 0 THEN
    v_recent_inflation_ratio := ROUND((v_faucet_today::numeric / v_sink_today::numeric), 2);
  ELSE
    v_recent_inflation_ratio := CASE WHEN v_faucet_today > 0 THEN 2.0 ELSE 1.0 END;
  END IF;

  IF v_recent_inflation_ratio >= v_policy.inflation_threshold_ratio THEN
    v_inflation_alert := true;
  END IF;

  -- 4. Jobs Stats (Distribution across 8 career jobs)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'job_type', j.job_type,
    'user_count', j.cnt,
    'avg_level', ROUND(j.avg_lvl, 1)
  )), '[]'::jsonb) INTO v_jobs_stat
  FROM (
    SELECT job_type, COUNT(*) as cnt, AVG(level) as avg_lvl
    FROM public.user_job_progress
    WHERE is_active = true
    GROUP BY job_type
    ORDER BY cnt DESC
  ) j;

  -- 5. Businesses Stats
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'symbol', b.symbol,
    'name', b.name,
    'total_owners', b.cnt,
    'boosted_count', b.boosted
  )), '[]'::jsonb) INTO v_businesses_stat
  FROM (
    SELECT bt.symbol, bt.name, COUNT(*) as cnt,
           COUNT(CASE WHEN bo.boost_active IS NOT NULL AND bo.boost_active <> '{}'::jsonb AND (bo.boost_active->>'expires_at')::timestamptz > clock_timestamp() THEN 1 END) as boosted
    FROM public.virtual_business_ownerships bo
    JOIN public.virtual_business_types bt ON bt.id = bo.business_type_id
    WHERE bo.status = 'active'
    GROUP BY bt.symbol, bt.name
  ) b;

  -- 6. Bonds Stats
  SELECT jsonb_build_object(
    'holding_count', COUNT(CASE WHEN status = 'holding' THEN 1 END),
    'holding_principal', COALESCE(SUM(CASE WHEN status = 'holding' THEN principal_amount ELSE 0 END), 0)::text,
    'redeemed_count', COUNT(CASE WHEN status = 'redeemed' THEN 1 END),
    'redeemed_amount', COALESCE(SUM(CASE WHEN status = 'redeemed' THEN maturity_amount ELSE 0 END), 0)::text
  ) INTO v_bonds_stat
  FROM public.virtual_bank_bonds;

  -- 7. Loans Stats
  SELECT jsonb_build_object(
    'active_count', COUNT(CASE WHEN status = 'active' THEN 1 END),
    'active_outstanding', COALESCE(SUM(CASE WHEN status = 'active' THEN outstanding_amount ELSE 0 END), 0)::text,
    'repaid_count', COUNT(CASE WHEN status = 'repaid' THEN 1 END)
  ) INTO v_loans_stat
  FROM public.virtual_bank_loans;

  RETURN jsonb_build_object(
    'policy', to_jsonb(v_policy),
    'm2_supply', v_m2_supply::text,
    'cash_total', v_cash_total::text,
    'bank_total', v_bank_total::text,
    'faucet_today', v_faucet_today::text,
    'sink_today', v_sink_today::text,
    'net_flow_today', (v_faucet_today - v_sink_today)::text,
    'inflation_ratio', v_recent_inflation_ratio,
    'inflation_alert', v_inflation_alert,
    'jobs_stats', v_jobs_stat,
    'businesses_stats', v_businesses_stat,
    'bonds_stats', v_bonds_stat,
    'loans_stats', v_loans_stat
  );
END;
$function$;

ALTER FUNCTION public.admin_get_macro_economy_v2(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_get_macro_economy_v2(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_get_macro_economy_v2(uuid) TO moneyverse_app;

-- The unscoped legacy overload is no longer an application API. Keeping it
-- owner-only avoids breaking migration history while closing the bypass.
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_get_macro_economy_v2() FROM PUBLIC, moneyverse_app;

-- Keep the existing actor-scoped inspector shape, but make every bigint in
-- the JSON payload text so inspection and full-balance revocation stay exact.
CREATE OR REPLACE FUNCTION public.admin_inspect_user_assets_v2(p_actor uuid, p_target_user uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_user record;
  v_cash bigint := 0;
  v_bank bigint := 0;
  v_tracker record;
  v_jobs jsonb;
  v_businesses jsonb;
  v_loan record;
  v_bonds jsonb;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);

  SELECT u.id, COALESCE(mp.display_name, u.id::text) as display_name, u.created_at, u.status INTO v_user
  FROM public.users u
  LEFT JOIN public.member_profiles mp ON mp.user_id = u.id
  WHERE u.id = p_target_user;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'user not found';
  END IF;

  SELECT COALESCE(ab.available_amount, 0) INTO v_cash
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_target_user AND a.account_type = 'USER_CASH';

  SELECT COALESCE(ab.available_amount, 0) INTO v_bank
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_target_user AND a.account_type = 'USER_BANK';

  SELECT * INTO v_tracker FROM public.virtual_bank_deposit_trackers WHERE user_id = p_target_user;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'job_type', jp.job_type,
    'level', jp.level,
    'experience', jp.experience::text,
    'is_active', jp.is_active
  )), '[]'::jsonb) INTO v_jobs
  FROM public.user_job_progress jp
  WHERE jp.user_id = p_target_user;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', bo.id,
    'symbol', bt.symbol,
    'name', bt.name,
    'boost_active', bo.boost_active,
    'status', bo.status
  )), '[]'::jsonb) INTO v_businesses
  FROM public.virtual_business_ownerships bo
  JOIN public.virtual_business_types bt ON bt.id = bo.business_type_id
  WHERE bo.user_id = p_target_user;

  SELECT id, principal_amount, interest_amount, outstanding_amount, issued_at, status
  INTO v_loan
  FROM public.virtual_bank_loans
  WHERE user_id = p_target_user AND status = 'active'
  LIMIT 1;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'bond_code', b.bond_code,
    'bond_name', b.bond_name,
    'principal_amount', b.principal_amount::text,
    'maturity_amount', b.maturity_amount::text,
    'maturity_at', b.maturity_at,
    'status', b.status
  )), '[]'::jsonb) INTO v_bonds
  FROM public.virtual_bank_bonds b
  WHERE b.user_id = p_target_user;

  RETURN jsonb_build_object(
    'user_id', v_user.id,
    'display_name', v_user.display_name,
    'created_at', v_user.created_at,
    'status', v_user.status,
    'cash_balance', COALESCE(v_cash, 0)::text,
    'bank_balance', COALESCE(v_bank, 0)::text,
    'total_interest_claimed', COALESCE(v_tracker.total_interest_claimed, 0)::text,
    'jobs', v_jobs,
    'businesses', v_businesses,
    'active_loan', CASE WHEN v_loan.id IS NOT NULL THEN jsonb_build_object(
      'loan_id', v_loan.id,
      'principal', v_loan.principal_amount::text,
      'outstanding', v_loan.outstanding_amount::text,
      'issued_at', v_loan.issued_at
    ) ELSE NULL END,
    'bonds', v_bonds
  );
END;
$function$;

ALTER FUNCTION public.admin_inspect_user_assets_v2(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_inspect_user_assets_v2(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_inspect_user_assets_v2(uuid, uuid) TO moneyverse_app;

COMMIT;
