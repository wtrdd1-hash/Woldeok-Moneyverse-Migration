-- v2026.10.14.622: low-impact cleanup lookup and high-churn outbox maintenance.
-- The outbox remains append/dispatch authoritative: this migration never deletes rows.
-- CREATE INDEX CONCURRENTLY intentionally runs outside a transaction, so
-- delivery inserts/updates are not blocked behind a table-rewrite lock.
SET lock_timeout = '3s';
SET statement_timeout = '5min';

CREATE INDEX CONCURRENTLY IF NOT EXISTS outbox_events_delivered_retention_idx
  ON public.outbox_events (delivered_at, id)
  WHERE delivered_at IS NOT NULL;

RESET statement_timeout;
RESET lock_timeout;

-- With ~267k live and ~47k dead rows, default 20% vacuum scaling delays
-- reclamation; 5% + 1000 wakes maintenance sooner without global changes.
BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.outbox_events SET (
  autovacuum_vacuum_threshold = 1000,
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_threshold = 1000,
  autovacuum_analyze_scale_factor = 0.05
);
COMMIT;

ANALYZE public.outbox_events;
