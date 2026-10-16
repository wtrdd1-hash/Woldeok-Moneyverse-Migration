-- Synthetic, immutable-ledger settlement acceptance. Runs ONLY on disposable
-- CI/isolated Test. All synthetic data rolls back; never use on Production.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout='30000ms';
INSERT INTO public.users DEFAULT VALUES RETURNING id AS donor_id \gset
INSERT INTO public.accounts(account_type,owner_user_id) VALUES ('USER_CASH',:'donor_id') RETURNING id AS cash_id \gset
INSERT INTO public.account_balances(account_id,available_amount) VALUES (:'cash_id',2000);
SELECT gen_random_uuid() AS idempotency_key \gset
SELECT available_amount::text AS treasury_before FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id WHERE a.account_type='TREASURY' \gset
SELECT balance_wld AS vault_before FROM public.system_treasury_vaults WHERE code='VAULT_MAIN' \gset
SELECT set_config('mv.v744_donor_id',:'donor_id',true);
SELECT set_config('mv.v744_idempotency_key',:'idempotency_key',true);
SELECT set_config('mv.v744_treasury_before',:'treasury_before',true);
SELECT set_config('mv.v744_vault_before',:'vault_before',true);
-- Test with the actual application role, not only the owner/migrator.
SET LOCAL ROLE moneyverse_app;
SELECT public.treasury_user_donate(:'donor_id','1000','synthetic harmless donation',:'idempotency_key')::text AS first_receipt \gset
SELECT public.treasury_user_donate(:'donor_id','1000','synthetic harmless donation',:'idempotency_key')::text AS replay_receipt \gset
SELECT (:'first_receipt'::jsonb = :'replay_receipt'::jsonb) AS identical \gset
\if :identical
\else
  \echo 'ERROR: idempotency replay receipt changed'
  \quit 2
\endif
RESET ROLE;
DO $verify$
DECLARE
  u uuid := current_setting('mv.v744_donor_id')::uuid;
  cash_amount numeric;
  treasury_balance numeric;
  vault_balance numeric;
  receipt_count int;
  ledger_count int;
  posting_count int;
BEGIN
  SELECT b.available_amount INTO cash_amount FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id WHERE a.owner_user_id=u AND a.account_type='USER_CASH';
  SELECT b.available_amount INTO treasury_balance FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id WHERE a.account_type='TREASURY';
  SELECT balance_wld::numeric INTO vault_balance FROM public.system_treasury_vaults WHERE code='VAULT_MAIN';
  SELECT count(*) INTO receipt_count FROM public.treasury_donations WHERE user_id=u;
  SELECT count(*) INTO ledger_count FROM public.ledger_transactions WHERE actor_user_id=u;
  SELECT count(*) INTO posting_count FROM public.ledger_postings p JOIN public.ledger_transactions t ON t.id=p.transaction_id WHERE t.actor_user_id=u;
  IF cash_amount<>1000 OR treasury_balance<>(current_setting('mv.v744_treasury_before')::numeric+1000)
     OR vault_balance<>(current_setting('mv.v744_vault_before')::numeric+1000)
     OR receipt_count<>1 OR ledger_count<>1 OR posting_count<>2 THEN
    RAISE EXCEPTION 'synthetic treasury conservation/idempotency failure';
  END IF;
  IF has_function_privilege('moneyverse_app','public.treasury_user_donate(uuid,text,text)','EXECUTE')
    OR has_function_privilege('moneyverse_app','public.treasury_deposit_donation(uuid,bigint,text,boolean)','EXECUTE')
    OR has_function_privilege('moneyverse_app','public.execute_treasury_burn_draw(bigint,text)','EXECUTE')
    OR has_function_privilege('moneyverse_app','public.treasury_disburse_targeted_subsidy(uuid,text,text,text)','EXECUTE') THEN
    RAISE EXCEPTION 'uncertified legacy treasury mutation is exposed';
  END IF;
  BEGIN
    PERFORM public.treasury_user_donate(u,'1500','different replay',current_setting('mv.v744_idempotency_key')::uuid);
    RAISE EXCEPTION 'reused key changed amount but did not fail';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;
  BEGIN
    PERFORM public.treasury_user_donate(u,'100000','insufficient synthetic funds',gen_random_uuid());
    RAISE EXCEPTION 'overdraft did not fail';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;
END;
$verify$;
SELECT 'SYNTHETIC_TREASURY_ATOMICITY_IDEMPOTENCY_ROLE_GUARDS_PASS' AS verdict;
ROLLBACK;
