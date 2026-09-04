-- 116-virtual-banking-2.sql
-- Woldeok Moneyverse: Virtual Banking 2.0 (Compound Deposit, Smart Loan, Virtual Bonds)

-- 1. Virtual Bank Bonds Table
CREATE TABLE IF NOT EXISTS public.virtual_bank_bonds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  bond_code text NOT NULL CHECK (bond_code IN ('BOND_7D', 'BOND_30D')),
  bond_name text NOT NULL,
  principal_amount bigint NOT NULL CHECK (principal_amount >= 1000 AND principal_amount <= 100000000),
  yield_bps integer NOT NULL CHECK (yield_bps >= 100 AND yield_bps <= 5000),
  maturity_amount bigint NOT NULL CHECK (maturity_amount > principal_amount),
  purchased_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  maturity_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'holding' CHECK (status IN ('holding', 'redeemed')),
  purchase_idempotency_key uuid NOT NULL UNIQUE,
  purchase_transaction_id uuid,
  redeemed_at timestamptz,
  redeem_idempotency_key uuid,
  redeem_transaction_id uuid
);

CREATE INDEX IF NOT EXISTS idx_virtual_bank_bonds_user ON public.virtual_bank_bonds(user_id, status);

GRANT SELECT, INSERT, UPDATE ON public.virtual_bank_bonds TO moneyverse_app;

-- 2. Virtual Bank User Interest Accrual Tracker (for instant on-demand compound interest claim)
CREATE TABLE IF NOT EXISTS public.virtual_bank_deposit_trackers (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  last_interest_claimed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  total_interest_claimed bigint NOT NULL DEFAULT 0 CHECK (total_interest_claimed >= 0)
);

GRANT SELECT, INSERT, UPDATE ON public.virtual_bank_deposit_trackers TO moneyverse_app;

-- 3. Function: Credit Limit Calculator based on Job Level & Businesses Owned
CREATE OR REPLACE FUNCTION public.bank_calculate_credit_limit(p_actor uuid)
RETURNS TABLE(
  base_limit bigint,
  job_bonus bigint,
  business_bonus bigint,
  total_limit bigint,
  max_allowed_loan bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_job_level integer := 1;
  v_biz_count integer := 0;
  v_base bigint := 5000;
  v_job_b bigint := 0;
  v_biz_b bigint := 0;
  v_total bigint := 5000;
BEGIN
  -- Get active job level
  SELECT COALESCE(level, 1) INTO v_job_level
  FROM public.user_job_progress
  WHERE user_id = p_actor AND is_active = true
  LIMIT 1;

  -- Get active business count
  SELECT COUNT(*) INTO v_biz_count
  FROM public.virtual_business_ownerships
  WHERE user_id = p_actor AND status = 'active';

  v_job_b := (COALESCE(v_job_level, 1) * 2000);
  v_biz_b := (COALESCE(v_biz_count, 0) * 10000);
  v_total := v_base + v_job_b + v_biz_b;

  RETURN QUERY SELECT v_base, v_job_b, v_biz_b, v_total, v_total;
END;
$$;

ALTER FUNCTION public.bank_calculate_credit_limit(uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.bank_calculate_credit_limit(uuid) TO moneyverse_app;

-- 4. Function: Bank My Standing Overview
CREATE OR REPLACE FUNCTION public.bank_get_my_standing(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_cash bigint := 0;
  v_bank bigint := 0;
  v_credit record;
  v_active_loan record;
  v_bonds jsonb;
  v_unclaimed_interest bigint := 0;
  v_tracker record;
  v_hours_since numeric := 0;
BEGIN
  -- 1. Cash Balance
  SELECT COALESCE(ab.available_amount, 0) INTO v_cash
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH' AND a.status = 'active';

  -- 2. Bank Balance
  SELECT COALESCE(ab.available_amount, 0) INTO v_bank
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_BANK' AND a.status = 'active';

  -- 3. Calculate Credit Limit
  SELECT * INTO v_credit FROM public.bank_calculate_credit_limit(p_actor);

  -- 4. Active Loan
  SELECT id, principal_amount, interest_amount, outstanding_amount, issued_at, status
  INTO v_active_loan
  FROM public.virtual_bank_loans
  WHERE user_id = p_actor AND status = 'active'
  LIMIT 1;

  -- 5. Unclaimed Compound Interest Calculation (0.05% per day = 0.0005 per 24 hours)
  SELECT * INTO v_tracker FROM public.virtual_bank_deposit_trackers WHERE user_id = p_actor;
  IF v_tracker IS NOT NULL AND v_bank > 0 THEN
    v_hours_since := EXTRACT(EPOCH FROM (clock_timestamp() - v_tracker.last_interest_claimed_at)) / 3600.0;
    IF v_hours_since >= 1.0 THEN
      -- hourly accrued compound fraction: v_bank * 0.0005 * (hours / 24)
      v_unclaimed_interest := FLOOR(v_bank * 0.0005 * (v_hours_since / 24.0));
    END IF;
  ELSIF v_tracker IS NULL AND v_bank > 0 THEN
    v_unclaimed_interest := 0;
  END IF;

  -- 6. Bonds holding list
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', b.id,
    'bond_code', b.bond_code,
    'bond_name', b.bond_name,
    'principal_amount', b.principal_amount,
    'yield_bps', b.yield_bps,
    'maturity_amount', b.maturity_amount,
    'purchased_at', b.purchased_at,
    'maturity_at', b.maturity_at,
    'is_matured', (clock_timestamp() >= b.maturity_at),
    'status', b.status
  )), '[]'::jsonb) INTO v_bonds
  FROM public.virtual_bank_bonds b
  WHERE b.user_id = p_actor AND b.status = 'holding';

  RETURN jsonb_build_object(
    'cash_balance', COALESCE(v_cash, 0),
    'bank_balance', COALESCE(v_bank, 0),
    'daily_interest_rate_pct', 0.05,
    'annual_yield_pct', 19.72,
    'unclaimed_interest', COALESCE(v_unclaimed_interest, 0),
    'credit_limit', COALESCE(v_credit.total_limit, 5000),
    'active_loan', CASE WHEN v_active_loan.id IS NOT NULL THEN jsonb_build_object(
      'loan_id', v_active_loan.id,
      'principal_amount', v_active_loan.principal_amount,
      'interest_amount', v_active_loan.interest_amount,
      'outstanding_amount', v_active_loan.outstanding_amount,
      'issued_at', v_active_loan.issued_at,
      'status', v_active_loan.status
    ) ELSE NULL END,
    'bonds', v_bonds
  );
