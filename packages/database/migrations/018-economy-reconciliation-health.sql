-- Economy reconciliation is a maintenance concern, not an application
-- command.  This migration creates an append-only snapshot ledger that is
-- calculated inside PostgreSQL from one MVCC statement snapshot.  The shared
-- web role can read only the latest aggregate through an approver-gated
-- function; it cannot write a metric, a balance, or a ledger row.
BEGIN;

-- A NOLOGIN group role is intentionally used rather than a password-bearing
-- account in a checked-in migration.  Operations provisions a separate
-- NOINHERIT LOGIN role, grants this group to it, and keeps that credential in
-- a secret manager.  The web application never receives this membership.
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles
    WHERE rolname = 'moneyverse_reconciler'
  ) THEN
    CREATE ROLE moneyverse_reconciler
      NOLOGIN
      NOINHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS;
  END IF;
END;
$do$;

CREATE TABLE IF NOT EXISTS public.economy_reconciliation_snapshots (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  metric_version text NOT NULL CHECK (metric_version = 'v1'),
  calculated_at timestamptz NOT NULL,
  ledger_transaction_count bigint NOT NULL CHECK (ledger_transaction_count >= 0),
  ledger_posting_count bigint NOT NULL CHECK (ledger_posting_count >= 0),
  ledger_unbalanced_transaction_count bigint NOT NULL CHECK (ledger_unbalanced_transaction_count >= 0),
  missing_balance_account_count bigint NOT NULL CHECK (missing_balance_account_count >= 0),
  balance_mismatch_account_count bigint NOT NULL CHECK (balance_mismatch_account_count >= 0),
  disallowed_negative_balance_account_count bigint NOT NULL CHECK (disallowed_negative_balance_account_count >= 0),
  account_balance_total_amount numeric(38, 0) NOT NULL,
  ledger_balance_total_amount numeric(38, 0) NOT NULL,
  balance_total_delta_amount numeric(38, 0) NOT NULL,
  integrity_ok boolean NOT NULL,
  m2_amount numeric(38, 0) NOT NULL,
  net_mint_issuance_amount numeric(38, 0) NOT NULL,
  sink_absorbed_amount numeric(38, 0) NOT NULL,
  effective_issued_less_sink_amount numeric(38, 0) NOT NULL,
  treasury_balance_amount numeric(38, 0) NOT NULL,
  treasury_inflow_24h_amount numeric(38, 0) NOT NULL CHECK (treasury_inflow_24h_amount >= 0),
  treasury_outflow_24h_amount numeric(38, 0) NOT NULL CHECK (treasury_outflow_24h_amount >= 0),
  treasury_net_flow_24h_amount numeric(38, 0) NOT NULL,
  user_wallet_owner_count bigint NOT NULL CHECK (user_wallet_owner_count >= 0),
  positive_wallet_owner_count bigint NOT NULL CHECK (positive_wallet_owner_count >= 0),
  positive_user_balance_total_amount numeric(38, 0) NOT NULL CHECK (positive_user_balance_total_amount >= 0),
  top_1_user_balance_amount numeric(38, 0) NOT NULL CHECK (top_1_user_balance_amount >= 0),
  top_1_share_basis_points integer NOT NULL CHECK (top_1_share_basis_points BETWEEN 0 AND 10000),
  top_10_user_balance_amount numeric(38, 0) NOT NULL CHECK (top_10_user_balance_amount >= 0),
  top_10_share_basis_points integer NOT NULL CHECK (top_10_share_basis_points BETWEEN 0 AND 10000),
  flow_24h_transaction_count bigint NOT NULL CHECK (flow_24h_transaction_count >= 0),
  flow_24h_volume_amount numeric(38, 0) NOT NULL CHECK (flow_24h_volume_amount >= 0),
  mint_issuance_24h_amount numeric(38, 0) NOT NULL,
  sink_absorption_24h_amount numeric(38, 0) NOT NULL,
  payload jsonb NOT NULL
    CHECK (
      pg_catalog.jsonb_typeof(payload) = 'object'
      AND pg_catalog.octet_length(payload::text) <= 32768
    ),
  integrity_hash text NOT NULL
    CHECK (integrity_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  UNIQUE (metric_version, calculated_at)
);

CREATE INDEX IF NOT EXISTS economy_reconciliation_snapshots_latest_idx
  ON public.economy_reconciliation_snapshots (calculated_at DESC, id DESC);

-- Reconciliation data is evidence.  Trusted migrations can evolve a schema,
-- but no normal database path can rewrite or erase an observed snapshot.
CREATE OR REPLACE FUNCTION public.economy_reject_reconciliation_snapshot_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'economy reconciliation snapshots are append-only';
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.economy_reconciliation_snapshots'::pg_catalog.regclass
      AND trigger_row.tgname = 'economy_reconciliation_snapshots_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER economy_reconciliation_snapshots_immutable
      BEFORE UPDATE OR DELETE ON public.economy_reconciliation_snapshots
      FOR EACH ROW
      EXECUTE FUNCTION public.economy_reject_reconciliation_snapshot_mutation();
  END IF;
END;
$do$;

-- The worker does not submit amounts, account IDs, timestamps, or a payload.
-- PostgreSQL derives every field from a single statement-level MVCC view of
-- the ledger and account-balance tables.  This gives a coherent evidence
-- point even while ordinary economic commands continue in other sessions.
CREATE OR REPLACE FUNCTION public.economy_record_reconciliation_snapshot()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_calculated_at timestamptz;
  v_snapshot_id uuid;
BEGIN
  -- EXECUTE privilege is the first gate.  This second check fails closed if a
  -- future migration accidentally grants the function to an unrelated role.
  IF NOT pg_catalog.pg_has_role(
    session_user,
    'moneyverse_reconciler',
    'member'
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'dedicated reconciliation worker role required';
  END IF;

  -- Serialize record creation.  The calculation itself is still one SQL
  -- statement, so its reads share one MVCC snapshot rather than a series of
  -- independently changing table reads.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy-reconciliation-snapshot', 0)
  );
  v_calculated_at := pg_catalog.clock_timestamp();

  WITH
  settings AS (
    SELECT
      v_calculated_at AS calculated_at,
      v_calculated_at - INTERVAL '24 hours' AS flow_since
  ),
  transaction_totals AS (
    SELECT
      transaction_row.id AS transaction_id,
      pg_catalog.count(posting_row.id)::bigint AS posting_count,
      pg_catalog.coalesce(
        pg_catalog.sum(posting_row.amount::numeric)
          FILTER (WHERE posting_row.direction = 'debit'::public.posting_direction),
        0::numeric
      ) AS debit_total,
      pg_catalog.coalesce(
        pg_catalog.sum(posting_row.amount::numeric)
          FILTER (WHERE posting_row.direction = 'credit'::public.posting_direction),
        0::numeric
      ) AS credit_total
    FROM public.ledger_transactions AS transaction_row
    LEFT JOIN public.ledger_postings AS posting_row
      ON posting_row.transaction_id = transaction_row.id
    GROUP BY transaction_row.id
  ),
  ledger_integrity AS (
    SELECT
      pg_catalog.count(*)::bigint AS ledger_transaction_count,
      pg_catalog.coalesce(pg_catalog.sum(posting_count), 0)::bigint AS ledger_posting_count,
      pg_catalog.count(*) FILTER (
        WHERE posting_count < 2 OR debit_total <> credit_total
      )::bigint AS ledger_unbalanced_transaction_count
    FROM transaction_totals
  ),
  account_expected_balances AS (
    SELECT
      account_row.id AS account_id,
      account_row.allow_negative,
      balance_row.available_amount::numeric AS stored_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(
          CASE posting_row.direction
            WHEN 'debit'::public.posting_direction THEN posting_row.amount::numeric
            WHEN 'credit'::public.posting_direction THEN -posting_row.amount::numeric
            ELSE 0::numeric
          END
        ),
        0::numeric
      ) AS ledger_amount
    FROM public.accounts AS account_row
    LEFT JOIN public.account_balances AS balance_row
      ON balance_row.account_id = account_row.id
    LEFT JOIN public.ledger_postings AS posting_row
      ON posting_row.account_id = account_row.id
    GROUP BY account_row.id, account_row.allow_negative, balance_row.available_amount
  ),
  balance_integrity AS (
    SELECT
      pg_catalog.count(*) FILTER (WHERE stored_amount IS NULL)::bigint
        AS missing_balance_account_count,
      pg_catalog.count(*) FILTER (
        WHERE stored_amount IS NOT NULL AND stored_amount <> ledger_amount
      )::bigint AS balance_mismatch_account_count,
      pg_catalog.count(*) FILTER (
        WHERE stored_amount < 0 AND NOT allow_negative
      )::bigint AS disallowed_negative_balance_account_count,
      pg_catalog.coalesce(pg_catalog.sum(stored_amount), 0::numeric)
        AS account_balance_total_amount,
      pg_catalog.coalesce(pg_catalog.sum(ledger_amount), 0::numeric)
        AS ledger_balance_total_amount
    FROM account_expected_balances
  ),
  supply AS (
    SELECT
      pg_catalog.coalesce(
        pg_catalog.sum(pg_catalog.coalesce(balance_row.available_amount, 0)::numeric)
          FILTER (
            WHERE account_row.owner_user_id IS NOT NULL
              AND account_row.account_type IN (
                'USER_CASH'::public.account_type,
                'USER_BANK'::public.account_type
              )
          ),
        0::numeric
      ) AS m2_amount,
      pg_catalog.coalesce(
        -pg_catalog.sum(pg_catalog.coalesce(balance_row.available_amount, 0)::numeric)
          FILTER (WHERE account_row.account_type = 'MINT'::public.account_type),
        0::numeric
      ) AS net_mint_issuance_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(pg_catalog.coalesce(balance_row.available_amount, 0)::numeric)
          FILTER (WHERE account_row.account_type = 'SINK'::public.account_type),
        0::numeric
      ) AS sink_absorbed_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(pg_catalog.coalesce(balance_row.available_amount, 0)::numeric)
          FILTER (WHERE account_row.account_type = 'TREASURY'::public.account_type),
        0::numeric
      ) AS treasury_balance_amount
    FROM public.accounts AS account_row
    LEFT JOIN public.account_balances AS balance_row
      ON balance_row.account_id = account_row.id
  ),
  user_wallet_balances AS (
    SELECT
      account_row.owner_user_id,
      pg_catalog.coalesce(
        pg_catalog.sum(pg_catalog.coalesce(balance_row.available_amount, 0)::numeric),
        0::numeric
      ) AS balance_amount
    FROM public.accounts AS account_row
    LEFT JOIN public.account_balances AS balance_row
      ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id IS NOT NULL
      AND account_row.account_type IN (
        'USER_CASH'::public.account_type,
        'USER_BANK'::public.account_type
      )
    GROUP BY account_row.owner_user_id
  ),
  positive_user_wallet_balances AS (
    SELECT
      owner_user_id,
      GREATEST(balance_amount, 0::numeric) AS positive_balance_amount
    FROM user_wallet_balances
  ),
  ranked_user_wallet_balances AS (
    SELECT
      owner_user_id,
      positive_balance_amount,
      pg_catalog.row_number() OVER (
        ORDER BY positive_balance_amount DESC, owner_user_id ASC
      ) AS balance_rank
    FROM positive_user_wallet_balances
  ),
  concentration AS (
    SELECT
      pg_catalog.count(*)::bigint AS user_wallet_owner_count,
      pg_catalog.count(*) FILTER (WHERE positive_balance_amount > 0)::bigint
        AS positive_wallet_owner_count,
      pg_catalog.coalesce(
        pg_catalog.sum(positive_balance_amount),
        0::numeric
      ) AS positive_user_balance_total_amount
    FROM positive_user_wallet_balances
  ),
  concentration_top AS (
    SELECT
      pg_catalog.coalesce(
        pg_catalog.max(positive_balance_amount) FILTER (WHERE balance_rank = 1),
        0::numeric
      ) AS top_1_user_balance_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(positive_balance_amount) FILTER (WHERE balance_rank <= 10),
        0::numeric
      ) AS top_10_user_balance_amount
    FROM ranked_user_wallet_balances
  ),
  flow_by_transaction AS (
    SELECT
      transaction_row.id AS transaction_id,
      pg_catalog.coalesce(
        pg_catalog.sum(posting_row.amount::numeric)
          FILTER (WHERE posting_row.direction = 'debit'::public.posting_direction),
        0::numeric
      ) AS flow_volume_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(
          CASE
            WHEN account_row.account_type = 'MINT'::public.account_type
              AND posting_row.direction = 'credit'::public.posting_direction
              THEN posting_row.amount::numeric
            WHEN account_row.account_type = 'MINT'::public.account_type
              AND posting_row.direction = 'debit'::public.posting_direction
              THEN -posting_row.amount::numeric
            ELSE 0::numeric
          END
        ),
        0::numeric
      ) AS mint_issuance_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(
          CASE
            WHEN account_row.account_type = 'SINK'::public.account_type
              AND posting_row.direction = 'debit'::public.posting_direction
              THEN posting_row.amount::numeric
            WHEN account_row.account_type = 'SINK'::public.account_type
              AND posting_row.direction = 'credit'::public.posting_direction
              THEN -posting_row.amount::numeric
            ELSE 0::numeric
          END
        ),
        0::numeric
      ) AS sink_absorption_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(
          CASE
            WHEN account_row.account_type = 'TREASURY'::public.account_type
              AND posting_row.direction = 'debit'::public.posting_direction
              THEN posting_row.amount::numeric
            ELSE 0::numeric
          END
        ),
        0::numeric
      ) AS treasury_inflow_amount,
      pg_catalog.coalesce(
        pg_catalog.sum(
          CASE
            WHEN account_row.account_type = 'TREASURY'::public.account_type
              AND posting_row.direction = 'credit'::public.posting_direction
              THEN posting_row.amount::numeric
            ELSE 0::numeric
          END
        ),
        0::numeric
      ) AS treasury_outflow_amount
    FROM public.ledger_transactions AS transaction_row
    CROSS JOIN settings
    LEFT JOIN public.ledger_postings AS posting_row
      ON posting_row.transaction_id = transaction_row.id
    LEFT JOIN public.accounts AS account_row
      ON account_row.id = posting_row.account_id
    WHERE transaction_row.created_at >= settings.flow_since
      AND transaction_row.created_at <= settings.calculated_at
    GROUP BY transaction_row.id
  ),
  flow AS (
    SELECT
      pg_catalog.count(*)::bigint AS flow_24h_transaction_count,
      pg_catalog.coalesce(pg_catalog.sum(flow_volume_amount), 0::numeric)
        AS flow_24h_volume_amount,
      pg_catalog.coalesce(pg_catalog.sum(mint_issuance_amount), 0::numeric)
        AS mint_issuance_24h_amount,
      pg_catalog.coalesce(pg_catalog.sum(sink_absorption_amount), 0::numeric)
        AS sink_absorption_24h_amount,
      pg_catalog.coalesce(pg_catalog.sum(treasury_inflow_amount), 0::numeric)
        AS treasury_inflow_24h_amount,
      pg_catalog.coalesce(pg_catalog.sum(treasury_outflow_amount), 0::numeric)
        AS treasury_outflow_24h_amount
    FROM flow_by_transaction
  ),
  metrics AS (
    SELECT
      settings.calculated_at,
      ledger_integrity.ledger_transaction_count,
      ledger_integrity.ledger_posting_count,
      ledger_integrity.ledger_unbalanced_transaction_count,
      balance_integrity.missing_balance_account_count,
      balance_integrity.balance_mismatch_account_count,
      balance_integrity.disallowed_negative_balance_account_count,
      balance_integrity.account_balance_total_amount,
      balance_integrity.ledger_balance_total_amount,
      balance_integrity.account_balance_total_amount
        - balance_integrity.ledger_balance_total_amount AS balance_total_delta_amount,
      (
        ledger_integrity.ledger_unbalanced_transaction_count = 0
        AND balance_integrity.missing_balance_account_count = 0
        AND balance_integrity.balance_mismatch_account_count = 0
        AND balance_integrity.disallowed_negative_balance_account_count = 0
        AND balance_integrity.account_balance_total_amount = 0::numeric
        AND balance_integrity.ledger_balance_total_amount = 0::numeric
      ) AS integrity_ok,
      supply.m2_amount,
      supply.net_mint_issuance_amount,
      supply.sink_absorbed_amount,
      supply.net_mint_issuance_amount - supply.sink_absorbed_amount
        AS effective_issued_less_sink_amount,
      supply.treasury_balance_amount,
      flow.treasury_inflow_24h_amount,
      flow.treasury_outflow_24h_amount,
      flow.treasury_inflow_24h_amount - flow.treasury_outflow_24h_amount
        AS treasury_net_flow_24h_amount,
      concentration.user_wallet_owner_count,
      concentration.positive_wallet_owner_count,
      concentration.positive_user_balance_total_amount,
      concentration_top.top_1_user_balance_amount,
      CASE
        WHEN concentration.positive_user_balance_total_amount > 0::numeric THEN
          pg_catalog.floor(
            concentration_top.top_1_user_balance_amount * 10000::numeric
              / concentration.positive_user_balance_total_amount
          )::integer
        ELSE 0
      END AS top_1_share_basis_points,
      concentration_top.top_10_user_balance_amount,
      CASE
        WHEN concentration.positive_user_balance_total_amount > 0::numeric THEN
          pg_catalog.floor(
            concentration_top.top_10_user_balance_amount * 10000::numeric
              / concentration.positive_user_balance_total_amount
          )::integer
        ELSE 0
      END AS top_10_share_basis_points,
      flow.flow_24h_transaction_count,
      flow.flow_24h_volume_amount,
      flow.mint_issuance_24h_amount,
      flow.sink_absorption_24h_amount
    FROM settings
    CROSS JOIN ledger_integrity
    CROSS JOIN balance_integrity
    CROSS JOIN supply
    CROSS JOIN concentration
    CROSS JOIN concentration_top
    CROSS JOIN flow
  ),
  snapshot_payload AS (
    SELECT
      metrics.*,
      pg_catalog.jsonb_build_object(
        'metricVersion', 'v1',
        'calculatedAt', metrics.calculated_at,
        'integrity', pg_catalog.jsonb_build_object(
          'ok', metrics.integrity_ok,
          'ledgerTransactionCount', metrics.ledger_transaction_count,
          'ledgerPostingCount', metrics.ledger_posting_count,
          'unbalancedTransactionCount', metrics.ledger_unbalanced_transaction_count,
          'missingBalanceAccountCount', metrics.missing_balance_account_count,
          'balanceMismatchAccountCount', metrics.balance_mismatch_account_count,
          'disallowedNegativeBalanceAccountCount', metrics.disallowed_negative_balance_account_count,
          'accountBalanceTotalAmount', metrics.account_balance_total_amount,
          'ledgerBalanceTotalAmount', metrics.ledger_balance_total_amount,
          'balanceTotalDeltaAmount', metrics.balance_total_delta_amount
        ),
        'supply', pg_catalog.jsonb_build_object(
          'm2Amount', metrics.m2_amount,
          'netMintIssuanceAmount', metrics.net_mint_issuance_amount,
          'sinkAbsorbedAmount', metrics.sink_absorbed_amount,
          'effectiveIssuedLessSinkAmount', metrics.effective_issued_less_sink_amount,
          'treasuryBalanceAmount', metrics.treasury_balance_amount
        ),
        'treasury24h', pg_catalog.jsonb_build_object(
          'inflowAmount', metrics.treasury_inflow_24h_amount,
          'outflowAmount', metrics.treasury_outflow_24h_amount,
          'netFlowAmount', metrics.treasury_net_flow_24h_amount
        ),
        'concentration', pg_catalog.jsonb_build_object(
          'userWalletOwnerCount', metrics.user_wallet_owner_count,
          'positiveWalletOwnerCount', metrics.positive_wallet_owner_count,
          'positiveUserBalanceTotalAmount', metrics.positive_user_balance_total_amount,
          'top1UserBalanceAmount', metrics.top_1_user_balance_amount,
          'top1ShareBasisPoints', metrics.top_1_share_basis_points,
          'top10UserBalanceAmount', metrics.top_10_user_balance_amount,
          'top10ShareBasisPoints', metrics.top_10_share_basis_points
        ),
        'flow24h', pg_catalog.jsonb_build_object(
          'transactionCount', metrics.flow_24h_transaction_count,
          'volumeAmount', metrics.flow_24h_volume_amount,
          'mintIssuanceAmount', metrics.mint_issuance_24h_amount,
          'sinkAbsorptionAmount', metrics.sink_absorption_24h_amount
        )
      ) AS payload
    FROM metrics
  )
  INSERT INTO public.economy_reconciliation_snapshots (
    metric_version,
    calculated_at,
    ledger_transaction_count,
    ledger_posting_count,
    ledger_unbalanced_transaction_count,
    missing_balance_account_count,
    balance_mismatch_account_count,
    disallowed_negative_balance_account_count,
    account_balance_total_amount,
    ledger_balance_total_amount,
    balance_total_delta_amount,
    integrity_ok,
    m2_amount,
    net_mint_issuance_amount,
    sink_absorbed_amount,
    effective_issued_less_sink_amount,
    treasury_balance_amount,
    treasury_inflow_24h_amount,
    treasury_outflow_24h_amount,
    treasury_net_flow_24h_amount,
    user_wallet_owner_count,
    positive_wallet_owner_count,
    positive_user_balance_total_amount,
    top_1_user_balance_amount,
    top_1_share_basis_points,
    top_10_user_balance_amount,
    top_10_share_basis_points,
    flow_24h_transaction_count,
    flow_24h_volume_amount,
    mint_issuance_24h_amount,
    sink_absorption_24h_amount,
    payload,
    integrity_hash
  )
  SELECT
    'v1',
    snapshot_payload.calculated_at,
    snapshot_payload.ledger_transaction_count,
    snapshot_payload.ledger_posting_count,
    snapshot_payload.ledger_unbalanced_transaction_count,
    snapshot_payload.missing_balance_account_count,
    snapshot_payload.balance_mismatch_account_count,
    snapshot_payload.disallowed_negative_balance_account_count,
    snapshot_payload.account_balance_total_amount,
    snapshot_payload.ledger_balance_total_amount,
    snapshot_payload.balance_total_delta_amount,
    snapshot_payload.integrity_ok,
    snapshot_payload.m2_amount,
    snapshot_payload.net_mint_issuance_amount,
    snapshot_payload.sink_absorbed_amount,
    snapshot_payload.effective_issued_less_sink_amount,
    snapshot_payload.treasury_balance_amount,
    snapshot_payload.treasury_inflow_24h_amount,
    snapshot_payload.treasury_outflow_24h_amount,
    snapshot_payload.treasury_net_flow_24h_amount,
    snapshot_payload.user_wallet_owner_count,
    snapshot_payload.positive_wallet_owner_count,
    snapshot_payload.positive_user_balance_total_amount,
    snapshot_payload.top_1_user_balance_amount,
    snapshot_payload.top_1_share_basis_points,
    snapshot_payload.top_10_user_balance_amount,
    snapshot_payload.top_10_share_basis_points,
    snapshot_payload.flow_24h_transaction_count,
    snapshot_payload.flow_24h_volume_amount,
    snapshot_payload.mint_issuance_24h_amount,
    snapshot_payload.sink_absorption_24h_amount,
    snapshot_payload.payload,
    pg_catalog.encode(
      public.digest(snapshot_payload.payload::text, 'sha256'),
      'hex'
    )
  FROM snapshot_payload
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$;

