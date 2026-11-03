-- Production-restore clone ONLY; synthetic data is always ROLLED BACK.
\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
  v_admin uuid := pg_catalog.gen_random_uuid();
  v_member uuid := pg_catalog.gen_random_uuid();
  v_mint uuid;
  v_cash uuid;
  v_original uuid;
  v_correction uuid;
  v_balance numeric;
  v_rejected boolean := false;
BEGIN
  INSERT INTO public.users(id) VALUES (v_admin),(v_member);
  INSERT INTO public.user_roles(user_id,role) VALUES (v_admin,'superadmin');
  INSERT INTO public.accounts(account_type,owner_user_id)
  VALUES('USER_CASH',v_member),('USER_BANK',v_member);
  INSERT INTO public.account_balances(account_id)
  SELECT id FROM public.accounts WHERE owner_user_id=v_member;
  SELECT id INTO STRICT v_cash FROM public.accounts
    WHERE owner_user_id=v_member AND account_type='USER_CASH';
  SELECT id INTO STRICT v_mint FROM public.accounts
    WHERE system_key='mint' AND account_type='MINT';
  SELECT public.economy_post_transaction(
    pg_catalog.gen_random_uuid(),'ADMIN_ADJUSTMENT',v_member,NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_mint,'amount','500','direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_cash,'amount','500','direction','debit')),
    'test.funded','{}'::jsonb
  ) INTO v_original;
  SELECT (public.economy_reverse_transaction(
    pg_catalog.gen_random_uuid(),v_admin,v_original,
    'The campaign grant was issued to the wrong recipient')).transaction_id
  INTO v_correction;
  SELECT available_amount INTO STRICT v_balance FROM public.account_balances
  WHERE account_id=v_cash;
  IF v_balance<>0 OR NOT EXISTS (
    SELECT 1 FROM public.ledger_transactions WHERE id=v_correction
      AND reverses_transaction_id=v_original
  ) THEN RAISE EXCEPTION 'FAIL: correction did not reverse money / link'; END IF;
  IF (SELECT count(*) FROM public.finance_integrity_receipts
    WHERE transaction_id IN (v_original,v_correction))<>2 THEN
    RAISE EXCEPTION 'FAIL: correction receipts missing';END IF;
  BEGIN
    UPDATE public.ledger_transactions SET type='UNAUTHORIZED_CHANGE' WHERE id=v_original;
  EXCEPTION WHEN SQLSTATE '55000' THEN v_rejected:=true;
  END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'FAIL: mutable canonical transaction'; END IF;
  IF public.finance_integrity_scan()->>'status' <> 'CLEAN' THEN
    RAISE EXCEPTION 'FAIL: correction left global discrepancy';END IF;
  RAISE NOTICE 'PASS: correction reverses and links without mutating historic journal; receipts intact';
END
$$;
ROLLBACK;
