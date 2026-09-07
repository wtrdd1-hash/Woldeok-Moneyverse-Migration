BEGIN;

-- The application reaches the tracker only through SECURITY DEFINER bank
-- functions. Direct writes would let a compromised query move the accrual
-- clock or claimed total independently of the ledger.
REVOKE ALL PRIVILEGES ON TABLE public.virtual_bank_deposit_trackers FROM PUBLIC, moneyverse_app;

-- This older automatic path uses a separate receipt table from the interactive
-- compound-interest path. It has no current application caller; remove it from
-- the runtime role so the same deposit cannot accidentally gain interest from
-- two independent clocks.
REVOKE EXECUTE ON FUNCTION public.bank_accrue_daily_interest(date) FROM moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_move_balance(
  p_key uuid,
  p_actor uuid,
  p_direction text,
  p_amount bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_cash uuid;
  v_bank uuid;
  v_transaction uuid;
  v_replayed boolean := false;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL
     OR p_direction NOT IN ('deposit', 'withdraw')
     OR p_amount < 1 OR p_amount > 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid bank transfer';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.ledger_transactions AS tx
    WHERE tx.idempotency_key = p_key
  ) INTO v_replayed;

  SELECT account_row.id INTO v_cash
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_bank
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_BANK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_bank IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active bank accounts required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key,
    CASE WHEN p_direction='deposit' THEN 'BANK_DEPOSIT' ELSE 'BANK_WITHDRAW' END,
    p_actor,
    NULL,
    CASE WHEN p_direction='deposit' THEN pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash,'amount',p_amount,'direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_bank,'amount',p_amount,'direction','debit')
    ) ELSE pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash,'amount',p_amount,'direction','debit'),
      pg_catalog.jsonb_build_object('accountId',v_bank,'amount',p_amount,'direction','credit')
    ) END,
    'bank.balance.moved',
    pg_catalog.jsonb_build_object('direction',p_direction,'amount',p_amount)
  ) INTO v_transaction;

  -- A balance change starts a new constant-principal accrual interval. Do not
  -- move the clock on an idempotent replay of the same transfer.
  IF NOT v_replayed THEN
    INSERT INTO public.virtual_bank_deposit_trackers(
      user_id, last_interest_claimed_at, total_interest_claimed
    ) VALUES (p_actor, pg_catalog.clock_timestamp(), 0)
    ON CONFLICT (user_id) DO UPDATE
    SET last_interest_claimed_at = EXCLUDED.last_interest_claimed_at;
  END IF;

  RETURN v_transaction;
END;
$$;