END;
$$;

ALTER FUNCTION public.bank_get_my_standing(uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.bank_get_my_standing(uuid) TO moneyverse_app;

-- 5. Procedure: Claim Compound Interest
CREATE OR REPLACE FUNCTION public.bank_claim_compound_interest(
  p_actor uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  claimed_amount bigint,
  new_bank_balance bigint,
  transaction_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_bank bigint := 0;
  v_bank_acc uuid;
  v_mint_acc uuid;
  v_tracker record;
  v_hours_since numeric := 0;
  v_interest bigint := 0;
  v_tx_id uuid;
BEGIN
  -- 1. Lock bank account
  SELECT a.id, ab.available_amount INTO v_bank_acc, v_bank
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_BANK' AND a.status = 'active'
  FOR UPDATE;

  IF v_bank_acc IS NULL OR v_bank <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active bank deposit balance required to claim interest';
  END IF;

  -- 2. Check tracker
  SELECT * INTO v_tracker FROM public.virtual_bank_deposit_trackers WHERE user_id = p_actor FOR UPDATE;
  IF v_tracker IS NULL THEN
    INSERT INTO public.virtual_bank_deposit_trackers (user_id, last_interest_claimed_at, total_interest_claimed)
    VALUES (p_actor, clock_timestamp(), 0)
    RETURNING * INTO v_tracker;
  END IF;

  v_hours_since := EXTRACT(EPOCH FROM (clock_timestamp() - v_tracker.last_interest_claimed_at)) / 3600.0;
  IF v_hours_since < 0.5 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'interest can only be claimed after at least 30 minutes of deposit';
  END IF;

  v_interest := FLOOR(v_bank * 0.0005 * (v_hours_since / 24.0));
  IF v_interest < 1 THEN
    v_interest := 1;
  END IF;

  -- 3. Mint Account
  SELECT id INTO v_mint_acc FROM public.accounts WHERE system_key = 'mint' AND account_type = 'MINT' AND status = 'active' FOR UPDATE;
  IF v_mint_acc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'active mint account required';
  END IF;

  -- 4. Post Transaction to USER_BANK (Compound into bank balance)
  SELECT public.economy_post_transaction(
    p_idempotency_key, 'BANK_DEPOSIT_INTEREST', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_bank_acc, 'amount', v_interest, 'direction', 'debit'),
      jsonb_build_object('accountId', v_mint_acc, 'amount', v_interest, 'direction', 'credit')
    ),
    'bank.compound_interest_claimed',
    jsonb_build_object('hoursAccrued', v_hours_since, 'interestAmount', v_interest)
  ) INTO v_tx_id;

  -- 5. Update Tracker
  UPDATE public.virtual_bank_deposit_trackers
  SET last_interest_claimed_at = clock_timestamp(),
      total_interest_claimed = total_interest_claimed + v_interest
  WHERE user_id = p_actor;

  RETURN QUERY SELECT v_interest, (v_bank + v_interest), v_tx_id;
