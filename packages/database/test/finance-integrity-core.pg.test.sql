-- Disposable database only. Uses synthetic accounts and amounts, not Production.
\set ON_ERROR_STOP on

DO $tests$
DECLARE
  v_actor uuid := pg_catalog.gen_random_uuid();
  v_second_actor uuid := pg_catalog.gen_random_uuid();
  v_mint uuid;
  v_treasury uuid;
  v_cash uuid;
  v_cash2 uuid;
  v_bank uuid;
  v_escrow uuid;
  v_key uuid := pg_catalog.gen_random_uuid();
  v_tx uuid;
  v_replay uuid;
  v_amount numeric := 90071992547409939999;
  v_request jsonb;
  v_scan jsonb;
  v_before bigint;
BEGIN
  INSERT INTO public.accounts(account_type,system_key,allow_negative)
  VALUES('MINT','synthetic-mint',true) RETURNING id INTO v_mint;
  INSERT INTO public.accounts(account_type,system_key)
  VALUES('TREASURY','synthetic-treasury') RETURNING id INTO v_treasury;
  INSERT INTO public.accounts(account_type,owner_user_id)
  VALUES('USER_CASH',v_actor) RETURNING id INTO v_cash;
  INSERT INTO public.accounts(account_type,owner_user_id)
  VALUES('USER_CASH',v_second_actor) RETURNING id INTO v_cash2;
  INSERT INTO public.accounts(account_type,owner_user_id)
  VALUES('USER_BANK',v_actor) RETURNING id INTO v_bank;
  INSERT INTO public.accounts(account_type,system_key)
  VALUES('ESCROW','synthetic-market') RETURNING id INTO v_escrow;
  INSERT INTO public.account_balances(account_id)
  SELECT id FROM public.accounts;

  v_request := pg_catalog.jsonb_build_array(
    pg_catalog.jsonb_build_object('accountId',v_mint,'direction','credit','amount',v_amount::text),
    pg_catalog.jsonb_build_object('accountId',v_treasury,'direction','debit','amount',v_amount::text)
  );
  v_tx := public.economy_post_transaction(v_key,'TREASURY_FUNDED',v_actor,NULL,
    v_request,'treasury.test',pg_catalog.jsonb_build_object('scope','isolated'));
  IF NOT EXISTS (SELECT 1 FROM public.finance_integrity_receipts
    WHERE transaction_id=v_tx AND domain='TREASURY'
      AND evidence->>'schemaVersion'='1' AND
      evidence->>'postingNetWld'='0')
  THEN RAISE EXCEPTION 'FAIL: missing atomic Treasury proof'; END IF;
  IF (SELECT available_amount FROM public.account_balances
    WHERE account_id=v_treasury) <> v_amount
  THEN RAISE EXCEPTION 'FAIL: numeric precision was lost'; END IF;

  v_replay := public.economy_post_transaction(v_key,'TREASURY_FUNDED',v_actor,NULL,
    v_request,'treasury.test',pg_catalog.jsonb_build_object('scope','isolated'));
  IF v_replay<>v_tx OR (SELECT count(*) FROM public.ledger_transactions)<>1
    OR (SELECT count(*) FROM public.finance_integrity_receipts)<>1
  THEN RAISE EXCEPTION 'FAIL: idempotency replay double posted'; END IF;

  BEGIN
    PERFORM public.economy_post_transaction(v_key,'TREASURY_FUNDED',v_actor,NULL,
      v_request,'treasury.test',pg_catalog.jsonb_build_object('scope','changed'));
    RAISE EXCEPTION 'FAIL: idempotency key accepted changed payload';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'TREASURY_GRANT',
    v_actor,NULL,pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_treasury,'direction','credit','amount','10000'),
      pg_catalog.jsonb_build_object('accountId',v_cash,'direction','debit','amount','10000')
    ),'treasury.grant', '{}'::jsonb);
  PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'USER_TRANSFER',
    v_actor,NULL,pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash,'direction','credit','amount','3000'),
      pg_catalog.jsonb_build_object('accountId',v_cash2,'direction','debit','amount','3000')
    ),'wallet.transfer', '{}'::jsonb);
  PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'BANK_DEPOSIT',
    v_actor,NULL,pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash,'direction','credit','amount','2000'),
      pg_catalog.jsonb_build_object('accountId',v_bank,'direction','debit','amount','2000')
    ),'bank.deposit','{}'::jsonb);
  PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'STOCK_ORDER',
    v_second_actor,NULL,pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash2,'direction','credit','amount','1000'),
      pg_catalog.jsonb_build_object('accountId',v_escrow,'direction','debit','amount','1000')
    ),'market.order','{}'::jsonb);

  IF (SELECT count(*) FROM public.finance_integrity_receipts) <> 5 OR
     (SELECT count(DISTINCT domain) FROM public.finance_integrity_receipts) <> 4
  THEN RAISE EXCEPTION 'FAIL: missing domain proof'; END IF;

  SELECT count(*) INTO v_before FROM public.ledger_transactions;
  BEGIN
    PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'USER_TRANSFER',
      v_actor,NULL,pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('accountId',v_cash,'direction','credit','amount','9999999'),
        pg_catalog.jsonb_build_object('accountId',v_cash2,'direction','debit','amount','9999999')
      ),'wallet.transfer','{}'::jsonb);
    RAISE EXCEPTION 'FAIL: overdraft accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'UNBALANCED',
      v_actor,NULL,pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('accountId',v_cash,'direction','credit','amount','30'),
        pg_catalog.jsonb_build_object('accountId',v_cash2,'direction','debit','amount','20')
      ),'wallet.transfer','{}'::jsonb);
    RAISE EXCEPTION 'FAIL: unbalanced journal accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  IF (SELECT count(*) FROM public.ledger_transactions)<>v_before
  THEN RAISE EXCEPTION 'FAIL: rejected trade partially saved'; END IF;

  BEGIN
    UPDATE public.finance_integrity_receipts SET evidence='{}'::jsonb
      WHERE transaction_id=v_tx;
    RAISE EXCEPTION 'FAIL: immutable proof changed';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    DELETE FROM public.ledger_postings WHERE transaction_id=v_tx;
    RAISE EXCEPTION 'FAIL: ledger postings were deleted';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  SELECT public.finance_integrity_scan() INTO v_scan;
  IF v_scan->>'status'<>'CLEAN' THEN
    RAISE EXCEPTION 'FAIL: five valid domain trades not clean: %',v_scan;
  END IF;

  -- Deliberate synthetic corruption demonstrates fail-visible detection; it
  -- never touches member/Production data or attempts silent auto-correction.
  UPDATE public.account_balances SET available_amount=available_amount+1
    WHERE account_id=v_cash;
  SELECT public.finance_integrity_scan() INTO v_scan;
  IF v_scan->>'status'<>'ALERT'
    OR (v_scan->>'balanceDiscrepancies')::bigint<>1
  THEN RAISE EXCEPTION 'FAIL: corrupt balance not detected'; END IF;
  UPDATE public.account_balances SET available_amount=available_amount-1
    WHERE account_id=v_cash;
  RAISE NOTICE 'PASS: huge exact WLD, five domain transactions, 4 domains, replay, rollback, immutable receipts and ledger, drift alert';
