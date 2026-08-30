-- What the superadmin's dashboard reads, and the alerts it raises.
--
-- Spec 14.9 lists what the operations screen shows: the money supply, what
-- was issued and burned over an hour, a day and a week, where payouts came
-- from, what failed, how concentrated holdings are, and whether the ledger
-- reconciles. None of it existed as a read model -- the console showed thirty
-- audit rows and a Discord outbox table.
--
-- 17.10 names the things that must raise an alert: administrator sign-in
-- failure, a permission change, a bulk payout, a large correction, and a log
-- integrity failure. An alert is a row here rather than a message somewhere,
-- because a message that nobody was watching for is indistinguishable from
-- one that was never sent.

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  kind text NOT NULL CHECK (kind ~ '^[a-z][a-z0-9_.]{2,63}$'),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  summary text NOT NULL CHECK (pg_catalog.char_length(summary) BETWEEN 1 AND 500),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- The window this alert is about, so the same hour cannot raise the same
  -- alert twice however often the detector runs.
  dedupe_key text NOT NULL,
  raised_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  acknowledged_by uuid REFERENCES public.users(id),
  acknowledged_at timestamptz,
  UNIQUE (kind, dedupe_key)
);

CREATE INDEX IF NOT EXISTS admin_alerts_open
  ON public.admin_alerts (raised_at DESC) WHERE acknowledged_at IS NULL;

