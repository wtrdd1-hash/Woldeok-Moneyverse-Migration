-- Route every outbox type to the sanitised logs destination, including types
-- introduced after the route table was seeded. Restore rows suppressed while
-- the production worker was being configured. Also expose only the three
-- recent unacknowledged alerts the Discord sentinel needs.

BEGIN;

CREATE OR REPLACE FUNCTION public.outbox_claim_pending(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, event_type text, channel_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS MATERIALIZED (
    SELECT event.id
    FROM public.outbox_events AS event
    WHERE event.delivered_at IS NULL
      AND event.delivery_failed_at IS NULL
      AND (event.delivery_locked_until IS NULL OR event.delivery_locked_until < clock_timestamp())
    ORDER BY event.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(p_limit, 100))
  ), resolved AS (
    SELECT event.id,
           event.type,
           coalesce((
             SELECT route.channel_key
             FROM public.discord_outbox_routes AS route
             WHERE route.event_type = event.type AND route.enabled
           ), 'logs') AS channel_key
    FROM public.outbox_events AS event
    JOIN candidates ON candidates.id = event.id
  ), claimed AS (
    UPDATE public.outbox_events AS event
    SET delivery_attempts = event.delivery_attempts + 1,
        delivery_locked_until = clock_timestamp() + interval '2 minutes'
    FROM resolved
    WHERE event.id = resolved.id
    RETURNING event.id, event.type
  )
  SELECT claimed.id, claimed.type, resolved.channel_key
  FROM claimed
  JOIN resolved ON resolved.id = claimed.id;
END;
$$;

ALTER FUNCTION public.outbox_claim_pending(integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.outbox_claim_pending(integer)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.outbox_claim_pending(integer)
  TO moneyverse_app;

UPDATE public.outbox_events
SET delivery_failed_at = NULL,
    delivery_outcome = NULL,
    last_delivery_error = NULL,
    delivery_locked_until = NULL
WHERE delivery_outcome = 'suppressed'
  AND delivered_at IS NULL;

CREATE OR REPLACE FUNCTION public.discord_recent_unacknowledged_alerts()
RETURNS TABLE(
  id uuid,
  kind text,
  severity text,
  summary text,
  raised_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT alert.id, alert.kind, alert.severity, alert.summary, alert.raised_at
  FROM public.admin_alerts AS alert
  WHERE alert.acknowledged_at IS NULL
    AND alert.raised_at > pg_catalog.clock_timestamp() - interval '1 hour'
  ORDER BY alert.raised_at DESC, alert.id DESC
  LIMIT 3
$$;

ALTER FUNCTION public.discord_recent_unacknowledged_alerts() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.discord_recent_unacknowledged_alerts()
  FROM PUBLIC, moneyverse_reconciler;
GRANT EXECUTE ON FUNCTION public.discord_recent_unacknowledged_alerts()
  TO moneyverse_app;

COMMIT;
