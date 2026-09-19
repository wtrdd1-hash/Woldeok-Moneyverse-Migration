-- 211-bank-loan-economic-command-envelope.sql
-- Update version: v2026.09.19.271
-- P0 ECON-233-02: adopt the common economic command envelope for virtual-bank loan issue/repayment.
-- Existing authoritative loan/ledger policy is retained as private delegates.

BEGIN;

ALTER FUNCTION public.bank_borrow(uuid, uuid, numeric) RENAME TO bank_borrow_policy_v210;
ALTER FUNCTION public.bank_repay(uuid, uuid, uuid, numeric) RENAME TO bank_repay_policy_v210;

REVOKE ALL ON FUNCTION public.bank_borrow_policy_v210(uuid, uuid, numeric) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.bank_repay_policy_v210(uuid, uuid, uuid, numeric) FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_borrow(
  p_key uuid, p_actor uuid, p_principal numeric
)
RETURNS TABLE(loan_id uuid, principal_amount numeric, interest_amount numeric, outstanding_amount numeric, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_command uuid;
  v_replayed boolean;
  v_command_tx uuid;
  v_result jsonb;
  v_loan uuid;
  v_principal numeric;
  v_interest numeric;
  v_outstanding numeric;
  v_tx uuid;
  v_policy_replayed boolean;
  v_hash bytea;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_principal IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='loan command identity is required';
  END IF;

  v_hash := public.digest(pg_catalog.convert_to(p_principal::text, 'UTF8'), 'sha256');
  SELECT c.command_id, c.replayed, c.ledger_transaction_id, c.result_snapshot
    INTO v_command, v_replayed, v_command_tx, v_result
  FROM public.economic_command_claim(p_actor, 'bank.loan.borrow', 'bank-loan:new', p_key, v_hash, NULL) AS c;

  IF v_replayed THEN
    RETURN QUERY SELECT
      (v_result->>'loanId')::uuid,
      (v_result->>'principalAmount')::numeric,
      (v_result->>'interestAmount')::numeric,
      (v_result->>'outstandingAmount')::numeric,
      v_command_tx,
      true;
    RETURN;
  END IF;

  SELECT b.loan_id, b.principal_amount, b.interest_amount, b.outstanding_amount, b.transaction_id, b.replayed
    INTO v_loan, v_principal, v_interest, v_outstanding, v_tx, v_policy_replayed
  FROM public.bank_borrow_policy_v210(p_key, p_actor, p_principal) AS b;

  IF v_loan IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='bank borrow policy returned no result';
  END IF;

  v_result := pg_catalog.jsonb_build_object(
    'loanId', v_loan,
    'principalAmount', v_principal,
    'interestAmount', v_interest,
    'outstandingAmount', v_outstanding
  );
  PERFORM public.economic_command_complete(v_command, v_tx, v_result);

  RETURN QUERY SELECT v_loan, v_principal, v_interest, v_outstanding, v_tx, v_policy_replayed;
END;
$$;

CREATE OR REPLACE FUNCTION public.bank_repay(
  p_key uuid, p_actor uuid, p_loan uuid, p_amount numeric
)
RETURNS TABLE(loan_id uuid, paid_amount numeric, outstanding_amount numeric, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_command uuid;
  v_replayed boolean;
  v_command_tx uuid;
  v_result jsonb;
  v_loan uuid;
  v_paid numeric;
  v_outstanding numeric;
  v_tx uuid;
  v_policy_replayed boolean;
  v_hash bytea;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_loan IS NULL OR p_amount IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='loan repayment command identity is required';
  END IF;

  v_hash := public.digest(pg_catalog.convert_to(p_loan::text || ':' || p_amount::text, 'UTF8'), 'sha256');
  SELECT c.command_id, c.replayed, c.ledger_transaction_id, c.result_snapshot
    INTO v_command, v_replayed, v_command_tx, v_result
  FROM public.economic_command_claim(p_actor, 'bank.loan.repay', p_loan::text, p_key, v_hash, NULL) AS c;

  IF v_replayed THEN
    RETURN QUERY SELECT
      (v_result->>'loanId')::uuid,
      (v_result->>'paidAmount')::numeric,
      (v_result->>'outstandingAmount')::numeric,
      v_command_tx,
      true;
    RETURN;
  END IF;

  SELECT r.loan_id, r.paid_amount, r.outstanding_amount, r.transaction_id, r.replayed
    INTO v_loan, v_paid, v_outstanding, v_tx, v_policy_replayed
  FROM public.bank_repay_policy_v210(p_key, p_actor, p_loan, p_amount) AS r;

  IF v_loan IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='bank repayment policy returned no result';
  END IF;

  v_result := pg_catalog.jsonb_build_object(
    'loanId', v_loan,
    'paidAmount', v_paid,
    'outstandingAmount', v_outstanding
  );
  PERFORM public.economic_command_complete(v_command, v_tx, v_result);

  RETURN QUERY SELECT v_loan, v_paid, v_outstanding, v_tx, v_policy_replayed;
END;
$$;

ALTER FUNCTION public.bank_borrow_policy_v210(uuid, uuid, numeric) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_repay_policy_v210(uuid, uuid, uuid, numeric) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_borrow(uuid, uuid, numeric) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_repay(uuid, uuid, uuid, numeric) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.bank_borrow(uuid, uuid, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bank_repay(uuid, uuid, uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bank_borrow(uuid, uuid, numeric) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_repay(uuid, uuid, uuid, numeric) TO moneyverse_app;

COMMIT;
