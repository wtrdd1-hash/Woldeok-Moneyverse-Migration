-- A market that moves, and enough history to draw it.
--
-- 023 gave stocks a price, 025 gave the market a tick that applies one factor
-- to every stock at once, and 034 records a row into virtual_stock_price_ticks
-- whenever current_price changes. Nothing ever called the tick, so the market
-- has been frozen since the port, and the only history is the row each stock
-- got when it was created.
--
-- Three things are added here.
--
-- `stock_market_live_tick` moves each stock independently, once per call. The
-- walk is a small random shock plus a pull back toward the day's open, so a
-- stock wanders second to second without drifting to zero or to the ceiling
-- over an afternoon — 025's tick could not do this because its factor is an
-- argument, the same one for every stock.
--
-- `virtual_stock_daily_candles` is the year view. One row per stock per day
-- with open, high, low and close, maintained by the same tick. Raw ticks are
-- kept for two days and then dropped: a one-second tick is 86,400 rows per
-- stock per day, which is the right resolution for today's line and quite the
-- wrong one for a year of candles.
--
-- The read functions are what the market screen and the detail chart call.
--
-- The trade date is Seoul's, not UTC's. "오늘 얼마 올랐는지" is a question
-- about the reader's day, and a market that rolled its open at 09:00 local
-- would be answering a different one.

BEGIN;

CREATE TABLE IF NOT EXISTS public.virtual_stock_daily_candles (
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  trade_date date NOT NULL,
  open_price bigint NOT NULL CHECK (open_price >= 10),
  high_price bigint NOT NULL CHECK (high_price >= 10),
  low_price bigint NOT NULL CHECK (low_price >= 10),
  close_price bigint NOT NULL CHECK (close_price >= 10),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (stock_id, trade_date),
  CHECK (high_price >= low_price)
);

CREATE INDEX IF NOT EXISTS virtual_stock_daily_candles_stock_date_idx
  ON public.virtual_stock_daily_candles (stock_id, trade_date DESC);

REVOKE ALL ON public.virtual_stock_daily_candles FROM PUBLIC, moneyverse_app;

-- Seed one candle per stock from what is known now, so a chart drawn before
-- the first tick is empty rather than wrong.
INSERT INTO public.virtual_stock_daily_candles
  (stock_id, trade_date, open_price, high_price, low_price, close_price)
SELECT
  stock.id,
  (pg_catalog.timezone('Asia/Seoul', pg_catalog.now()))::date,
  stock.day_open_price,
  greatest(stock.day_open_price, stock.current_price),
  least(stock.day_open_price, stock.current_price),
  stock.current_price
FROM public.virtual_stocks AS stock
ON CONFLICT (stock_id, trade_date) DO NOTHING;

/**
 * One step of the market.
 *
 * Returns the number of stocks moved. Zero means another caller holds the
 * lock, which is the correct answer for a second ticker rather than a reason
 * to fail: the advisory lock is what stops two API processes from applying
 * two independent walks to the same second.
 */
CREATE OR REPLACE FUNCTION public.stock_market_live_tick()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  stock_row record;
  v_today date;
  v_open bigint;
  v_shock numeric;
  v_drift numeric;
  v_price bigint;
  v_moved integer := 0;
BEGIN
  -- 8574201 is an arbitrary constant naming this job. A second process that
  -- cannot take it does nothing and says so.
  IF NOT pg_catalog.pg_try_advisory_xact_lock(8574201) THEN
    RETURN 0;
  END IF;

  v_today := (pg_catalog.timezone('Asia/Seoul', pg_catalog.now()))::date;

  FOR stock_row IN
    SELECT id, current_price, day_open_price
    FROM public.virtual_stocks
    WHERE active
    ORDER BY id
    FOR UPDATE
  LOOP
    -- A new day opens where the last one closed.
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

    -- Up to ±0.3% a second, pulled gently back toward the open. Without the
    -- pull a random walk leaves the day's range within an hour; with it the
    -- price wanders and returns, which is what a market looks like.
    v_shock := (pg_catalog.random() - 0.5) * 0.006;
    v_drift := -0.05 * (stock_row.current_price::numeric / greatest(v_open, 1) - 1);
    v_price := pg_catalog.round(stock_row.current_price * (1 + v_shock + v_drift))::bigint;

    -- Never below the floor 023 sets, and never more than 30% either side of
    -- the day's open: a day's range is a product decision, not an accident of
    -- how long the ticker happened to run.
    v_price := greatest(
      greatest(10::bigint, (v_open * 0.7)::bigint),
      least((v_open * 1.3)::bigint, v_price)
    );

    -- A price that did not move writes nothing: 034's trigger only records a
    -- tick when current_price actually changes, and an UPDATE that sets the
    -- same value would still bump updated_at.
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
  END LOOP;

  -- Two days of one-second ticks is the intraday line and a margin. The daily
  -- candles are the long memory. Pruned on roughly one call in a thousand,
  -- because a DELETE every second would cost more than the rows it removes.
  IF pg_catalog.random() < 0.001 THEN
    DELETE FROM public.virtual_stock_price_ticks
    WHERE recorded_at < pg_catalog.now() - interval '2 days';
  END IF;

  RETURN v_moved;
