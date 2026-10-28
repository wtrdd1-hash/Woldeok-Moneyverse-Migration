-- Disposable Github CI database only. All synthetic balances/roles rollback.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout='30000ms';
INSERT INTO public.users DEFAULT VALUES RETURNING id AS operator_id \gset
INSERT INTO public.user_roles(user_id,role) VALUES (:'operator_id','operator');
INSERT INTO public.users DEFAULT VALUES RETURNING id AS recipient_id \gset
INSERT INTO public.accounts(account_type,owner_user_id) VALUES ('USER_CASH',:'recipient_id') RETURNING id AS recipient_account_id \gset
INSERT INTO public.account_balances(account_id,available_amount) VALUES (:'recipient_account_id',0);
UPDATE public.account_balances SET available_amount=5000
 WHERE account_id=(SELECT id FROM public.accounts WHERE account_type='TREASURY');
UPDATE public.system_treasury_vaults SET balance_wld='20000' WHERE code='VAULT_MAIN';
SELECT pg_catalog.gen_random_uuid() AS request_key \gset
SET LOCAL ROLE moneyverse_app;
SELECT public.treasury_disburse_citizen_dividend(:'operator_id','1000','isolated audited citizen dividend',:'request_key')::text AS first_receipt \gset
SELECT public.treasury_disburse_citizen_dividend(:'operator_id','1000','isolated audited citizen dividend',:'request_key')::text AS retry_receipt \gset
RESET ROLE;
SELECT set_config('mv1420.actor',:'operator_id',true),
       set_config('mv1420.recipient',:'recipient_account_id',true),
       set_config('mv1420.key',:'request_key',true),
       set_config('mv1420.first',:'first_receipt',true),
       set_config('mv1420.retry',:'retry_receipt',true);
DO $verify$
DECLARE
 tx uuid; recipient_cash numeric; treasury_cash numeric; vault_cash numeric;
 receipts integer; posts integer; debit numeric; credit numeric;
 rejected boolean;
BEGIN
 IF current_setting('mv1420.first')::jsonb IS DISTINCT FROM current_setting('mv1420.retry')::jsonb THEN
   RAISE EXCEPTION 'duplicate request changed receipt';
 END IF;
 tx := (current_setting('mv1420.first')::jsonb->>'ledger_transaction_id')::uuid;
 SELECT available_amount INTO recipient_cash FROM public.account_balances
 WHERE account_id=current_setting('mv1420.recipient')::uuid;
 SELECT b.available_amount INTO treasury_cash FROM public.account_balances b
 JOIN public.accounts a ON a.id=b.account_id WHERE a.account_type='TREASURY';
 SELECT balance_wld::numeric INTO vault_cash FROM public.system_treasury_vaults WHERE code='VAULT_MAIN';
 SELECT count(*) INTO receipts FROM public.treasury_disbursements WHERE request_key=current_setting('mv1420.key')::uuid;
 SELECT count(*),coalesce(sum(amount) FILTER (WHERE direction='debit'),0),
   coalesce(sum(amount) FILTER (WHERE direction='credit'),0)
   INTO posts,debit,credit FROM public.ledger_postings WHERE transaction_id=tx;
 IF recipient_cash<>1000 OR treasury_cash<>4000 OR vault_cash<>19000 OR receipts<>1
    OR posts<>2 OR debit<>1000 OR credit<>1000 THEN
   RAISE EXCEPTION 'canonical dividends not conserved or duplicated';
 END IF;
 rejected:=false;
 BEGIN
  PERFORM public.treasury_disburse_citizen_dividend(current_setting('mv1420.actor')::uuid,
    '100000','isolated audited citizen dividend',pg_catalog.gen_random_uuid());
 EXCEPTION WHEN SQLSTATE '55000' THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'uncertified treasury overdraft executed'; END IF;
 rejected:=false;
 BEGIN
  PERFORM public.treasury_disburse_citizen_dividend(current_setting('mv1420.actor')::uuid,
    '2000','isolated audited citizen dividend',current_setting('mv1420.key')::uuid);
 EXCEPTION WHEN SQLSTATE '22023' THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'changed replay executed'; END IF;
 rejected:=false;
 BEGIN
  PERFORM public.treasury_disburse_citizen_dividend(current_setting('mv1420.actor')::uuid,
    '1000','isolated audited citizen dividend');
 EXCEPTION WHEN SQLSTATE '55000' THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'legacy payout bypass enabled'; END IF;
 rejected:=false;
 BEGIN
  PERFORM public.treasury_disburse_citizen_dividend(current_setting('mv1420.recipient')::uuid,
    '1000','non-operator cannot issue citizen dividends',pg_catalog.gen_random_uuid());
 EXCEPTION WHEN SQLSTATE '42501' THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'unauthorized citizen payout executed'; END IF;
 UPDATE public.account_balances SET available_amount=0
 WHERE account_id=(SELECT id FROM public.accounts WHERE account_type='TREASURY');
 rejected:=false;
 BEGIN
  PERFORM public.treasury_disburse_citizen_dividend(current_setting('mv1420.actor')::uuid,
    '1000','zero canonical treasury must not pay',pg_catalog.gen_random_uuid());
 EXCEPTION WHEN SQLSTATE '55000' THEN rejected:=true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'unfunded treasury produced money'; END IF;
END;
$verify$;
SELECT 'V1420_TREASURY_DIVIDEND_LEDGER_ATOMIC_PASS' AS verdict;
ROLLBACK;
