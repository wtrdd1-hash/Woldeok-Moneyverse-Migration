-- A market with a direction, a response to demand, and a volatility a
-- reader can watch.
--
-- 052's walk had one force in it: a pull back to the day's open, under a
-- ±0.3 % uniform shock every second. That is 0.17 % a second, 1.3 % a
-- minute and ten percent an hour of noise around a point that never moves,
-- which is why the one-minute candles looked like a hedge and why nothing
-- connected one day to the next. And a trade moved the price by exactly one
-- percent whatever its size, so the float 053 introduced was never a price
-- of anything. docs/superpowers/specs/2026-09-04-market-dynamics-design.md
-- is the design; this file is its shape in SQL.
--
-- Three states replace the one force. A fair value per stock carries the
-- direction -- the stock's own trend, the market's trend, and whatever
-- events are running -- and the price wanders around it with a pull back and
-- Gaussian noise sized in basis points a day rather than percent a second.
-- Trends and volatility are Ornstein-Uhlenbeck processes stepped once a
-- minute, so a morning has a mood and the mood changes over hours. A trade
-- moves the price in proportion to the share of the float it took, and a
-- third of that move is absorbed into the fair value for good: sustained
-- demand raises what the stock is worth, which is the whole of supply and
-- demand in one line.
--
-- Every coefficient is a column of one row in `virtual_stock_market_params`,
-- so the market can be retuned without a migration. The exact price is kept
-- as a numeric beside the bigint the rest of the schema reads, because a
-- 1,000 WLD stock moving 0.01 % a second moves a tenth of a WLD, and a walk
-- rounded to integers every step is a walk that stands still.
--
-- Events are the seam for news. An operator publishes one -- a headline, a
-- direction, a strength and a duration, for one stock or the whole market --
-- and from that second the fair value leans that way and the noise widens.
-- A scenario an AI proposes and an operator picks would enter here, marked
-- `source = 'ai'`, and nowhere else.

BEGIN;

