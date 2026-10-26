-- Disposable PostgreSQL only. Every synthetic member and posting is rolled back.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.users DEFAULT VALUES RETURNING id AS actor_id \gset
INSERT INTO public.users DEFAULT VALUES RETURNING id AS other_actor_id \gset
INSERT INTO public.accounts(account_type,owner_user_id)
  VALUES('USER_CASH',:'actor_id') RETURNING id AS cash_id \gset
INSERT INTO public.account_balances(account_id,available_amount) VALUES(:'cash_id',25000);
INSERT INTO public.accounts(account_type,owner_user_id)
  VALUES('USER_CASH',:'other_actor_id') RETURNING id AS other_cash_id \gset
INSERT INTO public.account_balances(account_id,available_amount) VALUES(:'other_cash_id',5000);
SELECT pg_catalog.gen_random_uuid() AS request_key \gset
SELECT pg_catalog.gen_random_uuid() AS legacy_key \gset
SELECT b.available_amount AS sink_before FROM public.account_balances b
  JOIN public.accounts a ON a.id=b.account_id WHERE a.system_key='sink' \gset
SELECT set_config('mv.actor',:'actor_id',true),set_config('mv.other',:'other_actor_id',true),
  set_config('mv.key',:'request_key',true),set_config('mv.legacy',:'legacy_key',true),
  set_config('mv.sink_before',:'sink_before',true);
SET LOCAL ROLE moneyverse_app;
SELECT club_id AS first_club FROM public.club_create(
  :'actor_id','TESTV57','Test club charter','description','charter','public',:'request_key') \gset
SELECT club_id AS replay_club FROM public.club_create(
  :'actor_id','testv57',' Test club charter ','description','charter','public',:'request_key') \gset
RESET ROLE;
DO $verify$
DECLARE
  v_actor uuid := current_setting('mv.actor')::uuid;
  v_key uuid := current_setting('mv.key')::uuid;
  v_tx uuid;
  v_cash numeric;
  v_sink numeric;
BEGIN
  IF (SELECT count(*) FROM public.club_charter_receipts WHERE idempotency_key=v_key)<>1
    OR (SELECT count(*) FROM public.clubs WHERE owner_id=v_actor)<>1 THEN
    RAISE EXCEPTION 'charter receipt or club count mismatch';
  END IF;
  SELECT ledger_transaction_id INTO v_tx FROM public.club_charter_receipts WHERE idempotency_key=v_key;
  IF (SELECT count(*) FROM public.ledger_postings WHERE transaction_id=v_tx)<>2
    OR (SELECT coalesce(sum(CASE WHEN direction='debit' THEN amount ELSE -amount END),0)
        FROM public.ledger_postings WHERE transaction_id=v_tx)<>0 THEN
    RAISE EXCEPTION 'charter postings are missing or unbalanced';
  END IF;
  SELECT b.available_amount INTO v_cash FROM public.account_balances b
    JOIN public.accounts a ON a.id=b.account_id WHERE a.owner_user_id=v_actor;
  SELECT b.available_amount INTO v_sink FROM public.account_balances b
    JOIN public.accounts a ON a.id=b.account_id WHERE a.system_key='sink';
  IF v_cash<>15000 OR v_sink<>current_setting('mv.sink_before')::numeric+10000 THEN
    RAISE EXCEPTION 'club charter charged incorrect amount';
  END IF;
  IF has_table_privilege('moneyverse_app','public.clubs','INSERT')
    OR has_column_privilege('moneyverse_app','public.clubs','charter_fee_paid','UPDATE')
    OR NOT has_column_privilege('moneyverse_app','public.clubs','member_count','UPDATE')
    OR has_table_privilege('moneyverse_app','public.club_project_contributions','INSERT')
    OR has_table_privilege('moneyverse_app','public.club_projects','UPDATE') THEN
    RAISE EXCEPTION 'club write privileges bypass ledger or break member counts';
  END IF;
  IF has_table_privilege('moneyverse_app','public.club_charter_receipts','INSERT')
    OR has_table_privilege('moneyverse_app','public.club_charter_receipts','UPDATE')
    OR has_table_privilege('moneyverse_app','public.club_charter_receipts','SELECT') THEN
    RAISE EXCEPTION 'app role can mutate or inspect private charter receipts';
  END IF;
  BEGIN
    UPDATE public.club_charter_receipts SET payload='{}' WHERE idempotency_key=v_key;
    RAISE EXCEPTION 'immutable receipt update unexpectedly succeeded';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$verify$;
SET LOCAL ROLE moneyverse_app;
DO $failures$
DECLARE
  v_actor uuid := current_setting('mv.actor')::uuid;
  v_other uuid := current_setting('mv.other')::uuid;
  v_key uuid := current_setting('mv.key')::uuid;
BEGIN
  BEGIN
    PERFORM public.club_create(v_actor,'TESTV57','Different club','description','charter','public',v_key);
    RAISE EXCEPTION 'different replay payload was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.club_create(v_other,'TESTV57','Test club charter','description','charter','public',v_key);
    RAISE EXCEPTION 'different replay actor was accepted';
  EXCEPTION WHEN SQLSTATE '28000' THEN NULL;
  END;
  BEGIN
    PERFORM public.club_create(v_other,'NOFUNDS','Insufficient charter','','','public',gen_random_uuid());
    RAISE EXCEPTION 'insufficient funds was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.club_create(v_actor,'TESTV57','Conflicting charter','','','public',gen_random_uuid());
    RAISE EXCEPTION 'unique club tag conflict did not roll back its ledger debit';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.club_contribute_project(v_actor,gen_random_uuid(),gen_random_uuid(),100,gen_random_uuid());
    RAISE EXCEPTION 'unposted project funding was accepted';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$failures$;
RESET ROLE;
DO $no_extra_charge$
BEGIN
  IF (SELECT available_amount FROM public.account_balances
      WHERE account_id=(SELECT id FROM public.accounts WHERE owner_user_id=current_setting('mv.actor')::uuid AND account_type='USER_CASH'))<>15000
    OR (SELECT count(*) FROM public.ledger_transactions
      WHERE actor_user_id=current_setting('mv.actor')::uuid)<>1 THEN
    RAISE EXCEPTION 'failed charter attempt persisted a ledger debit';
  END IF;
END;
$no_extra_charge$;
INSERT INTO public.ledger_transactions(idempotency_key,type,actor_user_id,request_hash)
  VALUES(:'legacy_key','SINK_CLUB_CHARTER',:'actor_id',digest('legacy-charter','sha256'));
SET LOCAL ROLE moneyverse_app;
DO $legacy$
BEGIN
  BEGIN
    PERFORM public.club_create(current_setting('mv.actor')::uuid,
      'LEGACY','Legacy test','','','public',current_setting('mv.legacy')::uuid);
    RAISE EXCEPTION 'legacy unposted key was accepted';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$legacy$;
RESET ROLE;
SELECT 'CLUB_CHARTER_LEDGER_REPLAY_ROLE_GUARDS_PASS' AS verdict;
ROLLBACK;
