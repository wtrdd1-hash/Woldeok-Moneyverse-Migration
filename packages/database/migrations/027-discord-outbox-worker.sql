CREATE OR REPLACE FUNCTION public.outbox_claim_pending(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid,event_type text,payload jsonb) LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  RETURN QUERY WITH claimed AS (
    SELECT e.id FROM public.outbox_events e WHERE e.delivered_at IS NULL ORDER BY e.created_at FOR UPDATE SKIP LOCKED LIMIT greatest(1,least(p_limit,100))
  ) SELECT e.id,e.type,e.payload FROM public.outbox_events e JOIN claimed c ON c.id=e.id;
END $$;
CREATE OR REPLACE FUNCTION public.outbox_mark_delivered(p_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  UPDATE public.outbox_events SET delivered_at=coalesce(delivered_at,now()) WHERE id=p_id RETURNING true
$$;
GRANT EXECUTE ON FUNCTION public.outbox_claim_pending(integer),public.outbox_mark_delivered(uuid) TO moneyverse_app;
