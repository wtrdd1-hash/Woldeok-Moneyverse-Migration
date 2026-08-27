-- Delivery diagnostics are available only to an active approver.  Do not
-- expose event payloads here: they can contain transaction-specific details.
CREATE OR REPLACE FUNCTION public.admin_recent_discord_outbox_events(
  p_actor uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  event_id uuid,
  event_type text,
  created_at timestamptz,
  delivered_at timestamptz,
  delivery_attempts integer,
  delivery_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'limit must be between 1 and 100';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles AS role
    JOIN public.users AS user_row ON user_row.id = role.user_id
    WHERE role.user_id = p_actor
      AND role.role = 'approver'::public.admin_role
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'approver role required';
  END IF;

  RETURN QUERY
  SELECT event.id,
         event.type,
         event.created_at,
         event.delivered_at,
         event.delivery_attempts,
         CASE
           WHEN event.delivered_at IS NOT NULL THEN 'delivered'
           WHEN event.delivery_locked_until IS NOT NULL
                AND event.delivery_locked_until >= pg_catalog.clock_timestamp() THEN 'delivering'
           WHEN event.delivery_attempts > 0 THEN 'retry_pending'
           ELSE 'pending'
         END
  FROM public.outbox_events AS event
  ORDER BY event.created_at DESC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_recent_discord_outbox_events(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_recent_discord_outbox_events(uuid, integer) TO moneyverse_app;
