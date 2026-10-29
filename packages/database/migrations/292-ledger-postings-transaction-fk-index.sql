-- v2026.10.29.1203: transaction FK lookup index; no permission or money changes.
-- A foreign-key constraint does not automatically index the referencing side.
BEGIN;
CREATE INDEX IF NOT EXISTS idx_ledger_postings_transaction_id
 ON public.ledger_postings (transaction_id);
COMMIT;