END;
$$;

ALTER FUNCTION public.bank_claim_compound_interest(uuid, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.bank_claim_compound_interest(uuid, uuid) TO moneyverse_app;

-- 6. Procedure: Purchase Virtual Bond
CREATE OR REPLACE FUNCTION public.bank_purchase_bond(
  p_actor uuid,
  p_bond_code text,
  p_amount bigint,
  p_idempotency_key uuid
)
RETURNS TABLE(
  bond_id uuid,
  bond_name text,
  principal_amount bigint,
  maturity_amount bigint,
  maturity_at timestamptz,
  transaction_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_cash_acc uuid;
  v_sink_acc uuid;
  v_cash bigint;
  v_name text;
  v_yield_bps integer;
  v_days integer;
  v_maturity_amt bigint;
  v_maturity_dt timestamptz;
  v_tx_id uuid;
  v_new_id uuid;
BEGIN
  IF p_amount < 1000 OR p_amount > 10000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'bond purchase amount must be between 1,000 and 10,000,000 WLD';
  END IF;

  IF p_bond_code = 'BOND_7D' THEN
    v_name := '7일 만기 가상 국채 (수익률 3%)';
    v_yield_bps := 300;
    v_days := 7;
  ELSIF p_bond_code = 'BOND_30D' THEN
    v_name := '30일 만기 가상 국채 (수익률 15%)';
    v_yield_bps := 1500;
    v_days := 30;
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unrecognized bond code';
  END IF;

  v_maturity_amt := p_amount + ROUND(p_amount * (v_yield_bps / 10000.0));
  v_maturity_dt := clock_timestamp() + (v_days || ' days')::interval;

  -- 1. Check Cash Balance
  SELECT a.id, ab.available_amount INTO v_cash_acc, v_cash
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH' AND a.status = 'active'
  FOR UPDATE;

  IF v_cash_acc IS NULL OR v_cash < p_amount THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient cash balance to purchase bond';
  END IF;

  -- 2. Sink account (Lock money into system sink during bond tenure)
  SELECT id INTO v_sink_acc FROM public.accounts WHERE system_key = 'sink' AND account_type = 'SINK' AND status = 'active' FOR UPDATE;
  IF v_sink_acc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'active sink account required';
  END IF;

  -- 3. Post transaction: User Cash -> Sink (Lockup)
  SELECT public.economy_post_transaction(
    p_idempotency_key, 'BOND_PURCHASE', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash_acc, 'amount', p_amount, 'direction', 'credit'),
      jsonb_build_object('accountId', v_sink_acc, 'amount', p_amount, 'direction', 'debit')
    ),
    'bank.bond_purchased',
    jsonb_build_object('bondCode', p_bond_code, 'principal', p_amount, 'yieldBps', v_yield_bps)
  ) INTO v_tx_id;

  -- 4. Create Bond record
  v_new_id := gen_random_uuid();
  INSERT INTO public.virtual_bank_bonds (
    id, user_id, bond_code, bond_name, principal_amount, yield_bps, maturity_amount,
    purchased_at, maturity_at, status, purchase_idempotency_key, purchase_transaction_id
  ) VALUES (
    v_new_id, p_actor, p_bond_code, v_name, p_amount, v_yield_bps, v_maturity_amt,
    clock_timestamp(), v_maturity_dt, 'holding', p_idempotency_key, v_tx_id
  );

  RETURN QUERY SELECT v_new_id, v_name, p_amount, v_maturity_amt, v_maturity_dt, v_tx_id;
END;
$$;

