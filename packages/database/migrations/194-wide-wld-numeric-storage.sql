-- v2026.09.15.118 — wide WLD storage foundation.
-- Monetary magnitude is not bounded by bigint/JS Number. WLD remains an exact integer.
BEGIN;

DROP VIEW IF EXISTS public.v_daily_economy_stats;
DROP VIEW IF EXISTS public.v_economy_summary;

ALTER TABLE public.account_balances ALTER COLUMN available_amount TYPE numeric USING available_amount::numeric;
ALTER TABLE public.ledger_postings ALTER COLUMN amount TYPE numeric USING amount::numeric;
ALTER TABLE public.virtual_bank_loans ALTER COLUMN principal_amount TYPE numeric USING principal_amount::numeric;
ALTER TABLE public.virtual_bank_loans ALTER COLUMN interest_amount TYPE numeric USING interest_amount::numeric;
ALTER TABLE public.virtual_bank_loans ALTER COLUMN outstanding_amount TYPE numeric USING outstanding_amount::numeric;
ALTER TABLE public.virtual_bank_loans ALTER COLUMN minimum_repayment TYPE numeric USING minimum_repayment::numeric;
ALTER TABLE public.virtual_bank_loan_repayments ALTER COLUMN amount TYPE numeric USING amount::numeric;
ALTER TABLE public.virtual_bank_interest_accruals ALTER COLUMN principal_amount TYPE numeric USING principal_amount::numeric;
ALTER TABLE public.virtual_bank_interest_accruals ALTER COLUMN interest_amount TYPE numeric USING interest_amount::numeric;
ALTER TABLE public.virtual_bank_deposit_trackers ALTER COLUMN total_interest_claimed TYPE numeric USING total_interest_claimed::numeric;
ALTER TABLE public.bank_credit_policies ALTER COLUMN credit_limit TYPE numeric USING credit_limit::numeric;
ALTER TABLE public.bank_credit_policies ALTER COLUMN minimum_repayment TYPE numeric USING minimum_repayment::numeric;

DO $do$
DECLARE r record;
BEGIN
  FOR r IN SELECT column_name FROM information_schema.columns
           WHERE table_schema='public' AND table_name='economy_reconciliation_snapshots'
             AND data_type='numeric' AND numeric_precision=38 AND numeric_scale=0
  LOOP
    EXECUTE format('ALTER TABLE public.economy_reconciliation_snapshots ALTER COLUMN %I TYPE numeric USING %I::numeric', r.column_name, r.column_name);
  END LOOP;
END
$do$;

