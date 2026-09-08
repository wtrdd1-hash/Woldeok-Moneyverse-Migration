-- Read-only integrity audit for backup/restore and periodic operations checks.
-- Returns one JSON object and never exposes member-level data.
-- Run as moneyverse_backup so the audit cannot mutate production data.

WITH
ledger AS (
  SELECT
    count(*) FILTER (WHERE p.direction = 'debit') AS debit_postings,
    count(*) FILTER (WHERE p.direction = 'credit') AS credit_postings,
    coalesce(sum(p.amount) FILTER (WHERE p.direction = 'debit'), 0) AS debit_total,
    coalesce(sum(p.amount) FILTER (WHERE p.direction = 'credit'), 0) AS credit_total
  FROM public.ledger_postings p
),
per_account AS (
  SELECT a.id,
         b.available_amount AS stored,
         coalesce(sum(p.amount) FILTER (WHERE p.direction = 'debit'), 0)
       - coalesce(sum(p.amount) FILTER (WHERE p.direction = 'credit'), 0) AS derived
    FROM public.accounts a
    LEFT JOIN public.account_balances b ON b.account_id = a.id
    LEFT JOIN public.ledger_postings p ON p.account_id = a.id
   GROUP BY a.id, b.available_amount
),
orphans AS (
  SELECT
    (SELECT count(*) FROM public.ledger_postings p
      LEFT JOIN public.ledger_transactions t ON t.id = p.transaction_id
     WHERE t.id IS NULL) AS postings_without_transaction,
    (SELECT count(*) FROM public.account_balances b
      LEFT JOIN public.accounts a ON a.id = b.account_id
     WHERE a.id IS NULL) AS balances_without_account,
    (SELECT count(*) FROM public.identities i
      LEFT JOIN public.users u ON u.id = i.user_id
     WHERE u.id IS NULL) AS identities_without_user
),
figures AS (
  SELECT
    (SELECT count(*) FROM public.users) AS users,
    (SELECT count(*) FROM public.accounts) AS accounts,
    (SELECT count(*) FROM public.ledger_transactions) AS ledger_transactions,
    (SELECT count(*) FROM public.ledger_postings) AS ledger_postings,
    (SELECT count(*) FROM public.audit_logs) AS audit_logs
)
SELECT jsonb_build_object(
  'schema', 'moneyverse-data-audit/1',
  'checked_at', to_char(clock_timestamp() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
  'figures', jsonb_build_object(
    'users', f.users,
    'accounts', f.accounts,
    'ledger_transactions', f.ledger_transactions,
    'ledger_postings', f.ledger_postings,
    'audit_logs', f.audit_logs,
    'ledger_debit_total', l.debit_total::text,
    'ledger_credit_total', l.credit_total::text
  ),
  'anomalies', jsonb_build_object(
    'balance_mismatch_accounts', (SELECT count(*) FROM per_account WHERE stored IS NOT NULL AND stored <> derived),
    'missing_balance_accounts', (SELECT count(*) FROM per_account WHERE stored IS NULL),
    'postings_without_transaction', o.postings_without_transaction,
    'balances_without_account', o.balances_without_account,
    'identities_without_user', o.identities_without_user,
    'ledger_total_difference', (l.debit_total - l.credit_total)::text
  ),
  'healthy',
       (SELECT count(*) FROM per_account WHERE stored IS NOT NULL AND stored <> derived) = 0
   AND (SELECT count(*) FROM per_account WHERE stored IS NULL) = 0
   AND o.postings_without_transaction = 0
   AND o.balances_without_account = 0
   AND o.identities_without_user = 0
   AND l.debit_total = l.credit_total
)
FROM figures f CROSS JOIN ledger l CROSS JOIN orphans o;
