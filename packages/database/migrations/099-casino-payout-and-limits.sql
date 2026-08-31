-- The casino as a sink, which is what it was supposed to be.
--
-- 060 pays even money: `v_net` is `+p_stake` on a win and `-p_stake` on a
-- loss, against a coin that is exactly fair. Its own disclosure function says
-- so out loud -- `house_edge_ppm` computes to zero -- and a zero-edge game
-- returns every WLD it takes. Specification 6 lists SINK as a burn account
-- and 15.1 wants 일일 소각량 at 60~90% of issuance; a casino that recycles
-- nothing contributes to neither. It is a coin flip that moves money between
-- members and the mint and back again.
--
-- The community's proposal, and the arithmetic behind it:
--
--   동전 맞히기            50%      1.90배    0.5    x 1.9 = 0.95
--   주사위 홀짝            50%      1.90배    0.5    x 1.9 = 0.95
--   주사위 숫자 맞히기     16.67%   5.70배    0.1667 x 5.7 = 0.95
--
-- All three return 95%, so about 5% of everything staked leaves circulation.
-- This migration prices the game that exists; the two dice games are a
-- separate change, because each needs its own outcome function, its own
-- distribution trial, and its own row in the fairness disclosure.
--
-- THE MULTIPLIER BECOMES POLICY, NOT A CONSTANT. 060 made it a constant on
-- purpose -- "the disclosed even-money payout honest" -- and that reasoning
-- holds only while the number never moves. It has now moved once, and the
-- next time it moves it should not need a migration: pricing is an operator
-- decision. It stays out of the *automatic* engine, which 15.4 requires
-- ("카지노 확률과 과거 결과는 자동 조정 대상에서 제외"), and the disclosure
-- functions read the same row the settlement does, so the two cannot drift.
--
-- THE PROBABILITY DOES NOT MOVE. 14.3 fixed the coin at exactly 50:50 and
-- that is a legal requirement, not a lever. The edge comes entirely from the
-- payout, which is disclosed. A member who is told "50% to win, 1.9x if you
-- do" has been told everything.
--
-- ROUNDING FAVOURS THE HOUSE, AND THAT IS SAID ON SCREEN. Winnings are
-- integer WLD, so a 1.9x payout on a stake that is not a multiple of ten has
-- to round. Rounding down is the direction that cannot create currency, which
-- matters more here than the fraction of a WLD it costs a member -- and the
-- minimum stake of 10 keeps the worst case under one percent of a stake.

BEGIN;

ALTER TABLE public.casino_policy
  ADD COLUMN IF NOT EXISTS payout_multiplier_ppm integer NOT NULL DEFAULT 1900000;

-- Above 1,000,000 or a win pays less than the stake it risked, which is not a
-- game. At or above 2,000,000 the house edge is zero or negative and the
-- casino issues currency instead of retiring it -- the state this migration
-- exists to leave.
ALTER TABLE public.casino_policy DROP CONSTRAINT IF EXISTS casino_policy_payout_is_a_sink;
ALTER TABLE public.casino_policy ADD CONSTRAINT casino_policy_payout_is_a_sink
  CHECK (payout_multiplier_ppm > 1000000 AND payout_multiplier_ppm < 2000000);

-- The proposed limits. `daily_loss_limit` is not in the proposal; half the
-- day's exposure is what 060's own comment calls a cap that actually stops a
-- losing run, and the CHECK requires it to sit below the stake limit.
UPDATE public.casino_policy
SET min_stake = 10,
    max_stake = 500,
    daily_stake_limit = 3000,
    daily_loss_limit = 1500,
    payout_multiplier_ppm = 1900000,
    updated_at = clock_timestamp()
WHERE singleton;

-- What a win pays, net of the stake, in whole WLD.
--
-- One function so the settlement and the disclosure cannot disagree about
-- rounding -- which is exactly the way a "1.9x" that is really 1.867x for a
-- stake of 15 would go unnoticed.
CREATE OR REPLACE FUNCTION public.casino_net_win(p_stake bigint, p_multiplier_ppm integer)
RETURNS bigint
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT (p_stake * (p_multiplier_ppm - 1000000)) / 1000000
$$;

