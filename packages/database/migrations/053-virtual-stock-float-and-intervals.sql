-- A share count, an intraday memory, and the two controls an operator needs.
--
-- 023 gave a stock a price but never a size: every stock was effectively
-- infinite, so "how many are left to buy" had no answer and a split had
-- nothing to split. `shares_outstanding` is that size, and the float — what
-- nobody is holding — is what a buy draws from and a sell returns to.
--
-- 052 keeps two days of one-second ticks for today's line and one row per day
-- for the year. Neither can answer "the last four hours in five-minute
-- candles": the ticks are too many to aggregate on every read and the daily
-- candles are too few. `virtual_stock_minute_candles` sits between them — one
-- row per stock per minute, kept for thirty days, which every intraday bucket
-- from a minute to four hours aggregates from cheaply.
--
-- `stock_admin_set_price` and `stock_admin_delete` are the two things an
-- operator could not do. Both are deliberately narrow. A forced price also
-- moves the day's open, because 052's walk clamps to ±30% of that open and a
-- price set outside the band would be dragged back within a second. A delete
-- refuses any stock that has ever traded or that anybody holds: the trades
-- are a ledger, and `active = false` is the right way to retire a stock that
-- has a history. Deleting is for the symbol typed wrong a minute ago.

BEGIN;

-- ---------------------------------------------------------------------------
-- The float
-- ---------------------------------------------------------------------------

ALTER TABLE public.virtual_stocks
  ADD COLUMN IF NOT EXISTS shares_outstanding bigint NOT NULL DEFAULT 1000000;

