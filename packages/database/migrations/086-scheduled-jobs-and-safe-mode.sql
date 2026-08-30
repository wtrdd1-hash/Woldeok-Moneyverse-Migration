-- A scheduler, and the switch that trips when reconciliation fails.
--
-- There is no scheduler in this system. Two `setInterval` timers -- the
-- market tick and the status collector -- are the whole of it, and neither
-- records that it ran. Nothing anywhere knows when a periodic job last
-- succeeded, how long it took, or whether it failed, which is why the
-- reconciliation snapshot has never been taken: 018 built the function and
-- the role, and no worker was ever written to call it.
--
-- WINDOWS, NOT TIMERS. A job claims a named window -- 2026-08-31, or
-- 2026-08-31T04, or 2026-W36 -- and a window can be claimed once. A restart
-- that misses 04:00 catches the window up on the next tick instead of
-- skipping the day, and two processes cannot both run it, because the claim
-- is an INSERT against a primary key. That is the whole of the mutual
-- exclusion: no leader election, no lease to expire, nothing to get stuck.
--
-- KST. Every boundary the specification names -- hourly, daily 04:00, Monday
-- 04:30, the first of the month -- is stated in Asia/Seoul, and the server
-- runs in UTC. The period key is computed in Seoul so that a job whose window
-- opens at 04:00 Seoul does so on the day a reader in Seoul would name.

BEGIN;

CREATE TABLE IF NOT EXISTS public.scheduled_job_runs (
  job text NOT NULL CHECK (job ~ '^[a-z][a-z0-9_.]{2,63}$'),
  period_key text NOT NULL CHECK (pg_catalog.char_length(period_key) BETWEEN 1 AND 32),
  started_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'succeeded', 'failed', 'skipped')),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (job, period_key)
);

CREATE INDEX IF NOT EXISTS scheduled_job_runs_recent
  ON public.scheduled_job_runs (job, started_at DESC);

REVOKE ALL PRIVILEGES ON TABLE public.scheduled_job_runs FROM PUBLIC, moneyverse_app;

