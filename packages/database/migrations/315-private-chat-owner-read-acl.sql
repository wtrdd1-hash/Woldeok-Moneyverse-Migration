-- P1 #2053: restore private chat reads without granting raw-table access.
-- Forward-only; all member rows are scoped to the actor inside SECURITY DEFINER.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.private_chat_conversations,
  public.private_chat_messages, public.private_chat_participant_state
  FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.private_chat_list_conversations(p_actor uuid, p_limit integer)
RETURNS TABLE (
  conversation_id uuid, state text, latest_sequence text,
  last_message_at timestamptz, created_at timestamptz,
  peer_user_id uuid, peer_display_name text, peer_avatar_key text,
  last_read_sequence text, unread_count text, muted boolean,
  archived boolean, is_peer_blocked boolean, last_message_body text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'invalid chat list arguments' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'active chat member required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT c.id, c.state, c.latest_sequence::text, c.last_message_at, c.created_at,
           CASE WHEN c.participant_a_id = p_actor THEN c.participant_b_id ELSE c.participant_a_id END,
           COALESCE(mp.display_name, '회원')::text, mp.image_url,
           ps.last_read_sequence::text,
           GREATEST(0, c.latest_sequence - ps.last_read_sequence)::text,
           ps.muted, ps.archived,
           public.private_chat_is_blocked(p_actor,
             CASE WHEN c.participant_a_id = p_actor THEN c.participant_b_id ELSE c.participant_a_id END),
           (SELECT m.body FROM public.private_chat_messages m
            WHERE m.conversation_id = c.id ORDER BY m.sequence DESC LIMIT 1)
    FROM public.private_chat_conversations c
    JOIN public.private_chat_participant_state ps
      ON ps.conversation_id = c.id AND ps.user_id = p_actor
    JOIN public.users u ON u.id = CASE WHEN c.participant_a_id = p_actor THEN c.participant_b_id ELSE c.participant_a_id END
    LEFT JOIN public.member_profiles mp ON mp.user_id = u.id
    WHERE ps.archived = false
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC, c.id DESC
    LIMIT p_limit;
END;
$function$;

CREATE FUNCTION public.private_chat_list_messages(
  p_actor uuid, p_conversation uuid, p_cursor bigint, p_limit integer, p_direction text
)
RETURNS TABLE (
  id uuid, conversation_id uuid, sender_id uuid, sequence text,
  body text, created_at timestamptz, is_mine boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_limit IS NULL
     OR p_limit NOT BETWEEN 1 AND 200 OR p_direction NOT IN ('before', 'after')
     OR p_direction IS NULL OR (p_cursor IS NOT NULL AND p_cursor < 0)
     OR (p_direction = 'after' AND p_cursor IS NULL)
  THEN
    RAISE EXCEPTION 'invalid chat history arguments' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) OR NOT EXISTS (
    SELECT 1 FROM public.private_chat_conversations c
    WHERE c.id = p_conversation AND p_actor IN (c.participant_a_id, c.participant_b_id)
  ) THEN
    RAISE EXCEPTION 'chat participant required' USING ERRCODE = '42501';
  END IF;
  IF p_direction = 'before' THEN
    RETURN QUERY
      SELECT m.id, m.conversation_id, m.sender_id, m.sequence::text,
             m.body, m.created_at, (m.sender_id = p_actor)
      FROM public.private_chat_messages m
      WHERE m.conversation_id = p_conversation
        AND (p_cursor IS NULL OR m.sequence < p_cursor)
      ORDER BY m.sequence DESC LIMIT p_limit;
  ELSE
    RETURN QUERY
      SELECT m.id, m.conversation_id, m.sender_id, m.sequence::text,
             m.body, m.created_at, (m.sender_id = p_actor)
      FROM public.private_chat_messages m
      WHERE m.conversation_id = p_conversation AND m.sequence > p_cursor
      ORDER BY m.sequence ASC LIMIT p_limit;
  END IF;
END;
$function$;

CREATE FUNCTION public.private_chat_total_unread(p_actor uuid)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE v_total text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'active chat member required' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(SUM(GREATEST(0, c.latest_sequence - ps.last_read_sequence)), 0)::text
    INTO v_total
  FROM public.private_chat_conversations c
  JOIN public.private_chat_participant_state ps ON ps.conversation_id = c.id
  WHERE ps.user_id = p_actor AND ps.archived = false AND ps.muted = false;
  RETURN v_total;
END;
$function$;

CREATE FUNCTION public.private_chat_archive(p_actor uuid, p_conversation uuid, p_archived boolean)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_archived IS NULL THEN
    RAISE EXCEPTION 'invalid chat archive arguments' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) OR NOT EXISTS (
    SELECT 1 FROM public.private_chat_conversations c
    WHERE c.id = p_conversation AND p_actor IN (c.participant_a_id, c.participant_b_id)
  ) THEN
    RAISE EXCEPTION 'chat participant required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.private_chat_participant_state
  SET archived = p_archived, updated_at = pg_catalog.clock_timestamp()
  WHERE conversation_id = p_conversation AND user_id = p_actor;
  RETURN FOUND;
END;
$function$;

ALTER FUNCTION public.private_chat_list_conversations(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_list_messages(uuid, uuid, bigint, integer, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_total_unread(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_archive(uuid, uuid, boolean) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.private_chat_list_conversations(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.private_chat_list_messages(uuid, uuid, bigint, integer, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.private_chat_total_unread(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.private_chat_archive(uuid, uuid, boolean) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.private_chat_list_conversations(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.private_chat_list_messages(uuid, uuid, bigint, integer, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.private_chat_total_unread(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.private_chat_archive(uuid, uuid, boolean) TO moneyverse_app;
COMMIT;