DO $$
BEGIN
  ALTER TABLE public.virtual_stocks
    ADD CONSTRAINT virtual_stocks_shares_outstanding_check
    CHECK (shares_outstanding BETWEEN 1 AND 1000000000000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- The float is sum(quantity) per stock, and the positions table is keyed the
-- other way round.
CREATE INDEX IF NOT EXISTS virtual_stock_positions_stock_idx
  ON public.virtual_stock_positions (stock_id);

-- ---------------------------------------------------------------------------
-- The intraday memory
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.virtual_stock_minute_candles (
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  bucket_at timestamptz NOT NULL,
  open_price bigint NOT NULL CHECK (open_price >= 10),
  high_price bigint NOT NULL CHECK (high_price >= 10),
  low_price bigint NOT NULL CHECK (low_price >= 10),
  close_price bigint NOT NULL CHECK (close_price >= 10),
  PRIMARY KEY (stock_id, bucket_at),
  CHECK (high_price >= low_price)
);

CREATE INDEX IF NOT EXISTS virtual_stock_minute_candles_stock_bucket_idx
  ON public.virtual_stock_minute_candles (stock_id, bucket_at DESC);

REVOKE ALL ON public.virtual_stock_minute_candles FROM PUBLIC, moneyverse_app;

-- ---------------------------------------------------------------------------
-- The tick, now keeping minutes as well as days
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.stock_market_live_tick()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  stock_row record;
  v_today date;
  v_minute timestamptz;
  v_open bigint;
  v_shock numeric;
  v_drift numeric;
  v_price bigint;
  v_moved integer := 0;
BEGIN
  IF NOT pg_catalog.pg_try_advisory_xact_lock(8574201) THEN
    RETURN 0;
  END IF;

  v_today := (pg_catalog.timezone('Asia/Seoul', pg_catalog.now()))::date;
  v_minute := pg_catalog.date_trunc('minute', pg_catalog.now());

  FOR stock_row IN
    SELECT id, current_price, day_open_price
    FROM public.virtual_stocks
    WHERE active
    ORDER BY id
    FOR UPDATE
  LOOP
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

    v_shock := (pg_catalog.random() - 0.5) * 0.006;
    v_drift := -0.05 * (stock_row.current_price::numeric / greatest(v_open, 1) - 1);
    v_price := pg_catalog.round(stock_row.current_price * (1 + v_shock + v_drift))::bigint;

    v_price := greatest(
      greatest(10::bigint, (v_open * 0.7)::bigint),
      least((v_open * 1.3)::bigint, v_price)
    );

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

    -- The same shape one minute wide. The first tick of a minute writes the
    -- open; every later one only moves high, low and close.
    INSERT INTO public.virtual_stock_minute_candles AS minute_candle
      (stock_id, bucket_at, open_price, high_price, low_price, close_price)
    VALUES (stock_row.id, v_minute, v_price, v_price, v_price, v_price)
    ON CONFLICT (stock_id, bucket_at) DO UPDATE
    SET high_price = greatest(minute_candle.high_price, EXCLUDED.close_price),
        low_price = least(minute_candle.low_price, EXCLUDED.close_price),
        close_price = EXCLUDED.close_price;
  END LOOP;

  -- Pruned on roughly one call in a thousand, because a DELETE every second
  -- would cost more than the rows it removes. Thirty days of minutes is
  -- 43,200 rows a stock, which is what the four-hour bucket needs to have
  -- anything to aggregate.
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
-- One candle reader for every interval the detail view offers
-- ---------------------------------------------------------------------------

/**
 * Candles at any of the supported bucket widths, oldest first.
 *
 * Below a day the rows are folded up from the minute candles; a day is the
 * daily table as it stands; a week folds those. Splitting this across three
 * functions would put the choice of which to call in the application, where
 * it would have to know the retention rules to make it.
 *
 * `bucket_at` is the start of the bucket, so a caller never has to know how
 * wide it was to place it on an axis.
 */
CREATE OR REPLACE FUNCTION public.stock_candles(
  p_stock uuid,
  p_bucket_seconds integer,
  p_limit integer DEFAULT 120
)
RETURNS TABLE(
  bucket_at timestamptz,
  open_price bigint,
  high_price bigint,
  low_price bigint,
  close_price bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_width integer;
  v_limit integer;
BEGIN
  -- An unrecognised width is a caller bug, not a reason to invent a chart.
  IF p_bucket_seconds NOT IN (60, 300, 1800, 3600, 7200, 14400, 86400, 604800) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unsupported candle interval';
  END IF;

  v_width := p_bucket_seconds;
  v_limit := greatest(1, least(coalesce(p_limit, 120), 400));

  IF NOT EXISTS (SELECT 1 FROM public.virtual_stocks WHERE id = p_stock) THEN
    RETURN;
  END IF;

  IF v_width < 86400 THEN
    RETURN QUERY
    WITH folded AS (
      SELECT
        to_timestamp(floor(extract(epoch FROM candle.bucket_at) / v_width) * v_width) AS slot,
        (array_agg(candle.open_price ORDER BY candle.bucket_at))[1] AS opened,
        max(candle.high_price) AS high,
        min(candle.low_price) AS low,
        (array_agg(candle.close_price ORDER BY candle.bucket_at DESC))[1] AS closed
      FROM public.virtual_stock_minute_candles AS candle
      WHERE candle.stock_id = p_stock
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT v_limit
    )
    SELECT folded.slot, folded.opened, folded.high, folded.low, folded.closed
    FROM folded
    ORDER BY folded.slot;
    RETURN;
  END IF;

  IF v_width = 86400 THEN
    RETURN QUERY
    WITH recent AS (
      SELECT candle.trade_date, candle.open_price, candle.high_price,
             candle.low_price, candle.close_price
      FROM public.virtual_stock_daily_candles AS candle
      WHERE candle.stock_id = p_stock
      ORDER BY candle.trade_date DESC
      LIMIT v_limit
    )
    SELECT recent.trade_date::timestamptz, recent.open_price, recent.high_price,
           recent.low_price, recent.close_price
    FROM recent
    ORDER BY recent.trade_date;
    RETURN;
  END IF;

  RETURN QUERY
  WITH folded AS (
    SELECT
      date_trunc('week', candle.trade_date::timestamptz) AS slot,
      (array_agg(candle.open_price ORDER BY candle.trade_date))[1] AS opened,
      max(candle.high_price) AS high,
      min(candle.low_price) AS low,
      (array_agg(candle.close_price ORDER BY candle.trade_date DESC))[1] AS closed
    FROM public.virtual_stock_daily_candles AS candle
    WHERE candle.stock_id = p_stock
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT v_limit
  )
  SELECT folded.slot, folded.opened, folded.high, folded.low, folded.closed
  FROM folded
  ORDER BY folded.slot;
END;
$$;

/**
 * Just the prices, for the once-a-second broadcast.
 *
 * `stock_market_overview` is the screen's query and it sums every position to
 * work out the float; running that every second to push a price change would
 * cost O(positions) a second to send two numbers per stock. The float only
 * moves when somebody trades, so the socket carries the prices and the page
 * keeps the float it loaded with.
 */
CREATE OR REPLACE FUNCTION public.stock_live_prices()
RETURNS TABLE(
  id uuid,
  current_price bigint,
  day_open_price bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT stock.id, stock.current_price, stock.day_open_price
  FROM public.virtual_stocks AS stock
  WHERE stock.active
  ORDER BY stock.symbol
$$;

-- ---------------------------------------------------------------------------
-- The listings, now carrying the float
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.stock_market_overview();
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
  shares_outstanding bigint,
  shares_available bigint,
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
    stock.shares_outstanding,
    greatest(stock.shares_outstanding - coalesce(held.quantity, 0), 0)::bigint,
    stock.updated_at
  FROM public.virtual_stocks AS stock
  LEFT JOIN public.virtual_stock_daily_candles AS candle
    ON candle.stock_id = stock.id
   AND candle.trade_date = (timezone('Asia/Seoul', now()))::date
  LEFT JOIN LATERAL (
    SELECT sum(position_row.quantity) AS quantity
    FROM public.virtual_stock_positions AS position_row
    WHERE position_row.stock_id = stock.id
  ) AS held ON true
  WHERE stock.active
  ORDER BY stock.symbol
$$;

DROP FUNCTION IF EXISTS public.stock_list_active();
CREATE OR REPLACE FUNCTION public.stock_list_active()
RETURNS TABLE(
  id uuid,
  symbol text,
  name text,
  description text,
  current_price bigint,
  day_open_price bigint,
  shares_outstanding bigint,
  shares_available bigint,
  active boolean,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT stock.id, stock.symbol, stock.name, stock.description,
         stock.current_price, stock.day_open_price,
         stock.shares_outstanding,
         -- sum(bigint) is numeric, and RETURN QUERY will not widen it back.
         greatest(stock.shares_outstanding - coalesce(held.quantity, 0), 0)::bigint,
         stock.active, stock.updated_at
  FROM public.virtual_stocks AS stock
  LEFT JOIN LATERAL (
    SELECT sum(position_row.quantity) AS quantity
    FROM public.virtual_stock_positions AS position_row
    WHERE position_row.stock_id = stock.id
  ) AS held ON true
  WHERE stock.active
  ORDER BY stock.symbol
$$;

DROP FUNCTION IF EXISTS public.stock_admin_list(uuid);
CREATE OR REPLACE FUNCTION public.stock_admin_list(p_actor uuid)
RETURNS TABLE(
  id uuid,
  symbol text,
  name text,
  description text,
  current_price bigint,
  day_open_price bigint,
  shares_outstanding bigint,
  shares_available bigint,
  holders integer,
  trades integer,
  active boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT stock.id, stock.symbol, stock.name, stock.description,
         stock.current_price, stock.day_open_price,
         stock.shares_outstanding,
         -- sum(bigint) is numeric, and RETURN QUERY will not widen it back.
         greatest(stock.shares_outstanding - coalesce(held.quantity, 0), 0)::bigint,
         coalesce(held.holders, 0)::integer,
         -- What makes a stock undeletable, shown next to the delete control
         -- rather than discovered by pressing it.
         (SELECT count(*) FROM public.virtual_stock_trades AS trade_row
           WHERE trade_row.stock_id = stock.id)::integer,
         stock.active, stock.updated_at
  FROM public.virtual_stocks AS stock
  LEFT JOIN LATERAL (
    SELECT sum(position_row.quantity) AS quantity,
           count(*) FILTER (WHERE position_row.quantity > 0) AS holders
    FROM public.virtual_stock_positions AS position_row
    WHERE position_row.stock_id = stock.id
  ) AS held ON true
  ORDER BY stock.active DESC, stock.symbol;
END $$;

-- ---------------------------------------------------------------------------
-- Registration, now naming the size
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.stock_admin_create(uuid, text, text, text, bigint);
CREATE OR REPLACE FUNCTION public.stock_admin_create(
  p_actor uuid,
  p_symbol text,
  p_name text,
  p_description text,
  p_price bigint,
  p_shares bigint DEFAULT 1000000
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE v_id uuid;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_symbol !~ '^[A-Z][A-Z0-9]{1,7}$'
     OR char_length(p_name) NOT BETWEEN 1 AND 80
     OR char_length(p_description) > 500
     OR p_price < 10
     OR coalesce(p_shares, 0) NOT BETWEEN 1 AND 1000000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock';
  END IF;
  INSERT INTO public.virtual_stocks
    (symbol, name, description, initial_price, current_price, day_open_price, shares_outstanding)
  VALUES (p_symbol, p_name, p_description, p_price, p_price, p_price, p_shares)
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- ---------------------------------------------------------------------------
-- Trading against a finite float
-- ---------------------------------------------------------------------------

-- Carried forward from 045 unchanged apart from the float check: a stock now
-- has a size, so a buy that would take more shares than exist is refused
-- rather than quietly minting them.
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
  v_gross := v_price * p_quantity;

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

  -- A buy draws from the float, which is what nobody is holding. The stock
  -- row is already locked above, so the sum below cannot be undercut by a
  -- concurrent buy of the same stock between reading it and writing.
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
    VALUES(p_actor, p_stock, p_quantity, v_price)
    ON CONFLICT(user_id, stock_id) DO UPDATE
    SET average_cost = ((virtual_stock_positions.quantity * virtual_stock_positions.average_cost + excluded.quantity * excluded.average_cost) / (virtual_stock_positions.quantity + excluded.quantity)),
        quantity = virtual_stock_positions.quantity + excluded.quantity, updated_at = now();
  ELSE
    UPDATE public.virtual_stock_positions AS position_row
    SET quantity = position_row.quantity - p_quantity, updated_at = now()
    WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_trades(idempotency_key, user_id, stock_id, side, quantity, unit_price, gross_amount, tax_amount)
  VALUES(p_key, p_actor, p_stock, p_side, p_quantity, v_price, v_gross, v_tax)
  RETURNING id INTO v_trade;
  v_next := CASE WHEN p_side = 'buy' THEN least((v_price * 101 + 99) / 100, (v_open * 115) / 100)
    ELSE greatest((v_price * 99) / 100, (v_open * 85) / 100, 10) END;
  UPDATE public.virtual_stocks AS stock_row SET current_price = v_next, updated_at = now() WHERE stock_row.id = p_stock;
  RETURN QUERY SELECT v_trade, v_price, v_gross, v_tax, v_next;
END;
$$;

-- ---------------------------------------------------------------------------
-- Splits and merges, now moving the share count with the price
-- ---------------------------------------------------------------------------

-- Carried forward from 040. A split that divided the price but left the
-- share count alone would have halved every holder's stake in the company
-- while doubling their share count, which is the one thing a split must not
-- do. A reverse split is refused unless the count divides evenly, for the
-- same reason it is refused when a position would not.
CREATE OR REPLACE FUNCTION public.stock_admin_corporate_action(
  p_key uuid,
  p_actor uuid,
  p_stock uuid,
  p_action text,
  p_factor integer
)
RETURNS TABLE(corporate_action_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.virtual_stock_corporate_actions%ROWTYPE;
  v_stock public.virtual_stocks%ROWTYPE;
  v_action_id uuid;
  v_max bigint := 9223372036854775807;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL
     OR p_action NOT IN ('split', 'reverse_split')
     OR p_factor NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock corporate action';
  END IF;

  SELECT * INTO v_existing
  FROM public.virtual_stock_corporate_actions
  WHERE idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.actor_user_id = p_actor
       AND v_existing.stock_id = p_stock
       AND v_existing.action = p_action
       AND v_existing.factor = p_factor THEN
      RETURN QUERY SELECT v_existing.id, true;
      RETURN;
    END IF;
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency key conflicts with a different corporate action';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles AS role_row
    JOIN public.users AS user_row ON user_row.id = role_row.user_id
    WHERE role_row.user_id = p_actor
      AND role_row.role = 'operator'::public.admin_role
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active operator role required';
  END IF;

  SELECT * INTO v_stock FROM public.virtual_stocks WHERE id = p_stock FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock not found';
  END IF;

  IF p_action = 'split' THEN
    IF v_stock.initial_price < p_factor * 10
       OR v_stock.current_price < p_factor * 10
       OR v_stock.day_open_price < p_factor * 10
       OR v_stock.shares_outstanding > v_max / p_factor
       OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE stock_id = p_stock AND quantity > v_max / p_factor) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock cannot be split by this factor';
    END IF;
    UPDATE public.virtual_stock_positions
    SET quantity = quantity * p_factor,
        -- GREATEST is a parser construct, not a function in pg_catalog, so the
        -- qualified form 040 used raises undefined_function every time. This
        -- line is why no split has ever completed.
        average_cost = greatest(1::bigint, (average_cost + p_factor - 1) / p_factor),
        updated_at = pg_catalog.clock_timestamp()
    WHERE stock_id = p_stock;
    UPDATE public.virtual_stocks
    SET initial_price = (initial_price + p_factor - 1) / p_factor,
        current_price = (current_price + p_factor - 1) / p_factor,
        day_open_price = (day_open_price + p_factor - 1) / p_factor,
        -- More shares of a proportionally smaller thing. Leaving the count
        -- alone would shrink the float against a price that had already
        -- been divided.
        shares_outstanding = shares_outstanding * p_factor,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_stock;
  ELSE
    IF v_stock.initial_price > v_max / p_factor
       OR v_stock.current_price > v_max / p_factor
       OR v_stock.day_open_price > v_max / p_factor
       OR v_stock.shares_outstanding % p_factor <> 0
       OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE stock_id = p_stock AND quantity % p_factor <> 0)
       OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE stock_id = p_stock AND average_cost > v_max / p_factor) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock cannot be reverse split by this factor';
    END IF;
    UPDATE public.virtual_stock_positions
    SET quantity = quantity / p_factor,
        average_cost = average_cost * p_factor,
        updated_at = pg_catalog.clock_timestamp()
    WHERE stock_id = p_stock;
    UPDATE public.virtual_stocks
    SET initial_price = initial_price * p_factor,
        current_price = current_price * p_factor,
        day_open_price = day_open_price * p_factor,
        shares_outstanding = shares_outstanding / p_factor,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_corporate_actions(idempotency_key, actor_user_id, stock_id, action, factor)
  VALUES (p_key, p_actor, p_stock, p_action, p_factor)
  RETURNING id INTO v_action_id;

  PERFORM public.admin_record_audit_event(
    p_actor,
    'stock.corporate_action',
    p_stock,
    p_key,
    pg_catalog.jsonb_build_object('action', p_action, 'factor', p_factor)
  );
  RETURN QUERY SELECT v_action_id, false;
END;
$$;


-- ---------------------------------------------------------------------------
-- The two controls an operator did not have
-- ---------------------------------------------------------------------------

/**
 * Sets a stock's price by hand.
 *
 * The day's open moves with it. 052's walk clamps every tick to ±30% of the
 * open, so a price set outside that band would be pulled back inside it
 * within the second — the control would appear to work and then undo itself.
 * Moving the open is what makes the new price the one the market walks around.
 *
 * Today's candle keeps the open it already had. The day really did travel
 * from there to here, and rewriting it would erase the move from the chart.
 */
CREATE OR REPLACE FUNCTION public.stock_admin_set_price(
  p_key uuid,
  p_actor uuid,
  p_stock uuid,
  p_price bigint
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_stock public.virtual_stocks%ROWTYPE;
  v_today date;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);

  IF p_key IS NULL OR p_stock IS NULL
     OR coalesce(p_price, 0) NOT BETWEEN 10 AND 1000000000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock price';
  END IF;

  SELECT * INTO v_stock FROM public.virtual_stocks WHERE id = p_stock FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock not found';
  END IF;

  v_today := (pg_catalog.timezone('Asia/Seoul', pg_catalog.now()))::date;

  UPDATE public.virtual_stocks
  SET current_price = p_price,
      day_open_price = p_price,
      updated_at = pg_catalog.now()
  WHERE id = p_stock;

  INSERT INTO public.virtual_stock_daily_candles AS candle
    (stock_id, trade_date, open_price, high_price, low_price, close_price)
  VALUES (p_stock, v_today, p_price, p_price, p_price, p_price)
  ON CONFLICT (stock_id, trade_date) DO UPDATE
  SET high_price = greatest(candle.high_price, EXCLUDED.close_price),
      low_price = least(candle.low_price, EXCLUDED.close_price),
      close_price = EXCLUDED.close_price,
      updated_at = pg_catalog.clock_timestamp();

  PERFORM public.admin_record_audit_event(
    p_actor,
    'stock.price_set',
    p_stock,
    p_key,
    pg_catalog.jsonb_build_object('from', v_stock.current_price, 'to', p_price)
  );

  RETURN p_price;
END;
$$;

/**
 * Removes a stock that never went anywhere.
 *
 * Refused the moment anybody holds it or anybody has traded it, and that is
 * deliberate: `virtual_stock_trades` is a ledger, and a delete that took the
 * trades with it would leave the economy's own transactions pointing at a
 * stock that no longer exists. A stock with a history is retired by setting
 * `active = false`, which the console already offers. This is the way out of
 * a symbol typed wrong a minute ago.
 */
CREATE OR REPLACE FUNCTION public.stock_admin_delete(
  p_key uuid,
  p_actor uuid,
  p_stock uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_stock public.virtual_stocks%ROWTYPE;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);

  IF p_key IS NULL OR p_stock IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock delete';
  END IF;

  SELECT * INTO v_stock FROM public.virtual_stocks WHERE id = p_stock FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.virtual_stock_trades WHERE stock_id = p_stock) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'stock has trade history; deactivate it instead of deleting';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.virtual_stock_positions
    WHERE stock_id = p_stock AND quantity > 0
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'stock is still held; deactivate it instead of deleting';
  END IF;

  DELETE FROM public.virtual_stock_positions WHERE stock_id = p_stock;
  DELETE FROM public.virtual_stock_price_ticks WHERE stock_id = p_stock;
  DELETE FROM public.virtual_stock_corporate_actions WHERE stock_id = p_stock;
  -- The candle tables cascade from the stock row itself.
  DELETE FROM public.virtual_stocks WHERE id = p_stock;

  PERFORM public.admin_record_audit_event(
    p_actor,
    'stock.deleted',
    p_stock,
    p_key,
    pg_catalog.jsonb_build_object('symbol', v_stock.symbol, 'name', v_stock.name)
  );

  RETURN true;
END;
$$;

-- ---------------------------------------------------------------------------
-- Ownership and privilege
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.stock_market_live_tick() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_candles(uuid, integer, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_live_prices() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_market_overview() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_list_active() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_admin_list(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_admin_create(uuid, text, text, text, bigint, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_admin_corporate_action(uuid, uuid, uuid, text, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_admin_set_price(uuid, uuid, uuid, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_admin_delete(uuid, uuid, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.stock_candles(uuid, integer, integer),
  public.stock_live_prices(),
  public.stock_market_overview(),
  public.stock_list_active(),
  public.stock_admin_list(uuid),
  public.stock_admin_create(uuid, text, text, text, bigint, bigint),
  public.stock_admin_set_price(uuid, uuid, uuid, bigint),
  public.stock_admin_delete(uuid, uuid, uuid)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION
  public.stock_candles(uuid, integer, integer),
  public.stock_live_prices(),
  public.stock_market_overview(),
  public.stock_list_active(),
  public.stock_admin_list(uuid),
  public.stock_admin_create(uuid, text, text, text, bigint, bigint),
  public.stock_admin_set_price(uuid, uuid, uuid, bigint),
  public.stock_admin_delete(uuid, uuid, uuid)
TO moneyverse_app;

COMMIT;
