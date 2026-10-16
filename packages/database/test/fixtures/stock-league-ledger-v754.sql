-- Disposable DB only, actual application role. No Production data.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout = '15000ms';
INSERT INTO public.users DEFAULT VALUES RETURNING id AS member_id \gset
INSERT INTO public.accounts(owner_user_id,account_type)
  VALUES (:'member_id','USER_CASH') RETURNING id AS cash_id \gset
INSERT INTO public.account_balances(account_id,available_amount)
  VALUES (:'cash_id',20000);
INSERT INTO public.stock_league_seasons(season_number,title,starts_at,ends_at,entry_fee)
  VALUES (999, 'Synthetic league',now()-interval '1 day',now()+interval '1 day',10000)
  RETURNING id AS season_id \gset
SELECT b.available_amount::text AS before_escrow FROM public.account_balances b
JOIN public.accounts a ON a.id=b.account_id WHERE a.account_type='ESCROW' \gset
SELECT set_config('v754.member',:'member_id',true);
SELECT set_config('v754.season',:'season_id',true);
SELECT set_config('v754.escrow_before',:'before_escrow',true);
SET LOCAL ROLE moneyverse_app;
SELECT public.stock_league_settle_entry_fee(:'member_id',:'season_id')::text AS first_tx \gset
SELECT public.stock_league_settle_entry_fee(:'member_id',:'season_id')::text AS second_tx \gset
RESET ROLE;
DO $verify$
DECLARE
  member uuid:=current_setting('v754.member')::uuid;
  season uuid:=current_setting('v754.season')::uuid;
  tx uuid:=md5('stock-league-entry-v754:'||member::text||':'||season::text)::uuid;
  balance numeric;
  escrow numeric;
  txn_count integer;
  posting_count integer;
BEGIN
  SELECT b.available_amount INTO balance
  FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.owner_user_id=member AND a.account_type='USER_CASH';
  SELECT b.available_amount INTO escrow
  FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.account_type='ESCROW';
  SELECT count(*) INTO txn_count FROM public.ledger_transactions WHERE idempotency_key=tx;
  SELECT count(*) INTO posting_count FROM public.ledger_postings p JOIN public.ledger_transactions t
    ON p.transaction_id=t.id WHERE t.idempotency_key=tx;
  IF balance<>10000 OR escrow<>current_setting('v754.escrow_before')::numeric+10000
    OR txn_count<>1 OR posting_count<>2 THEN
    RAISE EXCEPTION 'stock-league entry failed double-entry/replay conservation';
  END IF;
  IF NOT has_function_privilege('moneyverse_app','public.stock_league_settle_entry_fee(uuid,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'app role cannot run approved scoped transfer';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) x
    WHERE p.oid='public.stock_league_settle_entry_fee(uuid,uuid)'::pg_catalog.regprocedure
      AND x.grantee=0 AND x.privilege_type='EXECUTE'
  ) THEN
    RAISE EXCEPTION 'PUBLIC can execute scoped entry transfer';
  END IF;
  BEGIN
    PERFORM public.stock_league_settle_entry_fee(member,gen_random_uuid());
    RAISE EXCEPTION 'invalid season accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
END;
$verify$;
SELECT 'STOCK_LEAGUE_DOUBLE_ENTRY_APP_ROLE_IDEMPOTENCY_PASS' AS verdict;
ROLLBACK;