ALTER FUNCTION public.bank_move_balance(uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_move_balance(uuid, uuid, text, bigint) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_move_balance(uuid, uuid, text, bigint) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_claim_compound_interest(
  p_actor uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  claimed_amount bigint,
  new_bank_balance bigint,
  transaction_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_bank bigint := 0;
  v_bank_acc uuid;
  v_mint_acc uuid;
  v_tracker record;
  v_hours_since numeric := 0;
  v_rate_bps integer := 0;
  v_interest bigint := 0;
  v_tx_id uuid;
BEGIN
  IF p_actor IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and idempotency key are required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:bank-interest-claim:' || p_idempotency_key::text, 0)
  );

  -- A retry of the same write returns the already-posted amount rather than
  -- failing the 30-minute gate on the newly advanced tracker clock.
  SELECT tx.id, posting.amount
  INTO v_tx_id, v_interest
  FROM public.ledger_transactions AS tx
  JOIN public.ledger_postings AS posting ON posting.transaction_id = tx.id
  JOIN public.accounts AS account_row ON account_row.id = posting.account_id
  WHERE tx.idempotency_key = p_idempotency_key
    AND tx.type = 'BANK_DEPOSIT_INTEREST'
    AND tx.actor_user_id = p_actor
    AND account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_BANK'::public.account_type
    AND posting.direction = 'debit'::public.posting_direction
  LIMIT 1;

  IF FOUND THEN
    SELECT balance.available_amount INTO v_bank
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance ON balance.account_id = account_row.id
    WHERE account_row.owner_user_id = p_actor
      AND account_row.account_type = 'USER_BANK'::public.account_type
      AND account_row.status = 'active'::public.account_status;
    RETURN QUERY SELECT v_interest, coalesce(v_bank, 0), v_tx_id;
    RETURN;
  END IF;

  SELECT account_row.id, balance.available_amount
  INTO v_bank_acc, v_bank
  FROM public.accounts AS account_row
  JOIN public.account_balances AS balance ON balance.account_id = account_row.id
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_BANK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_bank_acc IS NULL OR v_bank <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active bank deposit balance required to claim interest';
  END IF;

  SELECT * INTO v_tracker
  FROM public.virtual_bank_deposit_trackers
  WHERE user_id = p_actor
  FOR UPDATE;

  IF v_tracker IS NULL THEN
    INSERT INTO public.virtual_bank_deposit_trackers(
      user_id, last_interest_claimed_at, total_interest_claimed
    ) VALUES (p_actor, pg_catalog.clock_timestamp(), 0)
    RETURNING * INTO v_tracker;
  END IF;

  v_hours_since := EXTRACT(EPOCH FROM (pg_catalog.clock_timestamp() - v_tracker.last_interest_claimed_at)) / 3600.0;
  IF v_hours_since < 0.5 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'interest can only be claimed after at least 30 minutes of unchanged deposit balance';
  END IF;

  v_rate_bps := public.bank_auto_interest_rate_bps();
  v_interest := pg_catalog.floor(
    v_bank::numeric * v_rate_bps::numeric * v_hours_since / (10000::numeric * 24::numeric)
  )::bigint;

  IF v_interest < 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'accrued interest has not reached 1 WLD yet';
  END IF;

  SELECT id INTO v_mint_acc
  FROM public.accounts
  WHERE system_key = 'mint'
    AND account_type = 'MINT'::public.account_type
    AND status = 'active'::public.account_status
  FOR UPDATE;

  IF v_mint_acc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'active mint account required';
  END IF;

  SELECT public.economy_post_transaction(
    p_idempotency_key,
    'BANK_DEPOSIT_INTEREST',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_bank_acc, 'amount', v_interest, 'direction', 'debit'),
      pg_catalog.jsonb_build_object('accountId', v_mint_acc, 'amount', v_interest, 'direction', 'credit')
    ),
    'bank.compound_interest_claimed',
    pg_catalog.jsonb_build_object(
      'hoursAccrued', v_hours_since,
      'rateBps', v_rate_bps,
      'interestAmount', v_interest
    )
  ) INTO v_tx_id;

  UPDATE public.virtual_bank_deposit_trackers
  SET last_interest_claimed_at = pg_catalog.clock_timestamp(),
      total_interest_claimed = total_interest_claimed + v_interest
  WHERE user_id = p_actor;

  RETURN QUERY SELECT v_interest, v_bank + v_interest, v_tx_id;
END;
$$;

