-- v2026.10.29.1203: fail-closed, read-only financial schema acceptance.
BEGIN TRANSACTION READ ONLY;
DO $audit$
DECLARE v_bad bigint; v_name text;
BEGIN
 SELECT count(*) INTO v_bad FROM pg_catalog.pg_constraint c
 WHERE c.connamespace='public'::regnamespace AND NOT c.convalidated;
 IF v_bad<>0 THEN RAISE EXCEPTION 'unvalidated constraints: %',v_bad; END IF;
 SELECT count(*) INTO v_bad FROM pg_catalog.pg_index i
 JOIN pg_catalog.pg_class t ON t.oid=i.indrelid JOIN pg_catalog.pg_namespace n ON n.oid=t.relnamespace
 WHERE n.nspname='public' AND (NOT i.indisvalid OR NOT i.indisready);
 IF v_bad<>0 THEN RAISE EXCEPTION 'invalid indexes: %',v_bad; END IF;
 SELECT count(*) INTO v_bad FROM pg_catalog.pg_class t JOIN pg_catalog.pg_namespace n ON n.oid=t.relnamespace
 WHERE n.nspname='public' AND t.relkind='r' AND NOT EXISTS
 (SELECT 1 FROM pg_catalog.pg_constraint c WHERE c.conrelid=t.oid AND c.contype='p');
 IF v_bad<>0 THEN RAISE EXCEPTION 'tables missing primary keys: %',v_bad; END IF;
 FOREACH v_name IN ARRAY ARRAY['accounts','account_balances','ledger_transactions','ledger_postings','system_treasury_ledger'] LOOP
  SELECT count(*) INTO v_bad FROM pg_catalog.pg_constraint c
  WHERE c.conrelid=('public.'||v_name)::regclass AND c.contype='p';
  IF v_bad<>1 THEN RAISE EXCEPTION 'missing primary key: %',v_name; END IF;
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_indexes WHERE schemaname='public' AND tablename='ledger_postings' AND indexname='idx_ledger_postings_transaction_id')
 THEN RAISE EXCEPTION 'missing FK transaction lookup index'; END IF;
 IF EXISTS (SELECT 1 FROM public.ledger_transactions WHERE idempotency_key IS NULL)
 THEN RAISE EXCEPTION 'null ledger idempotency key'; END IF;
 IF EXISTS (SELECT 1 FROM public.ledger_postings WHERE transaction_id IS NULL OR account_id IS NULL OR amount<=0)
 THEN RAISE EXCEPTION 'invalid ledger posting'; END IF;
 SELECT count(*) INTO v_bad FROM (
  SELECT t.id FROM public.ledger_transactions t LEFT JOIN public.ledger_postings p ON p.transaction_id=t.id
  GROUP BY t.id HAVING count(p.id)<2 OR coalesce(sum(CASE WHEN p.direction::text='credit' THEN p.amount ELSE -p.amount END),0)<>0
 ) problem;
 IF v_bad<>0 THEN RAISE EXCEPTION 'unbalanced or unposted ledger transactions: %',v_bad; END IF;
 RAISE NOTICE 'PASS: primary keys, validated constraints, valid indexes, idempotency, postings and balanced ledger';
END $audit$;
COMMIT;