CREATE OR REPLACE FUNCTION public.economy_post_transaction(p_key uuid, p_type text, p_actor uuid, p_policy text, p_postings jsonb, p_event text, p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_transaction_id uuid;
  v_existing_hash bytea;
  v_existing_hash_version smallint;
  v_request_hash bytea;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_debit_total numeric;
  v_credit_total numeric;
  v_expected_account_count integer;
  v_locked_account_count integer;
  v_updated_balance_count integer;
  v_invalid_balance boolean;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_type IS NULL OR btrim(p_type) = ''
    OR p_event IS NULL OR btrim(p_event) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'transaction identity is required';
  END IF;

  IF jsonb_typeof(p_postings) IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_postings) < 2 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'at least two postings required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_postings) AS posting
    WHERE jsonb_typeof(posting) <> 'object'
      OR nullif(posting ->> 'accountId', '') IS NULL
      OR coalesce(posting ->> 'direction', '') NOT IN ('debit', 'credit')
      OR coalesce(posting ->> 'amount', '') !~ '^[1-9][0-9]*$'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid ledger posting';
  END IF;

  SELECT
    coalesce(sum((posting ->> 'amount')::numeric)
      FILTER (WHERE posting ->> 'direction' = 'debit'), 0),
    coalesce(sum((posting ->> 'amount')::numeric)
      FILTER (WHERE posting ->> 'direction' = 'credit'), 0)
  INTO v_debit_total, v_credit_total
  FROM jsonb_array_elements(p_postings) AS posting;

  IF v_debit_total <> v_credit_total OR v_debit_total <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unbalanced ledger transaction';
  END IF;

  v_request_hash := public.digest(
    jsonb_build_object(
      'type', p_type,
      'actorUserId', p_actor,
      'policyVersion', p_policy,
      'postings', p_postings,
      'eventType', p_event,
      'eventPayload', v_payload
    )::text,
    'sha256'
  );

  SELECT id, request_hash, request_hash_version
  INTO v_transaction_id, v_existing_hash, v_existing_hash_version
  FROM public.ledger_transactions
  WHERE idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_hash_version <> 1
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different request';
    END IF;
    RETURN v_transaction_id;
  END IF;

  -- PostgreSQL waits for an in-flight conflicting insert before DO NOTHING.
  -- A second read therefore returns the first committed receipt rather than a
  -- unique-key error when identical requests arrive concurrently.
  INSERT INTO public.ledger_transactions (
    idempotency_key,
    request_hash,
    request_hash_version,
    type,
    actor_user_id,
    policy_version
  ) VALUES (
    p_key,
    v_request_hash,
    1,
    p_type,
    p_actor,
    p_policy
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_transaction_id;

  IF v_transaction_id IS NULL THEN
    SELECT id, request_hash, request_hash_version
    INTO v_transaction_id, v_existing_hash, v_existing_hash_version
    FROM public.ledger_transactions
    WHERE idempotency_key = p_key;

    IF NOT FOUND
      OR v_existing_hash_version <> 1
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different request';
    END IF;
    RETURN v_transaction_id;
  END IF;

  SELECT count(*)
  INTO v_expected_account_count
  FROM (
    SELECT DISTINCT (posting ->> 'accountId')::uuid AS account_id
    FROM jsonb_array_elements(p_postings) AS posting
  ) AS posting_accounts;

  PERFORM account.id
  FROM public.accounts AS account
  JOIN (
    SELECT DISTINCT (posting ->> 'accountId')::uuid AS account_id
    FROM jsonb_array_elements(p_postings) AS posting
  ) AS posting_accounts ON posting_accounts.account_id = account.id
  WHERE account.status = 'active'::public.account_status
  ORDER BY account.id
  FOR UPDATE OF account;
  GET DIAGNOSTICS v_locked_account_count = ROW_COUNT;

  IF v_locked_account_count <> v_expected_account_count THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown or inactive account';
  END IF;

  INSERT INTO public.ledger_postings (
    transaction_id,
    account_id,
    amount,
    direction
  )
  SELECT
    v_transaction_id,
    (posting ->> 'accountId')::uuid,
    (posting ->> 'amount')::numeric,
    (posting ->> 'direction')::public.posting_direction
  FROM jsonb_array_elements(p_postings) AS posting;

  UPDATE public.account_balances AS balance
  SET available_amount = balance.available_amount + delta.delta,
      updated_at = now()
  FROM (
    SELECT
      (posting ->> 'accountId')::uuid AS account_id,
      sum(
        CASE posting ->> 'direction'
          WHEN 'debit' THEN (posting ->> 'amount')::numeric
          ELSE -(posting ->> 'amount')::numeric
        END
      ) AS delta
    FROM jsonb_array_elements(p_postings) AS posting
    GROUP BY 1
  ) AS delta
  WHERE balance.account_id = delta.account_id;
  GET DIAGNOSTICS v_updated_balance_count = ROW_COUNT;

  IF v_updated_balance_count <> v_expected_account_count THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'account balance row is missing';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.account_balances AS balance
    JOIN public.accounts AS account ON account.id = balance.account_id
    JOIN (
      SELECT DISTINCT (posting ->> 'accountId')::uuid AS account_id
      FROM jsonb_array_elements(p_postings) AS posting
    ) AS posting_accounts ON posting_accounts.account_id = account.id
    WHERE balance.available_amount < 0
      AND NOT account.allow_negative
  ) INTO v_invalid_balance;

  IF v_invalid_balance THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient balance';
  END IF;

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (v_transaction_id, p_event, v_payload);

  RETURN v_transaction_id;
END;
$function$;


