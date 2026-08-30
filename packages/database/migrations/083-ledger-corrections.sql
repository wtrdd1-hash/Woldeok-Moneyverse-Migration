-- Correcting the ledger without rewriting it, and freezing an account.
--
-- `ADMIN_ADJUSTMENT` has been a label in the wallet screen since the original
-- application and nothing has ever produced one. This is the producer: a
-- correction is a NEW transaction whose postings are the original's with the
-- directions swapped, linked to it by `reverses_transaction_id`. The old
-- transaction is not touched, which is what the ledger's whole design assumes
-- -- `ledger_postings.amount` is CHECKed positive, so a negative correcting
-- posting was never possible anyway.
--
-- WHAT MAY NOT BE REVERSED. Money is only half of most transactions: a loan
-- issue has a loan row, a purchase has a receipt, a casino play has a play.
-- Reversing the money and leaving the record produces a loan nobody owes and
-- an item nobody paid for. The guard reads `pg_constraint` rather than a list,
-- so a table added later cannot quietly fall outside it -- there is no test
-- that would notice a stale list, and there will be more such tables.
--
-- That only works if the record actually names its transaction. Every such
-- table does except `virtual_bank_loans`, which since 035 has carried only
-- `borrow_idempotency_key` -- the same value as the transaction's
-- `idempotency_key`, so the link exists but no constraint expresses it, and
-- the walk cannot see it. Issuing a loan was therefore the one correction the
-- guard would have allowed, and it is the worst one. The column below closes
-- that, and closes it structurally, so the guard stays a walk and not a list.
--
-- Freezing needs no enforcement written for it: `account_status` has carried
-- 'frozen' since init/001 and `economy_post_transaction` only ever locks
-- accounts whose status is 'active'. What was missing was the command.

BEGIN;

ALTER TABLE public.ledger_transactions
  ADD COLUMN IF NOT EXISTS reverses_transaction_id uuid REFERENCES public.ledger_transactions(id);

-- Once. A second correction of the same transaction is a correction of the
-- correction, and has to say so.
CREATE UNIQUE INDEX IF NOT EXISTS ledger_transactions_one_reversal
  ON public.ledger_transactions (reverses_transaction_id)
  WHERE reverses_transaction_id IS NOT NULL;

-- The loan's missing link to the transaction that paid it out. Backfilled by
-- the natural key the two have always shared, which is unique on both sides.
ALTER TABLE public.virtual_bank_loans
  ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.ledger_transactions(id);

UPDATE public.virtual_bank_loans AS loan_row
SET transaction_id = transaction_row.id
FROM public.ledger_transactions AS transaction_row
WHERE transaction_row.idempotency_key = loan_row.borrow_idempotency_key
  AND loan_row.transaction_id IS NULL;

