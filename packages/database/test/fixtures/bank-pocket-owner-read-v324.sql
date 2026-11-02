-- Disposable PostgreSQL only: verify the Nest owner-read function and ACL.
BEGIN;
INSERT INTO public.users(id) VALUES
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222');
INSERT INTO public.bank_saving_pockets(id, user_id, name, balance, target_amount, target_date)
VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Owner A', 9007199254740993, 9007199254740994, '2026-12-31'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Owner B', 7, NULL, NULL);
SET LOCAL ROLE moneyverse_app;
DO $test$
DECLARE v_count integer; v_balance text; v_denied boolean := false;
BEGIN
  SELECT count(*), max(balance::text) INTO v_count, v_balance
  FROM public.bank_list_pockets('11111111-1111-4111-8111-111111111111');
  IF v_count <> 1 OR v_balance <> '9007199254740993' THEN
    RAISE EXCEPTION 'owner A read mismatch: % %', v_count, v_balance;
  END IF;
  SELECT count(*) INTO v_count
  FROM public.bank_list_pockets('22222222-2222-4222-8222-222222222222');
  IF v_count <> 1 THEN RAISE EXCEPTION 'owner B read mismatch: %', v_count; END IF;
  SELECT count(*) INTO v_count
  FROM public.bank_list_pockets('33333333-3333-4333-8333-333333333333');
  IF v_count <> 0 THEN RAISE EXCEPTION 'foreign/nonexistent actor returned rows'; END IF;
  BEGIN
    EXECUTE 'SELECT count(*) FROM public.bank_saving_pockets' INTO v_count;
  EXCEPTION WHEN insufficient_privilege THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'app role can read pocket table directly'; END IF;
  IF has_table_privilege('moneyverse_app','public.bank_saving_pockets','INSERT') THEN
    RAISE EXCEPTION 'app role can write pocket table directly';
  END IF;
  RAISE NOTICE 'BANK_POCKET_OWNER_READ_REAL_PG_PASS';
END
$test$;
RESET ROLE;
ROLLBACK;