END;
$$;

/**
 * The market screen: every tradable stock with the figures the list shows.
 *
 * day_high and day_low come from today's candle rather than from a scan of
 * the tick table, which is what keeps this cheap once a stock has a day's
 * worth of seconds behind it.
 */
CREATE OR REPLACE FUNCTION public.stock_market_overview()
RETURNS TABLE(
  id uuid,
  symbol text,
  name text,
  description text,
  current_price bigint,
  day_open_price bigint,
  day_high_price bigint,
  day_low_price bigint,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    stock.id,
    stock.symbol,
    stock.name,
    stock.description,
    stock.current_price,
    stock.day_open_price,
    coalesce(candle.high_price, greatest(stock.current_price, stock.day_open_price)),
    coalesce(candle.low_price, least(stock.current_price, stock.day_open_price)),
    stock.updated_at
  FROM public.virtual_stocks AS stock
  LEFT JOIN public.virtual_stock_daily_candles AS candle
    ON candle.stock_id = stock.id
   AND candle.trade_date = (timezone('Asia/Seoul', now()))::date
  WHERE stock.active
  ORDER BY stock.symbol
$$;

/** Daily candles, newest last, for the detail chart. */
CREATE OR REPLACE FUNCTION public.stock_daily_candles(p_stock uuid, p_days integer DEFAULT 60)
RETURNS TABLE(
  trade_date date,
  open_price bigint,
  high_price bigint,
  low_price bigint,
  close_price bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT candle.trade_date, candle.open_price, candle.high_price,
         candle.low_price, candle.close_price
  FROM public.virtual_stock_daily_candles AS candle
  JOIN public.virtual_stocks AS stock ON stock.id = candle.stock_id AND stock.active
  WHERE candle.stock_id = p_stock
  ORDER BY candle.trade_date DESC
  LIMIT greatest(1, least(coalesce(p_days, 60), 365))
$$;

/**
 * The highs and lows a detail view quotes.
 *
 * The day's pair comes from today's candle and the year's from the candle
 * table, so neither reads the tick table — the ticks only ever answer "what
 * did the last few minutes look like".
 */
CREATE OR REPLACE FUNCTION public.stock_price_range(p_stock uuid)
RETURNS TABLE(
  day_high bigint,
  day_low bigint,
  year_high bigint,
  year_low bigint,
  first_trade_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    max(candle.high_price) FILTER (
      WHERE candle.trade_date = (timezone('Asia/Seoul', now()))::date
    ),
    min(candle.low_price) FILTER (
      WHERE candle.trade_date = (timezone('Asia/Seoul', now()))::date
    ),
    max(candle.high_price),
    min(candle.low_price),
    min(candle.trade_date)
  FROM public.virtual_stock_daily_candles AS candle
  JOIN public.virtual_stocks AS stock ON stock.id = candle.stock_id AND stock.active
  WHERE candle.stock_id = p_stock
    AND candle.trade_date >= (timezone('Asia/Seoul', now()))::date - interval '1 year'
$$;

ALTER FUNCTION public.stock_market_live_tick() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_overview() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_daily_candles(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_price_range(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.stock_market_live_tick(),
  public.stock_market_overview(),
  public.stock_daily_candles(uuid, integer),
  public.stock_price_range(uuid)
FROM PUBLIC;

-- 025 already grants stock_market_tick(numeric) to moneyverse_app, so moving
-- the market is not a privilege this migration introduces.
GRANT EXECUTE ON FUNCTION
  public.stock_market_live_tick(),
  public.stock_market_overview(),
  public.stock_daily_candles(uuid, integer),
  public.stock_price_range(uuid)
TO moneyverse_app;

COMMIT;
