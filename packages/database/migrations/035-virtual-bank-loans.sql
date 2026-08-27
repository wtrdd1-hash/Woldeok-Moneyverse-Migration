-- Game-only bank.  No fiat payment, cash-out, credit score, or real-world
-- lending is represented here.
CREATE TABLE IF NOT EXISTS public.virtual_bank_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrow_idempotency_key uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  principal_amount bigint NOT NULL CHECK (principal_amount BETWEEN 100 AND 500000),
  interest_amount bigint NOT NULL CHECK (interest_amount >= 0),
  outstanding_amount bigint NOT NULL CHECK (outstanding_amount >= 0),
  status text NOT NULL CHECK (status IN ('active', 'repaid')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  repaid_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS virtual_bank_one_active_loan_per_user
  ON public.virtual_bank_loans(user_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.virtual_bank_loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  loan_id uuid NOT NULL REFERENCES public.virtual_bank_loans(id),
  amount bigint NOT NULL CHECK (amount > 0),
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.bank_move_balance(
  p_key uuid, p_actor uuid, p_direction text, p_amount bigint
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_bank uuid; v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_direction NOT IN ('deposit', 'withdraw') OR p_amount < 1 OR p_amount > 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid bank transfer';
  END IF;
  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id=p_actor AND account_row.account_type='USER_CASH'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_bank FROM public.accounts AS account_row
  WHERE account_row.owner_user_id=p_actor AND account_row.account_type='USER_BANK'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_bank IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active bank accounts required'; END IF;
  SELECT public.economy_post_transaction(
    p_key, CASE WHEN p_direction='deposit' THEN 'BANK_DEPOSIT' ELSE 'BANK_WITHDRAW' END, p_actor, NULL,
    CASE WHEN p_direction='deposit' THEN jsonb_build_array(
      jsonb_build_object('accountId',v_cash,'amount',p_amount,'direction','credit'),
      jsonb_build_object('accountId',v_bank,'amount',p_amount,'direction','debit')
    ) ELSE jsonb_build_array(
      jsonb_build_object('accountId',v_cash,'amount',p_amount,'direction','debit'),
      jsonb_build_object('accountId',v_bank,'amount',p_amount,'direction','credit')
    ) END,
    'bank.balance.moved', jsonb_build_object('direction',p_direction,'amount',p_amount)
  ) INTO v_transaction;
  RETURN v_transaction;
END;
$$;

CREATE OR REPLACE FUNCTION public.bank_borrow(
  p_key uuid, p_actor uuid, p_principal bigint
)
RETURNS TABLE(loan_id uuid, principal_amount bigint, interest_amount bigint, outstanding_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_mint uuid; v_loan uuid; v_interest bigint; v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_principal < 100 OR p_principal > 500000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid loan amount';
  END IF;
  SELECT loan_row.id, loan_row.principal_amount, loan_row.interest_amount, loan_row.outstanding_amount
  INTO v_loan, principal_amount, interest_amount, outstanding_amount
  FROM public.virtual_bank_loans AS loan_row WHERE loan_row.borrow_idempotency_key=p_key;
  IF FOUND THEN
    SELECT transaction_row.id INTO transaction_id FROM public.ledger_transactions AS transaction_row WHERE transaction_row.idempotency_key=p_key;
    loan_id:=v_loan; replayed:=true; RETURN NEXT; RETURN;
  END IF;
  PERFORM loan_row.id FROM public.virtual_bank_loans AS loan_row WHERE loan_row.user_id=p_actor AND loan_row.status='active' FOR UPDATE;
  IF FOUND THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='an active loan already exists'; END IF;
  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id=p_actor AND account_row.account_type='USER_CASH'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key='mint' AND account_row.account_type='MINT'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active loan accounts required'; END IF;
  v_interest := ceil(p_principal * 0.05)::bigint;
  SELECT public.economy_post_transaction(p_key,'BANK_LOAN_ISSUED',p_actor,NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',p_principal,'direction','debit'),jsonb_build_object('accountId',v_mint,'amount',p_principal,'direction','credit')),
    'bank.loan.issued',jsonb_build_object('principal',p_principal,'interest',v_interest)) INTO v_transaction;
  INSERT INTO public.virtual_bank_loans(borrow_idempotency_key,user_id,principal_amount,interest_amount,outstanding_amount,status)
  VALUES(p_key,p_actor,p_principal,v_interest,p_principal+v_interest,'active') RETURNING id INTO v_loan;
  RETURN QUERY SELECT v_loan,p_principal,v_interest,p_principal+v_interest,v_transaction,false;
END;
$$;

CREATE OR REPLACE FUNCTION public.bank_repay(
  p_key uuid, p_actor uuid, p_loan uuid, p_amount bigint
)
RETURNS TABLE(loan_id uuid, paid_amount bigint, outstanding_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_mint uuid; v_outstanding bigint; v_paid bigint; v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_loan IS NULL OR p_amount < 1 OR p_amount > 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid loan repayment';
  END IF;
  SELECT repayment.loan_id, repayment.amount, loan_row.outstanding_amount, repayment.transaction_id
  INTO loan_id, paid_amount, outstanding_amount, transaction_id
  FROM public.virtual_bank_loan_repayments AS repayment JOIN public.virtual_bank_loans AS loan_row ON loan_row.id=repayment.loan_id
  WHERE repayment.idempotency_key=p_key;
  IF FOUND THEN replayed:=true; RETURN NEXT; RETURN; END IF;
  SELECT loan_row.outstanding_amount INTO v_outstanding FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.id=p_loan AND loan_row.user_id=p_actor AND loan_row.status='active' FOR UPDATE;
  IF v_outstanding IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active loan required'; END IF;
  v_paid := least(p_amount,v_outstanding);
  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id=p_actor AND account_row.account_type='USER_CASH'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key='mint' AND account_row.account_type='MINT'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active loan accounts required'; END IF;
  SELECT public.economy_post_transaction(p_key,'BANK_LOAN_REPAYMENT',p_actor,NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_paid,'direction','credit'),jsonb_build_object('accountId',v_mint,'amount',v_paid,'direction','debit')),
    'bank.loan.repaid',jsonb_build_object('loanId',p_loan,'amount',v_paid)) INTO v_transaction;
  UPDATE public.virtual_bank_loans AS loan_row SET outstanding_amount=v_outstanding-v_paid,
    status=CASE WHEN v_outstanding=v_paid THEN 'repaid' ELSE 'active' END,
    repaid_at=CASE WHEN v_outstanding=v_paid THEN clock_timestamp() ELSE NULL END WHERE loan_row.id=p_loan;
  INSERT INTO public.virtual_bank_loan_repayments(idempotency_key,loan_id,amount,transaction_id) VALUES(p_key,p_loan,v_paid,v_transaction);
  RETURN QUERY SELECT p_loan,v_paid,v_outstanding-v_paid,v_transaction,false;
END;
$$;

CREATE OR REPLACE FUNCTION public.bank_my_loans(p_actor uuid)
RETURNS TABLE(loan_id uuid, principal_amount bigint, interest_amount bigint, outstanding_amount bigint, status text, issued_at timestamptz, repaid_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT id, principal_amount, interest_amount, outstanding_amount, status, issued_at, repaid_at
  FROM public.virtual_bank_loans WHERE user_id=p_actor ORDER BY issued_at DESC, id DESC LIMIT 20
$$;

ALTER FUNCTION public.bank_move_balance(uuid,uuid,text,bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_borrow(uuid,uuid,bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_repay(uuid,uuid,uuid,bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_my_loans(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON public.virtual_bank_loans, public.virtual_bank_loan_repayments FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.bank_move_balance(uuid,uuid,text,bigint), public.bank_borrow(uuid,uuid,bigint), public.bank_repay(uuid,uuid,uuid,bigint), public.bank_my_loans(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bank_move_balance(uuid,uuid,text,bigint), public.bank_borrow(uuid,uuid,bigint), public.bank_repay(uuid,uuid,uuid,bigint), public.bank_my_loans(uuid) TO moneyverse_app;
