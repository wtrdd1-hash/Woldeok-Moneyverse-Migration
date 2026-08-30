-- The coin is not a coin.
--
-- 042-virtual-casino-coin-game.sql decides the toss with
--
--   CASE WHEN get_byte(public.gen_random_bytes(1), 0) < 48 THEN 'heads' ELSE 'tails' END
--
-- and a byte is 0..255, so heads lands 48/256 = 18.75% of the time while the
-- payout stays even money (net = +stake on a win, -stake on a loss). A member
-- who always picks 'tails' therefore has an expected value of +0.625 x stake
-- per play: a WLD printer bounded only by the daily stake cap. The spec's
-- 14.3 states the threshold as 128, which is the only value that makes the
-- disclosed even-money payout honest.
--
-- 042 is recorded in production-checksums.json, so it cannot be edited. This
-- migration replaces the function and, while it is here, fixes the three
-- things that let the bug exist in the first place:
--
--   1. The threshold was a bare number nobody could compare against a stated
--      probability. It now lives in exactly one place -- the byte-to-face
--      mapping -- and the disclosed probability is *derived by enumerating
--      that mapping* rather than written down beside it. The two cannot
--      drift, and a future edit that biases the coin also moves the number
--      the screen shows and the number the trial asserts.
--   2. The limits were baked into the function body and a CHECK constraint,
--      so tuning them needed a migration. They move to public.casino_policy,
--      alongside a daily loss cap the spec requires and 042 never had.
--   3. Nothing could turn the game off. Spec 18.6 keeps the casino disabled
--      for the MVP and 14.3 requires a >= 1,000,000-play distribution trial
--      before it opens at all, so the game now asks a feature switch before
--      it takes a bet, and the trial 14.3 demands is recorded as evidence
--      rather than printed once and forgotten.
--
-- The ledger is not touched. Whatever the biased game paid out has already
-- been posted, and per the spec a wrong transaction is undone by a
-- compensating transaction, never by editing rows. Nothing here rewrites a
-- play, a posting or a balance -- and in practice production has none: the
-- casino has no controller, service, route or page, and this migration
-- deliberately leaves it that way.
--
-- Where the switch lives. 059-feature-switches-and-economy-policies.sql owns
-- public.feature_switches: the four states, the seed rows -- the casino's
-- among them, disabled, with its preconditions written out -- the read
-- function public.feature_switch_state(text), and the superadmin write path.
-- This migration only consumes that registry.
--
-- An earlier draft of this file carried a minimal registry of its own, keyed
-- `feature` with a boolean `enabled`, written on the assumption that whatever
-- general registry followed would absorb it. It did not: 059 arrived with a
-- different shape, and the two would not have collided loudly. CREATE TABLE
-- IF NOT EXISTS finds a table of that name, skips, and leaves every later
-- statement addressing columns that are not there. One table, one definition,
-- and the one that seeds the row wins.
--
-- What this migration adds on top is a single thing 059 deliberately does not
-- do: a trigger that refuses to let the casino row leave 'disabled' while no
-- qualifying distribution trial exists. It belongs here because the trial
-- table it reads is defined here, and because 059 is the general registry --
-- the gate is a property of this one feature, not of switches.

BEGIN;

-- ---------------------------------------------------------------------------
-- Coin fairness: one definition of the face, one derived disclosure
-- ---------------------------------------------------------------------------

-- The single place a random byte becomes a face. Everything else -- the game,
-- the disclosed probability, the distribution trial -- goes through here, so
-- there is exactly one number to get wrong and three things that notice.
--
-- The threshold is deliberately NOT a policy column. Bet sizes are an
-- operator's business; the fairness of the coin is not, and a tunable
-- threshold would be a supported way to reintroduce 042's bias without a
-- migration and without review.
CREATE OR REPLACE FUNCTION public.casino_coin_outcome_for_byte(p_byte integer)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_byte IS NULL OR p_byte < 0 OR p_byte > 255 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'coin draw byte must be 0..255';
  END IF;
  -- 128 of the 256 byte values, so exactly one half. 042 used 48.
  RETURN CASE WHEN p_byte < 128 THEN 'heads' ELSE 'tails' END;
