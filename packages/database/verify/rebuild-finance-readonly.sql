-- v2026.10.29.1202: read-only reconstruction audit, run on isolated clone.
-- Differences are evidence, not automatic repair instructions.
BEGIN TRANSACTION READ ONLY;
SELECT 'public_tables' metric,count(*)::text value FROM information_schema.tables WHERE table_schema='public'
UNION ALL SELECT 'accounts',count(*)::text FROM public.accounts
UNION ALL SELECT 'account_balances',count(*)::text FROM public.account_balances
UNION ALL SELECT 'ledger_transactions',count(*)::text FROM public.ledger_transactions
UNION ALL SELECT 'ledger_postings',count(*)::text FROM public.ledger_postings
UNION ALL SELECT 'treasury_records',count(*)::text FROM public.system_treasury_ledger
UNION ALL SELECT 'treasury_records_without_ledger_link',count(*)::text FROM public.system_treasury_ledger WHERE ledger_transaction_id IS NULL;
WITH journal AS (
 SELECT t.id, count(p.id) AS postings,coalesce(sum(CASE WHEN p.direction::text='credit' THEN p.amount ELSE -p.amount END),0) AS delta
 FROM public.ledger_transactions t LEFT JOIN public.ledger_postings p ON p.transaction_id=t.id GROUP BY t.id
)
SELECT count(*) FILTER (WHERE delta<>0 OR postings<2) AS malformed_or_unbalanced_transactions FROM journal;
WITH diffs AS (
 SELECT a.account_type::text account_type,coalesce(b.available_amount,0) - coalesce(sum(CASE WHEN p.direction::text='credit' THEN p.amount ELSE -p.amount END),0) delta
 FROM public.accounts a LEFT JOIN public.account_balances b ON b.account_id=a.id LEFT JOIN public.ledger_postings p ON p.account_id=a.id
 GROUP BY a.id,a.account_type,b.available_amount
)
SELECT account_type,count(*) FILTER (WHERE delta<>0) mismatch_count,coalesce(sum(abs(delta)) FILTER(WHERE delta<>0),0)::text sum_absolute_delta FROM diffs GROUP BY account_type ORDER BY account_type;
SELECT table_name,privilege_type FROM information_schema.role_table_grants
 WHERE table_schema='public' AND grantee='moneyverse_app' AND table_name IN ('accounts','account_balances','ledger_transactions','ledger_postings','system_treasury_ledger') ORDER BY table_name,privilege_type;
COMMIT;
