-- The market screen's preview line, over an hour rather than over forty ticks.
--
-- 055 built the line from `virtual_stock_price_ticks`: the last forty rows in
-- which a stock's rounded price changed. Under 052's walk that was minutes.
-- Under 124 the price moves a fraction of a percent every second, so a stock
-- priced in tens of thousands changes its rounded price on nearly every tick
-- and forty of them are forty seconds. The line is then normalised to its own
-- extremes, so forty seconds of Gaussian noise -- a few hundredths of a
-- percent -- was stretched over the full height of the figure and drawn as a
-- saw. Reported as the price algorithm having gone wrong: the walk was doing
-- what 124 designed it to do, and the picture of it was not.
--
-- The closes of the last N one-minute candles are a window that does not
-- depend on any of that: one point a minute whatever the stock costs and
-- however often it ticks, sixty of them to the hour, and the same hour on
-- every card of the screen. The minute candles are written by the same tick
-- (053, 124) and pruned at thirty days, so nothing new has to be kept.
--
-- A stock whose market was halted, or whose ticker was down, has no candles
-- for those minutes and the line simply has fewer points. That is what a
-- figure with no time axis can say about a gap, and it is why the detail
-- chart -- which has one -- is where the finer question goes.
--
-- Same signature and same shape, so the API and its callers are unchanged.

BEGIN;

CREATE OR REPLACE FUNCTION public.stock_spark_series(p_limit integer DEFAULT 60)
RETURNS TABLE(stock_id uuid, prices bigint[])
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT stock.id,
         -- A stock listed a moment ago has no candle yet. An empty array is
         -- the honest answer and the line already draws nothing for it; a
         -- NULL would make the caller decide what that meant.
         coalesce(recent.prices, ARRAY[]::bigint[])
  FROM public.virtual_stocks AS stock
  LEFT JOIN LATERAL (
    SELECT array_agg(candle.close_price ORDER BY candle.bucket_at DESC) AS prices
    FROM (
      SELECT candidate.close_price, candidate.bucket_at
      FROM public.virtual_stock_minute_candles AS candidate
      WHERE candidate.stock_id = stock.id
      ORDER BY candidate.bucket_at DESC
      LIMIT greatest(1, least(coalesce(p_limit, 60), 240))
    ) AS candle
  ) AS recent ON true
  WHERE stock.active
  ORDER BY stock.symbol
$$;

-- 055's grants, restated: the minute candles are revoked from the application
-- role by 053, and this function is how that role reads them.
ALTER FUNCTION public.stock_spark_series(integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_spark_series(integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_spark_series(integer) TO moneyverse_app;

COMMIT;
