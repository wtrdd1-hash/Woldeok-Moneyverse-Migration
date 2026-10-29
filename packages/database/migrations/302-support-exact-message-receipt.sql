-- Read-only owner receipt for long support threads. The legacy 200-message list
-- remains unchanged; a receipt is identified by immutable message UUID.
CREATE OR REPLACE FUNCTION public.support_my_message_receipt(
  p_actor uuid, p_thread uuid, p_message uuid
)
RETURNS TABLE(message_id uuid, sender_kind text, body text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_thread IS NULL OR p_message IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid support message receipt';
  END IF;

  -- Ownership is checked before message existence to avoid a cross-member oracle.
  IF NOT EXISTS (
    SELECT 1 FROM public.support_threads t
    WHERE t.id = p_thread AND t.user_id = p_actor
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'support thread not available';
  END IF;

  RETURN QUERY
    SELECT m.id, m.sender_kind, m.body, m.created_at
    FROM public.support_messages m
    WHERE m.thread_id = p_thread AND m.id = p_message;
END $$;

ALTER FUNCTION public.support_my_message_receipt(uuid,uuid,uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.support_my_message_receipt(uuid,uuid,uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.support_my_message_receipt(uuid,uuid,uuid)
  TO moneyverse_app;

-- The new read path must not expand direct table access.
REVOKE ALL PRIVILEGES ON TABLE public.support_threads, public.support_messages
  FROM PUBLIC, moneyverse_app;
