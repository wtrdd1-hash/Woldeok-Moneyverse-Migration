-- The two dice games, and the day the casino stopped counting per game.
--
-- 099 priced the coin as a sink and left the other two games of the
-- community's proposal to a migration of their own, because each needs its
-- own outcome function, its own distribution trial and its own row in the
-- fairness disclosure:
--
--   동전 맞히기            50%      1.90배    0.5     x 1.9 = 0.95
--   주사위 홀짝            50%      1.90배    0.5     x 1.9 = 0.95
--   주사위 숫자 맞히기     16.67%   5.70배    0.16666 x 5.7 = 0.95
--
-- THE DIE IS NOT A BYTE MODULO SIX. 256 is not a multiple of 6, so `byte % 6`
-- shows faces 1-4 on 43 byte values each and faces 5-6 on 42. That is a 0.13
-- point bias on the number game, and 14.3 makes the published probability a
-- legal statement rather than a description. This migration draws by
-- rejection: bytes 252..255 -- everything above the largest multiple of six
-- that fits in 256 -- are thrown away, and the remaining 252 split six ways
-- exactly. The decision stays a pure function of one byte, the way
-- `casino_coin_outcome_for_byte` is, so the trial can enumerate it and the
-- disclosed probability can be counted off it rather than written down beside
-- it. A roller that draws bytes until one is accepted is a separate function,
-- because a function that both draws randomness and decides a face cannot be
-- tested for the second thing.
--
-- AND THE TRIAL HAS TO LOOK AT THE FACES, NOT AT THE WINS. 060's trial is a
-- z-test on the winning share, and against modulo bias that test is nearly
-- blind: the biased mapping puts 128 of 256 bytes on odd faces and 128 on
-- even, so 주사위 홀짝 comes out exactly fair, while 주사위 숫자 맞히기 misses
-- by 3.5 sigma at a million draws -- inside the five-sigma band 060 accepts.
-- What separates a uniform die from that one is the spread across the six
-- faces, so the trial records all six counts and a chi-square with five
-- degrees of freedom. The biased mapping scores about 122 against a critical
-- value of 40; an honest die exceeds 40 about once in seven million trials.
--
-- THE DAILY CAPS ARE PER MEMBER. The proposal's 하루 총베팅 한도 3,000덕 is a
-- limit on a member, not on a game, and the daily loss cap is a
-- responsible-gambling control rather than an accounting one. 060 and 099
-- count `virtual_casino_coin_plays` alone; if each game counted only its own
-- table a member would get 3,000 per game and 1,500 of loss per game, which
-- is three times the exposure the proposal describes, and the same hole in
-- the self-limit a member sets on themselves. So `casino_daily_usage` sums
-- both tables, and every place that asked one of them -- the coin's terms,
-- the coin's settlement, the self-limit trigger -- now asks it instead. The
-- advisory lock that serialises a member's day moves to a game-independent
-- key for the same reason: two caps that are shared must be taken under one
-- lock or a coin play and a dice play can both pass the last one.
--
-- THE TWO TRIGGERS ARE REUSED, NOT REWRITTEN. 080's `casino_enforce_self_limit`
-- reads NEW.user_id, NEW.play_date, NEW.stake_amount and NEW.net_amount, and
-- 096's `casino_refuse_while_in_debt` reads NEW.user_id. The dice table names
-- those four columns exactly that, which is the whole reason both triggers
-- can be attached to it as they stand -- rename one and a member who has
-- locked themselves out of the casino can still roll dice.

BEGIN;

-- ---------------------------------------------------------------------------
-- The die
-- ---------------------------------------------------------------------------

