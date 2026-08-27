-- A row lock held only for a SELECT statement is released before the worker
-- sends its Discord request.  Persist a short delivery lease instead so two
-- workers cannot deliver the same event concurrently.
ALTER TABLE public.outbox_events
  ADD COLUMN IF NOT EXISTS delivery_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_locked_until timestamptz;

CREATE INDEX IF NOT EXISTS outbox_events_pending_delivery_idx
  ON public.outbox_events (created_at)
  WHERE delivered_at IS NULL;

CREATE OR REPLACE FUNCTION public.outbox_claim_pending(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid,event_type text,payload jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT event.id
    FROM public.outbox_events AS event
    WHERE event.delivered_at IS NULL
      AND (event.delivery_locked_until IS NULL OR event.delivery_locked_until < pg_catalog.clock_timestamp())
    ORDER BY event.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT pg_catalog.greatest(1, pg_catalog.least(p_limit, 100))
  ), claimed AS (
    UPDATE public.outbox_events AS event
    SET delivery_attempts = event.delivery_attempts + 1,
        delivery_locked_until = pg_catalog.clock_timestamp() + interval '2 minutes'
    FROM candidates
    WHERE event.id = candidates.id
    RETURNING event.id, event.type, event.payload
  )
  SELECT claimed.id, claimed.type, claimed.payload FROM claimed;
END $$;

CREATE OR REPLACE FUNCTION public.outbox_mark_delivered(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  UPDATE public.outbox_events
  SET delivered_at = coalesce(delivered_at, pg_catalog.clock_timestamp()),
      delivery_locked_until = NULL
  WHERE id = p_id
  RETURNING true
$$;

CREATE OR REPLACE FUNCTION public.outbox_release_claim(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  UPDATE public.outbox_events
  SET delivery_locked_until = NULL
  WHERE id = p_id AND delivered_at IS NULL
  RETURNING true
$$;

REVOKE ALL ON FUNCTION public.outbox_claim_pending(integer), public.outbox_mark_delivered(uuid), public.outbox_release_claim(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.outbox_claim_pending(integer), public.outbox_mark_delivered(uuid), public.outbox_release_claim(uuid) TO moneyverse_app;
