-- What a restored copy has to reproduce, as one JSON object.
--
-- Read twice: once by backup.sh straight after the dump, and once by
-- restore.sh against the restored database. Both readings go through this one
-- file so the two can never drift apart -- a figure that is computed
-- differently on the two sides proves nothing.
--
-- Every figure is bounded by :cutoff, a timestamp taken from the database
-- clock BEFORE pg_dump starts. pg_dump reads one repeatable-read snapshot
-- taken at its own start, so everything committed by the cutoff is inside the
-- dump; bounding the same way on both sides makes the comparison exact even
-- though the site kept trading while the dump ran.
--
-- Money never becomes a JSON number. bigint sums exceed what IEEE754 can hold
-- exactly, and jq or any other reader downstream would silently round them, so
-- every amount leaves here as a canonical integer string. Counts are not money
-- and stay numbers.
--
-- Run with: psql -X -qAt -v cutoff='<timestamptz>' -f backup-figures.sql

SELECT jsonb_build_object(
  'cutoff', to_char(c.at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),

  'users', (SELECT count(*) FROM public.users WHERE created_at <= c.at),
  'identities', (SELECT count(*) FROM public.identities WHERE linked_at <= c.at),
  'accounts', (SELECT count(*) FROM public.accounts WHERE created_at <= c.at),
  'photos', (SELECT count(*) FROM public.photos WHERE created_at <= c.at),
  'audit_logs', (SELECT count(*) FROM public.audit_logs WHERE created_at <= c.at),

  'ledger_transactions',
    (SELECT count(*) FROM public.ledger_transactions WHERE created_at <= c.at),
  'ledger_postings',
    (SELECT count(*)
       FROM public.ledger_postings p
       JOIN public.ledger_transactions t ON t.id = p.transaction_id
      WHERE t.created_at <= c.at),

  -- A posting is bounded by the transaction it belongs to rather than by its
  -- own created_at, so a transaction is never half-counted.
  'ledger_debit_total',
    (SELECT coalesce(sum(p.amount), 0)::text
       FROM public.ledger_postings p
       JOIN public.ledger_transactions t ON t.id = p.transaction_id
      WHERE t.created_at <= c.at AND p.direction = 'debit'),
  'ledger_credit_total',
    (SELECT coalesce(sum(p.amount), 0)::text
       FROM public.ledger_postings p
       JOIN public.ledger_transactions t ON t.id = p.transaction_id
      WHERE t.created_at <= c.at AND p.direction = 'credit'),

  -- The balance every account should hold at the cutoff, derived from the
  -- ledger the way 018-economy-reconciliation-health.sql derives it: a debit
  -- raises the account, a credit lowers it. Derived rather than read from
  -- account_balances because that table is mutable -- reading it after the
  -- dump would include movements the dump does not contain, and the two sides
  -- would differ for a reason that is not data loss.
  'account_balance_total',
    (SELECT (coalesce(sum(p.amount) FILTER (WHERE p.direction = 'debit'), 0)
           - coalesce(sum(p.amount) FILTER (WHERE p.direction = 'credit'), 0))::text
       FROM public.ledger_postings p
       JOIN public.ledger_transactions t ON t.id = p.transaction_id
      WHERE t.created_at <= c.at),

  -- Photo metadata, content and not just row count: the gallery comes back
  -- wrong rather than empty if a storage_key is reattached to another row, or
  -- if a draft returns published. coalesce on every part because one NULL
  -- would make its whole row vanish from string_agg rather than change the
  -- digest. md5 is a checksum here and not a security claim.
  'photo_digest',
    (SELECT coalesce(
              md5(string_agg(
                id::text
                  || ':' || coalesce(storage_key, '')
                  || ':' || coalesce(visibility, '')
                  || ':' || coalesce(content_state, ''),
                ',' ORDER BY id
              )),
              'empty')
       FROM public.photos WHERE created_at <= c.at),

  -- Unbounded, and the one figure restore.sh asserts rather than compares: the
  -- number of accounts whose stored balance disagrees with its own postings.
  -- It must be 0 in the restored copy whatever the cutoff was, because a
  -- restore that tore a transaction in half shows up here and nowhere else.
  --
  -- An account with no balance row at all is counted beside it rather than
  -- inside it -- 018 keeps the two apart for the same reason. It is an anomaly
  -- the restore inherited rather than caused, so it is compared like every
  -- other figure instead of failing a restore that reproduced the database
  -- faithfully.
  'balance_mismatch_accounts',
    (SELECT count(*) FROM (
       SELECT b.available_amount AS stored,
              coalesce(sum(p.amount) FILTER (WHERE p.direction = 'debit'), 0)
            - coalesce(sum(p.amount) FILTER (WHERE p.direction = 'credit'), 0) AS derived
         FROM public.accounts a
         LEFT JOIN public.account_balances b ON b.account_id = a.id
         LEFT JOIN public.ledger_postings p ON p.account_id = a.id
        GROUP BY a.id, b.available_amount
     ) per_account WHERE stored IS NOT NULL AND stored <> derived),
  'missing_balance_accounts',
    (SELECT count(*)
       FROM public.accounts a
       LEFT JOIN public.account_balances b ON b.account_id = a.id
      WHERE b.account_id IS NULL)
)
FROM (SELECT :'cutoff'::timestamptz AS at) AS c;