-- One byte in, one face out, or nothing.
--
-- 252 = 6 x 42 is the largest multiple of six inside 256, so the accepted
-- range divides evenly and the modulus is uniform. NULL is a rejected draw,
-- not an error: it is a real outcome of the mapping and the roller's business
-- to handle, and returning it keeps this a total function that a trial can
-- enumerate over all 256 values.
--
-- The threshold is deliberately not a policy column, for the reason 060 gives
-- about the coin: bet sizes are an operator's business and the fairness of
-- the die is not.
CREATE OR REPLACE FUNCTION public.casino_dice_face_for_byte(p_byte integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_byte IS NULL OR p_byte < 0 OR p_byte > 255 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'dice draw byte must be 0..255';
  END IF;
  IF p_byte >= 252 THEN
    RETURN NULL;
  END IF;
  RETURN p_byte % 6 + 1;
END;
$$;

-- Draws until the mapping accepts one. Expected cost is 256/252 bytes, so the
-- loop runs once nearly always.
--
-- The attempt limit is not about probability -- 64 consecutive rejections is
-- (4/256)^64 -- but about what a broken randomness source would do here: this
-- runs inside `casino_play_dice`, which is already holding the member's wallet
-- row locked, and a connection spinning forever under that lock is worse than
-- a refused play.
CREATE OR REPLACE FUNCTION public.casino_roll_die()
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  c_attempt_limit constant integer := 64;
  v_face integer;
  v_attempt integer := 0;
BEGIN
  LOOP
    v_face := public.casino_dice_face_for_byte(
      pg_catalog.get_byte(public.gen_random_bytes(1), 0)
    );
    EXIT WHEN v_face IS NOT NULL;
    v_attempt := v_attempt + 1;
    IF v_attempt >= c_attempt_limit THEN
      RAISE EXCEPTION USING
        ERRCODE = '55000',
        MESSAGE = 'the dice roller drew only rejected bytes';
    END IF;
  END LOOP;
  RETURN v_face;
END;
$$;

-- Whether a face wins, for both games, in one place.
--
-- The settlement, the disclosed probability and the trial all decide through
-- this, so there is one rule to get wrong and three things that notice. It
-- also validates the game and the choice together, which is what lets the play
-- function check both with a single PERFORM.
CREATE OR REPLACE FUNCTION public.casino_dice_is_win(
  p_game text,
  p_choice text,
  p_face integer
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_face IS NULL OR p_face < 1 OR p_face > 6 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a die shows 1..6';
  END IF;
  IF p_game = 'dice_parity' THEN
    IF p_choice IS NULL OR p_choice NOT IN ('odd', 'even') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the parity choice must be odd or even';
    END IF;
    RETURN (p_choice = 'odd') = (p_face % 2 = 1);
  END IF;
  IF p_game = 'dice_number' THEN
    IF p_choice IS NULL OR p_choice NOT IN ('1', '2', '3', '4', '5', '6') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the number choice must be a face of the die';
    END IF;
    RETURN p_face = p_choice::integer;
  END IF;
  RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown dice game';
END;
$$;

-- The probability the member is told, counted off the mapping above.
--
-- Enumerating the byte range is what makes the rejection sampling visible in
-- the number: the denominator is the accepted bytes, not 256, so a change to
-- the accepted range moves the disclosure with it. Both games are symmetric
-- across their choices -- every face owns 42 accepted bytes -- so a nominal
-- choice stands for all of them, and the trial's per-face counts are the
-- evidence that the symmetry is real.
--
-- Floor division, as 060 uses: 1/6 is 166,666.67 ppm and the disclosure is
-- never rounded up into a better chance than the member has.
CREATE OR REPLACE FUNCTION public.casino_dice_win_probability_ppm(p_game text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_nominal text;
  v_accepted bigint;
  v_winning bigint;
BEGIN
  v_nominal := CASE p_game WHEN 'dice_parity' THEN 'odd' WHEN 'dice_number' THEN '1' END;
  IF v_nominal IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown dice game';
  END IF;

  SELECT pg_catalog.count(*),
         pg_catalog.count(*) FILTER (
           WHERE public.casino_dice_is_win(p_game, v_nominal, draw.face)
         )
  INTO v_accepted, v_winning
  FROM (
    SELECT public.casino_dice_face_for_byte(byte_value) AS face
    FROM pg_catalog.generate_series(0, 255) AS byte_value
  ) AS draw
  WHERE draw.face IS NOT NULL;

  RETURN (v_winning * 1000000 / v_accepted)::integer;
END;
$$;

-- ---------------------------------------------------------------------------
-- Pricing, per game
-- ---------------------------------------------------------------------------

-- 099 made the coin's payout policy rather than a constant, on the singleton
-- `casino_policy` row, with a CHECK that reads `> 1,000,000 AND < 2,000,000`.
-- That bound is a 50% game's bound: 5.7x on a 1-in-6 game violates it while
-- being the same 95% return. A per-game price cannot live on a singleton row
-- once there is more than one game, so it lives here.
--
-- The coin's price stays where 099 put it. Moving it would rewrite a settled
-- path for no gain, and `casino-payout.db.test.ts` pins the constraint that
-- would go with it.
CREATE TABLE IF NOT EXISTS public.casino_game_payouts (
  game text PRIMARY KEY CHECK (game IN ('dice_parity', 'dice_number')),
  payout_multiplier_ppm integer NOT NULL CHECK (payout_multiplier_ppm > 1000000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL PRIVILEGES ON TABLE public.casino_game_payouts FROM PUBLIC, moneyverse_app;

-- The sink property, checked against the game's own odds rather than against a
-- constant range.
--
-- A CHECK cannot express it: the bound depends on the disclosed probability,
-- which is derived from the byte mapping. A trigger can ask for it. 23514 is
-- the SQLSTATE a CHECK would have raised, so the refusal reads the same way
-- 099's does to everything above.
--
-- The second condition is a rounding floor. `casino_net_win` floors to whole
-- WLD, and a multiplier close enough to 1.0 makes a winning minimum stake pay
-- zero -- which reaches `economy_post_transaction` as a posting of nothing and
-- fails as an unbalanced transaction, after the member has been told they won.
-- The same count, before it is rounded into a disclosure.
--
-- `casino_dice_win_probability_ppm` floors, deliberately: a member is never
-- told a better chance than they have. But a floor is the wrong tool for
-- deciding whether a price leaves the house an edge. 1/6 floors to 166,666
-- ppm, and 166,666 x 6.0 is 999,996 -- under 1,000,000 by four parts in a
-- million, so a payout that returns exactly everything reads as a sink and is
-- accepted. The guard needs the fraction, not its rounding.
CREATE OR REPLACE FUNCTION public.casino_dice_win_odds(p_game text)
RETURNS TABLE(winning_bytes bigint, accepted_bytes bigint)
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_nominal text;
BEGIN
  v_nominal := CASE p_game WHEN 'dice_parity' THEN 'odd' WHEN 'dice_number' THEN '1' END;
  IF v_nominal IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown dice game';
  END IF;

  RETURN QUERY
  SELECT pg_catalog.count(*) FILTER (
           WHERE public.casino_dice_is_win(p_game, v_nominal, draw.face)
         ),
         pg_catalog.count(*)
  FROM (
    SELECT public.casino_dice_face_for_byte(byte_value) AS face
    FROM pg_catalog.generate_series(0, 255) AS byte_value
  ) AS draw
  WHERE draw.face IS NOT NULL;
END;
$$;

ALTER FUNCTION public.casino_dice_win_odds(text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_dice_win_odds(text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_dice_win_odds(text) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.casino_reject_payout_that_is_not_a_sink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_winning bigint;
  v_accepted bigint;
  v_min_stake bigint;
BEGIN
  SELECT odds.winning_bytes, odds.accepted_bytes INTO v_winning, v_accepted
  FROM public.casino_dice_win_odds(NEW.game) AS odds;
  -- Cross-multiplied rather than divided, so nothing rounds on the way to the
  -- comparison: winning/accepted x multiplier/1e6 >= 1 is exactly
  -- winning x multiplier >= accepted x 1e6.
  IF v_winning * NEW.payout_multiplier_ppm::bigint >= v_accepted * 1000000 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'this payout returns everything the game takes, or more',
      HINT = 'the casino is a burn account: probability x payout must stay under 1.0';
  END IF;

  SELECT policy_row.min_stake INTO v_min_stake
  FROM public.casino_policy AS policy_row
  WHERE policy_row.singleton;
  IF v_min_stake IS NOT NULL AND public.casino_net_win(v_min_stake, NEW.payout_multiplier_ppm) < 1 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'a winning minimum stake would pay nothing after rounding';
  END IF;

  RETURN NEW;
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.casino_game_payouts'::pg_catalog.regclass
      AND trigger_row.tgname = 'casino_game_payouts_stay_a_sink'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER casino_game_payouts_stay_a_sink
      BEFORE INSERT OR UPDATE ON public.casino_game_payouts
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_reject_payout_that_is_not_a_sink();
  END IF;
END;
$do$;

-- Seeded after the trigger exists, so the proposal's own numbers are the first
-- thing it checks. 500000 x 1.9 = 950,000 ppm returned; 166666 x 5.7 =
-- 949,996. Both leave about five percent of every stake in the sink.
INSERT INTO public.casino_game_payouts (game, payout_multiplier_ppm)
VALUES ('dice_parity', 1900000), ('dice_number', 5700000)
ON CONFLICT (game) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Where a dice play lands
-- ---------------------------------------------------------------------------

-- One table for both games rather than one each. The daily caps, the
-- self-limit and the debt block all treat a play as a play, and splitting the
-- rows would mean three copies of every aggregate and three places to attach
-- every trigger.
--
-- `user_id`, `play_date`, `stake_amount` and `net_amount` are named for the
-- triggers: those are the four NEW references 080's self-limit reads and the
-- one 096's debt block reads, so both attach here unchanged.
CREATE TABLE IF NOT EXISTS public.virtual_casino_dice_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  play_date date NOT NULL,
  game text NOT NULL CHECK (game IN ('dice_parity', 'dice_number')),
  choice text NOT NULL,
  outcome integer NOT NULL CHECK (outcome BETWEEN 1 AND 6),
  stake_amount bigint NOT NULL CHECK (stake_amount > 0),
  net_amount bigint NOT NULL,
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- The choice only means anything beside its game, so the two are checked
  -- together. 060 keeps the stake range out of the CHECK on purpose and this
  -- follows it: policy owns the amounts, the schema owns the vocabulary.
  CONSTRAINT virtual_casino_dice_plays_choice_matches_game CHECK (
    (game = 'dice_parity' AND choice IN ('odd', 'even'))
    OR (game = 'dice_number' AND choice IN ('1', '2', '3', '4', '5', '6'))
  )
);

REVOKE ALL PRIVILEGES ON TABLE public.virtual_casino_dice_plays FROM PUBLIC, moneyverse_app;

CREATE INDEX IF NOT EXISTS virtual_casino_dice_plays_user_day_idx
  ON public.virtual_casino_dice_plays (user_id, play_date);

-- ---------------------------------------------------------------------------
-- One member, one day, every game
-- ---------------------------------------------------------------------------

-- What this member has staked and lost today, across the whole casino.
--
-- This is the fix for the hole the second game opens. 060 wrote the same two
-- aggregates in three places against one table; three games and one table each
-- would be nine, and the first one somebody forgot would hand a member another
-- full day's allowance. There is one definition now and every caller reads it.
--
-- Both branches filter before the union so each uses its own (user_id,
-- play_date) index rather than scanning a table that grows with every play
-- anybody makes.
--
-- Not granted to the application. It is called by functions that are already
-- the authority on the caller, and it takes an actor it does not check.
CREATE OR REPLACE FUNCTION public.casino_daily_usage(p_actor uuid, p_date date)
RETURNS TABLE(staked bigint, lost bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT coalesce(sum(play.stake_amount), 0)::bigint,
         coalesce(-sum(least(play.net_amount, 0)), 0)::bigint
  FROM (
    SELECT coin.stake_amount, coin.net_amount
    FROM public.virtual_casino_coin_plays AS coin
    WHERE coin.user_id = p_actor AND coin.play_date = p_date
    UNION ALL
    SELECT dice.stake_amount, dice.net_amount
    FROM public.virtual_casino_dice_plays AS dice
    WHERE dice.user_id = p_actor AND dice.play_date = p_date
  ) AS play
$$;

-- The most this member can still lose today, in one place.
--
-- 060 defines it and 099 restates it: the lesser of the two remaining
-- allowances, because a member may stake no more than the stake headroom and
-- every WLD of it can lose. It is not the maximum stake, which is a different
-- and smaller disclosure, and it is not per game now that the allowances are
-- not. Three read models and two settlements report this number; they report
-- it from here.
CREATE OR REPLACE FUNCTION public.casino_worst_case_loss(p_actor uuid, p_date date)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT least(greatest(policy_row.daily_stake_limit - usage.staked, 0),
               greatest(policy_row.daily_loss_limit - usage.lost, 0))
  FROM public.casino_policy AS policy_row,
       public.casino_daily_usage(p_actor, p_date) AS usage
  WHERE policy_row.singleton
$$;

-- ---------------------------------------------------------------------------
-- The coin, counting the dice
-- ---------------------------------------------------------------------------

-- 099's terms, with the two usage figures spanning every game.
--
-- The column list is unchanged, so this replaces in place. What changes is
-- what `daily_stake_used` means: it was this member's coin plays and it is now
-- this member's plays. A screen that showed 3,000 of headroom after a member
-- had spent 3,000 on dice was offering a stake the game would refuse.
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
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid coin game terms request';
  END IF;

  SELECT policy_row.min_stake, policy_row.max_stake, policy_row.daily_stake_limit,
         policy_row.daily_loss_limit, policy_row.payout_multiplier_ppm
  INTO min_stake, max_stake, daily_stake_limit, daily_loss_limit, v_multiplier
  FROM public.casino_policy AS policy_row
  WHERE policy_row.singleton;

  IF min_stake IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;

  SELECT usage.staked, usage.lost INTO v_staked, v_lost
  FROM public.casino_daily_usage(p_actor, v_date) AS usage;

  enabled := public.feature_switch_state('casino') = 'enabled';
  daily_stake_used := v_staked;
  daily_loss_used := v_lost;
  remaining_stake := greatest(daily_stake_limit - v_staked, 0);
  remaining_loss := greatest(daily_loss_limit - v_lost, 0);
  win_probability_ppm := v_win_ppm;
  payout_multiplier_ppm := v_multiplier;
  house_edge_ppm := (1000000 - (v_win_ppm::bigint * v_multiplier::bigint / 1000000))::integer;
  worst_case_loss := public.casino_worst_case_loss(p_actor, v_date);
  net_win_at_max := public.casino_net_win(max_stake, v_multiplier);
  RETURN NEXT;
END;
$$;

-- 099's settlement, with four changes and no change to its shape.
--
--   1. The two daily caps read `casino_daily_usage`, so dice count here.
--   2. The day's advisory lock loses the game from its key. Two members are
--      still serialised separately; one member's coin play and dice play now
--      serialise against each other, which is what a shared cap requires.
--   3. The switch is consulted after the replay lookup again, as 060 wrote it
--      and as `casino.controller.ts` documents: closing the casino must not
--      turn a member's in-flight retry into an error, because that play's
--      money has already moved and the retry only wants the receipt for it.
--      099 moved the check above the lookup and broke that.
--   4. `worst_case_loss` reports what 060 named it -- the most this member can
--      still lose today -- instead of the stake that was just placed. The two
--      disclosure functions have always meant the first thing and the two
--      settlements have always returned the second.
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
                        public.casino_coin_win_probability_ppm(), v_multiplier,
                        public.casino_worst_case_loss(p_actor, v_date);
    RETURN;
  END IF;

  IF public.feature_switch_state('casino') <> 'enabled' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'the coin game is closed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:casino-day:' || p_actor::text, 0)
  );

  SELECT usage.staked, usage.lost INTO v_staked_today, v_lost_today
  FROM public.casino_daily_usage(p_actor, v_date) AS usage;

  IF v_staked_today + p_stake > v_daily_stake THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily stake limit reached';
  END IF;
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

  v_outcome := public.casino_coin_outcome_for_byte(
    pg_catalog.get_byte(public.gen_random_bytes(1), 0)
  );
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

  SELECT public.economy_post_transaction(
    p_key, 'VIRTUAL_COIN_GAME', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', pg_catalog.abs(v_net),
                         'direction', CASE WHEN v_net > 0 THEN 'debit' ELSE 'credit' END),
      pg_catalog.jsonb_build_object('accountId', v_counterparty, 'amount', pg_catalog.abs(v_net),
                         'direction', CASE WHEN v_net > 0 THEN 'credit' ELSE 'debit' END)
    ),
    'casino.coin.played',
    pg_catalog.jsonb_build_object(
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
                      v_win_ppm, v_multiplier,
                      public.casino_worst_case_loss(p_actor, v_date);
END;
$$;

-- ---------------------------------------------------------------------------
-- The self-limit, across every game
-- ---------------------------------------------------------------------------

-- 080's trigger, aggregating the whole casino.
--
-- The NEW references are untouched, which is what lets the same function stay
-- attached to the coin table and reach the dice table as well. Only the
-- aggregate moves: a member who set themselves a 500 WLD day and spent it on
-- the coin was still allowed 500 more on dice, and the control that a member
-- reaches for is the one that must not have that hole.
CREATE OR REPLACE FUNCTION public.casino_enforce_self_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_bet_limit bigint;
  v_loss_limit bigint;
  v_locked timestamptz;
  v_staked bigint;
  v_lost bigint;
BEGIN
  SELECT limit_row.daily_bet_limit, limit_row.daily_loss_limit, limit_row.locked_until
  INTO v_bet_limit, v_loss_limit, v_locked
  FROM public.casino_self_limits AS limit_row
  WHERE limit_row.user_id = NEW.user_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF v_locked IS NOT NULL AND v_locked > pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'you have locked yourself out of the casino';
  END IF;

  SELECT usage.staked, usage.lost INTO v_staked, v_lost
  FROM public.casino_daily_usage(NEW.user_id, NEW.play_date) AS usage;

  IF v_staked + NEW.stake_amount > v_bet_limit THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'your own daily stake limit is reached';
  END IF;

  IF v_lost + greatest(-NEW.net_amount, 0) > v_loss_limit THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'your own daily loss limit is reached';
  END IF;

  RETURN NEW;
END;
$$;

-- Both of the casino's protective triggers, on the table the dice land in.
-- Without these a member who has locked themselves out can still roll, and a
-- member with an unpaid loan can still gamble -- 14.4's 대출 잔액이 있으면
-- 카지노 이용 제한 would hold for one game out of three.
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.virtual_casino_dice_plays'::pg_catalog.regclass
      AND trigger_row.tgname = 'virtual_casino_dice_plays_self_limit'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER virtual_casino_dice_plays_self_limit
      BEFORE INSERT ON public.virtual_casino_dice_plays
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_enforce_self_limit();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.virtual_casino_dice_plays'::pg_catalog.regclass
      AND trigger_row.tgname = 'virtual_casino_dice_plays_debt_block'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER virtual_casino_dice_plays_debt_block
      BEFORE INSERT ON public.virtual_casino_dice_plays
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_refuse_while_in_debt();
  END IF;
END;
$do$;

-- ---------------------------------------------------------------------------
-- Distribution trials, per game (spec 14.3)
-- ---------------------------------------------------------------------------

-- Append-only, for the reason 060 gives: a trial you can edit afterwards
-- proves nothing, and this one stands between a biased die and production.
--
-- `face_counts` is the column the coin's trial has no equivalent of, and it is
-- the one that matters here. The sum constraint keeps the recorded evidence
-- internally consistent -- six counts that do not add up to the trial size are
-- not a record of anything.
CREATE TABLE IF NOT EXISTS public.casino_dice_distribution_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  game text NOT NULL CHECK (game IN ('dice_parity', 'dice_number')),
  requested_draws bigint NOT NULL CHECK (requested_draws > 0),
  trials bigint NOT NULL CHECK (trials > 0),
  wins bigint NOT NULL CHECK (wins >= 0),
  face_counts bigint[] NOT NULL CHECK (pg_catalog.array_length(face_counts, 1) = 6),
  rejected_bytes bigint NOT NULL CHECK (rejected_bytes >= 0),
  expected_win_probability_ppm integer NOT NULL
    CHECK (expected_win_probability_ppm BETWEEN 0 AND 1000000),
  observed_win_probability_ppm integer NOT NULL
    CHECK (observed_win_probability_ppm BETWEEN 0 AND 1000000),
  z_score numeric(12, 6) NOT NULL,
  chi_square numeric(14, 6) NOT NULL CHECK (chi_square >= 0),
  tolerance_sigma numeric(6, 3) NOT NULL CHECK (tolerance_sigma > 0),
  tolerance_chi_square numeric(8, 3) NOT NULL CHECK (tolerance_chi_square > 0),
  passed boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT casino_dice_distribution_trials_wins_within_trials CHECK (wins <= trials),
  CONSTRAINT casino_dice_distribution_trials_used_at_least_requested
    CHECK (trials >= requested_draws),
  CONSTRAINT casino_dice_distribution_trials_faces_sum_to_trials CHECK (
    face_counts[1] + face_counts[2] + face_counts[3]
    + face_counts[4] + face_counts[5] + face_counts[6] = trials
  )
);

REVOKE ALL PRIVILEGES ON TABLE public.casino_dice_distribution_trials
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.casino_reject_dice_trial_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'casino dice distribution trials are append-only';
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.casino_dice_distribution_trials'::pg_catalog.regclass
      AND trigger_row.tgname = 'casino_dice_distribution_trials_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER casino_dice_distribution_trials_immutable
      BEFORE UPDATE OR DELETE ON public.casino_dice_distribution_trials
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_reject_dice_trial_mutation();
  END IF;
END;
$do$;

-- Rolls the die a million times through the game's own mapping and records
-- what came up, face by face.
--
-- The statistics are two, and the second is the one 060 could do without.
-- The z-score asks whether the winning share matches the disclosure; the
-- chi-square asks whether the six faces are equally likely, which is the claim
-- rejection sampling exists to make good on and the one a win-share test
-- cannot see -- `byte % 6` leaves 주사위 홀짝 exactly fair and 주사위 숫자
-- 맞히기 only 3.5 sigma out at this size, both of which pass a five-sigma
-- z-test. That same mapping scores about 122 here against a critical value of
-- 40, which an honest die exceeds about once in seven million trials.
--
-- Enough bytes are drawn to cover the requested rolls with six percent to
-- spare against a 1.5625% rejection rate, and every accepted roll counts: the
-- recorded `trials` is what was actually rolled, which is why the idempotency
-- comparison is against `requested_draws` instead.
--
-- moneyverse_app holds EXECUTE for the reason 060 states about the coin's
-- trial: CI is the only place this SQL ever runs, and a trial the tests cannot
-- run is a trial nobody runs.
CREATE OR REPLACE FUNCTION public.casino_run_dice_distribution_trial(
  p_key uuid,
  p_game text,
  p_trials bigint
)
RETURNS TABLE(
  trial_id uuid,
  game text,
  trials bigint,
  wins bigint,
  face_counts bigint[],
  rejected_bytes bigint,
  expected_win_probability_ppm integer,
  observed_win_probability_ppm integer,
  z_score numeric,
  chi_square numeric,
  tolerance_sigma numeric,
  tolerance_chi_square numeric,
  passed boolean,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  c_block_bytes constant integer := 1024;
  c_tolerance_sigma constant numeric := 5.0;
  -- Chi-square, five degrees of freedom. p is about 1.5 x 10^-7.
  c_tolerance_chi_square constant numeric := 40.0;
  c_byte_headroom_percent constant integer := 106;
  v_existing public.casino_dice_distribution_trials%ROWTYPE;
  v_lookup integer[];
  v_nominal text;
  v_expected_ppm integer;
  v_probability numeric;
  v_bytes bigint;
  v_full_blocks integer;
  v_remainder integer;
  v_drawn bigint;
  v_accepted bigint;
  v_wins bigint;
  v_counts bigint[];
  v_expected_face numeric;
  v_chi numeric;
  v_variance numeric;
  v_z numeric;
  v_passed boolean;
  v_trial uuid;
BEGIN
  IF p_key IS NULL OR p_trials IS NULL OR p_trials < 1000 OR p_trials > 2000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'trial size must be 1000..2000000';
  END IF;
  v_nominal := CASE p_game WHEN 'dice_parity' THEN 'odd' WHEN 'dice_number' THEN '1' END;
  IF v_nominal IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown dice game';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:casino_run_dice_distribution_trial:' || p_key::text, 0)
  );

  SELECT * INTO v_existing
  FROM public.casino_dice_distribution_trials AS trial
  WHERE trial.idempotency_key = p_key;
  IF FOUND THEN
    -- No owner check, as 060 explains: a trial belongs to nobody, takes no
    -- actor and returns a public fact about the die.
    IF v_existing.game IS DISTINCT FROM p_game OR v_existing.requested_draws <> p_trials THEN
      RAISE EXCEPTION USING
        ERRCODE = '23505',
        MESSAGE = 'idempotency key conflicts with another distribution trial';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.game, v_existing.trials, v_existing.wins,
                        v_existing.face_counts, v_existing.rejected_bytes,
                        v_existing.expected_win_probability_ppm,
                        v_existing.observed_win_probability_ppm,
                        v_existing.z_score::numeric, v_existing.chi_square::numeric,
                        v_existing.tolerance_sigma::numeric,
                        v_existing.tolerance_chi_square::numeric,
                        v_existing.passed, true;
    RETURN;
  END IF;

  -- The mapping enumerated once into a 256-entry lookup rather than called a
  -- million times. It is still the game's own mapping deciding every draw --
  -- a trial against a reimplementation would only prove the reimplementation.
  SELECT pg_catalog.array_agg(public.casino_dice_face_for_byte(byte_value) ORDER BY byte_value)
  INTO v_lookup
  FROM pg_catalog.generate_series(0, 255) AS byte_value;

  v_expected_ppm := public.casino_dice_win_probability_ppm(p_game);
  v_probability := v_expected_ppm::numeric / 1000000;

  v_bytes := p_trials * c_byte_headroom_percent / 100 + c_block_bytes;
  v_full_blocks := (v_bytes / c_block_bytes)::integer;
  v_remainder := (v_bytes % c_block_bytes)::integer;

  -- OFFSET 0 is a fence, not a no-op: gen_random_bytes is volatile and a
  -- flattened subquery would regenerate the block once per drawn byte.
  SELECT pg_catalog.count(*),
         pg_catalog.count(*) FILTER (WHERE draw.face IS NOT NULL),
         pg_catalog.count(*) FILTER (
           WHERE draw.face IS NOT NULL
             AND public.casino_dice_is_win(p_game, v_nominal, draw.face)
         ),
         ARRAY[
           pg_catalog.count(*) FILTER (WHERE draw.face = 1),
           pg_catalog.count(*) FILTER (WHERE draw.face = 2),
           pg_catalog.count(*) FILTER (WHERE draw.face = 3),
           pg_catalog.count(*) FILTER (WHERE draw.face = 4),
           pg_catalog.count(*) FILTER (WHERE draw.face = 5),
           pg_catalog.count(*) FILTER (WHERE draw.face = 6)
         ]
  INTO v_drawn, v_accepted, v_wins, v_counts
  FROM (
    SELECT v_lookup[pg_catalog.get_byte(block.bytes, byte_index) + 1] AS face
    FROM (
      SELECT public.gen_random_bytes(c_block_bytes) AS bytes, c_block_bytes AS byte_count
      FROM pg_catalog.generate_series(1, v_full_blocks)
      UNION ALL
      SELECT public.gen_random_bytes(v_remainder), v_remainder
      WHERE v_remainder > 0
      OFFSET 0
    ) AS block,
    LATERAL pg_catalog.generate_series(0, block.byte_count - 1) AS byte_index
  ) AS draw;

  IF v_accepted < p_trials THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'the trial drew fewer accepted rolls than were asked for';
  END IF;

  v_expected_face := v_accepted::numeric / 6;
  SELECT sum(
           (v_counts[face] - v_expected_face) * (v_counts[face] - v_expected_face)
           / v_expected_face
         )
  INTO v_chi
  FROM pg_catalog.generate_series(1, 6) AS face;

  v_variance := v_accepted::numeric * v_probability * (1 - v_probability);
  IF v_variance > 0 THEN
    v_z := (v_wins::numeric - v_accepted::numeric * v_probability)
           / pg_catalog.sqrt(v_variance);
  ELSE
    v_z := CASE WHEN v_wins::numeric = v_accepted::numeric * v_probability THEN 0 ELSE 999999 END;
  END IF;

  -- Both, and both directions of failure matter: a die that is uniform across
  -- its faces can still be paired with a wrong disclosure, and a disclosure
  -- that matches the win share can still sit on a die that is not uniform.
  v_passed := pg_catalog.abs(v_z) <= c_tolerance_sigma AND v_chi <= c_tolerance_chi_square;

  INSERT INTO public.casino_dice_distribution_trials (
    idempotency_key, game, requested_draws, trials, wins, face_counts, rejected_bytes,
    expected_win_probability_ppm, observed_win_probability_ppm,
    z_score, chi_square, tolerance_sigma, tolerance_chi_square, passed
  )
  VALUES (
    p_key, p_game, p_trials, v_accepted, v_wins, v_counts, v_drawn - v_accepted,
    v_expected_ppm,
    pg_catalog.round(v_wins::numeric * 1000000 / v_accepted::numeric)::integer,
    v_z, v_chi, c_tolerance_sigma, c_tolerance_chi_square, v_passed
  )
  RETURNING id INTO v_trial;

  RETURN QUERY
  SELECT trial.id, trial.game, trial.trials, trial.wins, trial.face_counts,
         trial.rejected_bytes, trial.expected_win_probability_ppm,
         trial.observed_win_probability_ppm, trial.z_score::numeric,
         trial.chi_square::numeric, trial.tolerance_sigma::numeric,
         trial.tolerance_chi_square::numeric, trial.passed, false
  FROM public.casino_dice_distribution_trials AS trial
  WHERE trial.id = v_trial;
END;
$$;

-- The row the activation gate looks for, per game. "Qualifying" is the spec's
-- bar rather than the trial's: a passing thousand-roll trial is a smoke test.
CREATE OR REPLACE FUNCTION public.casino_latest_qualifying_dice_trial(p_game text)
RETURNS TABLE(
  trial_id uuid,
  trials bigint,
  wins bigint,
  expected_win_probability_ppm integer,
  observed_win_probability_ppm integer,
  z_score numeric,
  chi_square numeric,
  tolerance_chi_square numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT trial.id, trial.trials, trial.wins, trial.expected_win_probability_ppm,
         trial.observed_win_probability_ppm, trial.z_score::numeric,
         trial.chi_square::numeric, trial.tolerance_chi_square::numeric, trial.created_at
  FROM public.casino_dice_distribution_trials AS trial
  WHERE trial.game = p_game AND trial.passed AND trial.trials >= 1000000
  ORDER BY trial.created_at DESC, trial.id DESC
  LIMIT 1;
END;
$$;

-- Both games' disclosed odds and the evidence behind each, on one row per
-- game whether or not a trial qualifies. The LATERAL is what keeps the
-- probability on the row when no trial does -- the state every deployment is
-- in until the casino first opens -- rather than answering with nothing.
CREATE OR REPLACE FUNCTION public.casino_dice_fairness()
RETURNS TABLE(
  game text,
  win_probability_ppm integer,
  trial_id uuid,
  trials bigint,
  wins bigint,
  expected_win_probability_ppm integer,
  observed_win_probability_ppm integer,
  z_score numeric,
  chi_square numeric,
  tolerance_chi_square numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT payout_row.game,
         public.casino_dice_win_probability_ppm(payout_row.game),
         trial.trial_id, trial.trials, trial.wins,
         trial.expected_win_probability_ppm, trial.observed_win_probability_ppm,
         trial.z_score, trial.chi_square, trial.tolerance_chi_square, trial.created_at
  FROM public.casino_game_payouts AS payout_row
  LEFT JOIN LATERAL public.casino_latest_qualifying_dice_trial(payout_row.game) AS trial ON true
  ORDER BY CASE payout_row.game WHEN 'dice_parity' THEN 1 ELSE 2 END;
END;
$$;

-- ---------------------------------------------------------------------------
-- The activation gate, once per game (spec 18.6, 14.3)
-- ---------------------------------------------------------------------------

-- 060's gate asked for a coin trial, and with two more games that is weaker
-- than it was: it would let the casino open on evidence about a game that is
-- not the one a member plays. Each game answers for itself now.
--
-- The loop is driven off `casino_game_payouts` rather than a list written
-- here, so a fourth game is gated by the act of pricing it. The coin is asked
-- for separately because its price lives on `casino_policy`, not in that
-- table.
--
-- Everything else 060 decided stands: the trigger is scoped by its WHEN clause
-- to the casino row and to a state that is not 'disabled', so closing the
-- casino is never refused.
CREATE OR REPLACE FUNCTION public.casino_reject_activation_without_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_game text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.casino_latest_qualifying_distribution_trial()) THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'casino cannot leave disabled without a passing 1,000,000-play distribution trial for the coin',
      HINT = 'record one with public.casino_run_coin_distribution_trial on the test server first';
  END IF;

  FOR v_game IN
    SELECT payout_row.game FROM public.casino_game_payouts AS payout_row ORDER BY payout_row.game
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.casino_latest_qualifying_dice_trial(v_game)) THEN
      RAISE EXCEPTION USING
        ERRCODE = '55000',
        MESSAGE = pg_catalog.format(
          'casino cannot leave disabled without a passing 1,000,000-play distribution trial for %s',
          v_game
        ),
        HINT = 'record one with public.casino_run_dice_distribution_trial on the test server first';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Disclosure, for every game at once (spec 14.3)
-- ---------------------------------------------------------------------------

-- One row per game, carrying the three things 14.3 requires on the member's
-- screen: the probability, the payout, and the maximum they can lose.
--
-- A picker cannot ask three functions and stay consistent, and three reads of
-- three usage figures could disagree with each other by the time they are
-- rendered side by side. This is one read of one day.
--
-- `worst_case_loss` is the same number on every row, which is not a defect but
-- the point: the allowances are the member's, not the game's, and a screen
-- that showed a fresh maximum loss beside each game would be describing a
-- casino that does not exist.
--
-- `casino_coin_terms` survives alongside this because 099 shipped it and the
-- repository's tests pin its shape. The two cannot drift: every figure both
-- report comes from the same policy row, the same probability functions and
-- the same `casino_daily_usage`.
CREATE OR REPLACE FUNCTION public.casino_game_terms(p_actor uuid)
RETURNS TABLE(
  game text,
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
  v_min bigint; v_max bigint; v_daily_stake bigint; v_daily_loss bigint;
  v_coin_multiplier integer;
  v_staked bigint; v_lost bigint;
  v_enabled boolean;
  v_worst bigint;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid casino terms request';
  END IF;

  SELECT policy_row.min_stake, policy_row.max_stake, policy_row.daily_stake_limit,
         policy_row.daily_loss_limit, policy_row.payout_multiplier_ppm
  INTO v_min, v_max, v_daily_stake, v_daily_loss, v_coin_multiplier
  FROM public.casino_policy AS policy_row
  WHERE policy_row.singleton;
  IF v_min IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;

  SELECT usage.staked, usage.lost INTO v_staked, v_lost
  FROM public.casino_daily_usage(p_actor, v_date) AS usage;

  v_enabled := public.feature_switch_state('casino') = 'enabled';
  v_worst := public.casino_worst_case_loss(p_actor, v_date);

  RETURN QUERY
  SELECT catalogue.game,
         v_enabled,
         v_min, v_max, v_daily_stake, v_daily_loss,
         v_staked, v_lost,
         greatest(v_daily_stake - v_staked, 0),
         greatest(v_daily_loss - v_lost, 0),
         catalogue.win_ppm,
         catalogue.multiplier_ppm,
         (1000000 - (catalogue.win_ppm::bigint * catalogue.multiplier_ppm::bigint / 1000000))::integer,
         v_worst,
         public.casino_net_win(v_max, catalogue.multiplier_ppm)
  FROM (
    SELECT 'coin'::text AS game,
           public.casino_coin_win_probability_ppm() AS win_ppm,
           v_coin_multiplier AS multiplier_ppm
    UNION ALL
    SELECT payout_row.game,
           public.casino_dice_win_probability_ppm(payout_row.game),
           payout_row.payout_multiplier_ppm
    FROM public.casino_game_payouts AS payout_row
  ) AS catalogue
  ORDER BY CASE catalogue.game WHEN 'coin' THEN 1 WHEN 'dice_parity' THEN 2 ELSE 3 END;
END;
$$;

-- ---------------------------------------------------------------------------
-- The games
-- ---------------------------------------------------------------------------

-- One roll, settled the way 099 settles a toss.
--
-- The browser sends a game, a choice and a stake. It cannot reach the face,
-- the odds or the payout, and there is no parameter here through which it
-- could -- the roll happens after the caps have been checked and after the
-- wallet is locked, and the price comes from a table the application cannot
-- write.
CREATE OR REPLACE FUNCTION public.casino_play_dice(
  p_key uuid,
  p_actor uuid,
  p_game text,
  p_choice text,
  p_stake bigint
)
RETURNS TABLE(
  play_id uuid,
  outcome_face integer,
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
  v_existing public.virtual_casino_dice_plays%ROWTYPE;
  v_min bigint; v_max bigint; v_daily_stake bigint; v_daily_loss bigint;
  v_multiplier integer;
  v_staked_today bigint; v_lost_today bigint;
  v_cash uuid; v_counterparty uuid;
  v_face integer; v_net bigint; v_tx uuid; v_play uuid;
  v_win_ppm integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid dice game request';
  END IF;
  -- Validates the game and the choice together, against the one function that
  -- decides what a winning roll is. A face is passed only because the
  -- signature needs one; nothing here depends on which.
  PERFORM public.casino_dice_is_win(p_game, p_choice, 1);

  SELECT policy_row.min_stake, policy_row.max_stake, policy_row.daily_stake_limit,
         policy_row.daily_loss_limit
  INTO v_min, v_max, v_daily_stake, v_daily_loss
  FROM public.casino_policy AS policy_row
  WHERE policy_row.singleton
  FOR SHARE;
  IF v_min IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino policy is not configured';
  END IF;

  SELECT payout_row.payout_multiplier_ppm INTO v_multiplier
  FROM public.casino_game_payouts AS payout_row
  WHERE payout_row.game = p_game
  FOR SHARE;
  IF v_multiplier IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'this dice game has no price';
  END IF;

  IF p_stake IS NULL OR p_stake < v_min OR p_stake > v_max THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stake is outside the permitted range';
  END IF;

  v_win_ppm := public.casino_dice_win_probability_ppm(p_game);

  -- 045's order: lock the key before looking for its receipt, so two identical
  -- submissions cannot both find nothing and both play.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:casino-dice:' || p_key::text, 0)
  );

  SELECT * INTO v_existing
  FROM public.virtual_casino_dice_plays AS play_row
  WHERE play_row.idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'dice game receipt belongs to another user';
    END IF;
    IF v_existing.game IS DISTINCT FROM p_game
      OR v_existing.choice IS DISTINCT FROM p_choice
      OR v_existing.stake_amount IS DISTINCT FROM p_stake THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this key already settled different terms';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.outcome, v_existing.net_amount,
                        v_existing.transaction_id, true, v_win_ppm, v_multiplier,
                        public.casino_worst_case_loss(p_actor, v_date);
    RETURN;
  END IF;

  -- After the replay, not before: closing the casino must not turn a member's
  -- in-flight retry into an error.
  IF public.feature_switch_state('casino') <> 'enabled' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'the dice game is closed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  -- The same key `casino_play_coin` takes. The caps span the casino, so the
  -- lock that serialises a member's day has to as well.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:casino-day:' || p_actor::text, 0)
  );

  SELECT usage.staked, usage.lost INTO v_staked_today, v_lost_today
  FROM public.casino_daily_usage(p_actor, v_date) AS usage;

  IF v_staked_today + p_stake > v_daily_stake THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily stake limit reached';
  END IF;
  -- Before the roll, on the whole stake: a loss cap checked afterwards is a
  -- cap that is only ever breached.
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

  v_face := public.casino_roll_die();
  v_net := CASE
    WHEN public.casino_dice_is_win(p_game, p_choice, v_face)
      THEN public.casino_net_win(p_stake, v_multiplier)
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

  -- The posting moves what the member gained or lost, not the stake: at 5.7x a
  -- winning 100 is owed 470, and posting the stake would move the wrong number
  -- in the wrong direction.
  SELECT public.economy_post_transaction(
    p_key, 'VIRTUAL_DICE_GAME', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', pg_catalog.abs(v_net),
                         'direction', CASE WHEN v_net > 0 THEN 'debit' ELSE 'credit' END),
      pg_catalog.jsonb_build_object('accountId', v_counterparty, 'amount', pg_catalog.abs(v_net),
                         'direction', CASE WHEN v_net > 0 THEN 'credit' ELSE 'debit' END)
    ),
    'casino.dice.played',
    -- The odds the member was shown are part of the record of the play, not a
    -- property of whatever the function computes the next time it is asked.
    pg_catalog.jsonb_build_object(
      'game', p_game, 'choice', p_choice, 'face', v_face, 'stake', p_stake, 'net', v_net,
      'winProbabilityPpm', v_win_ppm, 'payoutMultiplierPpm', v_multiplier
    )
  ) INTO v_tx;

  INSERT INTO public.virtual_casino_dice_plays (
    idempotency_key, user_id, play_date, game, choice, outcome,
    stake_amount, net_amount, transaction_id
  )
  VALUES (p_key, p_actor, v_date, p_game, p_choice, v_face, p_stake, v_net, v_tx)
  RETURNING id INTO v_play;

  RETURN QUERY SELECT v_play, v_face, v_net, v_tx, false, v_win_ppm, v_multiplier,
                      public.casino_worst_case_loss(p_actor, v_date);
