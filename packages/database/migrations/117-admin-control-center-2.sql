-- Migration 117: Admin Control Center 2.0 (Macro Economy, Auto-Balancing, Master Killswitch, User Asset Overrides)

-- 1. Table: admin_economy_policy_v2
CREATE TABLE IF NOT EXISTS public.admin_economy_policy_v2 (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  master_killswitch_active boolean NOT NULL DEFAULT false,
  auto_balancing_active boolean NOT NULL DEFAULT true,
  banking_circuit_broken boolean NOT NULL DEFAULT false,
  businesses_circuit_broken boolean NOT NULL DEFAULT false,
  market_circuit_broken boolean NOT NULL DEFAULT false,
  daily_deposit_interest_bps integer NOT NULL DEFAULT 5 CHECK (daily_deposit_interest_bps >= 0 AND daily_deposit_interest_bps <= 500),
  bond_7d_yield_bps integer NOT NULL DEFAULT 300 CHECK (bond_7d_yield_bps >= 0 AND bond_7d_yield_bps <= 2000),
  bond_30d_yield_bps integer NOT NULL DEFAULT 1500 CHECK (bond_30d_yield_bps >= 0 AND bond_30d_yield_bps <= 5000),
  loan_daily_interest_bps integer NOT NULL DEFAULT 10 CHECK (loan_daily_interest_bps >= 0 AND loan_daily_interest_bps <= 200),
  inflation_threshold_ratio numeric NOT NULL DEFAULT 1.5 CHECK (inflation_threshold_ratio >= 1.0 AND inflation_threshold_ratio <= 10.0),
  last_auto_balanced_at timestamptz,
  auto_balance_log text,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.admin_economy_policy_v2 OWNER TO moneyverse_migrator;
GRANT SELECT, INSERT, UPDATE ON TABLE public.admin_economy_policy_v2 TO moneyverse_app;

INSERT INTO public.admin_economy_policy_v2 (
  id, master_killswitch_active, auto_balancing_active,
  banking_circuit_broken, businesses_circuit_broken, market_circuit_broken,
  daily_deposit_interest_bps, bond_7d_yield_bps, bond_30d_yield_bps, loan_daily_interest_bps
) VALUES (
  1, false, true, false, false, false, 5, 300, 1500, 10
) ON CONFLICT (id) DO NOTHING;

-- 2. Procedure: admin_get_macro_economy_v2
CREATE OR REPLACE FUNCTION public.admin_get_macro_economy_v2()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
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
    'holding_principal', COALESCE(SUM(CASE WHEN status = 'holding' THEN principal_amount ELSE 0 END), 0),
    'redeemed_count', COUNT(CASE WHEN status = 'redeemed' THEN 1 END),
    'redeemed_amount', COALESCE(SUM(CASE WHEN status = 'redeemed' THEN maturity_amount ELSE 0 END), 0)
  ) INTO v_bonds_stat
  FROM public.virtual_bank_bonds;

  -- 7. Loans Stats
  SELECT jsonb_build_object(
    'active_count', COUNT(CASE WHEN status = 'active' THEN 1 END),
    'active_outstanding', COALESCE(SUM(CASE WHEN status = 'active' THEN outstanding_amount ELSE 0 END), 0),
    'repaid_count', COUNT(CASE WHEN status = 'repaid' THEN 1 END)
  ) INTO v_loans_stat
  FROM public.virtual_bank_loans;

  RETURN jsonb_build_object(
    'policy', to_jsonb(v_policy),
    'm2_supply', v_m2_supply,
    'cash_total', v_cash_total,
    'bank_total', v_bank_total,
    'faucet_today', v_faucet_today,
    'sink_today', v_sink_today,
    'net_flow_today', (v_faucet_today - v_sink_today),
    'inflation_ratio', v_recent_inflation_ratio,
    'inflation_alert', v_inflation_alert,
    'jobs_stats', v_jobs_stat,
    'businesses_stats', v_businesses_stat,
    'bonds_stats', v_bonds_stat,
    'loans_stats', v_loans_stat
  );
