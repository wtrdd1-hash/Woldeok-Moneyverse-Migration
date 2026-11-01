-- Disposable GitHub Actions PostgreSQL ONLY. Transaction ends with ROLLBACK.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout = '12000ms';
INSERT INTO public.users DEFAULT VALUES RETURNING id AS actor \gset
INSERT INTO public.accounts (owner_user_id,account_type,currency,status)
  VALUES (:'actor','USER_CASH','WLD','active') RETURNING id AS cash_id \gset
INSERT INTO public.account_balances(account_id,available_amount)
  VALUES (:'cash_id',20000);
INSERT INTO public.economy_policies (version,effective_at,status,payload)
  SELECT 'ci-treasury-core-v1618',now(),'active','{}'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM public.economy_policies WHERE status='active');
SELECT gen_random_uuid() AS fund_key,gen_random_uuid() AS withdraw_key \gset
SELECT coalesce(sum(available_amount),0)::text AS supply_before
 FROM public.account_balances \gset
SET LOCAL ROLE moneyverse_app;
SELECT ledger_transaction_id AS fund_tx FROM public.treasury_core_post(
  :'actor'::uuid,:'fund_key'::uuid,'NPS_FUND','1000') \gset
SELECT ledger_transaction_id AS fund_tx_again FROM public.treasury_core_post(
  :'actor'::uuid,:'fund_key'::uuid,'NPS_FUND','1000') \gset
SELECT ledger_transaction_id AS withdraw_tx FROM public.treasury_core_post(
  :'actor'::uuid,:'withdraw_key'::uuid,'NPS_WITHDRAW','1000') \gset
SELECT ledger_transaction_id AS withdraw_tx_again FROM public.treasury_core_post(
  :'actor'::uuid,:'withdraw_key'::uuid,'NPS_WITHDRAW','1000') \gset
RESET ROLE;

SELECT set_config('v1618.actor',:'actor',true);
SELECT set_config('v1618.fund_key',:'fund_key',true);
SELECT set_config('v1618.withdraw_key',:'withdraw_key',true);
SELECT set_config('v1618.fund_tx',:'fund_tx',true);
SELECT set_config('v1618.fund_tx_again',:'fund_tx_again',true);
SELECT set_config('v1618.withdraw_tx',:'withdraw_tx',true);
SELECT set_config('v1618.withdraw_tx_again',:'withdraw_tx_again',true);
SELECT set_config('v1618.supply_before',:'supply_before',true);
DO $verify$
DECLARE
  actor uuid:=current_setting('v1618.actor')::uuid;
  fund_key uuid:=current_setting('v1618.fund_key')::uuid;
  withdraw_key uuid:=current_setting('v1618.withdraw_key')::uuid;
  fund_id uuid:=current_setting('v1618.fund_tx')::uuid;
  withdraw_id uuid:=current_setting('v1618.withdraw_tx')::uuid;
  old_total numeric:=current_setting('v1618.supply_before')::numeric;
  new_total numeric;
  user_balance numeric;
  fund_balance numeric;
  welfare_balance numeric;
  signed_delta numeric;
  position_balance numeric;
  n integer;
BEGIN
  IF current_setting('v1618.fund_tx') <> current_setting('v1618.fund_tx_again')
    OR current_setting('v1618.withdraw_tx') <> current_setting('v1618.withdraw_tx_again') THEN
    RAISE EXCEPTION 'replayed command changed canonical transaction ID';
  END IF;
  SELECT coalesce(sum(available_amount),0) INTO new_total FROM public.account_balances;
  SELECT b.available_amount INTO user_balance FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.owner_user_id=actor AND a.account_type='USER_CASH';
  SELECT b.available_amount INTO fund_balance FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.system_key='national_pension_fund' AND a.account_type='ESCROW';
  SELECT b.available_amount INTO welfare_balance FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.system_key='national_pension_welfare' AND a.account_type='ESCROW';
  SELECT available_principal_wld INTO position_balance FROM public.pension_funded_positions WHERE user_id=actor;
  IF old_total<>new_total OR user_balance<>19950 OR fund_balance<>0 OR welfare_balance<>50
    OR position_balance<>0 THEN
    RAISE EXCEPTION 'money conservation or exact 95/5 payout mismatch';
  END IF;
  SELECT count(*) INTO n FROM public.treasury_core_receipts WHERE actor_user_id=actor;
  IF n<>2 THEN RAISE EXCEPTION 'expected two immutable Treasury Core receipts'; END IF;
  SELECT count(*) INTO n FROM public.pension_funded_receipts WHERE user_id=actor;
  IF n<>2 THEN RAISE EXCEPTION 'expected two linked funded pension receipts'; END IF;
  SELECT count(*) INTO n FROM public.ledger_transactions WHERE id IN (fund_id,withdraw_id);
  IF n<>2 THEN RAISE EXCEPTION 'missing canonical ledger transaction'; END IF;
  SELECT count(*) INTO n FROM public.ledger_postings WHERE transaction_id IN (fund_id,withdraw_id);
  IF n<>5 THEN RAISE EXCEPTION 'new funded contribution + withdrawal must have five postings'; END IF;
  SELECT coalesce(sum(CASE WHEN direction='debit' THEN amount ELSE -amount END),0)
  INTO signed_delta FROM public.ledger_postings WHERE transaction_id IN (fund_id,withdraw_id);
  IF signed_delta<>0 THEN RAISE EXCEPTION 'canonical postings are not balanced'; END IF;
  IF EXISTS (SELECT 1 FROM public.account_balances WHERE available_amount<0
    AND account_id IN (SELECT id FROM public.accounts WHERE system_key IN ('national_pension_fund','national_pension_welfare'))) THEN
    RAISE EXCEPTION 'overdrawn protected pension escrow'; END IF;
  IF EXISTS (SELECT 1 FROM public.ledger_transactions WHERE idempotency_key IN (fund_key,withdraw_key)
     GROUP BY idempotency_key HAVING count(*)<>1) THEN
    RAISE EXCEPTION 'duplicate ledger transaction created'; END IF;
END;$verify$;

SET LOCAL ROLE moneyverse_app;
DO $negative$
DECLARE
  actor uuid:=current_setting('v1618.actor')::uuid;
  k uuid:=current_setting('v1618.fund_key')::uuid;
BEGIN
  BEGIN
    PERFORM public.treasury_core_post(actor,k,'NPS_FUND','2000');
    RAISE EXCEPTION 'changed idempotency amount accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM public.treasury_core_post(actor,gen_random_uuid(),'NPS_WITHDRAW','1');
    RAISE EXCEPTION 'withdraw without funded position accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    UPDATE public.treasury_core_receipts SET principal_wld=2 WHERE idempotency_key=k;
    RAISE EXCEPTION 'raw app-role receipt update accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;$negative$;
RESET ROLE;
SELECT 'TREASURY_CORE_NPS_FUNDED_DOUBLE_ENTRY_REPLAY_ROLLBACK_PASS' AS verdict;
ROLLBACK;