-- 060's terms, reading the multiplier from policy.
--
-- Dropped first because the row type changes: `net_win_at_max` is a new OUT
-- parameter, and PostgreSQL will not replace a function whose OUT columns
-- differ. Inside this transaction, so nothing observes it missing.
DROP FUNCTION IF EXISTS public.casino_coin_terms(uuid);
--
-- `worst_case_loss` keeps 060's meaning exactly -- the most this member can
-- still lose today, which is the lesser of their two remaining allowances.
-- `house_edge_ppm` now computes to something other than zero, which is the
-- number 14.3 asks to be shown, and `net_win_at_max` is new: what a winning
-- maximum stake actually pays after the rounding below.
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
  worst_case_loss bigint,
  net_win_at_max bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_date date := (pg_catalog.now() AT TIME ZONE 'Asia/Seoul')::date;
  v_win_ppm integer := public.casino_coin_win_probability_ppm();
  v_multiplier integer;
  v_staked bigint;
  v_lost bigint;
BEGIN
  SELECT policy_row.min_stake, policy_row.max_stake, policy_row.daily_stake_limit,
         policy_row.daily_loss_limit, policy_row.payout_multiplier_ppm
  INTO min_stake, max_stake, daily_stake_limit, daily_loss_limit, v_multiplier
  FROM public.casino_policy AS policy_row
  WHERE policy_row.singleton;

  IF min_stake IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;

  SELECT coalesce(sum(play_row.stake_amount), 0),
         coalesce(-sum(least(play_row.net_amount, 0)), 0)
  INTO v_staked, v_lost
  FROM public.virtual_casino_coin_plays AS play_row
  WHERE play_row.user_id = p_actor AND play_row.play_date = v_date;

  enabled := public.feature_switch_state('casino') = 'enabled';
  daily_stake_used := v_staked;
  daily_loss_used := v_lost;
  remaining_stake := greatest(daily_stake_limit - v_staked, 0);
  remaining_loss := greatest(daily_loss_limit - v_lost, 0);
  win_probability_ppm := v_win_ppm;
  payout_multiplier_ppm := v_multiplier;
  house_edge_ppm := (1000000 - (v_win_ppm::bigint * v_multiplier::bigint / 1000000))::integer;
  -- 060's meaning, unchanged: the most this member can still lose today. They
  -- may stake no more than the stake headroom, and every WLD of it can lose.
  -- It is not `max_stake`; that is the biggest single bet, which is a
  -- different disclosure and a smaller number.
  worst_case_loss := least(remaining_stake, remaining_loss);
  net_win_at_max := public.casino_net_win(max_stake, v_multiplier);
  RETURN NEXT;
END;
$$;