ALTER FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) FROM PUBLIC, moneyverse_app;
-- ledger primitive intentionally remains unavailable to moneyverse_app

DROP FUNCTION public.economy_transfer(uuid,uuid,uuid,bigint);

CREATE OR REPLACE FUNCTION public.economy_transfer(p_key uuid, p_actor uuid, p_recipient uuid, p_amount numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_from_account_id uuid;
  v_to_account_id uuid;
  v_transaction_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_recipient IS NULL
    OR p_actor = p_recipient OR p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid transfer';
  END IF;

  SELECT account.id
  INTO v_from_account_id
  FROM public.accounts AS account
  JOIN public.users AS user_row ON user_row.id = account.owner_user_id
  WHERE account.owner_user_id = p_actor
    AND account.account_type = 'USER_CASH'::public.account_type
    AND account.status = 'active'::public.account_status
    AND user_row.status = 'active'::public.user_status;

  SELECT account.id
  INTO v_to_account_id
  FROM public.accounts AS account
  JOIN public.users AS user_row ON user_row.id = account.owner_user_id
  WHERE account.owner_user_id = p_recipient
    AND account.account_type = 'USER_CASH'::public.account_type
    AND account.status = 'active'::public.account_status
    AND user_row.status = 'active'::public.user_status;

  IF v_from_account_id IS NULL OR v_to_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key,
    'USER_TO_USER',
    p_actor,
    NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_from_account_id, 'amount', p_amount, 'direction', 'credit'),
      jsonb_build_object('accountId', v_to_account_id, 'amount', p_amount, 'direction', 'debit')
    ),
    'wallet.transfer.completed',
    jsonb_build_object('fromUserId', p_actor, 'toUserId', p_recipient, 'amount', p_amount)
  ) INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$function$;


ALTER FUNCTION public.economy_transfer(uuid,uuid,uuid,numeric) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_transfer(uuid,uuid,uuid,numeric) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_transfer(uuid,uuid,uuid,numeric) TO moneyverse_app;

DROP FUNCTION public.bank_move_balance(uuid,uuid,text,bigint);

