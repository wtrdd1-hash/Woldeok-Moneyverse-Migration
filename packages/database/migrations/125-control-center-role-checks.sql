-- The control centre's four levers, now checked in the database.
--
-- 117 gave the console a master kill switch, three circuit breakers, four
-- interest-rate knobs, a per-member asset inspector and a lever that moves
-- WLD into or out of any member's accounts. Every one of those functions was
-- granted to moneyverse_app and none of them asked who was calling: the
-- route's guards admitted any holder of any administrative role, and the
-- function then did whatever it was told. That inverts the rule everything
-- else here keeps (AGENTS.md §1, §5): the guard decides who reaches the
-- controller, the function decides who may act. A server_operator -- a role
-- that exists to restart a Minecraft server -- could confiscate a member's
-- savings, and nothing in the audit trail would say so, because the override
-- wrote an outbox event and no audit row.
--
-- The functions also never revoked EXECUTE from PUBLIC. PostgreSQL grants it
-- by default, so every other login principal on the cluster -- the status
-- collector, the reconciler, the Minecraft executor -- could call
-- admin_override_user_asset_v2 directly. 114, 115 and 116 shipped the same
-- omission on their member functions; those are restated below too.
--
-- The money lever and the kill switch require the superadmin, as bulk
-- payouts (084) and reversals do; the knobs require the superadmin, as the
-- auto-policy knobs in 092 do; the inspector requires an operator, as every
-- other read of one member's standing does. All four write an audit row.

BEGIN;

-- ---------------------------------------------------------------------------
-- Kill switch and circuit breakers
-- ---------------------------------------------------------------------------

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
  PERFORM public.admin_require_superadmin(p_admin_id);
  IF p_active IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active flag is required';
  END IF;

  IF p_scope = 'master' THEN
    UPDATE public.admin_economy_policy_v2
    SET master_killswitch_active = p_active, updated_at = clock_timestamp(), updated_by = p_admin_id
    WHERE id = 1 RETURNING * INTO v_updated;
  ELSIF p_scope = 'banking' THEN
    UPDATE public.admin_economy_policy_v2
    SET banking_circuit_broken = p_active, updated_at = clock_timestamp(), updated_by = p_admin_id
    WHERE id = 1 RETURNING * INTO v_updated;
  ELSIF p_scope = 'businesses' THEN
    UPDATE public.admin_economy_policy_v2
    SET businesses_circuit_broken = p_active, updated_at = clock_timestamp(), updated_by = p_admin_id
    WHERE id = 1 RETURNING * INTO v_updated;
  ELSIF p_scope = 'market' THEN
    UPDATE public.admin_economy_policy_v2
    SET market_circuit_broken = p_active, updated_at = clock_timestamp(), updated_by = p_admin_id
    WHERE id = 1 RETURNING * INTO v_updated;
  ELSIF p_scope = 'auto_balancing' THEN
    UPDATE public.admin_economy_policy_v2
    SET auto_balancing_active = p_active, updated_at = clock_timestamp(), updated_by = p_admin_id
    WHERE id = 1 RETURNING * INTO v_updated;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unrecognized killswitch scope';
  END IF;

  PERFORM public.admin_record_audit_event(
    p_admin_id, 'economy.killswitch.toggled', NULL, gen_random_uuid(),
    jsonb_build_object('scope', p_scope, 'active', p_active)
  );

  RETURN to_jsonb(v_updated);
END;
$$;

-- ---------------------------------------------------------------------------
-- Interest-rate knobs
-- ---------------------------------------------------------------------------

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
  v_before record;
  v_updated record;
