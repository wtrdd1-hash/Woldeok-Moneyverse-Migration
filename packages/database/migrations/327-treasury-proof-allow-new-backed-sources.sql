-- v2026.11.02.1626.2: continue accepting canonical new fiscal-epoch sources after archived reset. without making
-- old receipt data spendable. Invalid archive SHA, totals or current leftovers fail closed.
-- SECURITY DEFINER is the only app-read path for private fiscal archive and
-- historical dividend rows. Never grant raw app SELECT on those tables.
BEGIN;
CREATE OR REPLACE FUNCTION public.treasury_fiscal_proof_read()
RETURNS TABLE (
  database_name text,
  epoch_opened_at timestamptz,
  expected_treasury_count text,
  expected_dividend_count text,
  archive_total text,
  backup_sha256 text,
  archive_items_count text,
  archive_items_total text,
  vault_count text,
  vault_total text,
  canonical_count text,
  canonical_total text,
  journal_total text,
  historic_treasury_count text,
  historic_dividend_count text,
  invalid_new_sources text,
  verified_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $proof$
        WITH fiscal_epoch AS (
          SELECT * FROM public.treasury_fiscal_epochs WHERE id = 1
        ),
        reset_proof AS (
          SELECT r.reset_id IS NOT NULL AS has_reset,
                 (r.reset_id IS NOT NULL
                   AND r.verified_archive_rows = (
                     SELECT count(*) FROM public.finance_reset_archive_entries a
                     WHERE a.reset_id='v2026.11.02.1626'
                   )
                   AND r.original_row_counts = (
                     SELECT coalesce(jsonb_object_agg(source_table, n), '{}'::jsonb)
                     FROM (
                       SELECT a.source_table, count(*) AS n
                       FROM public.finance_reset_archive_entries a
                       WHERE a.reset_id='v2026.11.02.1626'
                       GROUP BY a.source_table
                     ) p
                   )
                   AND NOT EXISTS (
                     SELECT 1 FROM public.finance_reset_archive_entries a
                     WHERE a.reset_id='v2026.11.02.1626'
                       AND a.sha256 <> encode(public.digest(convert_to(a.payload::text,'UTF8'),'sha256'),'hex')
                   )
                   AND NOT EXISTS (
                     SELECT 1 FROM public.system_treasury_ledger l
                     WHERE l.created_at < (SELECT opened_at FROM public.treasury_fiscal_epochs WHERE id=1)
                   )
                   AND NOT EXISTS (
                     SELECT 1 FROM public.state_enterprise_dividend_logs d
                     WHERE d.created_at < (SELECT opened_at FROM public.treasury_fiscal_epochs WHERE id=1)
                   )
                   AND r.pre_reset_backup_sha256 ~ '^[a-f0-9]{64}$'
                 ) AS valid
          FROM (SELECT 1) one
          LEFT JOIN public.finance_reset_runs r ON r.reset_id='v2026.11.02.1626'
        )
        SELECT
          current_database()::text AS database_name,
          e.opened_at AS epoch_opened_at,
          e.archived_legacy_events::text AS expected_treasury_count,
          e.archived_enterprise_dividends::text AS expected_dividend_count,
          e.archived_vault_total_wld AS archive_total,
          e.full_backup_sha256 AS backup_sha256,
          jsonb_array_length(e.archived_vaults)::text AS archive_items_count,
          (SELECT coalesce(sum((item->>'balance_wld')::numeric), 0)::text
             FROM jsonb_array_elements(e.archived_vaults) AS item) AS archive_items_total,
          (SELECT count(*)::text FROM public.system_treasury_vaults) AS vault_count,
          (SELECT coalesce(sum(balance_wld::numeric), 0)::text
             FROM public.system_treasury_vaults) AS vault_total,
          (SELECT count(*)::text FROM public.accounts a
             JOIN public.account_balances ab ON ab.account_id = a.id
             WHERE a.account_type = 'TREASURY' AND a.system_key = 'treasury') AS canonical_count,
          (SELECT coalesce(sum(ab.available_amount), 0)::text
             FROM public.accounts a JOIN public.account_balances ab ON ab.account_id = a.id
             WHERE a.account_type = 'TREASURY' AND a.system_key = 'treasury') AS canonical_total,
          (SELECT coalesce(sum(CASE WHEN p.direction::text = 'debit'
              THEN p.amount ELSE -p.amount END), 0)::text
             FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id
             WHERE a.account_type = 'TREASURY' AND a.system_key = 'treasury') AS journal_total,
          (CASE WHEN rp.has_reset AND NOT rp.valid THEN '-1'
            WHEN rp.has_reset AND rp.valid THEN
              (SELECT count(*)::text FROM public.finance_reset_archive_entries a
               WHERE a.reset_id='v2026.11.02.1626' AND a.source_table='system_treasury_ledger')
            ELSE (SELECT count(*)::text FROM public.system_treasury_ledger l
                  WHERE l.created_at < e.opened_at) END) AS historic_treasury_count,
          (CASE WHEN rp.has_reset AND NOT rp.valid THEN '-1'
            WHEN rp.has_reset AND rp.valid THEN
              (SELECT count(*)::text FROM public.finance_reset_archive_entries a
               WHERE a.reset_id='v2026.11.02.1626' AND a.source_table='state_enterprise_dividend_logs')
            ELSE (SELECT count(*)::text FROM public.state_enterprise_dividend_logs d
                  WHERE d.created_at < e.opened_at) END) AS historic_dividend_count,
          (SELECT count(*)::text FROM (
             SELECT l.ledger_transaction_id AS tx_id, l.amount_wld::numeric AS amount
               FROM public.system_treasury_ledger l WHERE l.created_at >= e.opened_at
             UNION ALL
             SELECT d.ledger_tx_id AS tx_id, d.dividend_amount_wld::numeric AS amount
               FROM public.state_enterprise_dividend_logs d WHERE d.created_at >= e.opened_at
          ) src
          WHERE src.tx_id IS NULL OR src.amount IS NULL OR src.amount <= 0
            OR NOT EXISTS (
              SELECT 1 FROM public.ledger_transactions tx
              WHERE tx.id = src.tx_id AND tx.created_at >= e.opened_at
            )
            OR NOT EXISTS (
              SELECT 1 FROM public.ledger_postings p
              JOIN public.accounts a ON a.id = p.account_id
              WHERE p.transaction_id = src.tx_id
              GROUP BY p.transaction_id
              HAVING count(*) >= 2
                AND coalesce(sum(CASE WHEN p.direction::text = 'debit'
                    THEN p.amount ELSE -p.amount END), 0) = 0
                AND coalesce(sum(p.amount) FILTER (
                    WHERE a.account_type = 'TREASURY' AND a.system_key = 'treasury'), 0) = src.amount
            )) AS invalid_new_sources,
          statement_timestamp() AS verified_at
        FROM fiscal_epoch e CROSS JOIN reset_proof rp;
$proof$;
ALTER FUNCTION public.treasury_fiscal_proof_read() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_fiscal_proof_read() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_fiscal_proof_read() TO moneyverse_app;
-- Explicitly restate the least-privilege boundary.
REVOKE ALL ON TABLE public.treasury_fiscal_epochs,
  public.state_enterprise_dividend_logs FROM moneyverse_app;
COMMIT;
