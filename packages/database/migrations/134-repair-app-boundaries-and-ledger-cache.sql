-- Restore the application-role boundary relaxed by 131, make announcement
-- deletion auditable, and replace the environment-specific balance repair in
-- 132 with a ledger-derived reconciliation that is safe in every stack.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.identities FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.content_delete_announcement(
  p_actor uuid,
  p_announcement_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR (
    NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role)
    AND NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator privilege required';
  END IF;

  IF p_announcement_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement id required';
  END IF;

  DELETE FROM public.announcements AS announcement_row
  WHERE announcement_row.id = p_announcement_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  PERFORM public.admin_record_audit_event(
    p_actor,
    'content.announcement.deleted',
    p_announcement_id,
    pg_catalog.gen_random_uuid(),
    '{}'::jsonb
  );
  RETURN true;
END;
$$;

ALTER FUNCTION public.content_delete_announcement(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_delete_announcement(uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_delete_announcement(uuid, uuid) TO moneyverse_app;

WITH ledger_balances AS (
  SELECT
    account_row.id AS account_id,
    COALESCE(
      SUM(
        CASE posting_row.direction
          WHEN 'debit'::public.posting_direction THEN posting_row.amount
          WHEN 'credit'::public.posting_direction THEN -posting_row.amount
          ELSE 0
        END
      ),
      0
    )::bigint AS expected_amount
  FROM public.accounts AS account_row
  LEFT JOIN public.ledger_postings AS posting_row ON posting_row.account_id = account_row.id
  GROUP BY account_row.id
)
UPDATE public.account_balances AS balance_row
SET available_amount = ledger_balances.expected_amount,
    updated_at = pg_catalog.clock_timestamp()
FROM ledger_balances
WHERE balance_row.account_id = ledger_balances.account_id
  AND balance_row.available_amount IS DISTINCT FROM ledger_balances.expected_amount;

COMMIT;