-- The window a job is in right now, named in Asia/Seoul.
--
-- The daily and weekly windows are shifted by their start-of-day offset
-- before truncation, so "the 04:00 run" belongs to the day it is named after
-- rather than to the day that is already three hours old in UTC.
CREATE OR REPLACE FUNCTION public.schedule_period_key(
  p_cadence text,
  p_at timestamptz
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE p_cadence
    WHEN 'hourly' THEN
      pg_catalog.to_char(p_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD"T"HH24')
    WHEN 'daily' THEN
      pg_catalog.to_char(
        (p_at AT TIME ZONE 'Asia/Seoul') - interval '4 hours', 'YYYY-MM-DD')
    WHEN 'weekly' THEN
      pg_catalog.to_char(
        date_trunc('week', (p_at AT TIME ZONE 'Asia/Seoul') - interval '4 hours 30 minutes'),
        'IYYY"-W"IW')
    WHEN 'monthly' THEN
      pg_catalog.to_char((p_at AT TIME ZONE 'Asia/Seoul') - interval '4 hours', 'YYYY-MM')
    ELSE NULL
  END
$$;

-- Claims the window, or answers false because somebody already has it. The
-- claim is an INSERT against the primary key, so two workers racing produce
-- one winner and one false without either of them waiting.
CREATE OR REPLACE FUNCTION public.schedule_claim_run(
  p_job text,
  p_cadence text,
  p_not_before_minutes integer
)
RETURNS TABLE(claimed boolean, period_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_key text;
  v_minutes integer;
BEGIN
  IF p_job IS NULL OR p_job !~ '^[a-z][a-z0-9_.]{2,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid job name';
  END IF;

  v_key := public.schedule_period_key(p_cadence, v_now);
  IF v_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'cadence must be hourly, daily, weekly or monthly';
  END IF;

  -- How far into the window we are, in Seoul minutes. A daily job asked not
  -- to start before 04:00 is asked for 0 here, because the daily window
  -- already begins at 04:00; a weekly one asked for 30 begins at 04:30.
  v_minutes := CASE p_cadence
    WHEN 'hourly'
      THEN pg_catalog.date_part('minute', v_now AT TIME ZONE 'Asia/Seoul')::integer
    ELSE (
      pg_catalog.date_part('epoch',
        (v_now AT TIME ZONE 'Asia/Seoul')
        - date_trunc('day', (v_now AT TIME ZONE 'Asia/Seoul') - interval '4 hours')
        - interval '4 hours'
      ) / 60
    )::integer
  END;

  IF v_minutes < coalesce(p_not_before_minutes, 0) THEN
    claimed := false;
    period_key := v_key;
    RETURN NEXT;
    RETURN;
  END IF;

  -- No conflict target. Naming the columns would be clearer, but plpgsql
  -- substitutes parameters into the inference list, and `period_key` is an
  -- OUT parameter of this function -- so the named form raises 42702 at run
  -- time and parses cleanly at deploy time. The table's only constraint is
  -- that primary key, so the bare form conflicts on exactly the same thing.
  INSERT INTO public.scheduled_job_runs (job, period_key)
  VALUES (p_job, v_key)
  ON CONFLICT DO NOTHING;

  claimed := FOUND;
  period_key := v_key;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_finish_run(
  p_job text,
  p_period_key text,
  p_status text,
  p_detail jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF coalesce(p_status, '') NOT IN ('succeeded', 'failed', 'skipped') THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'status must be succeeded, failed or skipped';
  END IF;

  UPDATE public.scheduled_job_runs AS run_row
  SET finished_at = pg_catalog.clock_timestamp(),
      status = p_status,
      detail = coalesce(p_detail, '{}'::jsonb)
  WHERE run_row.job = p_job AND run_row.period_key = p_period_key;
END;
$$;

-- A record of the system taking a feature down on its own.
--
-- Not an audit_logs row: that chain is the account of what an ADMINISTRATOR
-- did, and every writer into it requires an actor. An automatic trip has no
-- actor, and inventing one -- attributing it to the superadmin who was
-- asleep -- would put a false statement into the one record that is supposed
-- to be beyond question.
CREATE TABLE IF NOT EXISTS public.economy_safe_mode_trips (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  feature_key text NOT NULL,
  previous_state text NOT NULL,
  reason text NOT NULL,
  snapshot_id uuid,
  tripped_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS economy_safe_mode_trips_recent
  ON public.economy_safe_mode_trips (tripped_at DESC);

REVOKE ALL PRIVILEGES ON TABLE public.economy_safe_mode_trips FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.economy_reject_trip_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'safe mode trips are append-only';
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.economy_safe_mode_trips'::pg_catalog.regclass
      AND trigger_row.tgname = 'economy_safe_mode_trips_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER economy_safe_mode_trips_immutable
      BEFORE UPDATE OR DELETE ON public.economy_safe_mode_trips
      FOR EACH ROW EXECUTE FUNCTION public.economy_reject_trip_mutation();
  END IF;
END;
$do$;

-- Towards safety only. This can move a feature from 'enabled' to 'safe_mode'
-- and can do nothing else -- it cannot enable, it cannot resume, and it
-- cannot touch a feature an administrator has already put somewhere. Coming
-- back out is a decision with a reason attached, and that is
-- `admin_set_feature_switch`, which requires the superadmin.
CREATE OR REPLACE FUNCTION public.economy_trip_safe_mode(
  p_feature text,
  p_reason text,
  p_snapshot uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_previous text;
BEGIN
  IF p_feature IS NULL OR p_feature !~ '^[a-z][a-z0-9_]{2,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid feature';
  END IF;

  SELECT switch_row.state INTO v_previous
  FROM public.feature_switches AS switch_row
  WHERE switch_row.feature_key = p_feature
  FOR UPDATE;

  IF v_previous IS DISTINCT FROM 'enabled' THEN
    RETURN false;
  END IF;

  UPDATE public.feature_switches AS switch_row
  SET state = 'safe_mode',
      reason = coalesce(public.audit_normalize_text(p_reason, 1000), 'automatic safe mode'),
      updated_at = pg_catalog.clock_timestamp()
  WHERE switch_row.feature_key = p_feature;

  INSERT INTO public.economy_safe_mode_trips (feature_key, previous_state, reason, snapshot_id)
  VALUES (
    p_feature, v_previous,
    coalesce(public.audit_normalize_text(p_reason, 1000), 'automatic safe mode'),
    p_snapshot
  );

  RETURN true;
END;
$$;

-- The money supply the specification means.
--
-- 018's snapshot counts USER_CASH and USER_BANK. Section 14.9 defines M2 as
-- "user cash + deposits + market deposits", and market deposits are ESCROW --
-- member money in flight, which is still member money. The snapshot's own
-- `m2_amount` keeps 018's definition, because rewriting a 450-line
-- reconciliation function to change one FILTER would freeze the rest of it;
-- this is what the dashboard and the adjustment engine read.
CREATE OR REPLACE FUNCTION public.economy_money_supply()
RETURNS TABLE(
  m2_amount numeric,
  member_cash_amount numeric,
  member_bank_amount numeric,
  escrow_amount numeric,
  net_mint_issuance_amount numeric,
  sink_absorbed_amount numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    coalesce(sum(balance_row.available_amount::numeric) FILTER (
      WHERE account_row.account_type IN (
        'USER_CASH'::public.account_type,
        'USER_BANK'::public.account_type,
        'ESCROW'::public.account_type)
    ), 0),
    coalesce(sum(balance_row.available_amount::numeric) FILTER (
      WHERE account_row.account_type = 'USER_CASH'::public.account_type), 0),
    coalesce(sum(balance_row.available_amount::numeric) FILTER (
      WHERE account_row.account_type = 'USER_BANK'::public.account_type), 0),
    coalesce(sum(balance_row.available_amount::numeric) FILTER (
      WHERE account_row.account_type = 'ESCROW'::public.account_type), 0),
    -coalesce(sum(balance_row.available_amount::numeric) FILTER (
      WHERE account_row.account_type = 'MINT'::public.account_type), 0),
    coalesce(sum(balance_row.available_amount::numeric) FILTER (
      WHERE account_row.account_type = 'SINK'::public.account_type), 0)
  FROM public.accounts AS account_row
  LEFT JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
$$;

ALTER TABLE public.scheduled_job_runs OWNER TO moneyverse_migrator;
ALTER TABLE public.economy_safe_mode_trips OWNER TO moneyverse_migrator;
ALTER FUNCTION public.schedule_period_key(text, timestamptz) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.schedule_claim_run(text, text, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.schedule_finish_run(text, text, text, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_reject_trip_mutation() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_trip_safe_mode(text, text, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_money_supply() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.schedule_period_key(text, timestamptz) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.schedule_claim_run(text, text, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.schedule_finish_run(text, text, text, jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_reject_trip_mutation() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_trip_safe_mode(text, text, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_money_supply() FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.schedule_claim_run(text, text, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.schedule_finish_run(text, text, text, jsonb) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_trip_safe_mode(text, text, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_money_supply() TO moneyverse_app;

COMMIT;
