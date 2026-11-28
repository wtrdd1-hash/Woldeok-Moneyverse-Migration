-- Migration 354: indexes for the market-history retention prune.
--
-- stock_market_live_tick (124) deletes ticks older than 2 days and minute candles older than
-- 30 days with probability 0.001 per tick. Neither table had an index leading on the filtered
-- column (ticks lead on stock_id, candles' PK leads on stock_id), so every prune sequentially
-- scanned the whole table inside the tick transaction. Production statistics on 2026-11-26:
-- virtual_stock_price_ticks had 1,761 sequential scans reading 1.39 billion tuples against 8
-- index scans; at ~6.6 ticks/s that is a full scan of ~1.1M rows roughly every 2.5 minutes.
-- Isolated synthetic sandbox at production scale: deleting the steady-state 1,010 expired rows
-- read 918,583 rows (106 ms, ~18k buffers) before this index.
--
-- Rejected: moving the prune into a separate scheduled batch. It would change 124's function
-- body (copied, 200 lines) for no further gain once the delete is an index range scan; the
-- prune already runs rarely and deletes a small, contiguous range.
-- Rejected: CREATE INDEX CONCURRENTLY. The runner applies each file inside a transaction;
-- building these on ~250 MB / ~100 MB blocks inserts into the two history tables for seconds,
-- which only delays market ticks (they retry next second) and touches no money table.

BEGIN;

CREATE INDEX IF NOT EXISTS virtual_stock_price_ticks_recorded_at_idx
  ON public.virtual_stock_price_ticks (recorded_at);

CREATE INDEX IF NOT EXISTS virtual_stock_minute_candles_bucket_at_idx
  ON public.virtual_stock_minute_candles (bucket_at);

COMMIT;

ANALYZE public.virtual_stock_price_ticks;
ANALYZE public.virtual_stock_minute_candles;