END;
$$;

ALTER FUNCTION public.admin_get_macro_economy_v2() OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.admin_get_macro_economy_v2() TO moneyverse_app;

-- 3. Procedure: admin_toggle_killswitch
CREATE OR REPLACE FUNCTION public.admin_toggle_killswitch(
  p_scope text,
  p_active boolean,
  p_admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_updated record;
BEGIN
  IF p_scope = 'master' THEN
    UPDATE public.admin_economy_policy_v2
    SET master_killswitch_active = p_active,
        updated_at = clock_timestamp(),
        updated_by = p_admin_id
    WHERE id = 1
    RETURNING * INTO v_updated;
  ELSIF p_scope = 'banking' THEN
    UPDATE public.admin_economy_policy_v2
    SET banking_circuit_broken = p_active,
        updated_at = clock_timestamp(),
        updated_by = p_admin_id
    WHERE id = 1
    RETURNING * INTO v_updated;
  ELSIF p_scope = 'businesses' THEN
    UPDATE public.admin_economy_policy_v2
    SET businesses_circuit_broken = p_active,
        updated_at = clock_timestamp(),
        updated_by = p_admin_id
    WHERE id = 1
    RETURNING * INTO v_updated;
  ELSIF p_scope = 'market' THEN
    UPDATE public.admin_economy_policy_v2
    SET market_circuit_broken = p_active,
        updated_at = clock_timestamp(),
        updated_by = p_admin_id
    WHERE id = 1
    RETURNING * INTO v_updated;
  ELSIF p_scope = 'auto_balancing' THEN
    UPDATE public.admin_economy_policy_v2
    SET auto_balancing_active = p_active,
        updated_at = clock_timestamp(),
        updated_by = p_admin_id
    WHERE id = 1
    RETURNING * INTO v_updated;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unrecognized killswitch scope';
  END IF;

  RETURN to_jsonb(v_updated);
END;
$$;

ALTER FUNCTION public.admin_toggle_killswitch(text, boolean, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.admin_toggle_killswitch(text, boolean, uuid) TO moneyverse_app;

-- 4. Procedure: admin_update_economic_knobs_v2
CREATE OR REPLACE FUNCTION public.admin_update_economic_knobs_v2(
  p_deposit_bps integer,
  p_bond_7d_bps integer,
  p_bond_30d_bps integer,
  p_loan_bps integer,
  p_admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_updated record;
BEGIN
  IF p_deposit_bps < 0 OR p_deposit_bps > 500 OR
     p_bond_7d_bps < 0 OR p_bond_7d_bps > 2000 OR
     p_bond_30d_bps < 0 OR p_bond_30d_bps > 5000 OR
     p_loan_bps < 0 OR p_loan_bps > 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'parameter out of allowable range';
  END IF;

  UPDATE public.admin_economy_policy_v2
  SET daily_deposit_interest_bps = p_deposit_bps,
      bond_7d_yield_bps = p_bond_7d_bps,
      bond_30d_yield_bps = p_bond_30d_bps,
      loan_daily_interest_bps = p_loan_bps,
      updated_at = clock_timestamp(),
      updated_by = p_admin_id
  WHERE id = 1
  RETURNING * INTO v_updated;

  RETURN to_jsonb(v_updated);
END;
$$;

ALTER FUNCTION public.admin_update_economic_knobs_v2(integer, integer, integer, integer, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.admin_update_economic_knobs_v2(integer, integer, integer, integer, uuid) TO moneyverse_app;

-- 5. Procedure: admin_inspect_user_assets_v2
CREATE OR REPLACE FUNCTION public.admin_inspect_user_assets_v2(p_target_user uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
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
    'experience', jp.experience,
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
    'principal_amount', b.principal_amount,
    'maturity_amount', b.maturity_amount,
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
    'cash_balance', COALESCE(v_cash, 0),
    'bank_balance', COALESCE(v_bank, 0),
    'total_interest_claimed', COALESCE(v_tracker.total_interest_claimed, 0),
    'jobs', v_jobs,
    'businesses', v_businesses,
    'active_loan', CASE WHEN v_loan.id IS NOT NULL THEN jsonb_build_object(
      'loan_id', v_loan.id,
      'principal', v_loan.principal_amount,
      'outstanding', v_loan.outstanding_amount,
      'issued_at', v_loan.issued_at
    ) ELSE NULL END,
    'bonds', v_bonds
  );
END;
$$;

ALTER FUNCTION public.admin_inspect_user_assets_v2(uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.admin_inspect_user_assets_v2(uuid) TO moneyverse_app;

-- 6. Procedure: admin_override_user_asset_v2
CREATE OR REPLACE FUNCTION public.admin_override_user_asset_v2(
  p_target_user uuid,
  p_asset_type text,
  p_amount bigint,
  p_direction text,
  p_reason text,
  p_admin_id uuid,
  p_idempotency_key uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_user_acc uuid;
  v_treasury_acc uuid;
  v_tx_id uuid;
  v_new_balance bigint;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'amount must be positive integer';
  END IF;

  IF p_asset_type = 'cash' THEN
    SELECT a.id INTO v_user_acc
    FROM public.accounts a
    WHERE a.owner_user_id = p_target_user AND a.account_type = 'USER_CASH' AND a.status = 'active'
    FOR UPDATE;
  ELSIF p_asset_type = 'bank' THEN
    SELECT a.id INTO v_user_acc
    FROM public.accounts a
    WHERE a.owner_user_id = p_target_user AND a.account_type = 'USER_BANK' AND a.status = 'active'
    FOR UPDATE;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unsupported asset type for direct adjustment';
  END IF;

  SELECT id INTO v_treasury_acc
  FROM public.accounts WHERE system_key = 'treasury' AND account_type = 'TREASURY' AND status = 'active'
  FOR UPDATE;

  IF v_user_acc IS NULL OR v_treasury_acc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'required accounts unavailable';
  END IF;

  IF p_direction = 'credit_grant' THEN
    -- Admin grants money to user: Treasury -> User
    SELECT public.economy_post_transaction(
      p_idempotency_key, 'ADMIN_ADJUSTMENT', p_admin_id, NULL,
      jsonb_build_array(
        jsonb_build_object('accountId', v_user_acc, 'amount', p_amount, 'direction', 'debit'),
        jsonb_build_object('accountId', v_treasury_acc, 'amount', p_amount, 'direction', 'credit')
      ),
      'admin.override_grant',
      jsonb_build_object('targetUser', p_target_user, 'assetType', p_asset_type, 'reason', p_reason)
    ) INTO v_tx_id;
  ELSIF p_direction = 'debit_confiscate' THEN
    -- Admin confiscates money from user: User -> Treasury
    SELECT public.economy_post_transaction(
      p_idempotency_key, 'ADMIN_ADJUSTMENT', p_admin_id, NULL,
      jsonb_build_array(
        jsonb_build_object('accountId', v_user_acc, 'amount', p_amount, 'direction', 'credit'),
        jsonb_build_object('accountId', v_treasury_acc, 'amount', p_amount, 'direction', 'debit')
      ),
      'admin.override_confiscate',
      jsonb_build_object('targetUser', p_target_user, 'assetType', p_asset_type, 'reason', p_reason)
    ) INTO v_tx_id;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid direction (credit_grant or debit_confiscate)';
  END IF;

  SELECT available_amount INTO v_new_balance FROM public.account_balances WHERE account_id = v_user_acc;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'new_balance', v_new_balance,
    'asset_type', p_asset_type,
    'adjusted_amount', p_amount,
    'direction', p_direction
  );
END;
$$;

ALTER FUNCTION public.admin_override_user_asset_v2(uuid, text, bigint, text, text, uuid, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.admin_override_user_asset_v2(uuid, text, bigint, text, text, uuid, uuid) TO moneyverse_app;