END
$tests$;

-- Deliberately reject proof writing *after* the primitive wrote its journal,
-- balance and outbox. The surrounding SQL statement must roll back all four.
CREATE FUNCTION public.finance_test_block_receipt()
RETURNS trigger LANGUAGE plpgsql AS $body$
BEGIN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='synthetic receipt I/O failure'; END
$body$;
CREATE TRIGGER finance_test_receipt_failure
  BEFORE INSERT ON public.finance_integrity_receipts
  FOR EACH ROW EXECUTE FUNCTION public.finance_test_block_receipt();
DO $atomic$
DECLARE
  v_mint uuid; v_treasury uuid; v_actor uuid := pg_catalog.gen_random_uuid();
  v_balance numeric; v_tx bigint; v_post bigint; v_outbox bigint;
BEGIN
  SELECT id INTO STRICT v_mint FROM public.accounts WHERE system_key='synthetic-mint';
  SELECT id INTO STRICT v_treasury FROM public.accounts WHERE system_key='synthetic-treasury';
  SELECT available_amount INTO STRICT v_balance FROM public.account_balances
   WHERE account_id=v_treasury;
  SELECT count(*) INTO v_tx FROM public.ledger_transactions;
  SELECT count(*) INTO v_post FROM public.ledger_postings;
  SELECT count(*) INTO v_outbox FROM public.outbox_events;
  BEGIN
    PERFORM public.economy_post_transaction(pg_catalog.gen_random_uuid(),'TREASURY_TEST_ROLLBACK',
      v_actor,NULL,pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_mint,'direction','credit','amount','111'),
      pg_catalog.jsonb_build_object('accountId',v_treasury,'direction','debit','amount','111')
      ),'treasury.rollback','{}'::jsonb);
    RAISE EXCEPTION 'FAIL: receipt write error was ignored';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  IF (SELECT available_amount FROM public.account_balances WHERE account_id=v_treasury)<>v_balance
     OR (SELECT count(*) FROM public.ledger_transactions)<>v_tx
     OR (SELECT count(*) FROM public.ledger_postings)<>v_post
     OR (SELECT count(*) FROM public.outbox_events)<>v_outbox THEN
    RAISE EXCEPTION 'FAIL: partial money or event write remained after proof failure';
  END IF;
  RAISE NOTICE 'PASS: proof insert failure rolled back journal, balances and outbox';
END
$atomic$;
DROP TRIGGER finance_test_receipt_failure ON public.finance_integrity_receipts;
DROP FUNCTION public.finance_test_block_receipt();

-- Confirm the *external* low privilege web principal cannot directly call
-- the accounting primitive, proof helper, scanner or proof table.
SET ROLE moneyverse_app;
DO $acl$
BEGIN
  BEGIN
    PERFORM public.finance_integrity_scan();
    RAISE EXCEPTION 'FAIL: web role can scan finance core';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.finance_integrity_assert_and_record(NULL,NULL,NULL,NULL,NULL);
    RAISE EXCEPTION 'FAIL: web role can call proof core';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.economy_post_transaction(
      pg_catalog.gen_random_uuid(),'EXTERNAL',pg_catalog.gen_random_uuid(),NULL,
      '[]'::jsonb,'x','{}'::jsonb);
    RAISE EXCEPTION 'FAIL: web role can call raw money primitive';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM count(*) FROM public.finance_integrity_receipts;
    RAISE EXCEPTION 'FAIL: web role can read financial evidence';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: untrusted web role denied internal financial interfaces';
END
$acl$;
RESET ROLE;

SET ROLE moneyverse_reconciler;
SELECT public.finance_integrity_scan()->>'status' AS read_only_reconciler_status;
RESET ROLE;
