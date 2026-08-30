-- Growth stages, credit grades, and teaching the loan functions about
-- `overdue`.
--
-- 076 adds a third loan status. Every function written before it -- all of
-- them in 035 and 045 -- tests `status = 'active'`, which would have made an
-- overdue loan unrepayable by its borrower while no longer counting as a
-- loan. Defaulting would have been strictly better than repaying. Both
-- functions are redefined here, in the same migration that introduces the
-- status, because an applied migration cannot be corrected in place.
--
-- What is NOT applied yet: `bank_credit_policies.credit_limit` and
-- `interest_bps`. The seeded 'new' grade carries a limit of zero, so applying
-- it would silently take borrowing away from every member who has not yet
-- completed ten tasks -- a capability they have today. Tightening the ceiling
-- is a product decision and belongs in a change that says so out loud. The
-- grade, the term and the minimum repayment are recorded on every new loan
-- from here, which is what the maturity sweep in 078 needs.

BEGIN;

CREATE OR REPLACE FUNCTION public.progression_refresh(p_actor uuid)
RETURNS TABLE(stage_code text, next_stage_code text, requirements jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_stage text;
  v_completions integer;
  v_job_level integer;
  v_businesses integer;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  SELECT count(*) INTO v_completions
  FROM public.work_reward_receipts AS receipt_row
  WHERE receipt_row.user_id = p_actor;

  -- All three requirements, not just the first. `jobLevel` and `businesses`
  -- were advertised in the stage payload and never read, so a member who met
  -- them was still refused with no way to tell why.
  SELECT coalesce(max(progress_row.level), 0) INTO v_job_level
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor;

  SELECT count(*) INTO v_businesses
  FROM public.virtual_business_ownerships AS ownership_row
  WHERE ownership_row.user_id = p_actor;

  SELECT stage_row.code INTO v_stage
  FROM public.progression_stages AS stage_row
  WHERE coalesce((stage_row.unlock_requirements ->> 'workCompletions')::integer, 0) <= v_completions
    AND coalesce((stage_row.unlock_requirements ->> 'jobLevel')::integer, 0) <= v_job_level
    AND coalesce((stage_row.unlock_requirements ->> 'businesses')::integer, 0) <= v_businesses
  ORDER BY stage_row.ordinal DESC
  LIMIT 1;

  v_stage := coalesce(v_stage, 'starter');

  -- A stage is never taken back. Losing a business or a job level would
  -- otherwise demote a member who had already been told they had arrived, and
  -- `reached_at` would move to the day of the demotion.
  INSERT INTO public.user_progression (user_id, stage_code)
  VALUES (p_actor, v_stage)
  ON CONFLICT (user_id) DO UPDATE
  SET stage_code = CASE
        WHEN (SELECT stage_row.ordinal FROM public.progression_stages AS stage_row
              WHERE stage_row.code = excluded.stage_code)
           > (SELECT stage_row.ordinal FROM public.progression_stages AS stage_row
              WHERE stage_row.code = user_progression.stage_code)
        THEN excluded.stage_code
        ELSE user_progression.stage_code
      END,
      reached_at = CASE
        WHEN (SELECT stage_row.ordinal FROM public.progression_stages AS stage_row
              WHERE stage_row.code = excluded.stage_code)
           > (SELECT stage_row.ordinal FROM public.progression_stages AS stage_row
              WHERE stage_row.code = user_progression.stage_code)
        THEN pg_catalog.clock_timestamp()
        ELSE user_progression.reached_at
      END,
      updated_at = pg_catalog.clock_timestamp();

  SELECT progression_row.stage_code INTO v_stage
  FROM public.user_progression AS progression_row
  WHERE progression_row.user_id = p_actor;

  RETURN QUERY
  SELECT stage_row.code, next_row.code, next_row.unlock_requirements
  FROM public.progression_stages AS stage_row
  LEFT JOIN public.progression_stages AS next_row ON next_row.ordinal = stage_row.ordinal + 1
  WHERE stage_row.code = v_stage;
END;
$$;

-- Account age in whole days, measured on the clock the rest of the schema
-- uses. Subtracting two dates cast in the session timezone put the answer up
-- to a day out depending on who was connected.
CREATE OR REPLACE FUNCTION public.bank_credit_grade(p_actor uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT policy_row.grade
  FROM public.bank_credit_policies AS policy_row
  CROSS JOIN public.users AS user_row
  WHERE policy_row.active
    AND user_row.id = p_actor
    AND user_row.status = 'active'::public.user_status
    AND policy_row.minimum_account_days <= (
      (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date
      - (user_row.created_at AT TIME ZONE 'Asia/Seoul')::date
    )
    AND policy_row.minimum_work_completions <= (
      SELECT count(*) FROM public.work_reward_receipts AS receipt_row
      WHERE receipt_row.user_id = p_actor
    )
  ORDER BY policy_row.credit_limit DESC
  LIMIT 1
$$;

-- 045's body, with three changes: an overdue loan blocks a new one, the grade
-- and its term are recorded, and every column is qualified.
CREATE OR REPLACE FUNCTION public.bank_borrow(
  p_key uuid,
  p_actor uuid,
  p_principal bigint
)
RETURNS TABLE(
  loan_id uuid,
  principal_amount bigint,
  interest_amount bigint,
  outstanding_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_cash uuid;
  v_mint uuid;
  v_loan uuid;
  v_interest bigint;
  v_transaction uuid;
  v_existing_user_id uuid;
  v_grade text;
  v_term integer;
  v_minimum bigint;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_principal < 100 OR p_principal > 500000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid loan amount';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:bank-borrow:' || p_key::text, 0)
  );

  SELECT loan_row.id, loan_row.user_id, loan_row.principal_amount,
         loan_row.interest_amount, loan_row.outstanding_amount
  INTO v_loan, v_existing_user_id, principal_amount, interest_amount, outstanding_amount
  FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.borrow_idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'loan receipt belongs to another user';
    END IF;
    SELECT transaction_row.id INTO transaction_id
    FROM public.ledger_transactions AS transaction_row
    WHERE transaction_row.idempotency_key = p_key;
    loan_id := v_loan;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  PERFORM loan_row.id FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.user_id = p_actor AND loan_row.status IN ('active', 'overdue')
  FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an outstanding loan already exists';
  END IF;

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active loan accounts required';
  END IF;

  v_grade := coalesce(public.bank_credit_grade(p_actor), 'new');
  SELECT policy_row.term_days, policy_row.minimum_repayment INTO v_term, v_minimum
  FROM public.bank_credit_policies AS policy_row
  WHERE policy_row.grade = v_grade;

  v_interest := ceil(p_principal * 0.05)::bigint;

  SELECT public.economy_post_transaction(
    p_key, 'BANK_LOAN_ISSUED', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', p_principal, 'direction', 'debit'),
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', p_principal, 'direction', 'credit')
    ),
    'bank.loan.issued',
    pg_catalog.jsonb_build_object('principal', p_principal, 'interest', v_interest, 'grade', v_grade)
  ) INTO v_transaction;

  INSERT INTO public.virtual_bank_loans (
    borrow_idempotency_key, user_id, principal_amount, interest_amount,
    outstanding_amount, status, credit_grade, maturity_at, minimum_repayment
  ) VALUES (
    p_key, p_actor, p_principal, v_interest, p_principal + v_interest, 'active',
    v_grade,
    pg_catalog.clock_timestamp() + pg_catalog.make_interval(days => coalesce(v_term, 30)),
    coalesce(v_minimum, 0)
  )
  RETURNING virtual_bank_loans.id INTO v_loan;

  loan_id := v_loan;
  principal_amount := p_principal;
  interest_amount := v_interest;
  outstanding_amount := p_principal + v_interest;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$$;

-- 045's body, accepting an overdue loan. A partial repayment leaves an
-- overdue loan overdue; paying it off closes it either way.
CREATE OR REPLACE FUNCTION public.bank_repay(
  p_key uuid,
  p_actor uuid,
  p_loan uuid,
  p_amount bigint
)
RETURNS TABLE(
  loan_id uuid,
  paid_amount bigint,
  outstanding_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_cash uuid;
  v_mint uuid;
  v_outstanding bigint;
  v_status text;
  v_paid bigint;
  v_transaction uuid;
  v_existing_user_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_loan IS NULL
    OR p_amount < 1 OR p_amount > 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid loan repayment';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:bank-repay:' || p_key::text, 0)
  );

  SELECT repayment_row.loan_id, loan_row.user_id, repayment_row.amount,
         loan_row.outstanding_amount, repayment_row.transaction_id
  INTO loan_id, v_existing_user_id, paid_amount, outstanding_amount, transaction_id
  FROM public.virtual_bank_loan_repayments AS repayment_row
  JOIN public.virtual_bank_loans AS loan_row ON loan_row.id = repayment_row.loan_id
  WHERE repayment_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'loan repayment receipt belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT loan_row.outstanding_amount, loan_row.status
  INTO v_outstanding, v_status
  FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.id = p_loan AND loan_row.user_id = p_actor
    AND loan_row.status IN ('active', 'overdue')
  FOR UPDATE;

  IF v_outstanding IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an outstanding loan is required';
  END IF;

  v_paid := least(p_amount, v_outstanding);

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active loan accounts required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key, 'BANK_LOAN_REPAYMENT', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_paid, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_paid, 'direction', 'debit')
    ),
    'bank.loan.repaid',
    pg_catalog.jsonb_build_object('loanId', p_loan, 'amount', v_paid)
  ) INTO v_transaction;

  UPDATE public.virtual_bank_loans AS loan_row
  SET outstanding_amount = v_outstanding - v_paid,
      status = CASE WHEN v_outstanding = v_paid THEN 'repaid' ELSE v_status END,
      repaid_at = CASE WHEN v_outstanding = v_paid THEN pg_catalog.clock_timestamp() ELSE NULL END
  WHERE loan_row.id = p_loan;

  INSERT INTO public.virtual_bank_loan_repayments (idempotency_key, loan_id, amount, transaction_id)
  VALUES (p_key, p_loan, v_paid, v_transaction);

  loan_id := p_loan;
  paid_amount := v_paid;
  outstanding_amount := v_outstanding - v_paid;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.progression_refresh(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_credit_grade(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_borrow(uuid, uuid, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_repay(uuid, uuid, uuid, bigint) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.progression_refresh(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_credit_grade(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_borrow(uuid, uuid, bigint) FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_repay(uuid, uuid, uuid, bigint) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.progression_refresh(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_credit_grade(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_borrow(uuid, uuid, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_repay(uuid, uuid, uuid, bigint) TO moneyverse_app;

COMMIT;