END;
$$;

ALTER FUNCTION public.casino_coin_outcome_for_byte(integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_coin_outcome_for_byte(integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_coin_outcome_for_byte(integer) TO moneyverse_app;

-- The probability the member is told, counted off the mapping above rather
-- than asserted next to it. Writing `500000` here would be one more number to
-- keep in step with the threshold, which is the class of mistake this
-- migration exists to fix. Parts per million because the disclosure travels
-- through JSON and a float would print 0.4999999999.
CREATE OR REPLACE FUNCTION public.casino_coin_win_probability_ppm()
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_heads_faces bigint;
BEGIN
  SELECT count(*) INTO v_heads_faces
  FROM generate_series(0, 255) AS face
  WHERE public.casino_coin_outcome_for_byte(face) = 'heads';
  -- Floor division: exact for any threshold that divides 256, which every
  -- honest one does.
  RETURN (v_heads_faces * 1000000 / 256)::integer;
END;
$$;

ALTER FUNCTION public.casino_coin_win_probability_ppm() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_coin_win_probability_ppm()
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_coin_win_probability_ppm() TO moneyverse_app;

-- ---------------------------------------------------------------------------
-- Limits as policy, not as function body
-- ---------------------------------------------------------------------------

-- Singleton, following work_reward_policy (021) and daily_reward_policy (005).
-- No `enabled` column: the feature switch owns that, and a feature with two
-- off switches is a feature that is on when someone checks the wrong one.
CREATE TABLE IF NOT EXISTS public.casino_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  min_stake bigint NOT NULL CHECK (min_stake > 0),
  max_stake bigint NOT NULL CHECK (max_stake > 0),
  daily_stake_limit bigint NOT NULL CHECK (daily_stake_limit > 0),
  daily_loss_limit bigint NOT NULL CHECK (daily_loss_limit > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT casino_policy_stake_range CHECK (max_stake >= min_stake),
  -- Both daily caps have to leave room for one play at the maximum stake, or
  -- the policy silently forbids the bet it advertises.
  CONSTRAINT casino_policy_daily_covers_one_play CHECK (daily_stake_limit >= max_stake),
  CONSTRAINT casino_policy_loss_covers_one_play CHECK (daily_loss_limit >= max_stake),
  -- A loss cap at or above the stake cap can never bind, because the most a
  -- member can lose is everything they staked. Half the day's exposure is a
  -- cap that actually stops a losing run.
  CONSTRAINT casino_policy_loss_below_stake CHECK (daily_loss_limit < daily_stake_limit)
);

REVOKE ALL PRIVILEGES ON TABLE public.casino_policy FROM PUBLIC, moneyverse_app;

INSERT INTO public.casino_policy (singleton, min_stake, max_stake, daily_stake_limit, daily_loss_limit)
VALUES (true, 10, 10000, 50000, 25000)
ON CONFLICT (singleton) DO NOTHING;

-- 042 wrote the stake range into a CHECK as well as into the function. With
-- the range in policy, that constraint would turn a policy change into a
-- 23514 raised from an INSERT after the money has already moved, instead of a
-- clean 22023 raised before anything happens.
ALTER TABLE public.virtual_casino_coin_plays
  DROP CONSTRAINT IF EXISTS virtual_casino_coin_plays_stake_amount_check;
ALTER TABLE public.virtual_casino_coin_plays
  DROP CONSTRAINT IF EXISTS virtual_casino_coin_plays_stake_amount_positive;
ALTER TABLE public.virtual_casino_coin_plays
  ADD CONSTRAINT virtual_casino_coin_plays_stake_amount_positive CHECK (stake_amount > 0);

-- Both daily caps aggregate this table twice per play, keyed the same way.
CREATE INDEX IF NOT EXISTS virtual_casino_coin_plays_user_day_idx
  ON public.virtual_casino_coin_plays (user_id, play_date);

-- ---------------------------------------------------------------------------
-- Distribution trial (spec 14.3)
-- ---------------------------------------------------------------------------

-- Evidence, not a printout: the trigger further down refuses to open the
-- casino switch unless a row here qualifies. Append-only for the same reason
-- the reconciliation snapshots are -- a trial you can edit afterwards proves
-- nothing, and here it would be the thing standing between a biased coin and
-- production.
CREATE TABLE IF NOT EXISTS public.casino_coin_distribution_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  trials bigint NOT NULL CHECK (trials > 0),
  heads bigint NOT NULL CHECK (heads >= 0),
  expected_win_probability_ppm integer NOT NULL
    CHECK (expected_win_probability_ppm BETWEEN 0 AND 1000000),
  observed_win_probability_ppm integer NOT NULL
    CHECK (observed_win_probability_ppm BETWEEN 0 AND 1000000),
  z_score numeric(12, 6) NOT NULL,
  tolerance_sigma numeric(6, 3) NOT NULL CHECK (tolerance_sigma > 0),
  passed boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT casino_coin_distribution_trials_heads_within_trials CHECK (heads <= trials)
);

REVOKE ALL PRIVILEGES ON TABLE public.casino_coin_distribution_trials FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.casino_reject_distribution_trial_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'casino coin distribution trials are append-only';
END;
$$;

ALTER FUNCTION public.casino_reject_distribution_trial_mutation() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_distribution_trial_mutation()
  FROM PUBLIC, moneyverse_app;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.casino_coin_distribution_trials'::pg_catalog.regclass
      AND trigger_row.tgname = 'casino_coin_distribution_trials_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER casino_coin_distribution_trials_immutable
      BEFORE UPDATE OR DELETE ON public.casino_coin_distribution_trials
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_reject_distribution_trial_mutation();
  END IF;
END;
$do$;

-- Draws p_trials coins through the same mapping the game uses and records the
-- result. Three decisions worth stating:
--
-- The draws happen in one statement over blocks of random bytes rather than
-- one call per toss. A million round trips would make the trial a thing
-- nobody runs, and a trial nobody runs is how 042 shipped.
--
-- The mapping is enumerated once into a 256-entry lookup instead of being
-- called a million times. It is still the game's own mapping that decides
-- every draw -- a trial against a reimplementation of the rule would only
-- prove the reimplementation.
--
-- moneyverse_app holds EXECUTE because CI is the only place this SQL ever
-- runs, and a trial the tests cannot run is a trial nobody runs. What that
-- grant hands a compromised application is bounded CPU and one appended row
-- per call, and neither is new authority: an injected generate_series already
-- burns the CPU, and init/001-economy-core.sql already grants the role INSERT
-- on users, ledger_postings and audit_logs. The function reads no member data
-- and moves no money.
CREATE OR REPLACE FUNCTION public.casino_run_coin_distribution_trial(p_key uuid, p_trials bigint)
RETURNS TABLE(
  trial_id uuid,
  trials bigint,
  heads bigint,
  expected_win_probability_ppm integer,
  observed_win_probability_ppm integer,
  z_score numeric,
  tolerance_sigma numeric,
  passed boolean,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  c_block_bytes constant integer := 1024;
  -- Five sigma. At a million draws that is a heads share inside
  -- 0.5 +/- 0.0025, so an honest coin fails about once in 1.7 million runs
  -- while 042's coin misses by 625 sigma.
  c_tolerance_sigma constant numeric := 5.0;
  v_existing public.casino_coin_distribution_trials%ROWTYPE;
  v_is_heads boolean[];
  v_expected_ppm integer;
  v_probability numeric;
  v_full_blocks integer;
  v_remainder integer;
  v_heads bigint;
  v_variance numeric;
  v_z numeric;
  v_passed boolean;
  v_trial uuid;
BEGIN
  IF p_key IS NULL OR p_trials IS NULL OR p_trials < 1000 OR p_trials > 2000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'trial size must be 1000..2000000';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended('moneyverse:casino_run_coin_distribution_trial:' || p_key::text, 0)
  );

  SELECT * INTO v_existing
  FROM public.casino_coin_distribution_trials AS trial
  WHERE trial.idempotency_key = p_key;
  IF FOUND THEN
    -- No owner check, unlike 045's five functions: a trial belongs to nobody.
    -- It takes no actor, reads no member's rows and returns a public fact
    -- about the coin, so there is no caller a replay could leak to.
    IF v_existing.trials <> p_trials THEN
      RAISE EXCEPTION USING
        ERRCODE = '23505',
        MESSAGE = 'idempotency key conflicts with another distribution trial';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.trials, v_existing.heads,
                        v_existing.expected_win_probability_ppm,
                        v_existing.observed_win_probability_ppm,
                        v_existing.z_score::numeric, v_existing.tolerance_sigma::numeric,
                        v_existing.passed, true;
    RETURN;
  END IF;

  SELECT array_agg(public.casino_coin_outcome_for_byte(face) = 'heads' ORDER BY face)
  INTO v_is_heads
  FROM generate_series(0, 255) AS face;

  v_expected_ppm := public.casino_coin_win_probability_ppm();
  v_probability := v_expected_ppm::numeric / 1000000;
  v_full_blocks := (p_trials / c_block_bytes)::integer;
  v_remainder := (p_trials % c_block_bytes)::integer;

  -- OFFSET 0 is a fence, not a no-op: gen_random_bytes is volatile, and a
  -- subquery the planner is allowed to flatten would re-evaluate it once per
  -- drawn byte -- a gigabyte of randomness for a million-draw trial. OFFSET
  -- makes the block scan its own node, so each block of bytes is generated
  -- once and read 1024 times.
  SELECT count(*) FILTER (WHERE v_is_heads[get_byte(block.bytes, draw.byte_index) + 1])
  INTO v_heads
  FROM (
    SELECT public.gen_random_bytes(c_block_bytes) AS bytes, c_block_bytes AS byte_count
    FROM generate_series(1, v_full_blocks)
    UNION ALL
    SELECT public.gen_random_bytes(v_remainder), v_remainder
    WHERE v_remainder > 0
    OFFSET 0
  ) AS block,
  LATERAL generate_series(0, block.byte_count - 1) AS draw(byte_index);

  v_variance := p_trials::numeric * v_probability * (1 - v_probability);
  IF v_variance > 0 THEN
    v_z := (v_heads::numeric - p_trials::numeric * v_probability) / sqrt(v_variance);
  ELSE
    -- A mapping with no variance is a coin with one face. It "passes" only by
    -- landing on that face every time, which is still a failure of fairness --
    -- the probability the disclosure reports would then be 0 or 1,000,000 ppm,
    -- and the tests assert 500,000.
    v_z := CASE WHEN v_heads::numeric = p_trials::numeric * v_probability THEN 0 ELSE 999999 END;
  END IF;
  v_passed := abs(v_z) <= c_tolerance_sigma;

  INSERT INTO public.casino_coin_distribution_trials (
    idempotency_key, trials, heads, expected_win_probability_ppm,
    observed_win_probability_ppm, z_score, tolerance_sigma, passed
  )
  VALUES (
    p_key, p_trials, v_heads, v_expected_ppm,
    round(v_heads::numeric * 1000000 / p_trials::numeric)::integer,
    v_z, c_tolerance_sigma, v_passed
  )
  RETURNING id INTO v_trial;

  RETURN QUERY
  SELECT trial.id, trial.trials, trial.heads, trial.expected_win_probability_ppm,
         trial.observed_win_probability_ppm, trial.z_score::numeric,
         trial.tolerance_sigma::numeric, trial.passed, false
  FROM public.casino_coin_distribution_trials AS trial
  WHERE trial.id = v_trial;
END;
$$;

ALTER FUNCTION public.casino_run_coin_distribution_trial(uuid, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_run_coin_distribution_trial(uuid, bigint)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_run_coin_distribution_trial(uuid, bigint) TO moneyverse_app;

-- The row the activation trigger looks for, and the one whoever opens the
-- switch cites in the reason they record. "Qualifying" is the spec's bar, not
-- the trial's: a passing 1,000-draw trial is a fine smoke test and is not
-- evidence that the coin is fair across a member's lifetime of plays.
CREATE OR REPLACE FUNCTION public.casino_latest_qualifying_distribution_trial()
RETURNS TABLE(
  trial_id uuid,
  trials bigint,
  heads bigint,
  expected_win_probability_ppm integer,
  observed_win_probability_ppm integer,
  z_score numeric,
  tolerance_sigma numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT trial.id, trial.trials, trial.heads, trial.expected_win_probability_ppm,
         trial.observed_win_probability_ppm, trial.z_score::numeric,
         trial.tolerance_sigma::numeric, trial.created_at
  FROM public.casino_coin_distribution_trials AS trial
  WHERE trial.passed AND trial.trials >= 1000000
  ORDER BY trial.created_at DESC, trial.id DESC
  LIMIT 1;
END;
$$;

ALTER FUNCTION public.casino_latest_qualifying_distribution_trial() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_latest_qualifying_distribution_trial()
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_latest_qualifying_distribution_trial() TO moneyverse_app;

-- ---------------------------------------------------------------------------
-- The one activation precondition a machine can check (spec 18.6, 14.3)
-- ---------------------------------------------------------------------------

-- 059 keeps `activation_preconditions` as prose, "read by a person, not by
-- code", and for two of the casino's four entries that is the only honest
-- thing it can be: no column in this schema knows whether a lawyer has looked
-- at the game rating, or whether the abuse and self-limit controls were really
-- exercised rather than merely reported. Those stay prose on the row, judged
-- by whoever flips the switch.
--
-- The distribution trial is not like them. 14.3 states it as a number, and it
-- is a row in an append-only table this migration builds -- either one
-- qualifies or none does, and a query settles it. Leaving that one to prose
-- would mean the one precondition the spec made objective is enforced no
-- better than the ones that cannot be, which is how a coin that pays out
-- 18.75% of the time reaches production in the first place.
--
-- The ledger reconciliation stays prose too, and the reason is worth stating
-- rather than leaving as an omission: 018's snapshots do carry `integrity_ok`,
-- but 14.3 asks for a reconciliation clean *across the trial window*, and
-- nothing in this repository records a snapshot yet -- the worker that will is
-- a later PR. A check that accepted any snapshot with integrity_ok would pass
-- on evidence gathered before the trial ran, and a gate that opens for the
-- wrong reason is worse than one a person has to answer for.
CREATE OR REPLACE FUNCTION public.casino_reject_activation_without_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.casino_latest_qualifying_distribution_trial()) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'casino cannot leave disabled without a passing 1,000,000-play distribution trial',
      HINT = 'record one with public.casino_run_coin_distribution_trial on the test server first';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.casino_reject_activation_without_trial() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_activation_without_trial()
  FROM PUBLIC, moneyverse_app;

-- Scoped by the WHEN clause, and scoped twice over. To the casino row, because
-- the other two stage-3 features have their own evidence and none of it is a
-- coin; and to a state that is not 'disabled', so that closing the casino is
-- never refused. A safety valve that can jam shut is not a safety valve, and
-- the switch exists to be flipped at midnight by somebody who has just watched
-- the game misbehave.
--
-- The condition reads NEW.state alone rather than the OLD -> NEW pair, which
-- rejects a little more than "moves out of disabled": a row that reached
-- 'paused' by some route this migration did not anticipate cannot then be
-- promoted to 'enabled' without the evidence either. That costs nothing
-- afterwards, because trials are append-only -- once a qualifying one exists
-- it cannot stop existing, so a legitimately open casino is never held up by
-- its own reason or updated_by being edited.
--
-- UPDATE, not INSERT OR UPDATE. The registry's only INSERT is a migration
-- seeding a feature, and 059's casino row arrives 'disabled', so an INSERT
-- branch would have nothing to catch. It is left off rather than added
-- speculatively: this guards the act the switch exists for, which is somebody
-- moving a row that is already there.
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.feature_switches'::pg_catalog.regclass
      AND trigger_row.tgname = 'feature_switches_casino_requires_distribution_trial'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER feature_switches_casino_requires_distribution_trial
      BEFORE UPDATE ON public.feature_switches
      FOR EACH ROW
      WHEN (NEW.feature_key = 'casino' AND NEW.state IS DISTINCT FROM 'disabled')
      EXECUTE FUNCTION public.casino_reject_activation_without_trial();
  END IF;
END;
$do$;

-- ---------------------------------------------------------------------------
-- Disclosure (spec 3: the odds have to be on the screen)
-- ---------------------------------------------------------------------------

-- Korean game law requires the odds to be disclosed, which means before the
-- stake is placed, not in the receipt afterwards. The play function carries
-- them too, but a screen that only learns the odds from a result has already
-- taken the bet.
--
-- Usage figures are this actor's own, filtered here rather than by a caller
-- appending a WHERE -- the same reason 047 gave for the stock reads. An actor
-- with no plays and no account gets the policy with full headroom: the terms
-- are public disclosure, and a member who has never played has used nothing.
CREATE OR REPLACE FUNCTION public.casino_coin_terms(p_actor uuid)
RETURNS TABLE(
  enabled boolean,
  min_stake bigint,
  max_stake bigint,
  daily_stake_limit bigint,
  daily_loss_limit bigint,
  daily_stake_used bigint,
  daily_loss_used bigint,
  remaining_stake bigint,
  remaining_loss bigint,
  win_probability_ppm integer,
  payout_multiplier_ppm integer,
  house_edge_ppm integer,
  worst_case_loss bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  -- Even money: a winning play returns the stake and the same again, which is
  -- the +/- stake posting pair in casino_play_coin below. Change one and this
  -- number is wrong.
  c_payout_multiplier_ppm constant integer := 2000000;
  v_min bigint; v_max bigint; v_daily_stake bigint; v_daily_loss bigint;
  v_staked_today bigint; v_lost_today bigint;
  v_remaining_stake bigint; v_remaining_loss bigint;
  v_win_ppm integer;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid coin game terms request';
  END IF;

  SELECT policy.min_stake, policy.max_stake, policy.daily_stake_limit, policy.daily_loss_limit
  INTO v_min, v_max, v_daily_stake, v_daily_loss
  FROM public.casino_policy AS policy
  WHERE policy.singleton;
  IF v_min IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;

  -- sum(bigint) is numeric, and the cast back is explicit so a future reader
  -- does not have to know that plpgsql would have done it silently.
  SELECT COALESCE(sum(play.stake_amount), 0)::bigint,
         COALESCE(-sum(least(play.net_amount, 0)), 0)::bigint
  INTO v_staked_today, v_lost_today
  FROM public.virtual_casino_coin_plays AS play
  WHERE play.user_id = p_actor
    AND play.play_date = (now() AT TIME ZONE 'Asia/Seoul')::date;

  v_remaining_stake := greatest(v_daily_stake - v_staked_today, 0);
  v_remaining_loss := greatest(v_daily_loss - v_lost_today, 0);
  v_win_ppm := public.casino_coin_win_probability_ppm();

  RETURN QUERY SELECT
    -- Only 'enabled' is open, which is the same comparison casino_play_coin
    -- makes below. 'paused' settles what already exists and takes nothing new,
    -- and a coin toss leaves nothing to settle; 'safe_mode' reduces exposure
    -- and there is no smaller casino. A screen told anything but false for
    -- those two would offer a stake the game is going to refuse.
    public.feature_switch_state('casino') = 'enabled',
    v_min, v_max, v_daily_stake, v_daily_loss,
    v_staked_today, v_lost_today, v_remaining_stake, v_remaining_loss,
    v_win_ppm, c_payout_multiplier_ppm,
    -- Expected loss per unit staked. Zero for a fair coin at even money, which
    -- is the claim the distribution trial has to back up.
    (1000000 - (v_win_ppm::bigint * c_payout_multiplier_ppm::bigint / 1000000))::integer,
    -- The most this member can still lose today: they may stake no more than
    -- the stake headroom, and every WLD of it can lose.
    least(v_remaining_stake, v_remaining_loss);
END;
$$;

ALTER FUNCTION public.casino_coin_terms(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_coin_terms(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_coin_terms(uuid) TO moneyverse_app;

-- ---------------------------------------------------------------------------
-- The game
-- ---------------------------------------------------------------------------

-- Dropped rather than replaced: the return type gains the three disclosure
-- columns, and a RETURNS TABLE column list is part of the return type, so
-- CREATE OR REPLACE refuses it. Nothing calls this -- the casino has no
-- controller, service, DTO, route or page anywhere in the repository -- so
-- there is no caller to sequence the drop against. The parameter list is
-- unchanged: the browser sends a choice and a stake, and there is still no
-- parameter through which it could influence the face, the odds or the
-- payout.
DROP FUNCTION IF EXISTS public.casino_play_coin(uuid, uuid, text, bigint);

CREATE OR REPLACE FUNCTION public.casino_play_coin(
  p_key uuid,
  p_actor uuid,
  p_choice text,
  p_stake bigint
)
RETURNS TABLE(
  play_id uuid,
  outcome text,
  net_amount bigint,
  transaction_id uuid,
  replayed boolean,
  win_probability_ppm integer,
  payout_multiplier_ppm integer,
  worst_case_loss bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  c_payout_multiplier_ppm constant integer := 2000000;
  v_date date := (now() AT TIME ZONE 'Asia/Seoul')::date;
  v_existing public.virtual_casino_coin_plays%ROWTYPE;
  v_min bigint; v_max bigint; v_daily_stake bigint; v_daily_loss bigint;
  v_staked_today bigint; v_lost_today bigint;
  v_cash uuid; v_counterparty uuid;
  v_outcome text; v_net bigint; v_tx uuid; v_play uuid;
  v_win_ppm integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_choice IS NULL OR p_choice NOT IN ('heads', 'tails') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid coin game request';
  END IF;

  SELECT policy.min_stake, policy.max_stake, policy.daily_stake_limit, policy.daily_loss_limit
  INTO v_min, v_max, v_daily_stake, v_daily_loss
  FROM public.casino_policy AS policy
  WHERE policy.singleton
  FOR SHARE;
  IF v_min IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;
  IF p_stake IS NULL OR p_stake < v_min OR p_stake > v_max THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stake is outside the permitted range';
  END IF;

  -- 045's order: lock the key before looking for its receipt, so two identical
  -- submissions cannot both find nothing and both play.
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:casino_play_coin:' || p_key::text, 0));

  SELECT * INTO v_existing
  FROM public.virtual_casino_coin_plays AS play
  WHERE play.idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.user_id <> p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'coin game receipt belongs to another user';
    END IF;
    IF v_existing.choice <> p_choice OR v_existing.stake_amount <> p_stake THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency key conflicts with another game';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.outcome, v_existing.net_amount,
                        v_existing.transaction_id, true,
                        public.casino_coin_win_probability_ppm(), c_payout_multiplier_ppm,
                        v_existing.stake_amount;
    RETURN;
  END IF;

  -- After the replay, not before: closing the casino must not turn a member's
  -- in-flight retry into an error. That play's money has already moved, and
  -- the only thing the retry wants is the receipt for it.
  --
  -- 059 answers 'enabled' for a feature nobody registered, which is right for
  -- a registry -- a switch takes a feature away, and one nobody has taken away
  -- is on. It is also why this compares against 'enabled' rather than asking
  -- whether the state is 'disabled': 'paused' and 'safe_mode' are not open
  -- either, and the casino's own row is seeded by 059, so the permissive
  -- default never decides anything here.
  IF public.feature_switch_state('casino') <> 'enabled' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino is not open';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS member
    WHERE member.id = p_actor AND member.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active user required';
  END IF;

  SELECT COALESCE(sum(play.stake_amount), 0)::bigint,
         COALESCE(-sum(least(play.net_amount, 0)), 0)::bigint
  INTO v_staked_today, v_lost_today
  FROM public.virtual_casino_coin_plays AS play
  WHERE play.user_id = p_actor AND play.play_date = v_date;

  IF v_staked_today + p_stake > v_daily_stake THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily stake limit reached';
  END IF;
  -- Measured against what this play could lose, not against what it did. A
  -- loss cap checked after the toss is a cap that is only ever breached.
  IF v_lost_today + p_stake > v_daily_loss THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily loss limit reached';
  END IF;

  SELECT wallet.id INTO v_cash
  FROM public.accounts AS wallet
  WHERE wallet.owner_user_id = p_actor
    AND wallet.account_type = 'USER_CASH'::public.account_type
    AND wallet.status = 'active'::public.account_status
  FOR UPDATE;
  IF v_cash IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  v_outcome := public.casino_coin_outcome_for_byte(get_byte(public.gen_random_bytes(1), 0));
  v_net := CASE WHEN v_outcome = p_choice THEN p_stake ELSE -p_stake END;

  SELECT counterparty.id INTO v_counterparty
  FROM public.accounts AS counterparty
  WHERE counterparty.system_key = CASE WHEN v_net > 0 THEN 'mint' ELSE 'sink' END
    AND counterparty.status = 'active'::public.account_status
  FOR UPDATE;
  IF v_counterparty IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'game counterparty required';
  END IF;

  v_win_ppm := public.casino_coin_win_probability_ppm();

  SELECT public.economy_post_transaction(
    p_key, 'VIRTUAL_COIN_GAME', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', p_stake,
                         'direction', CASE WHEN v_net > 0 THEN 'debit' ELSE 'credit' END),
      jsonb_build_object('accountId', v_counterparty, 'amount', p_stake,
                         'direction', CASE WHEN v_net > 0 THEN 'credit' ELSE 'debit' END)
    ),
    'casino.coin.played',
    -- The disclosed odds go into the outbox payload as well: what the member
    -- was told is part of the record of the play, not a property of whatever
    -- the function happens to compute the next time it is asked.
    jsonb_build_object(
      'choice', p_choice, 'outcome', v_outcome, 'stake', p_stake, 'net', v_net,
      'winProbabilityPpm', v_win_ppm, 'payoutMultiplierPpm', c_payout_multiplier_ppm
    )
  ) INTO v_tx;

  INSERT INTO public.virtual_casino_coin_plays (
    idempotency_key, user_id, play_date, choice, outcome, stake_amount, net_amount, transaction_id
  )
  VALUES (p_key, p_actor, v_date, p_choice, v_outcome, p_stake, v_net, v_tx)
  RETURNING id INTO v_play;

  RETURN QUERY SELECT v_play, v_outcome, v_net, v_tx, false,
                      v_win_ppm, c_payout_multiplier_ppm, p_stake;
END;
$$;

ALTER FUNCTION public.casino_play_coin(uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_play_coin(uuid, uuid, text, bigint)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_play_coin(uuid, uuid, text, bigint) TO moneyverse_app;

-- Restated, not newly imposed: 042 already revoked this and the read functions
-- above must not be read as loosening it.
REVOKE ALL PRIVILEGES ON TABLE public.virtual_casino_coin_plays FROM PUBLIC, moneyverse_app;

COMMIT;
