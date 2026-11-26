-- Read-only ledger invariants (run against an isolated sandbox or Test DB; read-only, safe anywhere).
-- Every value must be 0 except the counters on the last line.
SELECT
  (SELECT count(*) FROM (
     SELECT transaction_id FROM public.ledger_postings
     GROUP BY transaction_id
     HAVING sum(CASE direction::text WHEN 'debit' THEN amount ELSE -amount END) <> 0) t) AS unbalanced_transactions,
  (SELECT count(*) FROM public.account_balances b
     LEFT JOIN (SELECT account_id, sum(CASE direction::text WHEN 'debit' THEN amount ELSE -amount END) AS s
                FROM public.ledger_postings GROUP BY account_id) l ON l.account_id = b.account_id
     WHERE b.available_amount <> coalesce(l.s, 0)) AS balance_ledger_mismatches,
  (SELECT count(*) FROM public.account_balances b JOIN public.accounts a ON a.id = b.account_id
     WHERE NOT a.allow_negative AND b.available_amount < 0) AS negative_disallowed_balances,
  (SELECT count(*) FROM public.ledger_transactions) AS transactions,
  (SELECT count(*) FROM public.ledger_postings) AS postings;
