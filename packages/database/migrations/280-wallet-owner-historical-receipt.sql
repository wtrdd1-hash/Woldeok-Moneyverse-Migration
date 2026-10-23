-- Read one committed owner wallet transaction without exposing other ledger legs.
-- Forward-only: a receipt is evidence of posted WLD movement, not a refund.
BEGIN;

CREATE FUNCTION public.wallet_owner_transaction_receipt(p_actor uuid, p_transaction uuid)
RETURNS TABLE (
  transaction_id uuid,
  type text,
  created_at timestamptz,
  net_amount text,
  cash_delta text,
  bank_delta text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $receipt$
  SELECT
    transaction.id,
    transaction.type,
    transaction.created_at,
    COALESCE(SUM(CASE posting.direction
      WHEN 'debit'::public.posting_direction THEN posting.amount
      ELSE -posting.amount
    END), 0)::text,
    COALESCE(SUM(CASE WHEN account.account_type = 'USER_CASH'::public.account_type
      THEN CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount ELSE -posting.amount END
      ELSE 0 END), 0)::text,
    COALESCE(SUM(CASE WHEN account.account_type = 'USER_BANK'::public.account_type
      THEN CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount ELSE -posting.amount END
      ELSE 0 END), 0)::text
  FROM public.ledger_transactions AS transaction
  JOIN public.ledger_postings AS posting ON posting.transaction_id = transaction.id
  JOIN public.accounts AS account ON account.id = posting.account_id
  WHERE transaction.id = p_transaction
    AND account.owner_user_id = p_actor
    AND account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
  GROUP BY transaction.id, transaction.type, transaction.created_at;
$receipt$;

REVOKE ALL ON FUNCTION public.wallet_owner_transaction_receipt(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_owner_transaction_receipt(uuid, uuid) TO moneyverse_app;
COMMIT;