-- ---------------------------------------------------------------------------
-- The coefficients, in one row
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.virtual_stock_market_params (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- Volatility: where a stock's daily sigma returns to, and its range.
  base_vol_bps numeric NOT NULL DEFAULT 300 CHECK (base_vol_bps BETWEEN 10 AND 5000),
  vol_floor_bps numeric NOT NULL DEFAULT 100 CHECK (vol_floor_bps BETWEEN 1 AND 5000),
  vol_ceiling_bps numeric NOT NULL DEFAULT 1000 CHECK (vol_ceiling_bps BETWEEN 10 AND 10000),
  vol_reversion_per_minute numeric NOT NULL DEFAULT 0.02 CHECK (vol_reversion_per_minute BETWEEN 0 AND 1),
  vol_noise_per_minute numeric NOT NULL DEFAULT 0.08 CHECK (vol_noise_per_minute BETWEEN 0 AND 1),
  -- A stock's own direction, in basis points a day.
  trend_reversion_per_minute numeric NOT NULL DEFAULT 0.003 CHECK (trend_reversion_per_minute BETWEEN 0 AND 1),
  trend_noise_bps_per_minute numeric NOT NULL DEFAULT 15 CHECK (trend_noise_bps_per_minute BETWEEN 0 AND 1000),
  trend_cap_bps numeric NOT NULL DEFAULT 400 CHECK (trend_cap_bps BETWEEN 0 AND 5000),
  -- The market's direction, shared by every stock through its beta.
  market_trend_reversion_per_minute numeric NOT NULL DEFAULT 0.001 CHECK (market_trend_reversion_per_minute BETWEEN 0 AND 1),
  market_trend_noise_bps_per_minute numeric NOT NULL DEFAULT 5 CHECK (market_trend_noise_bps_per_minute BETWEEN 0 AND 1000),
  market_trend_cap_bps numeric NOT NULL DEFAULT 200 CHECK (market_trend_cap_bps BETWEEN 0 AND 5000),
  market_beta numeric NOT NULL DEFAULT 1.0 CHECK (market_beta BETWEEN 0 AND 5),
  -- How fast the price returns to the fair value, and how fast the fair
  -- value gives way to a price that stays away from it.
  fair_reversion_half_life_seconds integer NOT NULL DEFAULT 14400 CHECK (fair_reversion_half_life_seconds BETWEEN 60 AND 604800),
  fair_absorb_half_life_seconds integer NOT NULL DEFAULT 43200 CHECK (fair_absorb_half_life_seconds BETWEEN 60 AND 2592000),
  -- What a trade does: so many basis points per percent of the float it
  -- takes, capped, with a share of the move kept for good.
  impact_bps_per_float_percent numeric NOT NULL DEFAULT 150 CHECK (impact_bps_per_float_percent BETWEEN 0 AND 10000),
  impact_cap_bps numeric NOT NULL DEFAULT 500 CHECK (impact_cap_bps BETWEEN 0 AND 3000),
  impact_permanent_share numeric NOT NULL DEFAULT 0.3 CHECK (impact_permanent_share BETWEEN 0 AND 1),
  -- 052's band around the day's open, kept.
  day_range_cap_bps numeric NOT NULL DEFAULT 3000 CHECK (day_range_cap_bps BETWEEN 100 AND 9000),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

INSERT INTO public.virtual_stock_market_params (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON public.virtual_stock_market_params FROM PUBLIC, moneyverse_app;

-- ---------------------------------------------------------------------------
-- The state
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.virtual_stock_market_regime (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  market_trend_bps numeric NOT NULL DEFAULT 0,
  regime_minute timestamptz NOT NULL DEFAULT pg_catalog.date_trunc('minute', pg_catalog.clock_timestamp()),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

INSERT INTO public.virtual_stock_market_regime (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON public.virtual_stock_market_regime FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.virtual_stock_dynamics (
  stock_id uuid PRIMARY KEY REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  price_exact numeric NOT NULL CHECK (price_exact >= 10),
  fair_value numeric NOT NULL CHECK (fair_value >= 10),
  trend_bps numeric NOT NULL DEFAULT 0,
  vol_bps numeric NOT NULL CHECK (vol_bps > 0),
  regime_minute timestamptz NOT NULL DEFAULT pg_catalog.date_trunc('minute', pg_catalog.clock_timestamp()),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- Seeded from where each stock stands, so the first tick after this
-- migration continues the price rather than restarting it.
INSERT INTO public.virtual_stock_dynamics (stock_id, price_exact, fair_value, trend_bps, vol_bps)
SELECT stock.id, stock.current_price, stock.current_price, 0,
       (SELECT base_vol_bps FROM public.virtual_stock_market_params WHERE id = 1)
FROM public.virtual_stocks AS stock
ON CONFLICT (stock_id) DO NOTHING;

REVOKE ALL ON public.virtual_stock_dynamics FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.virtual_stock_market_events (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  -- NULL is the whole market.
  stock_id uuid REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('up', 'down')),
  strength integer NOT NULL CHECK (strength BETWEEN 1 AND 3),
  drift_bps_per_day numeric NOT NULL,
  vol_multiplier numeric NOT NULL CHECK (vol_multiplier BETWEEN 1 AND 5),
  headline text NOT NULL CHECK (pg_catalog.char_length(headline) BETWEEN 2 AND 120),
  body text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(body) <= 2000),
  source text NOT NULL DEFAULT 'operator' CHECK (source IN ('operator', 'ai', 'system')),
  starts_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  ends_at timestamptz NOT NULL,
  cancelled_at timestamptz,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS virtual_stock_market_events_live_idx
  ON public.virtual_stock_market_events (ends_at)
  WHERE cancelled_at IS NULL;

REVOKE ALL ON public.virtual_stock_market_events FROM PUBLIC, moneyverse_app;

-- ---------------------------------------------------------------------------
-- A Gaussian draw
-- ---------------------------------------------------------------------------

-- Box-Muller. The uniform is floored away from zero because ln(0) is not a
-- number and random() can, in principle, return it.
CREATE OR REPLACE FUNCTION public.stock_market_gaussian()
RETURNS numeric
LANGUAGE sql
VOLATILE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT (pg_catalog.sqrt(-2 * pg_catalog.ln(greatest(pg_catalog.random(), 1e-12)))
          * pg_catalog.cos(2 * pg_catalog.pi() * pg_catalog.random()))::numeric
$$;

ALTER FUNCTION public.stock_market_gaussian() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_market_gaussian() FROM PUBLIC, moneyverse_app;

-- Whether 117's circuit breaker or kill switch has the market stopped.
CREATE OR REPLACE FUNCTION public.stock_market_halted()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT coalesce(
    (SELECT policy.market_circuit_broken OR policy.master_killswitch_active
     FROM public.admin_economy_policy_v2 AS policy
     WHERE policy.id = 1),
    false)
$$;

ALTER FUNCTION public.stock_market_halted() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_market_halted() FROM PUBLIC, moneyverse_app;

-- ---------------------------------------------------------------------------
-- The tick
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.stock_market_live_tick()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  prm public.virtual_stock_market_params%ROWTYPE;
  dyn public.virtual_stock_dynamics%ROWTYPE;
  stock_row record;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_minute timestamptz;
  v_today date;
  v_open bigint;
  v_market numeric;
  v_regime_minute timestamptz;
  v_event_drift numeric;
  v_event_vol numeric;
  v_kappa numeric;
  v_absorb numeric;
  v_mu numeric;
  v_sigma numeric;
  v_pull numeric;
  v_exact numeric;
  v_low numeric;
  v_high numeric;
  v_price bigint;
  v_moved integer := 0;
BEGIN
  -- 052's lock, kept: a second process ticking the same second does nothing.
  IF NOT pg_catalog.pg_try_advisory_xact_lock(8574201) THEN
    RETURN 0;
  END IF;

  -- A stopped market does not move. Trades are refused for the same reason
  -- in stock_trade below.
  IF public.stock_market_halted() THEN
    RETURN 0;
  END IF;

  SELECT * INTO prm FROM public.virtual_stock_market_params WHERE id = 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'market parameters are missing';
  END IF;

  v_today := (pg_catalog.timezone('Asia/Seoul', v_now))::date;
  v_minute := pg_catalog.date_trunc('minute', v_now);

  -- Per second: how much of the way back to the fair value, and how much of
  -- the way the fair value comes to meet the price. Half-lives in the
  -- parameters, rates here.
  v_kappa := 1 - pg_catalog.power(0.5, 1.0 / prm.fair_reversion_half_life_seconds);
  v_absorb := 1 - pg_catalog.power(0.5, 1.0 / prm.fair_absorb_half_life_seconds);

  -- The market's mood, stepped once a minute.
  SELECT regime.market_trend_bps, regime.regime_minute
  INTO v_market, v_regime_minute
  FROM public.virtual_stock_market_regime AS regime
  WHERE regime.id = 1
  FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.virtual_stock_market_regime (id) VALUES (1)
    RETURNING market_trend_bps, regime_minute INTO v_market, v_regime_minute;
  END IF;
  IF v_regime_minute < v_minute THEN
    v_market := v_market * (1 - prm.market_trend_reversion_per_minute)
              + prm.market_trend_noise_bps_per_minute * public.stock_market_gaussian();
    v_market := greatest(-prm.market_trend_cap_bps, least(prm.market_trend_cap_bps, v_market));
    UPDATE public.virtual_stock_market_regime
    SET market_trend_bps = v_market, regime_minute = v_minute, updated_at = v_now
    WHERE id = 1;
  END IF;

  FOR stock_row IN
    SELECT id, current_price, day_open_price
    FROM public.virtual_stocks
    WHERE active
    ORDER BY id
    FOR UPDATE
  LOOP
    -- A new day opens where the last one closed (052).
    IF NOT EXISTS (
      SELECT 1 FROM public.virtual_stock_daily_candles
      WHERE stock_id = stock_row.id AND trade_date = v_today
    ) THEN
      UPDATE public.virtual_stocks
      SET day_open_price = stock_row.current_price
      WHERE id = stock_row.id;
      v_open := stock_row.current_price;
    ELSE
      v_open := stock_row.day_open_price;
    END IF;

    SELECT * INTO dyn
    FROM public.virtual_stock_dynamics
    WHERE stock_id = stock_row.id
    FOR UPDATE;
    IF NOT FOUND THEN
      -- A stock listed since this migration. It starts where it is.
      INSERT INTO public.virtual_stock_dynamics
        (stock_id, price_exact, fair_value, trend_bps, vol_bps, regime_minute)
      VALUES (stock_row.id, stock_row.current_price, stock_row.current_price, 0, prm.base_vol_bps, v_minute)
      RETURNING * INTO dyn;
    END IF;

    -- Something else moved the price -- an operator setting it, a split.
    -- The exact price follows, and the fair value scales with it so a price
    -- set by hand is the new fair value rather than a deviation to correct.
    IF pg_catalog.round(dyn.price_exact) <> stock_row.current_price THEN
      dyn.fair_value := greatest(10, dyn.fair_value * stock_row.current_price / dyn.price_exact);
      dyn.price_exact := stock_row.current_price;
    END IF;

    -- This stock's mood, stepped once a minute: a trend that returns to
    -- zero, and a volatility that returns to the base in log space so it
    -- cannot go negative and spends as long above the base as below it.
    IF dyn.regime_minute < v_minute THEN
      dyn.trend_bps := dyn.trend_bps * (1 - prm.trend_reversion_per_minute)
                     + prm.trend_noise_bps_per_minute * public.stock_market_gaussian();
      dyn.trend_bps := greatest(-prm.trend_cap_bps, least(prm.trend_cap_bps, dyn.trend_bps));
      dyn.vol_bps := pg_catalog.exp(
        pg_catalog.ln(dyn.vol_bps) * (1 - prm.vol_reversion_per_minute)
        + pg_catalog.ln(prm.base_vol_bps) * prm.vol_reversion_per_minute
        + prm.vol_noise_per_minute * public.stock_market_gaussian());
      dyn.vol_bps := greatest(prm.vol_floor_bps, least(prm.vol_ceiling_bps, dyn.vol_bps));
      dyn.regime_minute := v_minute;
    END IF;

    -- What is in the news: the drifts add, the widest multiplier wins.
    SELECT coalesce(sum(event.drift_bps_per_day), 0), coalesce(max(event.vol_multiplier), 1)
    INTO v_event_drift, v_event_vol
    FROM public.virtual_stock_market_events AS event
    WHERE event.cancelled_at IS NULL
      AND event.starts_at <= v_now
      AND event.ends_at > v_now
      AND (event.stock_id IS NULL OR event.stock_id = stock_row.id);

    -- Basis points a day, into a fraction a second.
    v_mu := (dyn.trend_bps + prm.market_beta * v_market + v_event_drift) / 10000.0 / 86400.0;
    v_sigma := (dyn.vol_bps / 10000.0) / pg_catalog.sqrt(86400.0) * v_event_vol;

    -- The fair value carries the direction and meets the price partway; the
    -- price is pulled toward it and shaken.
    dyn.fair_value := dyn.fair_value * (1 + v_mu);
    dyn.fair_value := dyn.fair_value + (dyn.price_exact - dyn.fair_value) * v_absorb;
    -- Bounded to a band around the price, so an event that ran for days
    -- cannot leave a fair value the price would chase for a week.
    dyn.fair_value := greatest(dyn.price_exact * 0.5, least(dyn.price_exact * 2, dyn.fair_value));

    v_pull := (dyn.fair_value / dyn.price_exact - 1) * v_kappa;
    v_exact := dyn.price_exact * (1 + v_pull + v_sigma * public.stock_market_gaussian());

    -- 052's band around the day's open, and 023's floor.
    v_low := greatest(10, v_open * (1 - prm.day_range_cap_bps / 10000.0));
    v_high := v_open * (1 + prm.day_range_cap_bps / 10000.0);
    v_exact := greatest(v_low, least(v_high, v_exact));
    v_price := pg_catalog.round(v_exact)::bigint;

    dyn.price_exact := v_exact;
    dyn.fair_value := greatest(10, dyn.fair_value);

    UPDATE public.virtual_stock_dynamics
    SET price_exact = dyn.price_exact,
        fair_value = dyn.fair_value,
        trend_bps = dyn.trend_bps,
        vol_bps = dyn.vol_bps,
        regime_minute = dyn.regime_minute,
        updated_at = v_now
    WHERE stock_id = stock_row.id;

    -- A price that did not move writes nothing (052): 034's trigger records
    -- a tick only when current_price changes.
    IF v_price <> stock_row.current_price THEN
      UPDATE public.virtual_stocks
      SET current_price = v_price, updated_at = pg_catalog.now()
      WHERE id = stock_row.id;
      v_moved := v_moved + 1;
    END IF;

    INSERT INTO public.virtual_stock_daily_candles AS candle
      (stock_id, trade_date, open_price, high_price, low_price, close_price)
    VALUES (stock_row.id, v_today, v_open, v_price, v_price, v_price)
    ON CONFLICT (stock_id, trade_date) DO UPDATE
    SET high_price = greatest(candle.high_price, EXCLUDED.close_price),
        low_price = least(candle.low_price, EXCLUDED.close_price),
        close_price = EXCLUDED.close_price,
        updated_at = pg_catalog.clock_timestamp();

    INSERT INTO public.virtual_stock_minute_candles AS minute_candle
      (stock_id, bucket_at, open_price, high_price, low_price, close_price)
    VALUES (stock_row.id, v_minute, v_price, v_price, v_price, v_price)
    ON CONFLICT (stock_id, bucket_at) DO UPDATE
    SET high_price = greatest(minute_candle.high_price, EXCLUDED.close_price),
        low_price = least(minute_candle.low_price, EXCLUDED.close_price),
        close_price = EXCLUDED.close_price;
  END LOOP;

  -- 053's pruning, kept.
  IF pg_catalog.random() < 0.001 THEN
    DELETE FROM public.virtual_stock_price_ticks
    WHERE recorded_at < pg_catalog.now() - interval '2 days';
    DELETE FROM public.virtual_stock_minute_candles
    WHERE bucket_at < pg_catalog.now() - interval '30 days';
  END IF;

  RETURN v_moved;
END;
$$;

-- ---------------------------------------------------------------------------
-- Trades move the price in proportion to what they took
-- ---------------------------------------------------------------------------

-- 053's stock_trade, unchanged except where marked: the halt check after
-- the replay lookup, and the impact.
--
-- THE ORDER FILLS AT THE MOVED PRICE. 053 filled at the quoted price and
-- moved the market afterwards, which was harmless while the move was a flat
-- one percent matched by the one-percent sell tax. With a move that grows
-- with the order it would be a spread anyone could pocket: buy three percent
-- of the float at 100, watch the price become 105, sell the same shares at
-- 105 and back to 100, keep four percent of the gross from the sink, repeat.
-- So the impact is computed first and the taker pays it -- a buy fills at
-- the price it pushed to, a sell at the price it pushed down to -- which is
-- what slippage means and what makes a round trip cost money.
CREATE OR REPLACE FUNCTION public.stock_trade(
  p_key uuid, p_actor uuid, p_stock uuid, p_side text, p_quantity bigint
)
RETURNS TABLE(trade_id uuid, unit_price bigint, gross_amount bigint, tax_amount bigint, current_price bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_price bigint; v_open bigint; v_gross bigint; v_tax bigint := 0;
  v_cash uuid; v_sink uuid; v_treasury uuid; v_position bigint := 0;
  v_trade uuid; v_next bigint; v_wallet_net_worth bigint := 0;
  v_stock_net_worth bigint := 0; v_net_worth_before_tax bigint := 0;
  v_existing_user_id uuid; v_existing_unit_price bigint;
  v_existing_gross_amount bigint; v_existing_tax_amount bigint; v_existing_current_price bigint;
  v_shares bigint; v_held bigint; v_available bigint;
  prm public.virtual_stock_market_params%ROWTYPE;
  v_impact_bps numeric; v_exact numeric; v_low numeric; v_high numeric;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL
    OR p_side NOT IN ('buy', 'sell') OR p_quantity < 1 OR p_quantity > 1000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock trade';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:stock-trade:' || p_key::text, 0));

  SELECT trade_row.id, trade_row.user_id, trade_row.unit_price, trade_row.gross_amount, trade_row.tax_amount, stock_row.current_price
  INTO v_trade, v_existing_user_id, v_existing_unit_price, v_existing_gross_amount, v_existing_tax_amount, v_existing_current_price
  FROM public.virtual_stock_trades AS trade_row
  JOIN public.virtual_stocks AS stock_row ON stock_row.id = trade_row.stock_id
  WHERE trade_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'stock trade receipt belongs to another user';
    END IF;
    RETURN QUERY SELECT v_trade, v_existing_unit_price, v_existing_gross_amount, v_existing_tax_amount, v_existing_current_price;
    RETURN;
  END IF;

  -- 124: 117's circuit breaker stops trades as well as the walk. After the
  -- replay lookup, so a receipt already issued is still answered.
  IF public.stock_market_halted() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'the market is halted';
  END IF;

  PERFORM position_row.user_id
  FROM public.virtual_stock_positions AS position_row
  JOIN public.virtual_stocks AS position_stock ON position_stock.id = position_row.stock_id
  WHERE position_row.user_id = p_actor
  ORDER BY position_row.stock_id
  FOR UPDATE OF position_row, position_stock;

  SELECT stock_row.current_price, stock_row.day_open_price, stock_row.shares_outstanding
  INTO v_price, v_open, v_shares
  FROM public.virtual_stocks AS stock_row
  WHERE stock_row.id = p_stock AND stock_row.active
  FOR UPDATE;
  IF v_price IS NULL THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active stock required'; END IF;

  -- 124: the impact is the share of the float this order takes, in basis
  -- points per percent, capped; not 053's flat one percent. A buy of one
  -- share in a float of a million moves nothing, which is right. It is
  -- computed here, before the fill, because the fill is at this price.
  SELECT * INTO prm FROM public.virtual_stock_market_params WHERE id = 1;
  v_impact_bps := least(prm.impact_cap_bps,
                        prm.impact_bps_per_float_percent * (p_quantity::numeric * 100 / greatest(v_shares, 1)));
  v_exact := v_price * (1 + CASE WHEN p_side = 'buy' THEN v_impact_bps ELSE -v_impact_bps END / 10000.0);
  v_low := greatest(10, v_open * (1 - prm.day_range_cap_bps / 10000.0));
  v_high := v_open * (1 + prm.day_range_cap_bps / 10000.0);
  v_exact := greatest(v_low, least(v_high, v_exact));
  v_next := round(v_exact)::bigint;
  v_gross := v_next * p_quantity;

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_sink FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink' AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_treasury FROM public.accounts AS account_row
  WHERE account_row.system_key = 'treasury' AND account_row.account_type = 'TREASURY'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_sink IS NULL OR v_treasury IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active game accounts required';
  END IF;

  SELECT position_row.quantity INTO v_position FROM public.virtual_stock_positions AS position_row
  WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock FOR UPDATE;
  v_position := coalesce(v_position, 0);
  IF p_side = 'sell' AND v_position < p_quantity THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient stock position';
  END IF;

  IF p_side = 'buy' THEN
    SELECT coalesce(sum(position_row.quantity), 0) INTO v_held
    FROM public.virtual_stock_positions AS position_row
    WHERE position_row.stock_id = p_stock;
    v_available := greatest(v_shares - v_held, 0);
    IF v_available < p_quantity THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'not enough shares available';
    END IF;
  END IF;

  IF p_side = 'sell' THEN
    SELECT coalesce(sum(balance_row.available_amount), 0) INTO v_wallet_net_worth
    FROM public.accounts AS account_row JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id = p_actor AND account_row.status = 'active'::public.account_status
      AND account_row.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type);
    SELECT coalesce(sum(position_row.quantity * stock_row.current_price), 0) INTO v_stock_net_worth
    FROM public.virtual_stock_positions AS position_row JOIN public.virtual_stocks AS stock_row ON stock_row.id = position_row.stock_id
    WHERE position_row.user_id = p_actor;
    v_net_worth_before_tax := v_wallet_net_worth + v_stock_net_worth;
    v_tax := least(floor(v_gross * 0.01)::bigint, greatest(v_net_worth_before_tax - 1000000, 0));
  END IF;

  PERFORM public.economy_post_transaction(
    p_key, 'VIRTUAL_STOCK_' || upper(p_side), p_actor, NULL,
    CASE WHEN p_side = 'buy' THEN jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'credit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'debit')
    ) WHEN v_tax = 0 THEN jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'debit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'credit')
    ) ELSE jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross - v_tax, 'direction', 'debit'),
      jsonb_build_object('accountId', v_treasury, 'amount', v_tax, 'direction', 'debit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'credit')
    ) END,
    'stock.trade.completed',
    jsonb_build_object('stockId', p_stock, 'side', p_side, 'quantity', p_quantity, 'tax', v_tax, 'netWorthBeforeTax', v_net_worth_before_tax)
  );

  IF p_side = 'buy' THEN
    INSERT INTO public.virtual_stock_positions(user_id, stock_id, quantity, average_cost)
    VALUES(p_actor, p_stock, p_quantity, v_next)
    ON CONFLICT(user_id, stock_id) DO UPDATE
    SET average_cost = ((virtual_stock_positions.quantity * virtual_stock_positions.average_cost + excluded.quantity * excluded.average_cost) / (virtual_stock_positions.quantity + excluded.quantity)),
        quantity = virtual_stock_positions.quantity + excluded.quantity, updated_at = now();
  ELSE
    UPDATE public.virtual_stock_positions AS position_row
    SET quantity = position_row.quantity - p_quantity, updated_at = now()
    WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_trades(idempotency_key, user_id, stock_id, side, quantity, unit_price, gross_amount, tax_amount)
  VALUES(p_key, p_actor, p_stock, p_side, p_quantity, v_next, v_gross, v_tax)
  RETURNING id INTO v_trade;

  UPDATE public.virtual_stocks AS stock_row SET current_price = v_next, updated_at = now() WHERE stock_row.id = p_stock;

  -- The walk continues from the traded price, and a share of the move stays
  -- in the fair value: this is what makes demand raise a price for good.
  UPDATE public.virtual_stock_dynamics AS dynamics
  SET price_exact = v_exact,
      fair_value = greatest(10, dynamics.fair_value + (v_exact - v_price) * prm.impact_permanent_share),
      updated_at = clock_timestamp()
  WHERE dynamics.stock_id = p_stock;

  RETURN QUERY SELECT v_trade, v_next, v_gross, v_tax, v_next;