END;
$$;

-- ---------------------------------------------------------------------------
-- Ownership and privileges
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.casino_dice_face_for_byte(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_roll_die() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_dice_is_win(text, text, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_dice_win_probability_ppm(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_reject_payout_that_is_not_a_sink() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_daily_usage(uuid, date) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_worst_case_loss(uuid, date) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_coin_terms(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_play_coin(uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_enforce_self_limit() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_reject_dice_trial_mutation() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_run_dice_distribution_trial(uuid, text, bigint)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_latest_qualifying_dice_trial(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_dice_fairness() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_reject_activation_without_trial() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_game_terms(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_play_dice(uuid, uuid, text, text, bigint) OWNER TO moneyverse_migrator;

-- The pure vocabulary of the die, granted for the same reason 060 grants
-- `casino_coin_outcome_for_byte`: the disclosure is checkable only if the
-- mapping it is counted from can be asked directly.
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_dice_face_for_byte(integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_dice_face_for_byte(integer) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_dice_is_win(text, text, integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_dice_is_win(text, text, integer) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_dice_win_probability_ppm(text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_dice_win_probability_ppm(text) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_run_dice_distribution_trial(uuid, text, bigint)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_run_dice_distribution_trial(uuid, text, bigint)
  TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_latest_qualifying_dice_trial(text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_latest_qualifying_dice_trial(text) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_dice_fairness() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_dice_fairness() TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_game_terms(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_game_terms(uuid) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_play_dice(uuid, uuid, text, text, bigint)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_play_dice(uuid, uuid, text, text, bigint)
  TO moneyverse_app;

-- Restated, not newly imposed: 099 granted these and replacing a function
-- keeps its privileges, so this is a statement of what they are rather than a
-- change to them.
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_coin_terms(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_coin_terms(uuid) TO moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_play_coin(uuid, uuid, text, bigint)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.casino_play_coin(uuid, uuid, text, bigint) TO moneyverse_app;

-- Never called by the application: the roller only makes sense inside a play,
-- the two aggregates take an actor they do not check, and the four trigger
-- functions are called by their triggers.
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_roll_die() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_daily_usage(uuid, date)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_worst_case_loss(uuid, date)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_payout_that_is_not_a_sink()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_dice_trial_mutation()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_enforce_self_limit()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_activation_without_trial()
  FROM PUBLIC, moneyverse_app;

-- Restated so nothing above can be read as a relaxation. Every casino table is
-- reached through a function or not at all.
REVOKE ALL PRIVILEGES ON TABLE public.virtual_casino_coin_plays FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.virtual_casino_dice_plays FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.casino_policy FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.casino_game_payouts FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.casino_coin_distribution_trials FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.casino_dice_distribution_trials FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.casino_self_limits FROM PUBLIC, moneyverse_app;

COMMIT;
