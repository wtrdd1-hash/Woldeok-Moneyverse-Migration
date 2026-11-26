-- GAMEYEAR.2 (v2026.11.26.GAMEYEAR.2): server-specific game year, forward-only.
-- Spec: docs/planning/SERVER_GAME_CLOCK_SPEC.md section 6 (PR #3452).
-- Keeps migration 190 untouched: epoch 2026-09-15 00:00 KST, 600 real seconds per game day,
-- seven-day continuous weeks, day/week keys unchanged. Adds a fixed 365-day logical year:
--   yearIndex = floor(d / 365), gameYear = yearIndex + 1, dayOfYear = d mod 365 + 1,
--   year = 219000 real seconds, half-open [start, end). Pre-epoch moments have no public year.
-- Display/read-only: no annual payout, tax, dividend, accrual, reset, maturity or rate change.
BEGIN;

-- Versioned, immutable calendar policy. A later change needs a new row with an explicit
-- effective boundary and separate approval; old receipts are never reinterpreted.
CREATE TABLE public.server_game_calendar_policy (
  calendar_version text PRIMARY KEY,
  game_days_per_year integer NOT NULL CHECK (game_days_per_year = 365),
  effective_from_day bigint NOT NULL CHECK (effective_from_day = 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
INSERT INTO public.server_game_calendar_policy (calendar_version, game_days_per_year, effective_from_day)
VALUES ('v2026.11.26.GAMEYEAR.2', 365, 0);
REVOKE ALL ON TABLE public.server_game_calendar_policy FROM PUBLIC, moneyverse_app;
ALTER TABLE public.server_game_calendar_policy OWNER TO moneyverse_migrator;

CREATE FUNCTION public.server_game_calendar_policy_immutable()
RETURNS trigger LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'calendar policy rows are immutable; add a new version';
END
$$;
ALTER FUNCTION public.server_game_calendar_policy_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.server_game_calendar_policy_immutable() FROM PUBLIC;
CREATE TRIGGER server_game_calendar_policy_no_rewrite
  BEFORE UPDATE OR DELETE ON public.server_game_calendar_policy
  FOR EACH ROW EXECUTE FUNCTION public.server_game_calendar_policy_immutable();

-- One observation of the authoritative clock with the year added. p_at is read once, so every
-- field describes the same instant (no skew between day, week and year).
CREATE FUNCTION public.server_game_calendar(
  p_at timestamptz DEFAULT pg_catalog.clock_timestamp()
)
RETURNS TABLE(
  policy_version text, calendar_version text, observed_at timestamptz,
  day_index bigint, week_index bigint, day_of_week smallint,
  real_seconds_per_day integer, game_days_per_week smallint,
  game_days_per_year integer, real_seconds_per_game_year bigint,
  game_year bigint, day_of_year integer,
  year_started_at timestamptz, year_ends_at timestamptz,
  day_started_at timestamptz, day_ends_at timestamptz,
  week_started_at timestamptz, week_ends_at timestamptz,
  day_key date, week_key date
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH observed AS (
    SELECT p_at AS at
  ), clock AS (
    SELECT c.* FROM observed, public.server_game_clock(observed.at) AS c
  ), cal AS (
    SELECT * FROM public.server_game_calendar_policy ORDER BY effective_from_day DESC LIMIT 1
  ), policy AS (
    SELECT epoch_at FROM public.server_game_clock_policy WHERE singleton
  )
  SELECT clock.policy_version,
         cal.calendar_version,
         observed.at,
         clock.day_index,
         clock.week_index,
         clock.day_of_week,
         clock.real_seconds_per_day,
         clock.game_days_per_week,
         cal.game_days_per_year,
         (cal.game_days_per_year::bigint * clock.real_seconds_per_day),
         CASE WHEN clock.day_index >= 0 THEN clock.day_index / cal.game_days_per_year + 1 END,
         CASE WHEN clock.day_index >= 0 THEN (clock.day_index % cal.game_days_per_year)::integer + 1 END,
         CASE WHEN clock.day_index >= 0 THEN policy.epoch_at + pg_catalog.make_interval(
           secs => (clock.day_index / cal.game_days_per_year) * cal.game_days_per_year * clock.real_seconds_per_day) END,
         CASE WHEN clock.day_index >= 0 THEN policy.epoch_at + pg_catalog.make_interval(
           secs => (clock.day_index / cal.game_days_per_year + 1) * cal.game_days_per_year * clock.real_seconds_per_day) END,
         clock.day_started_at,
         clock.day_ends_at,
         clock.week_started_at,
         clock.week_ends_at,
         DATE '2000-01-01' + clock.day_index::integer,
         DATE '2000-01-01' + (clock.week_index * clock.game_days_per_week)::integer
  FROM observed, clock, cal, policy
$$;
ALTER FUNCTION public.server_game_calendar(timestamptz) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.server_game_calendar(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.server_game_calendar(timestamptz) TO moneyverse_app;

-- Boundary regression (spec section 6 examples), evaluated inside the migration transaction.
DO $check$
DECLARE
  v_epoch timestamptz;
  r record;
BEGIN
  SELECT epoch_at INTO v_epoch FROM public.server_game_clock_policy WHERE singleton;

  SELECT * INTO r FROM public.server_game_calendar(v_epoch);
  IF r.game_year <> 1 OR r.day_of_year <> 1 OR r.year_started_at <> v_epoch
     OR r.year_ends_at <> v_epoch + interval '219000 seconds' OR r.real_seconds_per_game_year <> 219000 THEN
    RAISE EXCEPTION 'calendar check failed at epoch: %', r;
  END IF;
  SELECT * INTO r FROM public.server_game_calendar(v_epoch + interval '218999 seconds');
  IF r.game_year <> 1 OR r.day_of_year <> 365 THEN RAISE EXCEPTION 'calendar check failed at +218999s: %', r; END IF;
  SELECT * INTO r FROM public.server_game_calendar(v_epoch + interval '219000 seconds');
  IF r.game_year <> 2 OR r.day_of_year <> 1 OR r.year_started_at <> v_epoch + interval '219000 seconds' THEN
    RAISE EXCEPTION 'calendar check failed at +219000s: %', r;
  END IF;
  SELECT * INTO r FROM public.server_game_calendar(v_epoch + interval '219001 seconds');
  IF r.game_year <> 2 OR r.day_of_year <> 1 THEN RAISE EXCEPTION 'calendar check failed at +219001s: %', r; END IF;
  SELECT * INTO r FROM public.server_game_calendar(v_epoch + make_interval(secs => 365 * 27 * 600));
  IF r.game_year <> 28 OR r.day_of_year <> 1 OR r.day_index <> 365 * 27 THEN
    RAISE EXCEPTION 'calendar check failed at day 365*27: %', r;
  END IF;
  SELECT * INTO r FROM public.server_game_calendar(v_epoch - interval '1 second');
  IF r.game_year IS NOT NULL OR r.day_of_year IS NOT NULL OR r.year_started_at IS NOT NULL THEN
    RAISE EXCEPTION 'pre-epoch moment must have no public year: %', r;
  END IF;
  -- Existing day/week keys and boundaries are unchanged for the same instant.
  SELECT * INTO r FROM public.server_game_calendar(v_epoch + interval '1234567 seconds');
  IF r.day_key <> public.server_game_day_key(v_epoch + interval '1234567 seconds')
     OR r.week_key <> public.server_game_week_key(v_epoch + interval '1234567 seconds')
     OR r.day_started_at <> public.server_game_day_start(v_epoch + interval '1234567 seconds')
     OR r.week_started_at <> public.server_game_week_start(v_epoch + interval '1234567 seconds') THEN
    RAISE EXCEPTION 'day/week keys changed: %', r;
  END IF;
  -- A week may span two years; the global week index never resets.
  SELECT * INTO r FROM public.server_game_calendar(v_epoch + make_interval(secs => 365 * 600));
  IF r.week_index <> 52 OR r.day_of_week <> 2 THEN RAISE EXCEPTION 'week continuity failed: %', r; END IF;
END
$check$;

COMMIT;