END;
$$;

-- ---------------------------------------------------------------------------
-- Events: the news
-- ---------------------------------------------------------------------------

/**
 * Publishes an event. Operator only, in 045's order: validate, lock the
 * key, look for the receipt, check its owner, then write.
 *
 * Strength is a vocabulary of three rather than a free number, so what an
 * operator (or, one day, an AI) can do to the market is bounded by this
 * table and not by whoever calls it: 300, 800 or 2,000 basis points a day of
 * drift, and 1.2, 1.5 or 2.0 times the volatility, for one to 168 hours.
 */
CREATE OR REPLACE FUNCTION public.stock_market_event_publish(
  p_key uuid,
  p_actor uuid,
  p_stock uuid,
  p_direction text,
  p_strength integer,
  p_hours integer,
  p_headline text,
  p_body text,
  p_source text DEFAULT 'operator'
)
RETURNS TABLE(event_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.virtual_stock_market_events%ROWTYPE;
  v_drift numeric;
  v_vol numeric;
  v_headline text;
  v_body text;
  v_id uuid;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);

  v_headline := pg_catalog.btrim(coalesce(p_headline, ''));
  v_body := pg_catalog.btrim(coalesce(p_body, ''));
  IF p_key IS NULL
     OR p_direction NOT IN ('up', 'down')
     OR coalesce(p_strength, 0) NOT BETWEEN 1 AND 3
     OR coalesce(p_hours, 0) NOT BETWEEN 1 AND 168
     OR pg_catalog.char_length(v_headline) NOT BETWEEN 2 AND 120
     OR pg_catalog.char_length(v_body) > 2000
     OR coalesce(p_source, '') NOT IN ('operator', 'ai', 'system') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid market event';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:stock-market-event:' || p_key::text, 0));

  SELECT event.* INTO v_existing
  FROM public.virtual_stock_market_events AS event
  WHERE event.idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.created_by IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'market event receipt belongs to another operator';
    END IF;
    RETURN QUERY SELECT v_existing.id, true;
    RETURN;
  END IF;

  IF p_stock IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.virtual_stocks AS stock WHERE stock.id = p_stock AND stock.active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active stock required';
  END IF;

  v_drift := CASE p_strength WHEN 1 THEN 300 WHEN 2 THEN 800 ELSE 2000 END
             * CASE p_direction WHEN 'up' THEN 1 ELSE -1 END;
  v_vol := CASE p_strength WHEN 1 THEN 1.2 WHEN 2 THEN 1.5 ELSE 2.0 END;

  INSERT INTO public.virtual_stock_market_events
    (idempotency_key, stock_id, direction, strength, drift_bps_per_day, vol_multiplier,
     headline, body, source, ends_at, created_by)
  VALUES
    (p_key, p_stock, p_direction, p_strength, v_drift, v_vol,
     v_headline, v_body, p_source,
     pg_catalog.clock_timestamp() + pg_catalog.make_interval(hours => p_hours), p_actor)
  RETURNING id INTO v_id;

  PERFORM public.admin_record_audit_event(
    p_actor,
    'stock.market_event.published',
    coalesce(p_stock, v_id),
    p_key,
    pg_catalog.jsonb_build_object(
      'eventId', v_id, 'stockId', p_stock, 'direction', p_direction, 'strength', p_strength,
      'hours', p_hours, 'headline', v_headline, 'source', p_source)
  );

  RETURN QUERY SELECT v_id, false;