BEGIN
  PERFORM public.admin_require_superadmin(p_admin_id);

  IF p_deposit_bps IS NULL OR p_deposit_bps < 0 OR p_deposit_bps > 500 OR
     p_bond_7d_bps IS NULL OR p_bond_7d_bps < 0 OR p_bond_7d_bps > 2000 OR
     p_bond_30d_bps IS NULL OR p_bond_30d_bps < 0 OR p_bond_30d_bps > 5000 OR
     p_loan_bps IS NULL OR p_loan_bps < 0 OR p_loan_bps > 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'parameter out of allowable range';
  END IF;

  SELECT * INTO v_before FROM public.admin_economy_policy_v2 WHERE id = 1 FOR UPDATE;

  UPDATE public.admin_economy_policy_v2
  SET daily_deposit_interest_bps = p_deposit_bps,
      bond_7d_yield_bps = p_bond_7d_bps,
      bond_30d_yield_bps = p_bond_30d_bps,
      loan_daily_interest_bps = p_loan_bps,
      updated_at = clock_timestamp(),
      updated_by = p_admin_id
  WHERE id = 1
  RETURNING * INTO v_updated;

  PERFORM public.admin_record_audit_event(
    p_admin_id, 'economy.knobs.updated', NULL, gen_random_uuid(),
    jsonb_build_object(
      'from', jsonb_build_object(
        'depositBps', v_before.daily_deposit_interest_bps, 'bond7dBps', v_before.bond_7d_yield_bps,
        'bond30dBps', v_before.bond_30d_yield_bps, 'loanBps', v_before.loan_daily_interest_bps),
      'to', jsonb_build_object(
        'depositBps', p_deposit_bps, 'bond7dBps', p_bond_7d_bps,
        'bond30dBps', p_bond_30d_bps, 'loanBps', p_loan_bps))
  );

  RETURN to_jsonb(v_updated);
END;
$$;

-- ---------------------------------------------------------------------------
-- The inspector: one member's standing, to an operator who names themselves
-- ---------------------------------------------------------------------------

-- The signature changes to take the actor, so the one-argument version is
-- dropped rather than left as an unchecked twin.
DROP FUNCTION IF EXISTS public.admin_inspect_user_assets_v2(uuid);

CREATE FUNCTION public.admin_inspect_user_assets_v2(p_actor uuid, p_target_user uuid)
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

-- ---------------------------------------------------------------------------
-- The money lever
-- ---------------------------------------------------------------------------

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
  v_reason text;
BEGIN
  PERFORM public.admin_require_superadmin(p_admin_id);

  IF p_idempotency_key IS NULL OR p_target_user IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid asset override';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'amount must be positive integer';
  END IF;
  v_reason := btrim(coalesce(p_reason, ''));
  IF char_length(v_reason) < 5 OR char_length(v_reason) > 500 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a reason of 5 to 500 characters is required';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_target_user AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an active target account is required';
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
    SELECT public.economy_post_transaction(
      p_idempotency_key, 'ADMIN_ADJUSTMENT', p_admin_id, NULL,
      jsonb_build_array(
        jsonb_build_object('accountId', v_user_acc, 'amount', p_amount, 'direction', 'debit'),
        jsonb_build_object('accountId', v_treasury_acc, 'amount', p_amount, 'direction', 'credit')
      ),
      'admin.override_grant',
      jsonb_build_object('targetUser', p_target_user, 'assetType', p_asset_type, 'reason', v_reason)
    ) INTO v_tx_id;
  ELSIF p_direction = 'debit_confiscate' THEN
    SELECT public.economy_post_transaction(
      p_idempotency_key, 'ADMIN_ADJUSTMENT', p_admin_id, NULL,
      jsonb_build_array(
        jsonb_build_object('accountId', v_user_acc, 'amount', p_amount, 'direction', 'credit'),
        jsonb_build_object('accountId', v_treasury_acc, 'amount', p_amount, 'direction', 'debit')
      ),
      'admin.override_confiscate',
      jsonb_build_object('targetUser', p_target_user, 'assetType', p_asset_type, 'reason', v_reason)
    ) INTO v_tx_id;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid direction (credit_grant or debit_confiscate)';
  END IF;

  -- The audit row the override never wrote. The outbox event is for Discord;
  -- this is for the operator asking, a month later, who moved this money.
  PERFORM public.admin_record_audit_event(
    p_admin_id, 'economy.asset.overridden', p_target_user, p_idempotency_key,
    jsonb_build_object(
      'transactionId', v_tx_id, 'assetType', p_asset_type, 'amount', p_amount,
      'direction', p_direction, 'reason', v_reason)
  );

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