CREATE OR REPLACE FUNCTION public.bank_move_balance(p_key uuid, p_actor uuid, p_direction text, p_amount numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_cash uuid;
  v_bank uuid;
  v_transaction uuid;
  v_replayed boolean := false;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL
     OR p_direction NOT IN ('deposit', 'withdraw')
     OR p_amount < 1 OR p_amount <> pg_catalog.trunc(p_amount) THEN
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
$function$;


ALTER FUNCTION public.bank_move_balance(uuid,uuid,text,numeric) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_move_balance(uuid,uuid,text,numeric) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_move_balance(uuid,uuid,text,numeric) TO moneyverse_app;

DROP FUNCTION public.bank_borrow(uuid,uuid,bigint);
DROP FUNCTION IF EXISTS public.bank_borrow(uuid,uuid,numeric);
CREATE OR REPLACE FUNCTION public.bank_borrow(p_key uuid, p_actor uuid, p_principal numeric)
 RETURNS TABLE(loan_id uuid, principal_amount numeric, interest_amount numeric, outstanding_amount numeric, transaction_id uuid, replayed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_cash uuid;
  v_mint uuid;
  v_loan uuid;
  v_interest numeric;
  v_transaction uuid;
  v_existing_user_id uuid;
  v_grade text;
  v_term integer;
  v_minimum numeric;
  v_limit numeric;
  v_rate integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_principal < 100 OR p_principal <> pg_catalog.trunc(p_principal) THEN
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
  SELECT policy_row.term_days, policy_row.minimum_repayment,
         policy_row.credit_limit, policy_row.interest_bps
  INTO v_term, v_minimum, v_limit, v_rate
  FROM public.bank_credit_policies AS policy_row
  WHERE policy_row.grade = v_grade;

  -- The ceiling. A grade with no policy row at all is treated as lending
  -- nothing rather than as lending without limit: a missing row is a
  -- deployment that has not finished, and the safe reading of it is no.
  IF coalesce(v_limit, 0) <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'this credit grade may not borrow yet';
  END IF;

  IF p_principal > v_limit THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the amount is above this credit grade''s limit';
  END IF;

  -- The grade's rate. 500 bps is the fallback, which is the flat rate every
  -- loan carried before this migration -- so a policy row missing a rate
  -- cannot make borrowing free.
  v_interest := ceil(p_principal * coalesce(v_rate, 500)::numeric / 10000);

  SELECT public.economy_post_transaction(
    p_key, 'BANK_LOAN_ISSUED', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', p_principal, 'direction', 'debit'),
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', p_principal, 'direction', 'credit')
    ),
    'bank.loan.issued',
    pg_catalog.jsonb_build_object(
      'principal', p_principal, 'interest', v_interest,
      'grade', v_grade, 'interestBps', coalesce(v_rate, 500)
    )
  ) INTO v_transaction;

  INSERT INTO public.virtual_bank_loans (
    borrow_idempotency_key, user_id, principal_amount, interest_amount,
    outstanding_amount, status, credit_grade, maturity_at, minimum_repayment,
    transaction_id
  ) VALUES (
    p_key, p_actor, p_principal, v_interest, p_principal + v_interest, 'active',
    v_grade,
    pg_catalog.clock_timestamp() + pg_catalog.make_interval(days => coalesce(v_term, 30)),
    coalesce(v_minimum, 0),
    v_transaction
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
$function$;


ALTER FUNCTION public.bank_borrow(uuid,uuid,numeric) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_borrow(uuid,uuid,numeric) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_borrow(uuid,uuid,numeric) TO moneyverse_app;

DROP FUNCTION public.bank_repay(uuid,uuid,uuid,bigint);
DROP FUNCTION IF EXISTS public.bank_repay(uuid,uuid,uuid,numeric);
CREATE OR REPLACE FUNCTION public.bank_repay(p_key uuid, p_actor uuid, p_loan uuid, p_amount numeric)
 RETURNS TABLE(loan_id uuid, paid_amount numeric, outstanding_amount numeric, transaction_id uuid, replayed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_cash uuid;
  v_mint uuid;
  v_outstanding numeric;
  v_status text;
  v_paid numeric;
  v_transaction uuid;
  v_existing_user_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_loan IS NULL
    OR p_amount < 1 OR p_amount <> pg_catalog.trunc(p_amount) THEN
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
$function$;


ALTER FUNCTION public.bank_repay(uuid,uuid,uuid,numeric) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_repay(uuid,uuid,uuid,numeric) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_repay(uuid,uuid,uuid,numeric) TO moneyverse_app;

DROP FUNCTION public.bank_claim_compound_interest(uuid,uuid);
CREATE OR REPLACE FUNCTION public.bank_claim_compound_interest(p_actor uuid, p_idempotency_key uuid)
 RETURNS TABLE(claimed_amount numeric, new_bank_balance numeric, transaction_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_bank numeric := 0;
  v_bank_acc uuid;
  v_mint_acc uuid;
  v_tracker record;
  v_hours_since numeric := 0;
  v_rate_bps integer := 0;
  v_interest numeric := 0;
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
  );

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
$function$;


ALTER FUNCTION public.bank_claim_compound_interest(uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_claim_compound_interest(uuid,uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_claim_compound_interest(uuid,uuid) TO moneyverse_app;

DROP FUNCTION public.bank_my_loans(uuid);
CREATE OR REPLACE FUNCTION public.bank_my_loans(p_actor uuid)
 RETURNS TABLE(loan_id uuid, principal_amount numeric, interest_amount numeric, outstanding_amount numeric, status text, issued_at timestamp with time zone, repaid_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  SELECT id, principal_amount, interest_amount, outstanding_amount, status, issued_at, repaid_at
  FROM public.virtual_bank_loans WHERE user_id=p_actor ORDER BY issued_at DESC, id DESC LIMIT 20
$function$;


ALTER FUNCTION public.bank_my_loans(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_my_loans(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_my_loans(uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_get_my_standing(p_actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_cash numeric := 0;
  v_bank numeric := 0;
  v_grade text := 'new';
  v_credit_limit numeric := 0;
  v_loan_interest_bps integer := 0;
  v_loan_term_days integer := 30;
  v_minimum_repayment numeric := 0;
  v_active_loan record;
  v_bonds jsonb;
  v_unclaimed_interest numeric := 0;
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
      );
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
$function$;


ALTER FUNCTION public.bank_get_my_standing(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_get_my_standing(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_get_my_standing(uuid) TO moneyverse_app;

CREATE VIEW public.v_daily_economy_stats AS
 WITH daily_postings AS (
         SELECT date_trunc('day'::text, (p.created_at AT TIME ZONE 'Asia/Seoul'::text))::date AS stat_date,
            a.account_type,
            a.system_key,
            p.direction,
            p.amount
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
        )
 SELECT stat_date,
    COALESCE(sum(
        CASE
            WHEN system_key = 'mint'::text AND direction = 'credit'::posting_direction THEN amount
            ELSE 0::bigint
        END), 0::numeric) AS faucet_amount,
    COALESCE(sum(
        CASE
            WHEN system_key = 'sink'::text AND direction = 'debit'::posting_direction THEN amount
            ELSE 0::bigint
        END), 0::numeric) AS sink_amount,
    COALESCE(sum(
        CASE
            WHEN system_key = 'treasury'::text AND direction = 'debit'::posting_direction THEN amount
            ELSE 0::bigint
        END), 0::numeric) AS tax_amount,
    COALESCE(sum(
        CASE
            WHEN system_key = 'mint'::text AND direction = 'credit'::posting_direction THEN amount
            ELSE 0::bigint
        END), 0::numeric) - COALESCE(sum(
        CASE
            WHEN system_key = 'sink'::text AND direction = 'debit'::posting_direction THEN amount
            ELSE 0::bigint
        END), 0::numeric) AS net_change,
        CASE
            WHEN COALESCE(sum(
            CASE
                WHEN system_key = 'mint'::text AND direction = 'credit'::posting_direction THEN amount
                ELSE 0::bigint
            END), 0::numeric) > 0::numeric THEN round(COALESCE(sum(
            CASE
                WHEN system_key = 'sink'::text AND direction = 'debit'::posting_direction THEN amount
                ELSE 0::bigint
            END), 0::numeric) / COALESCE(sum(
            CASE
                WHEN system_key = 'mint'::text AND direction = 'credit'::posting_direction THEN amount
                ELSE 0::bigint
            END), 1::numeric) * 100::numeric, 2)
            ELSE 0::numeric
        END AS sink_ratio_percent
   FROM daily_postings
  GROUP BY stat_date
  ORDER BY stat_date DESC;

CREATE VIEW public.v_economy_summary AS
 SELECT COALESCE(( SELECT sum(p.amount) AS sum
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
          WHERE a.system_key = 'mint'::text AND p.direction = 'credit'::posting_direction), 0::numeric) AS total_minted,
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
          WHERE a.system_key = 'sink'::text AND p.direction = 'debit'::posting_direction), 0::numeric) AS total_burned,
    COALESCE((( SELECT sum(p.amount) AS sum
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
          WHERE a.account_type = 'USER_CASH'::account_type AND p.direction = 'debit'::posting_direction)) - (( SELECT sum(p.amount) AS sum
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
          WHERE a.account_type = 'USER_CASH'::account_type AND p.direction = 'credit'::posting_direction)), 0::numeric) AS total_circulating,
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
          WHERE a.system_key = 'mint'::text AND p.direction = 'credit'::posting_direction AND p.created_at >= date_trunc('day'::text, (now() AT TIME ZONE 'Asia/Seoul'::text))), 0::numeric) AS today_minted,
    COALESCE(( SELECT sum(p.amount) AS sum
           FROM ledger_postings p
             JOIN accounts a ON a.id = p.account_id
          WHERE a.system_key = 'sink'::text AND p.direction = 'debit'::posting_direction AND p.created_at >= date_trunc('day'::text, (now() AT TIME ZONE 'Asia/Seoul'::text))), 0::numeric) AS today_burned;


COMMIT;
