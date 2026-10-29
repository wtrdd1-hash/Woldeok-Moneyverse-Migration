-- Disposable Test ONLY. Do not run on Production without explicit operational review.
BEGIN ISOLATION LEVEL REPEATABLE READ;
DO $$ DECLARE v_run uuid;v_count bigint;v_abs numeric;v_bad bigint;
BEGIN
 SELECT public.ledger_capture_reconciliation('isolated-test-v1205') INTO v_run;
 SELECT mismatch_account_count,discrepancy_abs_amount,journal_imbalance_count INTO v_count,v_abs,v_bad
 FROM public.ledger_reconciliation_runs WHERE id=v_run;
 IF v_count<>18 OR v_abs<>18000 OR v_bad<>0 THEN
  RAISE EXCEPTION 'unexpected historical evidence: cases %, abs %, imbalance %',v_count,v_abs,v_bad;
 END IF;
 IF (SELECT count(*) FROM public.ledger_reconciliation_cases WHERE run_id=v_run AND delta_amount=1000 AND account_type='USER_CASH')<>18 THEN
  RAISE EXCEPTION 'expected 18 cash opening discrepancy cases';
 END IF;
 RAISE NOTICE 'PASS: 18 cases, 18000 WLD aggregate, 0 journal imbalance; NO MONEY MUTATION';
END $$;
ROLLBACK;
