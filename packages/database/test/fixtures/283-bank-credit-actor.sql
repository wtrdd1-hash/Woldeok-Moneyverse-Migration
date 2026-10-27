-- Isolated PostgreSQL ONLY. The synthetic actor is rolled back before exit.
BEGIN;
INSERT INTO public.users (id, status, created_at)
VALUES ('00000000-0000-4000-8000-000000000283', 'active', clock_timestamp() - interval '4 days');
SET LOCAL ROLE moneyverse_app;
DO $assert$
DECLARE
  facts record;
BEGIN
  SELECT * INTO facts FROM public.bank_my_credit_facts('00000000-0000-4000-8000-000000000283');
  IF facts.account_age_days < 3 OR facts.job_level <> 0
     OR facts.repayment_count <> 0 OR facts.overdue_count <> 0 THEN
    RAISE EXCEPTION 'credit facts changed or are unavailable: %', row_to_json(facts);
  END IF;
  IF has_table_privilege(current_user, 'public.virtual_bank_loans', 'SELECT')
     OR has_table_privilege(current_user, 'public.virtual_bank_loans', 'UPDATE')
     OR has_table_privilege(current_user, 'public.virtual_bank_loan_repayments', 'SELECT') THEN
    RAISE EXCEPTION 'app role retains direct loan table access';
  END IF;
END;
$assert$;
ROLLBACK;
