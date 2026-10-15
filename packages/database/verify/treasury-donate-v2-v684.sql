-- All changes are rolled back; only independent restored Test DB is allowed.
BEGIN;
SET LOCAL statement_timeout = '15s';
DO $audit$
DECLARE
  v_user uuid;
  v_cash_id uuid;
  v_treasury_id uuid;
  v_before_cash numeric;
  v_before_treasury numeric;
  v_before_vault numeric;
  v_before_core bigint;
  v_before_fiscal bigint;
  v_before_donation bigint;
  v_key uuid := gen_random_uuid();
  v_receipt jsonb;
  v_repeat jsonb;
  v_caught boolean;
BEGIN
  IF current_database() <> 'wdmv_treasury_v680' THEN
    RAISE EXCEPTION 'Not an isolated restored Test DB';
  END IF;
  SELECT a.owner_user_id,a.id,ab.available_amount
    INTO v_user,v_cash_id,v_before_cash
  FROM public.accounts a JOIN public.account_balances ab ON ab.account_id=a.id
  WHERE a.account_type='USER_CASH'::public.account_type AND a.status='active'::public.account_status
    AND ab.available_amount>=5 AND a.owner_user_id IS NOT NULL
  LIMIT 1;
  SELECT a.id,ab.available_amount INTO v_treasury_id,v_before_treasury
  FROM public.accounts a JOIN public.account_balances ab ON ab.account_id=a.id
  WHERE a.account_type='TREASURY'::public.account_type AND a.status='active'::public.account_status LIMIT 1;
  IF v_user IS NULL OR v_treasury_id IS NULL THEN
    RAISE EXCEPTION 'Test fixture missing';
  END IF;
  SELECT balance_wld::numeric INTO v_before_vault FROM public.system_treasury_vaults WHERE code='VAULT_MAIN';
  SELECT count(*) INTO v_before_core FROM public.ledger_transactions;
  SELECT count(*) INTO v_before_fiscal FROM public.system_treasury_ledger;
  SELECT count(*) INTO v_before_donation FROM public.treasury_donations;

  v_receipt:=public.treasury_donate_v2(v_key,v_user,'2','isolated proof');
  IF (v_receipt->>'success') IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Failed settlement';
  END IF;
  IF (SELECT available_amount FROM public.account_balances WHERE account_id=v_cash_id)<>v_before_cash-2
    OR (SELECT available_amount FROM public.account_balances WHERE account_id=v_treasury_id)<>v_before_treasury+2
    OR (SELECT balance_wld::numeric FROM public.system_treasury_vaults WHERE code='VAULT_MAIN')<>v_before_vault+2
    OR (SELECT count(*) FROM public.ledger_transactions)<>v_before_core+1
    OR (SELECT count(*) FROM public.system_treasury_ledger)<>v_before_fiscal+1
    OR (SELECT count(*) FROM public.treasury_donations)<>v_before_donation+1 THEN
    RAISE EXCEPTION 'Ledger double-entry/fiscal journal mismatch';
  END IF;

  v_repeat:=public.treasury_donate_v2(v_key,v_user,'2','isolated proof');
  IF v_repeat<>v_receipt
    OR (SELECT count(*) FROM public.ledger_transactions)<>v_before_core+1
    OR (SELECT count(*) FROM public.treasury_donations)<>v_before_donation+1 THEN
    RAISE EXCEPTION 'Same idempotency key was settled again';
  END IF;

  v_caught:=false;
  BEGIN
    PERFORM public.treasury_donate_v2(v_key,v_user,'3','isolated proof');
  EXCEPTION WHEN SQLSTATE '22023' THEN v_caught:=true;
  END;
  IF NOT v_caught THEN RAISE EXCEPTION 'Changed request wrongly accepted'; END IF;

  v_caught:=false;
  BEGIN
    PERFORM public.treasury_donate_v2(gen_random_uuid(),v_user,(v_before_cash+10000)::text,'insufficient');
  EXCEPTION WHEN SQLSTATE '22023' THEN v_caught:=true;
  END;
  IF NOT v_caught THEN RAISE EXCEPTION 'Unfunded settlement wrongly accepted'; END IF;
  IF (SELECT available_amount FROM public.account_balances WHERE account_id=v_cash_id)<>v_before_cash-2
    OR (SELECT count(*) FROM public.ledger_transactions)<>v_before_core+1 THEN
    RAISE EXCEPTION 'Failed payment changed money or journal';
  END IF;
  RAISE NOTICE 'CANONICAL_DONATION_V684_PASS; receipt %, actor %, exact double-entry 2 WLD and idempotency',v_receipt->>'transactionId',v_user;
END $audit$;
ROLLBACK;
