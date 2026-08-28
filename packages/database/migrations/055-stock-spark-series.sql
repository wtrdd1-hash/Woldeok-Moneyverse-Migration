-- The market screen's preview lines, in one round trip.
--
-- The page drew one sparkline per card and fetched each card's series with
-- its own call to stock_price_history. That is one query per listed stock on
-- every render of the page, and the page re-renders itself every thirty
-- seconds while it is open, so the cost of listing a stock was a permanent
-- addition to the cost of the screen. Ten stocks and twenty readers is two
-- hundred queries a minute for a decoration.
--
-- This returns the same points for every listed stock at once. Only the
-- prices travel: the line has no time axis -- it is answering "which way has
-- this been going" and nothing finer -- so the timestamps were being fetched
-- and discarded.
--
-- SECURITY DEFINER for the same reason stock_price_history is:
-- 023-virtual-stock-game.sql revoked virtual_stock_price_ticks from
-- moneyverse_app, and 034 supplies the read through a function instead.

CREATE OR REPLACE FUNCTION public.stock_spark_series(p_limit integer DEFAULT 40)
RETURNS TABLE(stock_id uuid, prices bigint[])
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT stock.id,
         -- A stock listed a moment ago has no ticks yet. An empty array is
         -- the honest answer and the chart already draws nothing for it; a
         -- NULL would make the caller decide what that meant.
         coalesce(recent.prices, ARRAY[]::bigint[])
  FROM public.virtual_stocks AS stock
  LEFT JOIN LATERAL (
    SELECT array_agg(tick.price ORDER BY tick.recorded_at DESC, tick.id DESC) AS prices
    FROM (
      SELECT candidate.price, candidate.recorded_at, candidate.id
      FROM public.virtual_stock_price_ticks AS candidate
      WHERE candidate.stock_id = stock.id
      ORDER BY candidate.recorded_at DESC, candidate.id DESC
      LIMIT greatest(1, least(coalesce(p_limit, 40), 240))
    ) AS tick
  ) AS recent ON true
  WHERE stock.active
  ORDER BY stock.symbol
$$;

ALTER FUNCTION public.stock_spark_series(integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_spark_series(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_spark_series(integer) TO moneyverse_app;