REVOKE ALL PRIVILEGES ON TABLE public.admin_alerts FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_raise_alert(
  p_kind text,
  p_severity text,
  p_summary text,
  p_dedupe_key text,
  p_detail jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_kind IS NULL OR p_kind !~ '^[a-z][a-z0-9_.]{2,63}$'
    OR coalesce(p_severity, '') NOT IN ('info', 'warning', 'critical')
    OR coalesce(public.audit_normalize_text(p_summary, 500), '') = ''
    OR coalesce(p_dedupe_key, '') = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid alert';
  END IF;

  INSERT INTO public.admin_alerts (kind, severity, summary, dedupe_key, detail)
  VALUES (
    p_kind, p_severity, public.audit_normalize_text(p_summary, 500), p_dedupe_key,
    coalesce(p_detail, '{}'::jsonb)
  )
  ON CONFLICT (kind, dedupe_key) DO NOTHING;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_acknowledge_alert(
  p_actor uuid,
  p_alert uuid,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_changed integer;
BEGIN
  IF p_actor IS NULL OR p_alert IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and alert are required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'acknowledging an alert requires an administrator';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  UPDATE public.admin_alerts AS alert_row
  SET acknowledged_by = p_actor, acknowledged_at = pg_catalog.clock_timestamp()
  WHERE alert_row.id = p_alert AND alert_row.acknowledged_at IS NULL;

  GET DIAGNOSTICS v_changed = ROW_COUNT;
  IF v_changed = 0 THEN
    RETURN false;
  END IF;

  PERFORM public.admin_record_audit_event(
    p_actor, 'admin.alert.acknowledged', p_alert, NULL, '{}'::jsonb,
    pg_catalog.jsonb_build_object(
      'feature', 'alerts', 'targetKind', 'alert', 'reason', v_reason, 'outcome', 'success'
    )
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_alerts(p_actor uuid, p_limit integer)
RETURNS TABLE(
  alert_id uuid, kind text, severity text, summary text, detail jsonb,
  raised_at timestamptz, acknowledged_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 200);
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'alert visibility requires an administrator';
  END IF;

  RETURN QUERY
  SELECT alert_row.id, alert_row.kind, alert_row.severity, alert_row.summary,
         alert_row.detail, alert_row.raised_at, alert_row.acknowledged_at
  FROM public.admin_alerts AS alert_row
  ORDER BY (alert_row.acknowledged_at IS NULL) DESC, alert_row.raised_at DESC
  LIMIT v_limit;
END;
$$;

-- The operations screen, in one call.
--
-- Issuance and burn are read from the postings themselves rather than from a
-- rolling counter, because a counter that drifts from the ledger is worse
-- than no counter: it is the ledger that the correction path, the caps and
-- the adjustment engine all agree on.
CREATE OR REPLACE FUNCTION public.admin_economy_dashboard(p_actor uuid)
RETURNS TABLE(
  m2_amount numeric,
  member_cash_amount numeric,
  member_bank_amount numeric,
  escrow_amount numeric,
  net_mint_issuance_amount numeric,
  sink_absorbed_amount numeric,
  issued_1h numeric,
  issued_24h numeric,
  issued_7d numeric,
  burned_24h numeric,
  net_issued_24h numeric,
  top_holder_share numeric,
  member_count bigint,
  reconciliation_ok boolean,
  reconciliation_at timestamptz,
  failed_outbox_count bigint,
  open_alert_count bigint,
  running_job_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'the dashboard requires an administrator';
  END IF;

  RETURN QUERY
  WITH supply AS (SELECT * FROM public.economy_money_supply()),
  minted AS (
    SELECT
      coalesce(sum(posting_row.amount::numeric) FILTER (
        WHERE posting_row.direction = 'credit'::public.posting_direction
          AND transaction_row.created_at > pg_catalog.clock_timestamp() - interval '1 hour'), 0) AS issued_1h,
      coalesce(sum(posting_row.amount::numeric) FILTER (
        WHERE posting_row.direction = 'credit'::public.posting_direction
          AND transaction_row.created_at > pg_catalog.clock_timestamp() - interval '24 hours'), 0) AS issued_24h,
      coalesce(sum(posting_row.amount::numeric) FILTER (
        WHERE posting_row.direction = 'credit'::public.posting_direction
          AND transaction_row.created_at > pg_catalog.clock_timestamp() - interval '7 days'), 0) AS issued_7d
    FROM public.ledger_postings AS posting_row
    JOIN public.ledger_transactions AS transaction_row ON transaction_row.id = posting_row.transaction_id
    JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
    WHERE account_row.account_type = 'MINT'::public.account_type
  ),
  burned AS (
    SELECT coalesce(sum(posting_row.amount::numeric) FILTER (
      WHERE posting_row.direction = 'debit'::public.posting_direction
        AND transaction_row.created_at > pg_catalog.clock_timestamp() - interval '24 hours'), 0) AS burned_24h
    FROM public.ledger_postings AS posting_row
    JOIN public.ledger_transactions AS transaction_row ON transaction_row.id = posting_row.transaction_id
    JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
    WHERE account_row.account_type = 'SINK'::public.account_type
  ),
  wallets AS (
    SELECT balance_row.available_amount::numeric AS amount
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id IS NOT NULL
      AND account_row.account_type = 'USER_CASH'::public.account_type
      AND balance_row.available_amount > 0
  ),
  concentration AS (
    SELECT
      CASE WHEN coalesce(sum(wallets.amount), 0) = 0 THEN 0
           ELSE coalesce(max(wallets.amount), 0) / sum(wallets.amount) END AS top_share
    FROM wallets
  ),
  health AS (
    SELECT snapshot_row.integrity_ok, snapshot_row.calculated_at
    FROM public.economy_reconciliation_snapshots AS snapshot_row
    ORDER BY snapshot_row.calculated_at DESC
    LIMIT 1
  )
  SELECT
    supply.m2_amount, supply.member_cash_amount, supply.member_bank_amount,
    supply.escrow_amount, supply.net_mint_issuance_amount, supply.sink_absorbed_amount,
    minted.issued_1h, minted.issued_24h, minted.issued_7d,
    burned.burned_24h, minted.issued_24h - burned.burned_24h,
    concentration.top_share,
    (SELECT count(*) FROM public.users AS member_row
     WHERE member_row.status = 'active'::public.user_status),
    (SELECT health.integrity_ok FROM health),
    (SELECT health.calculated_at FROM health),
    (SELECT count(*) FROM public.outbox_events AS event_row
     WHERE event_row.delivered_at IS NULL
       AND event_row.created_at < pg_catalog.clock_timestamp() - interval '1 hour'),
    (SELECT count(*) FROM public.admin_alerts AS alert_row WHERE alert_row.acknowledged_at IS NULL),
    (SELECT count(*) FROM public.scheduled_job_runs AS run_row WHERE run_row.status = 'running')
  FROM supply, minted, burned, concentration;
END;
$$;

ALTER TABLE public.admin_alerts OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_raise_alert(text, text, text, text, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_acknowledge_alert(uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_alerts(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_economy_dashboard(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_raise_alert(text, text, text, text, jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_acknowledge_alert(uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_alerts(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_economy_dashboard(uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_raise_alert(text, text, text, text, jsonb) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_acknowledge_alert(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_alerts(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_economy_dashboard(uuid) TO moneyverse_app;

COMMIT;