-- ---------------------------------------------------------------------------
-- Ownership, and the revokes 114-117 left out
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.admin_toggle_killswitch(text, boolean, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_update_economic_knobs_v2(integer, integer, integer, integer, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_inspect_user_assets_v2(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_override_user_asset_v2(uuid, text, bigint, text, text, uuid, uuid) OWNER TO moneyverse_migrator;

-- PostgreSQL grants EXECUTE to PUBLIC on creation. 114-117 granted the
-- application role and stopped there, which left every other principal on
-- the cluster able to call these. Revoked from PUBLIC and granted to the one
-- role that calls them, in the shape every other migration uses.
REVOKE ALL PRIVILEGES ON FUNCTION
  public.admin_get_macro_economy_v2(),
  public.admin_toggle_killswitch(text, boolean, uuid),
  public.admin_update_economic_knobs_v2(integer, integer, integer, integer, uuid),
  public.admin_inspect_user_assets_v2(uuid, uuid),
  public.admin_override_user_asset_v2(uuid, text, bigint, text, text, uuid, uuid),
  public.inventory_equip_item(uuid, uuid, text, boolean),
  public.profile_get_cosmetics(uuid),
  public.job_get_my_profile(uuid),
  public.business_activate_from_license(uuid, text, uuid),
  public.business_apply_boost(uuid, uuid, text),
  public.business_settle_daily_v2(uuid, uuid, uuid),
  public.business_my_ownerships_v2(uuid),
  public.bank_calculate_credit_limit(uuid),
  public.bank_get_my_standing(uuid),
  public.bank_claim_compound_interest(uuid, uuid),
  public.bank_purchase_bond(uuid, text, bigint, uuid),
  public.bank_redeem_bond(uuid, uuid, uuid),
  public.bank_borrow_smart(uuid, bigint, uuid),
  public.stock_market_tick(numeric),
  public.stock_admin_update(uuid, uuid, text, text, boolean),
  public.admin_set_user_restriction(uuid, uuid, boolean, text, uuid),
  public.admin_list_users(uuid, integer)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.admin_get_macro_economy_v2(),
  public.admin_toggle_killswitch(text, boolean, uuid),
  public.admin_update_economic_knobs_v2(integer, integer, integer, integer, uuid),
  public.admin_inspect_user_assets_v2(uuid, uuid),
  public.admin_override_user_asset_v2(uuid, text, bigint, text, text, uuid, uuid),
  public.inventory_equip_item(uuid, uuid, text, boolean),
  public.profile_get_cosmetics(uuid),
  public.job_get_my_profile(uuid),
  public.business_activate_from_license(uuid, text, uuid),
  public.business_apply_boost(uuid, uuid, text),
  public.business_settle_daily_v2(uuid, uuid, uuid),
  public.business_my_ownerships_v2(uuid),
  public.bank_calculate_credit_limit(uuid),
  public.bank_get_my_standing(uuid),
  public.bank_claim_compound_interest(uuid, uuid),
  public.bank_purchase_bond(uuid, text, bigint, uuid),
  public.bank_redeem_bond(uuid, uuid, uuid),
  public.bank_borrow_smart(uuid, bigint, uuid),
  public.stock_market_tick(numeric),
  public.stock_admin_update(uuid, uuid, text, text, boolean),
  public.admin_set_user_restriction(uuid, uuid, boolean, text, uuid),
  public.admin_list_users(uuid, integer)
TO moneyverse_app;

-- 117 granted the application role SELECT, INSERT and UPDATE on the policy
-- row itself, so one SQL injection could throw the master kill switch or
-- zero every interest rate without passing through a function. Nothing in
-- the application reads or writes the table directly -- every path is one of
-- the SECURITY DEFINER functions above or `stock_market_halted` (124) -- so
-- the grant is taken back. 116's SELECT on the bond and deposit-tracker
-- tables is the same kind of grant and has the same answer.
REVOKE ALL PRIVILEGES ON TABLE
  public.admin_economy_policy_v2,
  public.virtual_bank_bonds,
  public.virtual_bank_deposit_trackers
FROM PUBLIC, moneyverse_app;

-- 121 granted the application role a function that hands the superadmin
-- designation to whoever it is called with, keyed on an e-mail address it
-- does not verify. Nothing in the application calls it. Until something
-- does -- with a provider-verified address -- the application role does not
-- get to.
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_bind_bootstrap_google_admin(text, text, uuid)
FROM PUBLIC, moneyverse_app;

COMMIT;