-- 060's body, settling at the policy's payout.
--
-- The only changes are `v_net` on a win and where the multiplier comes from.
-- The fair coin, the two daily caps checked before the toss, the idempotency
-- lock, the ledger posting and the outbox payload are all as they were --
-- including that the payload records the odds the member was shown, which now
-- means recording the multiplier that actually settled the play.
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
  v_date date := (pg_catalog.now() AT TIME ZONE 'Asia/Seoul')::date;
  v_existing public.virtual_casino_coin_plays%ROWTYPE;
  v_min bigint; v_max bigint; v_daily_stake bigint; v_daily_loss bigint;
  v_multiplier integer;
  v_staked_today bigint; v_lost_today bigint;
  v_cash uuid; v_counterparty uuid;
  v_outcome text; v_net bigint; v_tx uuid; v_play uuid;
  v_win_ppm integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_choice IS NULL OR p_choice NOT IN ('heads', 'tails') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid coin game request';
  END IF;

  SELECT policy_row.min_stake, policy_row.max_stake, policy_row.daily_stake_limit,
         policy_row.daily_loss_limit, policy_row.payout_multiplier_ppm
  INTO v_min, v_max, v_daily_stake, v_daily_loss, v_multiplier
  FROM public.casino_policy AS policy_row
  WHERE policy_row.singleton
  FOR SHARE;
  IF v_min IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;
  IF p_stake IS NULL OR p_stake < v_min OR p_stake > v_max THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stake is outside the permitted range';
  END IF;

  IF public.feature_switch_state('casino') <> 'enabled' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'the coin game is closed';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:casino-coin:' || p_key::text, 0)
  );

  SELECT * INTO v_existing FROM public.virtual_casino_coin_plays WHERE idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'coin game receipt belongs to another user';
    END IF;
    IF v_existing.stake_amount IS DISTINCT FROM p_stake
      OR v_existing.choice IS DISTINCT FROM p_choice THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this key already settled different terms';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.outcome, v_existing.net_amount,
                        v_existing.transaction_id, true,
                        public.casino_coin_win_probability_ppm(), v_multiplier, p_stake;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:casino-coin-day:' || p_actor::text, 0)
  );

  SELECT coalesce(sum(play_row.stake_amount), 0),
         coalesce(-sum(least(play_row.net_amount, 0)), 0)
  INTO v_staked_today, v_lost_today
  FROM public.virtual_casino_coin_plays AS play_row
  WHERE play_row.user_id = p_actor AND play_row.play_date = v_date;

  IF v_staked_today + p_stake > v_daily_stake THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily stake limit reached';
  END IF;
  -- Before the toss, on the whole stake: a loss cap checked after the toss is
  -- a cap that is only ever breached.
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
  -- The change. A win returns the stake plus the policy's margin over it; a
  -- loss still costs the whole stake. At 1.9x that is +90 on a 100 stake,
  -- against -100, which is where the 5% comes from.
  v_net := CASE
    WHEN v_outcome = p_choice THEN public.casino_net_win(p_stake, v_multiplier)
    ELSE -p_stake
  END;

  SELECT counterparty.id INTO v_counterparty
  FROM public.accounts AS counterparty
  WHERE counterparty.system_key = CASE WHEN v_net > 0 THEN 'mint' ELSE 'sink' END
    AND counterparty.status = 'active'::public.account_status
  FOR UPDATE;
  IF v_counterparty IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'game counterparty required';
  END IF;

  v_win_ppm := public.casino_coin_win_probability_ppm();

  -- The posting moves `abs(v_net)`, not the stake. Under even money the two
  -- were the same number and 060 could use `p_stake` for both legs; they are
  -- no longer the same, and posting the stake on a win would mint 100 where
  -- the member is owed 90.
  SELECT public.economy_post_transaction(
    p_key, 'VIRTUAL_COIN_GAME', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', abs(v_net),
                         'direction', CASE WHEN v_net > 0 THEN 'debit' ELSE 'credit' END),
      jsonb_build_object('accountId', v_counterparty, 'amount', abs(v_net),
                         'direction', CASE WHEN v_net > 0 THEN 'credit' ELSE 'debit' END)
    ),
    'casino.coin.played',
    jsonb_build_object(
      'choice', p_choice, 'outcome', v_outcome, 'stake', p_stake, 'net', v_net,
      'winProbabilityPpm', v_win_ppm, 'payoutMultiplierPpm', v_multiplier
    )
  ) INTO v_tx;

  INSERT INTO public.virtual_casino_coin_plays (
    idempotency_key, user_id, play_date, choice, outcome, stake_amount, net_amount, transaction_id
  )
  VALUES (p_key, p_actor, v_date, p_choice, v_outcome, p_stake, v_net, v_tx)
  RETURNING id INTO v_play;

  RETURN QUERY SELECT v_play, v_outcome, v_net, v_tx, false,
                      v_win_ppm, v_multiplier, p_stake;
END;
$$;

ALTER FUNCTION public.casino_net_win(bigint, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_coin_terms(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_play_coin(uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_net_win(bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.casino_net_win(bigint, integer) TO moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_coin_terms(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_coin_terms(uuid) TO moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_play_coin(uuid, uuid, text, bigint)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_play_coin(uuid, uuid, text, bigint) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.casino_policy FROM PUBLIC, moneyverse_app;

COMMIT;
