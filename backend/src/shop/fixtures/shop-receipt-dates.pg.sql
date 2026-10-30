-- Run on an isolated, fully migrated PostgreSQL instance as the migration owner.
-- Synthetic receipts and balanced ledger postings are rolled back; never run in Production.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.users(id, status) VALUES
  ('00000000-0000-4000-8000-000000000001','active'),
  ('00000000-0000-4000-8000-000000000002','active');
INSERT INTO public.shop_items(id, name, description, price, active)
VALUES ('00000000-0000-4000-8000-000000000099','Synthetic Gloves','fixture only',1,true);
INSERT INTO public.accounts(id,account_type,owner_user_id) VALUES
  ('00000000-0000-4000-8000-000000000091','USER_CASH','00000000-0000-4000-8000-000000000001');
INSERT INTO public.account_balances(account_id) VALUES ('00000000-0000-4000-8000-000000000091');
DO $fixture$
DECLARE i int; tx uuid; actor uuid; ts timestamptz; sink uuid;
BEGIN
  SELECT id INTO sink FROM public.accounts WHERE system_key='sink';
  FOR i IN 1..108 LOOP
    actor := CASE WHEN i <= 105 THEN '00000000-0000-4000-8000-000000000001'::uuid ELSE '00000000-0000-4000-8000-000000000002'::uuid END;
    ts := CASE WHEN i <= 5 THEN '2026-10-28T14:59:59Z'::timestamptz ELSE '2026-10-29T14:59:59Z'::timestamptz END;
    tx := gen_random_uuid();
    INSERT INTO public.ledger_transactions(id,idempotency_key,type,actor_user_id,created_at,request_hash) VALUES(tx,gen_random_uuid(),'shop_fixture',actor,ts,decode(md5(tx::text)||md5(actor::text),'hex'));
    INSERT INTO public.ledger_postings(transaction_id,account_id,amount,direction)
      VALUES (tx,'00000000-0000-4000-8000-000000000091',1,'debit'),(tx,sink,1,'credit');
    INSERT INTO public.purchases(user_id,item_id,transaction_id,paid_amount,created_at)
      VALUES(actor,'00000000-0000-4000-8000-000000000099',tx,1,ts);
  END LOOP;
END;
$fixture$;
SET ROLE moneyverse_app;
DO $assert$
DECLARE owner uuid := '00000000-0000-4000-8000-000000000001'; other uuid := '00000000-0000-4000-8000-000000000002';
BEGIN
  IF (SELECT count(*) FROM public.shop_list_my_purchases(owner,100)) <> 100 THEN RAISE EXCEPTION 'owner latest 100 cap failed'; END IF;
  IF (SELECT count(*) FROM public.shop_list_my_purchases(owner,100) WHERE purchased_at >= '2026-10-28T15:00:00Z' AND purchased_at < '2026-10-29T15:00:00Z') <> 100 THEN RAISE EXCEPTION 'KST day or latest 100 boundary failed'; END IF;
  IF (SELECT count(*) FROM public.shop_list_my_purchases(other,100)) <> 3 THEN RAISE EXCEPTION 'other owner count failed'; END IF;
  IF (SELECT count(*) FROM public.shop_list_my_purchases(owner,30)) <> 30 THEN RAISE EXCEPTION 'legacy cap failed'; END IF;
  RAISE NOTICE 'PASS: owner isolation, latest 30/100, KST half-open day, date filter after 100';
END;
$assert$;
RESET ROLE;
DO $ledger$
BEGIN
  IF EXISTS (
    SELECT transaction_id FROM public.ledger_postings
    WHERE transaction_id IN (SELECT id FROM public.ledger_transactions WHERE type='shop_fixture')
    GROUP BY transaction_id
    HAVING sum(CASE WHEN direction='debit' THEN amount ELSE -amount END) <> 0
  ) THEN RAISE EXCEPTION 'unbalanced synthetic ledger'; END IF;
  RAISE NOTICE 'PASS: synthetic ledger postings balanced';
END;
$ledger$;
SELECT has_table_privilege('moneyverse_app','public.purchases','SELECT') AS app_direct_purchase_select,
       has_table_privilege('moneyverse_app','public.purchases','INSERT') AS app_direct_purchase_insert;
ROLLBACK;