-- Which tables hold a record that names this transaction. `ledger_postings`
-- is excluded: every transaction has postings, and they are the transaction.
CREATE OR REPLACE FUNCTION public.economy_transaction_dependents(p_transaction uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reference record;
  v_found boolean;
  v_tables text[] := ARRAY[]::text[];
BEGIN
  FOR v_reference IN
    SELECT source_table.relname AS table_name, source_column.attname AS column_name
    FROM pg_catalog.pg_constraint AS constraint_row
    JOIN pg_catalog.pg_class AS source_table ON source_table.oid = constraint_row.conrelid
    JOIN pg_catalog.pg_attribute AS source_column
      ON source_column.attrelid = constraint_row.conrelid
      AND source_column.attnum = constraint_row.conkey[1]
    WHERE constraint_row.contype = 'f'
      AND constraint_row.confrelid = 'public.ledger_transactions'::pg_catalog.regclass
      AND source_table.relname <> 'ledger_postings'
      AND pg_catalog.array_length(constraint_row.conkey, 1) = 1
  LOOP
    EXECUTE pg_catalog.format(
      'SELECT EXISTS (SELECT 1 FROM public.%I WHERE %I = $1)',
      v_reference.table_name, v_reference.column_name
    ) INTO v_found USING p_transaction;

    IF v_found THEN
      v_tables := v_tables || v_reference.table_name;
    END IF;
  END LOOP;

  RETURN v_tables;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_reverse_transaction(
  p_key uuid,
  p_actor uuid,
  p_transaction uuid,
  p_reason text
)
RETURNS TABLE(
  transaction_id uuid,
  reverses_transaction_id uuid,
  amount bigint,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_reason text;
  v_type text;
  v_subject uuid;
  v_dependents text[];
  v_postings jsonb;
  v_amount bigint;
  v_new uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_transaction IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key, actor and transaction are required';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy_reverse_transaction:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT
      (v_existing.result ->> 'transactionId')::uuid,
      (v_existing.result ->> 'reversesTransactionId')::uuid,
      (v_existing.result ->> 'amount')::bigint,
      true;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT transaction_row.type, transaction_row.actor_user_id
  INTO v_type, v_subject
  FROM public.ledger_transactions AS transaction_row
  WHERE transaction_row.id = p_transaction
  FOR UPDATE;

  IF v_type IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown transaction';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.ledger_transactions AS transaction_row
    WHERE transaction_row.reverses_transaction_id = p_transaction
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this transaction has already been corrected';
  END IF;

  v_dependents := public.economy_transaction_dependents(p_transaction);
  IF pg_catalog.array_length(v_dependents, 1) IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'this transaction has records that would be left behind: '
        || pg_catalog.array_to_string(v_dependents, ', ');
  END IF;

  SELECT pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'accountId', posting_row.account_id,
             'amount', posting_row.amount,
             'direction', CASE posting_row.direction
                            WHEN 'debit'::public.posting_direction THEN 'credit'
                            ELSE 'debit'
                          END
           )
         ),
         coalesce(sum(posting_row.amount)
           FILTER (WHERE posting_row.direction = 'debit'::public.posting_direction), 0)
  INTO v_postings, v_amount
  FROM public.ledger_postings AS posting_row
  WHERE posting_row.transaction_id = p_transaction;

  IF v_postings IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the transaction has no postings';
  END IF;

  -- The same key for the receipt and the ledger transaction, as every other
  -- command in this schema does: one key, one effect.
  SELECT public.economy_post_transaction(
    p_key,
    'ADMIN_ADJUSTMENT',
    p_actor,
    NULL,
    v_postings,
    'economy.transaction.reversed',
    pg_catalog.jsonb_build_object('reverses', p_transaction, 'originalType', v_type)
  ) INTO v_new;

  UPDATE public.ledger_transactions AS transaction_row
  SET reverses_transaction_id = p_transaction
  WHERE transaction_row.id = v_new;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'economy.transaction.reversed', p_transaction, v_reason,
    pg_catalog.jsonb_build_object(
      'transactionId', v_new, 'reversesTransactionId', p_transaction, 'amount', v_amount
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor,
    'economy.transaction.reversed',
    p_transaction,
    p_key,
    pg_catalog.jsonb_build_object(
      'originalType', v_type, 'amount', v_amount, 'correctionId', v_new
    ),
    pg_catalog.jsonb_build_object(
      'feature', 'economy',
      'targetKind', 'ledger_transaction',
      'reason', v_reason,
      'originTransactionId', p_transaction,
      'correctionTransactionId', v_new,
      'amount', v_amount,
      'subjectUserId', v_subject,
      'outcome', 'success'
    )
  );

  RETURN QUERY SELECT v_new, p_transaction, v_amount, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_account_status(
  p_key uuid,
  p_actor uuid,
  p_account uuid,
  p_status text,
  p_reason text
)
RETURNS TABLE(account_id uuid, previous_status text, next_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_reason text;
  v_status public.account_status;
  v_previous public.account_status;
  v_owner uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_account IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key, actor and account are required';
  END IF;

  IF coalesce(p_status, '') NOT IN ('active', 'frozen') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'status must be active or frozen';
  END IF;
  v_status := p_status::public.account_status;
  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_set_account_status:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT
      (v_existing.result ->> 'accountId')::uuid,
      v_existing.result ->> 'previousStatus',
      v_existing.result ->> 'nextStatus';
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT account_row.status, account_row.owner_user_id
  INTO v_previous, v_owner
  FROM public.accounts AS account_row
  WHERE account_row.id = p_account
  FOR UPDATE;

  IF v_previous IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown account';
  END IF;

  -- 'closed' is a lifecycle end, not a moderation state, and nothing here
  -- should be able to reopen one.
  IF v_previous = 'closed'::public.account_status THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'a closed account cannot be reopened here';
  END IF;

  UPDATE public.accounts AS account_row
  SET status = v_status
  WHERE account_row.id = p_account;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'account.status.set', p_account, v_reason,
    pg_catalog.jsonb_build_object(
      'accountId', p_account, 'previousStatus', v_previous::text, 'nextStatus', v_status::text
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor,
    'account.status.set',
    p_account,
    p_key,
    pg_catalog.jsonb_build_object(
      'previousStatus', v_previous::text, 'nextStatus', v_status::text
    ),
    pg_catalog.jsonb_build_object(
      'feature', 'economy',
      'targetKind', 'account',
      'reason', v_reason,
      'subjectUserId', v_owner,
      'before', pg_catalog.jsonb_build_object('status', v_previous::text),
      'after', pg_catalog.jsonb_build_object('status', v_status::text),
      'outcome', 'success'
    )
  );

  RETURN QUERY SELECT p_account, v_previous::text, v_status::text;
END;
$$;

ALTER FUNCTION public.economy_transaction_dependents(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_reverse_transaction(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_set_account_status(uuid, uuid, uuid, text, text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_transaction_dependents(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_reverse_transaction(uuid, uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_set_account_status(uuid, uuid, uuid, text, text)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_reverse_transaction(uuid, uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_set_account_status(uuid, uuid, uuid, text, text) TO moneyverse_app;

-- 077's body, writing the transaction the loan was paid out by so that
-- `economy_transaction_dependents` can see it. 045's body, with three changes:
-- an overdue loan blocks a new one, the grade and its term are recorded, and
-- every column is qualified.
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
$$;

ALTER FUNCTION public.bank_borrow(uuid, uuid, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_borrow(uuid, uuid, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bank_borrow(uuid, uuid, bigint) TO moneyverse_app;

COMMIT;