ALTER FUNCTION public.bank_purchase_bond(uuid, text, bigint, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.bank_purchase_bond(uuid, text, bigint, uuid) TO moneyverse_app;

-- 7. Procedure: Redeem Matured Virtual Bond
CREATE OR REPLACE FUNCTION public.bank_redeem_bond(
  p_actor uuid,
  p_bond_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  bond_id uuid,
  maturity_amount bigint,
  transaction_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_bond record;
  v_cash_acc uuid;
  v_mint_acc uuid;
  v_tx_id uuid;
BEGIN
  -- 1. Check bond ownership and status
  SELECT * INTO v_bond
  FROM public.virtual_bank_bonds
  WHERE id = p_bond_id AND user_id = p_actor FOR UPDATE;

  IF v_bond IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'bond not found';
  END IF;

  IF v_bond.status = 'redeemed' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'bond already redeemed';
  END IF;

  IF clock_timestamp() < v_bond.maturity_at THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'bond has not reached maturity date yet';
  END IF;

  -- 2. Cash Account & Mint Account
  SELECT a.id INTO v_cash_acc
  FROM public.accounts a
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH' AND a.status = 'active'
  FOR UPDATE;

  SELECT id INTO v_mint_acc FROM public.accounts WHERE system_key = 'mint' AND account_type = 'MINT' AND status = 'active' FOR UPDATE;

  IF v_cash_acc IS NULL OR v_mint_acc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'cash or mint account unavailable';
  END IF;

  -- 3. Post transaction: Mint -> User Cash (Payout principal + interest)
  SELECT public.economy_post_transaction(
    p_idempotency_key, 'BOND_REDEEM', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash_acc, 'amount', v_bond.maturity_amount, 'direction', 'debit'),
      jsonb_build_object('accountId', v_mint_acc, 'amount', v_bond.maturity_amount, 'direction', 'credit')
    ),
    'bank.bond_redeemed',
    jsonb_build_object('bondId', p_bond_id, 'maturityAmount', v_bond.maturity_amount)
  ) INTO v_tx_id;

  -- 4. Update Bond record
  UPDATE public.virtual_bank_bonds
  SET status = 'redeemed',
      redeemed_at = clock_timestamp(),
      redeem_idempotency_key = p_idempotency_key,
      redeem_transaction_id = v_tx_id
  WHERE id = p_bond_id;

  RETURN QUERY SELECT p_bond_id, v_bond.maturity_amount, v_tx_id;
END;
$$;

ALTER FUNCTION public.bank_redeem_bond(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.bank_redeem_bond(uuid, uuid, uuid) TO moneyverse_app;

-- 8. Smart Loan Borrow (with Dynamic Credit Limit Check)
CREATE OR REPLACE FUNCTION public.bank_borrow_smart(
  p_actor uuid,
  p_amount bigint,
  p_idempotency_key uuid
)
RETURNS TABLE(
  loan_id uuid,
  principal_amount bigint,
  interest_amount bigint,
  outstanding_amount bigint,
  transaction_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_credit record;
  v_existing uuid;
  v_interest bigint;
  v_cash_acc uuid;
  v_mint_acc uuid;
  v_tx_id uuid;
  v_new_loan uuid;
BEGIN
  -- 1. Check existing active loan
  SELECT id INTO v_existing FROM public.virtual_bank_loans WHERE user_id = p_actor AND status = 'active';
  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'user already has an active loan. please repay existing loan first.';
  END IF;

  -- 2. Check Credit Limit
  SELECT * INTO v_credit FROM public.bank_calculate_credit_limit(p_actor);
  IF p_amount < 100 OR p_amount > v_credit.total_limit THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'loan amount exceeds evaluated credit limit';
  END IF;

  -- 14-day loan with 1.4% total interest (0.1% daily)
  v_interest := ROUND(p_amount * 0.014);

  -- 3. Accounts
  SELECT a.id INTO v_cash_acc
  FROM public.accounts a
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH' AND a.status = 'active'
  FOR UPDATE;

  SELECT id INTO v_mint_acc FROM public.accounts WHERE system_key = 'mint' AND account_type = 'MINT' AND status = 'active' FOR UPDATE;

  IF v_cash_acc IS NULL OR v_mint_acc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'cash or mint account unavailable';
  END IF;

  -- 4. Post transaction: Mint -> User Cash
  SELECT public.economy_post_transaction(
    p_idempotency_key, 'BANK_LOAN_ISSUED', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash_acc, 'amount', p_amount, 'direction', 'debit'),
      jsonb_build_object('accountId', v_mint_acc, 'amount', p_amount, 'direction', 'credit')
    ),
    'bank.smart_loan_issued',
    jsonb_build_object('principal', p_amount, 'interest', v_interest)
  ) INTO v_tx_id;

  -- 5. Insert Loan
  v_new_loan := gen_random_uuid();
  INSERT INTO public.virtual_bank_loans (
    id, borrow_idempotency_key, user_id, principal_amount, interest_amount,
    outstanding_amount, status, issued_at
  ) VALUES (
    v_new_loan, p_idempotency_key, p_actor, p_amount, v_interest,
    p_amount + v_interest, 'active', clock_timestamp()
  );

  RETURN QUERY SELECT v_new_loan, p_amount, v_interest, (p_amount + v_interest), v_tx_id;
END;
$$;

ALTER FUNCTION public.bank_borrow_smart(uuid, bigint, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.bank_borrow_smart(uuid, bigint, uuid) TO moneyverse_app;
