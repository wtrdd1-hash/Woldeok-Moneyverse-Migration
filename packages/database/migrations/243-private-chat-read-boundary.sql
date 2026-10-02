-- 243-private-chat-read-boundary.sql
-- Update version: v2026.10.02.506
-- P0: restore private-chat reads/archive through least-privilege SECURITY DEFINER contracts.
-- Direct table access remains revoked from moneyverse_app.

BEGIN;

REVOKE ALL ON public.private_chat_conversations,
              public.private_chat_messages,
              public.private_chat_participant_state
FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.private_chat_list_conversations(
  p_actor uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  conversation_id uuid,
  state text,
  latest_sequence bigint,
  last_message_at timestamptz,
  created_at timestamptz,
  peer_user_id uuid,
  peer_display_name text,
  peer_avatar_key text,
  last_read_sequence bigint,
  unread_count bigint,
  muted boolean,
  archived boolean,
  last_message_body text,
  is_peer_blocked boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := greatest(1, least(coalesce(p_limit, 50), 100));
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS actor
    WHERE actor.id = p_actor
      AND actor.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.state,
    c.latest_sequence,
    c.last_message_at,
    c.created_at,
    peer.peer_user_id,
    coalesce(public.member_public_name(peer.peer_user_id), '회원'),
    CASE
      WHEN public.member_field_visible(
        coalesce(profile.visibility, 'members'::public.profile_visibility),
        coalesce(profile.field_visibility, '{}'::jsonb),
        'imageUrl',
        false,
        true
      )
      THEN profile.image_url
      ELSE NULL
    END,
    ps.last_read_sequence,
    greatest(0::bigint, c.latest_sequence - ps.last_read_sequence),
    ps.muted,
    ps.archived,
    (
      SELECT message.body
      FROM public.private_chat_messages AS message
      WHERE message.conversation_id = c.id
      ORDER BY message.sequence DESC
      LIMIT 1
    ),
    public.private_chat_is_blocked(p_actor, peer.peer_user_id)
  FROM public.private_chat_conversations AS c
  JOIN public.private_chat_participant_state AS ps
    ON ps.conversation_id = c.id
   AND ps.user_id = p_actor
  CROSS JOIN LATERAL (
    SELECT CASE
      WHEN c.participant_a_id = p_actor THEN c.participant_b_id
      ELSE c.participant_a_id
    END AS peer_user_id
  ) AS peer
  LEFT JOIN public.member_profiles AS profile
    ON profile.user_id = peer.peer_user_id
  WHERE ps.archived = false
  ORDER BY coalesce(c.last_message_at, c.created_at) DESC
  LIMIT v_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.private_chat_list_messages(
  p_actor uuid,
  p_conversation uuid,
  p_limit integer DEFAULT 50,
  p_before_sequence bigint DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  sequence bigint,
  body text,
  created_at timestamptz,
  is_mine boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := greatest(1, least(coalesce(p_limit, 50), 100));
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL
     OR (p_before_sequence IS NOT NULL AND p_before_sequence < 0) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid chat history request';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.private_chat_conversations AS c
    WHERE c.id = p_conversation
      AND p_actor IN (c.participant_a_id, c.participant_b_id)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'conversation membership required';
  END IF;

  RETURN QUERY
  SELECT
    message.id,
    message.conversation_id,
    message.sender_id,
    message.sequence,
    message.body,
    message.created_at,
    message.sender_id = p_actor
  FROM public.private_chat_messages AS message
  WHERE message.conversation_id = p_conversation
    AND (p_before_sequence IS NULL OR message.sequence < p_before_sequence)
  ORDER BY message.sequence DESC
  LIMIT v_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.private_chat_sync_messages(
  p_actor uuid,
  p_conversation uuid,
  p_since_sequence bigint DEFAULT 0,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  sequence bigint,
  body text,
  created_at timestamptz,
  is_mine boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := greatest(1, least(coalesce(p_limit, 100), 200));
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR coalesce(p_since_sequence, 0) < 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid chat sync request';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.private_chat_conversations AS c
    WHERE c.id = p_conversation
      AND p_actor IN (c.participant_a_id, c.participant_b_id)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'conversation membership required';
  END IF;

  RETURN QUERY
  SELECT
    message.id,
    message.conversation_id,
    message.sender_id,
    message.sequence,
    message.body,
    message.created_at,
    message.sender_id = p_actor
  FROM public.private_chat_messages AS message
  WHERE message.conversation_id = p_conversation
    AND message.sequence > coalesce(p_since_sequence, 0)
  ORDER BY message.sequence ASC
  LIMIT v_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.private_chat_archive(
  p_actor uuid,
  p_conversation uuid,
  p_archived boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_archived IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid archive request';
  END IF;

  UPDATE public.private_chat_participant_state AS state
  SET archived = p_archived,
      updated_at = pg_catalog.clock_timestamp()
  WHERE state.conversation_id = p_conversation
    AND state.user_id = p_actor;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'conversation membership required';
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.private_chat_total_unread(p_actor uuid)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_total bigint;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS actor
    WHERE actor.id = p_actor
      AND actor.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  SELECT coalesce(sum(greatest(0::bigint, c.latest_sequence - ps.last_read_sequence)), 0)::bigint
  INTO v_total
  FROM public.private_chat_conversations AS c
  JOIN public.private_chat_participant_state AS ps
    ON ps.conversation_id = c.id
   AND ps.user_id = p_actor
  WHERE ps.archived = false
    AND ps.muted = false;

  RETURN coalesce(v_total, 0);
END;
$$;

ALTER FUNCTION public.private_chat_list_conversations(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_list_messages(uuid, uuid, integer, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_sync_messages(uuid, uuid, bigint, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_archive(uuid, uuid, boolean) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_total_unread(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.private_chat_list_conversations(uuid, integer),
                       public.private_chat_list_messages(uuid, uuid, integer, bigint),
                       public.private_chat_sync_messages(uuid, uuid, bigint, integer),
                       public.private_chat_archive(uuid, uuid, boolean),
                       public.private_chat_total_unread(uuid)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.private_chat_list_conversations(uuid, integer),
                          public.private_chat_list_messages(uuid, uuid, integer, bigint),
                          public.private_chat_sync_messages(uuid, uuid, bigint, integer),
                          public.private_chat_archive(uuid, uuid, boolean),
                          public.private_chat_total_unread(uuid)
TO moneyverse_app;

COMMIT;
