-- News that moves the price when it lands.
--
-- 124 let an event lean the market: `drift_bps_per_day` is added to the
-- stock's trend, the fair value drifts at that rate, and the price follows
-- the fair value with a four-hour half-life while the fair value gives way
-- to the price with a twelve-hour one. Work the two against each other and
-- the price ends up rising at three quarters of the event's nominal rate --
-- but only after about four hours. In the first minutes after a headline it
-- rises by almost nothing: a 보통 호재 is 8 % a day, which is 0.3 % an hour,
-- which on a 1,014 WLD stock is three WLD spread over sixty candles that are
-- already moving one WLD a second on noise. The operator published a 호재 and
-- watched the chart do what it had been doing.
--
-- That is not what news does. News re-prices a stock at once and then leaves
-- a lean behind it. So publishing an event now steps the price and the fair
-- value together -- 0.8 %, 2.5 % or 6 % by strength, in the event's own
-- direction -- and the drift 124 already applies carries on from there. The
-- step is bounded by the same day band as every other move, and it is three
-- more columns of the one params row, so the size of a headline can be
-- retuned without a migration.

BEGIN;

ALTER TABLE public.virtual_stock_market_params
  ADD COLUMN IF NOT EXISTS event_jump_bps_light numeric NOT NULL DEFAULT 80
    CHECK (event_jump_bps_light BETWEEN 0 AND 3000),
  ADD COLUMN IF NOT EXISTS event_jump_bps_medium numeric NOT NULL DEFAULT 250
    CHECK (event_jump_bps_medium BETWEEN 0 AND 3000),
  ADD COLUMN IF NOT EXISTS event_jump_bps_strong numeric NOT NULL DEFAULT 600
    CHECK (event_jump_bps_strong BETWEEN 0 AND 3000);

/**
 * The step a headline puts into the price, for one stock or for all of them.
 *
 * Both the price and the fair value move, or the pull back to the fair value
 * would undo the step within the hour. Bounded by 052's band around the
 * day's open and 023's floor, exactly as the tick bounds itself, so news
 * cannot take a stock somewhere a tick could not.
 *
 * Not granted to the application: the only way to move a price is to publish
 * an event, and that is what calls this.
 */
CREATE OR REPLACE FUNCTION public.stock_market_apply_event_jump(
  p_stock uuid,
  p_direction text,
  p_strength integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  prm public.virtual_stock_market_params%ROWTYPE;
  v_step numeric;
  v_row record;
  v_dyn public.virtual_stock_dynamics%ROWTYPE;
  v_open bigint;
  v_low numeric;
  v_high numeric;
  v_exact numeric;
  v_fair numeric;
  v_price bigint;
  v_moved integer := 0;
BEGIN
  IF p_direction NOT IN ('up', 'down') OR coalesce(p_strength, 0) NOT BETWEEN 1 AND 3 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid event jump';
  END IF;

  SELECT * INTO prm FROM public.virtual_stock_market_params WHERE id = 1;
  v_step := (CASE p_strength
               WHEN 1 THEN prm.event_jump_bps_light
               WHEN 2 THEN prm.event_jump_bps_medium
               ELSE prm.event_jump_bps_strong
             END) / 10000.0
          * (CASE p_direction WHEN 'up' THEN 1 ELSE -1 END);

  -- Locked in the tick's own order -- stocks by id, then that stock's
  -- dynamics -- so a headline landing during a tick waits rather than
  -- deadlocking with it.
  FOR v_row IN
    SELECT id, current_price, day_open_price
    FROM public.virtual_stocks
    WHERE active AND (p_stock IS NULL OR id = p_stock)
    ORDER BY id
    FOR UPDATE
  LOOP
    SELECT * INTO v_dyn FROM public.virtual_stock_dynamics WHERE stock_id = v_row.id FOR UPDATE;
    CONTINUE WHEN NOT FOUND;

    v_open := coalesce(nullif(v_row.day_open_price, 0), v_row.current_price);
    v_low := greatest(10, v_open * (1 - prm.day_range_cap_bps / 10000.0));
    v_high := v_open * (1 + prm.day_range_cap_bps / 10000.0);

    v_exact := greatest(v_low, least(v_high, v_dyn.price_exact * (1 + v_step)));
    -- The fair value takes the same step, and stays inside the band the tick
    -- keeps it in relative to the price.
    v_fair := greatest(10, greatest(v_exact * 0.5, least(v_exact * 2, v_dyn.fair_value * (1 + v_step))));

    UPDATE public.virtual_stock_dynamics
    SET price_exact = v_exact, fair_value = v_fair, updated_at = pg_catalog.clock_timestamp()
    WHERE stock_id = v_row.id;

    v_price := pg_catalog.round(v_exact)::bigint;
    IF v_price <> v_row.current_price THEN
      -- 034's trigger writes the tick; the next second's tick folds the new
      -- price into the minute and daily candles.
      UPDATE public.virtual_stocks
      SET current_price = v_price, updated_at = pg_catalog.now()
      WHERE id = v_row.id;
      v_moved := v_moved + 1;
    END IF;
  END LOOP;

  RETURN v_moved;
END;
$$;

ALTER FUNCTION public.stock_market_apply_event_jump(uuid, text, integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_market_apply_event_jump(uuid, text, integer) FROM PUBLIC, moneyverse_app;

/**
 * 124's publisher, with the step. Everything else is unchanged: the same
 * validation, the same idempotency, the same drift and volatility from the
 * same vocabulary of three, the same audit line -- which now also says how
 * many prices the headline moved.
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
  v_moved integer;
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

  -- The headline lands: 152.
  v_moved := public.stock_market_apply_event_jump(p_stock, p_direction, p_strength);

  PERFORM public.admin_record_audit_event(
    p_actor,
    'stock.market_event.published',
    coalesce(p_stock, v_id),
    p_key,
    pg_catalog.jsonb_build_object(
      'eventId', v_id, 'stockId', p_stock, 'direction', p_direction, 'strength', p_strength,
      'hours', p_hours, 'headline', v_headline, 'source', p_source, 'pricesMoved', v_moved)
  );

  RETURN QUERY SELECT v_id, false;
END;
$$;

ALTER FUNCTION public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text)
  TO moneyverse_app;

COMMIT;
