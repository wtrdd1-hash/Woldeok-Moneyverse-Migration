-- v1743: run on an isolated cloned Test database after migration 335.
-- No writes or money movement; PUBLIC KDIC data and private admin split.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL ROLE moneyverse_app;

DO $kdic_verify$
DECLARE
  fund_count bigint;
  inst_count bigint;
  denied boolean := false;
BEGIN
  IF pg_catalog.has_table_privilege('moneyverse_app','public.deposit_insurance_funds','SELECT')
    OR pg_catalog.has_table_privilege('moneyverse_app','public.insured_institutions','SELECT')
    OR pg_catalog.has_table_privilege('moneyverse_app','public.deposit_insurance_premiums','SELECT')
    OR pg_catalog.has_table_privilege('moneyverse_app','public.deposit_insurance_payouts','SELECT')
  THEN RAISE EXCEPTION 'KDIC_RAW_TABLE_READ_STILL_GRANTED_IN_TEST'; END IF;

  SELECT count(*) INTO fund_count FROM public.kdic_read_fund_v1743();
  SELECT count(*) INTO inst_count FROM public.kdic_read_institutions_v1743();
  IF fund_count <> 1 OR inst_count <> 2
  THEN RAISE EXCEPTION 'KDIC_PUBLIC_OBSERVATION_WRONG_COUNT: fund %, institutions %',fund_count,inst_count; END IF;

  BEGIN
    PERFORM 1 FROM public.kdic_read_recent_payouts_v1743(
      pg_catalog.gen_random_uuid(), 10
    );
  EXCEPTION WHEN insufficient_privilege THEN
    denied := true;
  END;
  IF NOT denied THEN RAISE EXCEPTION 'KDIC_ADMIN_AUTHORIZATION_NOT_ENFORCED'; END IF;

  RAISE NOTICE 'KDIC_V1743_PASS fund=1, institutions=2, no_raw_grants=true, private_denied=true';
END;
$kdic_verify$;

ROLLBACK;