END;
$$;

/** Ends an event now. True once; false for an event already over or unknown. */
CREATE OR REPLACE FUNCTION public.stock_market_event_cancel(
  p_key uuid,
  p_actor uuid,
  p_event uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_event IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid market event cancellation';
  END IF;

  UPDATE public.virtual_stock_market_events AS event
  SET cancelled_at = pg_catalog.clock_timestamp()
  WHERE event.id = p_event
    AND event.cancelled_at IS NULL
    AND event.ends_at > pg_catalog.clock_timestamp();
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  PERFORM public.admin_record_audit_event(
    p_actor, 'stock.market_event.cancelled', p_event, p_key,
    pg_catalog.jsonb_build_object('eventId', p_event)
  );
  RETURN true;
END;
$$;

/** What is running now, for the market screen. Newest first. */
CREATE OR REPLACE FUNCTION public.stock_market_events_active()
RETURNS TABLE(
  id uuid,
  stock_id uuid,
  symbol text,
  name text,
  direction text,
  strength integer,
  headline text,
  body text,
  source text,
  starts_at timestamptz,
  ends_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT event.id, event.stock_id, stock.symbol, stock.name, event.direction, event.strength,
         event.headline, event.body, event.source, event.starts_at, event.ends_at
  FROM public.virtual_stock_market_events AS event
  LEFT JOIN public.virtual_stocks AS stock ON stock.id = event.stock_id
  WHERE event.cancelled_at IS NULL
    AND event.starts_at <= pg_catalog.clock_timestamp()
    AND event.ends_at > pg_catalog.clock_timestamp()
    AND (event.stock_id IS NULL OR stock.active)
  ORDER BY event.starts_at DESC
  LIMIT 20
$$;

/** The recent history, ended and cancelled included, for the console. */
CREATE OR REPLACE FUNCTION public.stock_market_events_admin_list(p_actor uuid, p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  stock_id uuid,
  symbol text,
  name text,
  direction text,
  strength integer,
  headline text,
  body text,
  source text,
  starts_at timestamptz,
  ends_at timestamptz,
  cancelled_at timestamptz,
  live boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT event.id, event.stock_id, stock.symbol, stock.name, event.direction, event.strength,
         event.headline, event.body, event.source, event.starts_at, event.ends_at, event.cancelled_at,
         (event.cancelled_at IS NULL AND event.ends_at > pg_catalog.clock_timestamp()) AS live
  FROM public.virtual_stock_market_events AS event
  LEFT JOIN public.virtual_stocks AS stock ON stock.id = event.stock_id
  ORDER BY event.created_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 50), 200));
