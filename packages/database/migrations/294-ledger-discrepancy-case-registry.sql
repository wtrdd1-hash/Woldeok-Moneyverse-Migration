-- v2026.10.29.1205: immutable evidence of imbalance; NO balance mutation.
-- Granted finance table DML remains untouched per explicit operator policy.
BEGIN;
CREATE TABLE IF NOT EXISTS public.ledger_reconciliation_runs (
 id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
 captured_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
 source_tag text NOT NULL CHECK (length(source_tag) BETWEEN 3 AND 128),
 observed_account_count bigint NOT NULL CHECK(observed_account_count >= 0),
 mismatch_account_count bigint NOT NULL CHECK(mismatch_account_count >= 0),
 discrepancy_abs_amount numeric NOT NULL CHECK(discrepancy_abs_amount >= 0),
 journal_imbalance_count bigint NOT NULL CHECK(journal_imbalance_count >= 0),
 status text NOT NULL DEFAULT 'OBSERVED' CHECK (status='OBSERVED'),
 evidence jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(evidence)='object')
);
CREATE TABLE IF NOT EXISTS public.ledger_reconciliation_cases (
 run_id uuid NOT NULL REFERENCES public.ledger_reconciliation_runs(id) ON DELETE RESTRICT,
 account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
 account_type public.account_type NOT NULL,
 stored_amount numeric NOT NULL,
 journal_amount numeric NOT NULL,
 delta_amount numeric NOT NULL CHECK (delta_amount<>0),
 posting_count bigint NOT NULL CHECK(posting_count>=0),
 investigation_state text NOT NULL DEFAULT 'UNEXPLAINED' CHECK(investigation_state='UNEXPLAINED'),
 PRIMARY KEY (run_id,account_id),
 CHECK (stored_amount-journal_amount=delta_amount)
);
CREATE INDEX IF NOT EXISTS idx_ledger_reconciliation_cases_account ON public.ledger_reconciliation_cases(account_id,run_id);
-- New evidence registry is only accessible to schema owner; does not alter existing moneyverse_app grants.
REVOKE ALL ON public.ledger_reconciliation_runs,public.ledger_reconciliation_cases FROM PUBLIC, moneyverse_app;
CREATE OR REPLACE FUNCTION public.ledger_capture_reconciliation(p_source_tag text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $fn$
DECLARE v_run uuid; v_accounts bigint;v_mismatch bigint;v_abs numeric;v_unbalanced bigint;
BEGIN
 IF p_source_tag IS NULL OR length(p_source_tag) NOT BETWEEN 3 AND 128 THEN
  RAISE EXCEPTION 'source tag length must be 3..128' USING ERRCODE='22023';
 END IF;
 -- Transactions/rows are collected at one MVCC snapshot. Caller should use REPEATABLE READ
 -- on a live writer-enabled system to avoid scan-to-scan drift; only run on isolated Test by default.
 SELECT count(*) INTO v_unbalanced FROM (
  SELECT t.id FROM public.ledger_transactions t LEFT JOIN public.ledger_postings p ON p.transaction_id=t.id
  GROUP BY t.id HAVING count(p.id)<2 OR coalesce(sum(CASE WHEN p.direction='debit'::public.posting_direction THEN p.amount ELSE -p.amount END),0)<>0
 ) z;
 SELECT count(*),count(*) FILTER (WHERE stored_amount IS DISTINCT FROM journal_amount),
  coalesce(sum(abs(stored_amount-journal_amount)) FILTER(WHERE stored_amount IS DISTINCT FROM journal_amount),0)
 INTO v_accounts,v_mismatch,v_abs FROM (
  SELECT a.id,b.available_amount::numeric stored_amount,
    coalesce(sum(CASE WHEN p.direction='debit'::public.posting_direction THEN p.amount ELSE -p.amount END),0)::numeric journal_amount
  FROM public.accounts a LEFT JOIN public.account_balances b ON b.account_id=a.id
  LEFT JOIN public.ledger_postings p ON p.account_id=a.id GROUP BY a.id,b.available_amount
 ) q;
 INSERT INTO public.ledger_reconciliation_runs(source_tag,observed_account_count,mismatch_account_count,discrepancy_abs_amount,journal_imbalance_count,evidence)
 VALUES (p_source_tag,v_accounts,v_mismatch,v_abs,v_unbalanced,
 pg_catalog.jsonb_build_object('postingPolarity','debit-positive','repairApplied',false,'source','canonical-ledger-aggregate')) RETURNING id INTO v_run;
 INSERT INTO public.ledger_reconciliation_cases(run_id,account_id,account_type,stored_amount,journal_amount,delta_amount,posting_count)
 SELECT v_run,q.id,q.account_type,q.stored_amount,q.journal_amount,q.stored_amount-q.journal_amount,q.posting_count FROM (
  SELECT a.id,a.account_type,b.available_amount::numeric stored_amount,
   coalesce(sum(CASE WHEN p.direction='debit'::public.posting_direction THEN p.amount ELSE -p.amount END),0)::numeric journal_amount,
   count(p.id) posting_count
  FROM public.accounts a JOIN public.account_balances b ON b.account_id=a.id
  LEFT JOIN public.ledger_postings p ON p.account_id=a.id GROUP BY a.id,a.account_type,b.available_amount
 ) q WHERE q.stored_amount<>q.journal_amount;
 IF (SELECT count(*) FROM public.ledger_reconciliation_cases WHERE run_id=v_run)<>v_mismatch THEN
  RAISE EXCEPTION 'reconciliation scan changed; retry in repeatable-read transaction' USING ERRCODE='40001';
 END IF;
 RETURN v_run;
END $fn$;
REVOKE ALL ON FUNCTION public.ledger_capture_reconciliation(text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.ledger_capture_reconciliation(text) TO moneyverse_reconciler;
COMMIT;
