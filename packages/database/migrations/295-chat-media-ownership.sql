-- 291: P0 chat media ownership/recipient visibility; forward-only and no ledger mutation.
-- New 291 migration: 286 is already applied as privacy-request-returning-binding. Never rewrite it.
BEGIN;

CREATE TABLE public.chat_media_registry (
  storage_key text PRIMARY KEY
    CHECK (storage_key ~ '^chat_[0-9a-f-]{36}[.](png|jpg|webp|gif)$'),
  owner_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
CREATE INDEX chat_media_registry_owner_idx ON public.chat_media_registry(owner_user_id, created_at DESC);
REVOKE ALL ON TABLE public.chat_media_registry FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.chat_media_register(p_actor uuid, p_key text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_key IS NULL
     OR p_key !~ '^chat_[0-9a-f-]{36}[.](png|jpg|webp|gif)$'
     OR NOT EXISTS (
       SELECT 1 FROM public.users u
       WHERE u.id = p_actor AND u.status = 'active'::public.user_status
     )
  THEN RETURN false; END IF;

  INSERT INTO public.chat_media_registry(storage_key, owner_user_id)
  VALUES(p_key, p_actor) ON CONFLICT(storage_key) DO NOTHING;
  RETURN EXISTS (
    SELECT 1 FROM public.chat_media_registry r
    WHERE r.storage_key = p_key AND r.owner_user_id = p_actor
  );
END $$;

-- A sender may share only an image registered to that same sender. A stranger
-- cannot obtain access by pasting a leaked key into a conversation of their own.
-- Support operators must also hold a live, unlocked administrator console
-- session; a member login with an admin role is not sufficient.
CREATE FUNCTION public.chat_media_visible(p_actor uuid, p_key text, p_session uuid)
RETURNS boolean
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_owner uuid;
  v_admin_state text;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = p_actor AND u.status = 'active'::public.user_status)
  THEN RETURN false; END IF;

  SELECT r.owner_user_id INTO v_owner
  FROM public.chat_media_registry r WHERE r.storage_key = p_key;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_owner = p_actor THEN RETURN true; END IF;

  IF EXISTS (
    SELECT 1 FROM public.private_chat_messages m
    JOIN public.private_chat_conversations c ON c.id = m.conversation_id
    WHERE m.sender_id = v_owner
      AND p_actor IN (c.participant_a_id, c.participant_b_id)
      AND c.state <> 'closed'
      AND pg_catalog.strpos(m.body, '/api/v1/content/chat/media/' || p_key) > 0
  ) THEN RETURN true; END IF;

  IF EXISTS (
    SELECT 1 FROM public.support_messages m
    JOIN public.support_threads t ON t.id = m.thread_id
    WHERE m.sender_user_id = v_owner
      AND t.user_id = p_actor
      AND pg_catalog.strpos(m.body, '/api/v1/content/chat/media/' || p_key) > 0
  ) THEN RETURN true; END IF;

  IF p_session IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor))
     AND EXISTS (
       SELECT 1 FROM public.support_messages m
       WHERE m.sender_user_id = v_owner
         AND pg_catalog.strpos(m.body, '/api/v1/content/chat/media/' || p_key) > 0
     )
  THEN
    SELECT state INTO v_admin_state FROM public.admin_session_touch(p_session, p_actor);
    RETURN v_admin_state = 'open';
  END IF;
  RETURN false;
END $$;

ALTER FUNCTION public.chat_media_register(uuid,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.chat_media_visible(uuid,text,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.chat_media_register(uuid,text), public.chat_media_visible(uuid,text,uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.chat_media_register(uuid,text), public.chat_media_visible(uuid,text,uuid) TO moneyverse_app;
COMMIT;