END;
$$;

/** Each stock's mood beside its price, so an operator can see the direction the market has. */
CREATE OR REPLACE FUNCTION public.stock_market_dynamics_admin(p_actor uuid)
RETURNS TABLE(
  stock_id uuid,
  symbol text,
  name text,
  current_price bigint,
  fair_value bigint,
  trend_bps numeric,
  vol_bps numeric,
  market_trend_bps numeric,
  live_events integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT stock.id, stock.symbol, stock.name, stock.current_price,
         pg_catalog.round(dynamics.fair_value)::bigint,
         pg_catalog.round(dynamics.trend_bps, 1),
         pg_catalog.round(dynamics.vol_bps, 1),
         (SELECT pg_catalog.round(regime.market_trend_bps, 1)
          FROM public.virtual_stock_market_regime AS regime WHERE regime.id = 1),
         (SELECT count(*)::integer
          FROM public.virtual_stock_market_events AS event
          WHERE event.cancelled_at IS NULL
            AND event.starts_at <= pg_catalog.clock_timestamp()
            AND event.ends_at > pg_catalog.clock_timestamp()
            AND (event.stock_id IS NULL OR event.stock_id = stock.id))
  FROM public.virtual_stocks AS stock
  LEFT JOIN public.virtual_stock_dynamics AS dynamics ON dynamics.stock_id = stock.id
  WHERE stock.active
  ORDER BY stock.symbol;
END;
$$;

-- ---------------------------------------------------------------------------
-- Ownership and grants
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.stock_market_live_tick() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_event_cancel(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_events_active() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_events_admin_list(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_dynamics_admin(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.stock_market_live_tick(),
  public.stock_trade(uuid, uuid, uuid, text, bigint),
  public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text),
  public.stock_market_event_cancel(uuid, uuid, uuid),
  public.stock_market_events_active(),
  public.stock_market_events_admin_list(uuid, integer),
  public.stock_market_dynamics_admin(uuid)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.stock_market_live_tick(),
  public.stock_trade(uuid, uuid, uuid, text, bigint),
  public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text),
  public.stock_market_event_cancel(uuid, uuid, uuid),
  public.stock_market_events_active(),
  public.stock_market_events_admin_list(uuid, integer),
  public.stock_market_dynamics_admin(uuid)
TO moneyverse_app;

-- Restated (047): the state is read through functions, never granted.
REVOKE ALL ON TABLE
  public.virtual_stocks,
  public.virtual_stock_market_params,
  public.virtual_stock_market_regime,
  public.virtual_stock_dynamics,
  public.virtual_stock_market_events
FROM PUBLIC, moneyverse_app;

COMMIT;