ALTER FUNCTION public.bank_claim_compound_interest(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_claim_compound_interest(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_claim_compound_interest(uuid, uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_get_my_standing(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_cash bigint := 0;
  v_bank bigint := 0;
  v_grade text := 'new';
  v_credit_limit bigint := 0;
  v_loan_interest_bps integer := 0;
  v_loan_term_days integer := 30;
  v_minimum_repayment bigint := 0;
  v_active_loan record;
  v_bonds jsonb;
  v_unclaimed_interest bigint := 0;
  v_tracker record;
  v_hours_since numeric := 0;
  v_rate_bps integer := 0;
  v_daily_pct numeric := 0;
  v_annual_pct numeric := 0;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  SELECT coalesce(balance.available_amount, 0) INTO v_cash
  FROM public.accounts AS account_row
  JOIN public.account_balances AS balance ON balance.account_id = account_row.id
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status;

  SELECT coalesce(balance.available_amount, 0) INTO v_bank
  FROM public.accounts AS account_row
  JOIN public.account_balances AS balance ON balance.account_id = account_row.id
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_BANK'::public.account_type
    AND account_row.status = 'active'::public.account_status;

  v_grade := coalesce(public.bank_credit_grade(p_actor), 'new');
  SELECT policy_row.credit_limit, policy_row.interest_bps,
         policy_row.term_days, policy_row.minimum_repayment
  INTO v_credit_limit, v_loan_interest_bps, v_loan_term_days, v_minimum_repayment
  FROM public.bank_credit_policies AS policy_row
  WHERE policy_row.grade = v_grade AND policy_row.active;

  v_credit_limit := coalesce(v_credit_limit, 0);
  v_loan_interest_bps := coalesce(v_loan_interest_bps, 0);
  v_loan_term_days := coalesce(v_loan_term_days, 30);
  v_minimum_repayment := coalesce(v_minimum_repayment, 0);

  SELECT id, principal_amount, interest_amount, outstanding_amount,
         issued_at, status, maturity_at, minimum_repayment, credit_grade
  INTO v_active_loan
  FROM public.virtual_bank_loans
  WHERE user_id = p_actor AND status IN ('active', 'overdue')
  ORDER BY issued_at DESC
  LIMIT 1;

  v_rate_bps := public.bank_auto_interest_rate_bps();
  v_daily_pct := v_rate_bps::numeric / 100::numeric;
  v_annual_pct := (pg_catalog.power(1::numeric + v_rate_bps::numeric / 10000::numeric, 365) - 1) * 100;

  SELECT * INTO v_tracker
  FROM public.virtual_bank_deposit_trackers
  WHERE user_id = p_actor;

  IF v_tracker IS NOT NULL AND v_bank > 0 THEN
    v_hours_since := EXTRACT(EPOCH FROM (pg_catalog.clock_timestamp() - v_tracker.last_interest_claimed_at)) / 3600.0;
    IF v_hours_since >= 0.5 THEN
      v_unclaimed_interest := pg_catalog.floor(
        v_bank::numeric * v_rate_bps::numeric * v_hours_since / (10000::numeric * 24::numeric)
      )::bigint;
    END IF;
  END IF;

  SELECT coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'id', bond.id,
    'bond_code', bond.bond_code,
    'bond_name', bond.bond_name,
    'principal_amount', bond.principal_amount::text,
    'yield_bps', bond.yield_bps,
    'maturity_amount', bond.maturity_amount::text,
    'purchased_at', bond.purchased_at,
    'maturity_at', bond.maturity_at,
    'is_matured', (pg_catalog.clock_timestamp() >= bond.maturity_at),
    'status', bond.status
  ) ORDER BY bond.maturity_at), '[]'::jsonb)
  INTO v_bonds
  FROM public.virtual_bank_bonds AS bond
  WHERE bond.user_id = p_actor AND bond.status = 'holding';

  RETURN pg_catalog.jsonb_build_object(
    'cash_balance', coalesce(v_cash, 0)::text,
    'bank_balance', coalesce(v_bank, 0)::text,
    'daily_interest_rate_bps', v_rate_bps,
    'daily_interest_rate_pct', pg_catalog.round(v_daily_pct, 4),
    'annual_yield_pct', pg_catalog.round(v_annual_pct, 2),
    'unclaimed_interest', coalesce(v_unclaimed_interest, 0)::text,
    'credit_grade', v_grade,
    'credit_limit', v_credit_limit::text,
    'loan_interest_bps', v_loan_interest_bps,
    'loan_term_days', v_loan_term_days,
    'loan_minimum_repayment', v_minimum_repayment::text,
    'active_loan', CASE WHEN v_active_loan.id IS NOT NULL THEN pg_catalog.jsonb_build_object(
      'loan_id', v_active_loan.id,
      'principal_amount', v_active_loan.principal_amount::text,
      'interest_amount', v_active_loan.interest_amount::text,
      'outstanding_amount', v_active_loan.outstanding_amount::text,
      'issued_at', v_active_loan.issued_at,
      'status', v_active_loan.status,
      'maturity_at', v_active_loan.maturity_at,
      'minimum_repayment', v_active_loan.minimum_repayment::text,
      'credit_grade', v_active_loan.credit_grade
    ) ELSE NULL END,
    'bonds', v_bonds
  );
END;
$$;

ALTER FUNCTION public.bank_get_my_standing(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_get_my_standing(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_get_my_standing(uuid) TO moneyverse_app;

COMMIT;