-- This is a read-only, approver-gated DTO.  It intentionally exposes no
-- account IDs, user IDs, raw postings, or an endpoint to create a snapshot.
CREATE OR REPLACE FUNCTION public.admin_latest_economy_reconciliation_health(
  p_actor_user_id uuid
)
RETURNS TABLE(
  snapshot_id uuid,
  metric_version text,
  calculated_at timestamptz,
  integrity_ok boolean,
  ledger_transaction_count bigint,
  ledger_posting_count bigint,
  ledger_unbalanced_transaction_count bigint,
  missing_balance_account_count bigint,
  balance_mismatch_account_count bigint,
  disallowed_negative_balance_account_count bigint,
  account_balance_total_amount numeric,
  ledger_balance_total_amount numeric,
  balance_total_delta_amount numeric,
  m2_amount numeric,
  net_mint_issuance_amount numeric,
  sink_absorbed_amount numeric,
  effective_issued_less_sink_amount numeric,
  treasury_balance_amount numeric,
  treasury_inflow_24h_amount numeric,
  treasury_outflow_24h_amount numeric,
  treasury_net_flow_24h_amount numeric,
  user_wallet_owner_count bigint,
  positive_wallet_owner_count bigint,
  positive_user_balance_total_amount numeric,
  top_1_user_balance_amount numeric,
  top_1_share_basis_points integer,
  top_10_user_balance_amount numeric,
  top_10_share_basis_points integer,
  flow_24h_transaction_count bigint,
  flow_24h_volume_amount numeric,
  mint_issuance_24h_amount numeric,
  sink_absorption_24h_amount numeric,
  integrity_hash text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row
      ON role_row.user_id = user_row.id
    WHERE user_row.id = p_actor_user_id
      AND user_row.status = 'active'::public.user_status
      AND role_row.role = 'approver'::public.admin_role
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'active approver role required for reconciliation health';
  END IF;

  RETURN QUERY
  SELECT
    snapshot_row.id,
    snapshot_row.metric_version,
    snapshot_row.calculated_at,
    snapshot_row.integrity_ok,
    snapshot_row.ledger_transaction_count,
    snapshot_row.ledger_posting_count,
    snapshot_row.ledger_unbalanced_transaction_count,
    snapshot_row.missing_balance_account_count,
    snapshot_row.balance_mismatch_account_count,
    snapshot_row.disallowed_negative_balance_account_count,
    snapshot_row.account_balance_total_amount,
    snapshot_row.ledger_balance_total_amount,
    snapshot_row.balance_total_delta_amount,
    snapshot_row.m2_amount,
    snapshot_row.net_mint_issuance_amount,
    snapshot_row.sink_absorbed_amount,
    snapshot_row.effective_issued_less_sink_amount,
    snapshot_row.treasury_balance_amount,
    snapshot_row.treasury_inflow_24h_amount,
    snapshot_row.treasury_outflow_24h_amount,
    snapshot_row.treasury_net_flow_24h_amount,
    snapshot_row.user_wallet_owner_count,
    snapshot_row.positive_wallet_owner_count,
    snapshot_row.positive_user_balance_total_amount,
    snapshot_row.top_1_user_balance_amount,
    snapshot_row.top_1_share_basis_points,
    snapshot_row.top_10_user_balance_amount,
    snapshot_row.top_10_share_basis_points,
    snapshot_row.flow_24h_transaction_count,
    snapshot_row.flow_24h_volume_amount,
    snapshot_row.mint_issuance_24h_amount,
    snapshot_row.sink_absorption_24h_amount,
    snapshot_row.integrity_hash
  FROM public.economy_reconciliation_snapshots AS snapshot_row
  ORDER BY snapshot_row.calculated_at DESC, snapshot_row.id DESC
  LIMIT 1;
END;
$$;

ALTER TABLE public.economy_reconciliation_snapshots OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_reject_reconciliation_snapshot_mutation() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_record_reconciliation_snapshot() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_latest_economy_reconciliation_health(uuid) OWNER TO moneyverse_migrator;

-- `economy_metrics` was a prototype generic metric table.  It is not the
-- reconciliation read model and the shared web role no longer receives even
-- a direct read grant to it.  The new immutable snapshots have explicit,
-- reviewed semantics instead.
REVOKE ALL PRIVILEGES ON TABLE public.economy_metrics,
  public.economy_reconciliation_snapshots
  FROM PUBLIC, moneyverse_app, moneyverse_reconciler;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_reject_reconciliation_snapshot_mutation()
  FROM PUBLIC, moneyverse_app, moneyverse_reconciler;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_record_reconciliation_snapshot()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_latest_economy_reconciliation_health(uuid)
  FROM PUBLIC, moneyverse_reconciler;

GRANT USAGE ON SCHEMA public TO moneyverse_reconciler;
GRANT EXECUTE ON FUNCTION public.economy_record_reconciliation_snapshot()
  TO moneyverse_reconciler;
GRANT EXECUTE ON FUNCTION public.admin_latest_economy_reconciliation_health(uuid)
  TO moneyverse_app;

COMMIT;
