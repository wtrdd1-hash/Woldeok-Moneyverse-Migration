-- Migration: 229-stock-market-overview-halt-visibility.sql
-- Implements STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.ko.md (v2026.09.21.315)
-- Retains halted stocks in stock_market_overview with their authoritative halt_status,
-- ensuring /stocks/[symbol] and /stocks can display halt banners and settlement receipts without 404s.

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
  halt_status text,
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
    coalesce(stock.halt_status, 'ACTIVE')::text,
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
  WHERE stock.active OR stock.halt_status IN ('HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED')
  ORDER BY
    CASE WHEN stock.halt_status = 'HALTED_SETTLED' THEN 1 ELSE 0 END,
    stock.symbol;
$$;

ALTER FUNCTION public.stock_market_overview() OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.stock_market_overview() TO moneyverse_app;
