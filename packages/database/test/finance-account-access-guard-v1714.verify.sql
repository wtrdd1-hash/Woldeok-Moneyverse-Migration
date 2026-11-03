-- v1714 — verify a restored, isolated PostgreSQL database after SQL329/330.
-- This proof runs read-only and must not alter balances or financial records.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;

DO $proof$
DECLARE
  v_bad bigint;
  v_accounts bigint;
  v_member_balance numeric;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (VALUES ('public.accounts'::text), ('public.account_balances'::text)) AS a(tbl)
    CROSS JOIN (VALUES ('INSERT'::text), ('UPDATE'), ('DELETE'),
                       ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) AS p(priv)
    WHERE pg_catalog.has_table_privilege('moneyverse_app',a.tbl,p.priv)
  ) THEN RAISE EXCEPTION 'APP_FINANCE_DIRECT_WRITE_NOT_REVOKED'; END IF;

  IF NOT pg_catalog.has_table_privilege('moneyverse_app','public.accounts','SELECT')
     OR NOT pg_catalog.has_table_privilege('moneyverse_app','public.account_balances','SELECT')
  THEN RAISE EXCEPTION 'APP_FINANCE_READ_NOT_PRESERVED'; END IF;

  SELECT count(*) INTO v_bad FROM (
    SELECT transaction_id,
           SUM(CASE WHEN direction::text='debit' THEN amount ELSE -amount END) AS net
    FROM public.ledger_postings GROUP BY transaction_id
  ) t WHERE t.net <> 0;
  IF v_bad <> 0 THEN RAISE EXCEPTION 'UNBALANCED_TRANSACTIONS: %',v_bad; END IF;

  SELECT count(*), count(*) FILTER (
    WHERE balance.available_amount IS DISTINCT FROM COALESCE(posted.net,0)
  ) INTO v_accounts,v_bad
  FROM public.account_balances balance
  LEFT JOIN (
    SELECT account_id,
           SUM(CASE WHEN direction::text='debit' THEN amount ELSE -amount END) AS net
    FROM public.ledger_postings GROUP BY account_id
  ) posted ON posted.account_id=balance.account_id;
  IF v_bad <> 0 THEN RAISE EXCEPTION 'ACCOUNT_BALANCE_DRIFT: % / %',v_bad,v_accounts; END IF;

  SELECT COALESCE(sum(b.available_amount),0) INTO v_member_balance
  FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.account_type::text IN ('USER_CASH','USER_BANK');
  RAISE NOTICE 'FINANCE_ACL_V1714_VERIFIED accounts=% member_wld=%',
     v_accounts,v_member_balance;
END;
$proof$;
ROLLBACK;
