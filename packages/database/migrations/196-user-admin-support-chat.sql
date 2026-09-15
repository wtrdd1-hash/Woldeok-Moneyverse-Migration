-- v2026.09.15.122 — persistent user <-> administrator support chat.
-- Lobby chat remains ephemeral; support conversations are retained because
-- users and operators need a durable record of questions and replies.

CREATE TABLE public.support_threads (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  subject text NOT NULL CHECK (pg_catalog.char_length(subject) BETWEEN 1 AND 120),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','waiting_user','resolved')),
  create_key uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  last_message_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX support_threads_user_recent_idx
  ON public.support_threads(user_id, last_message_at DESC, id DESC);
CREATE INDEX support_threads_admin_queue_idx
  ON public.support_threads(status, last_message_at DESC, id DESC);

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.support_threads(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES public.users(id),
  sender_kind text NOT NULL CHECK (sender_kind IN ('user','admin')),
  body text NOT NULL CHECK (pg_catalog.char_length(body) BETWEEN 1 AND 2000),
  idempotency_key uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX support_messages_thread_idx
  ON public.support_messages(thread_id, created_at ASC, id ASC);

REVOKE ALL PRIVILEGES ON TABLE public.support_threads, public.support_messages
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.support_create_thread(
  p_actor uuid, p_key uuid, p_subject text, p_body text
)
RETURNS TABLE(thread_id uuid, status text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_subject text := pg_catalog.btrim(coalesce(p_subject,''));
  v_body text := pg_catalog.btrim(coalesce(p_body,''));
  v_thread uuid;
  v_created timestamptz;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL OR pg_catalog.char_length(v_subject) NOT BETWEEN 1 AND 120
     OR pg_catalog.char_length(v_body) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid support thread';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_actor AND u.status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active member required';
  END IF;

  SELECT t.id, t.created_at INTO v_thread, v_created
  FROM public.support_threads t WHERE t.create_key=p_key;
  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM public.support_threads t WHERE t.id=v_thread AND t.user_id=p_actor) THEN
      RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='support receipt belongs to another member';
    END IF;
    RETURN QUERY SELECT v_thread, t.status, v_created FROM public.support_threads t WHERE t.id=v_thread;
    RETURN;
  END IF;

  INSERT INTO public.support_threads(user_id,subject,create_key)
  VALUES(p_actor,v_subject,p_key)
  RETURNING id, support_threads.created_at INTO v_thread, v_created;

  INSERT INTO public.support_messages(thread_id,sender_user_id,sender_kind,body,idempotency_key)
  VALUES(v_thread,p_actor,'user',v_body,p_key);

  RETURN QUERY SELECT v_thread, 'open'::text, v_created;
END $$;

CREATE OR REPLACE FUNCTION public.support_my_threads(p_actor uuid, p_limit integer DEFAULT 50)
RETURNS TABLE(thread_id uuid, subject text, status text, created_at timestamptz, updated_at timestamptz, last_message_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT t.id,t.subject,t.status,t.created_at,t.updated_at,t.last_message_at
  FROM public.support_threads t
  WHERE t.user_id=p_actor
  ORDER BY t.last_message_at DESC,t.id DESC
  LIMIT greatest(1,least(coalesce(p_limit,50),100))
$$;

CREATE OR REPLACE FUNCTION public.support_thread_messages(p_actor uuid, p_thread uuid, p_limit integer DEFAULT 200)
RETURNS TABLE(message_id uuid, sender_kind text, body text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.support_threads t WHERE t.id=p_thread AND t.user_id=p_actor) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='support thread not available';
  END IF;
  RETURN QUERY
  SELECT m.id,m.sender_kind,m.body,m.created_at
  FROM public.support_messages m WHERE m.thread_id=p_thread
  ORDER BY m.created_at ASC,m.id ASC
  LIMIT greatest(1,least(coalesce(p_limit,200),500));
END $$;

CREATE OR REPLACE FUNCTION public.support_add_message(p_actor uuid, p_key uuid, p_thread uuid, p_body text)
RETURNS TABLE(message_id uuid, sender_kind text, body text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_body text := pg_catalog.btrim(coalesce(p_body,'')); v_id uuid; v_at timestamptz;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL OR p_thread IS NULL OR pg_catalog.char_length(v_body) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid support message';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.support_threads t WHERE t.id=p_thread AND t.user_id=p_actor) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='support thread not available';
  END IF;
  SELECT m.id,m.created_at INTO v_id,v_at FROM public.support_messages m WHERE m.idempotency_key=p_key;
  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM public.support_messages m WHERE m.id=v_id AND m.thread_id=p_thread AND m.sender_user_id=p_actor AND m.sender_kind='user' AND m.body=v_body) THEN
      RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='idempotency key reused with different support message';
    END IF;
    RETURN QUERY SELECT v_id,m.sender_kind,m.body,v_at FROM public.support_messages m WHERE m.id=v_id;
    RETURN;
  END IF;
  INSERT INTO public.support_messages(thread_id,sender_user_id,sender_kind,body,idempotency_key)
  VALUES(p_thread,p_actor,'user',v_body,p_key) RETURNING id,support_messages.created_at INTO v_id,v_at;
  UPDATE public.support_threads SET status='open',updated_at=v_at,last_message_at=v_at WHERE id=p_thread;
  RETURN QUERY SELECT v_id,'user'::text,v_body,v_at;
END $$;

CREATE OR REPLACE FUNCTION public.admin_support_threads(p_actor uuid, p_status text DEFAULT NULL, p_limit integer DEFAULT 100)
RETURNS TABLE(thread_id uuid, user_id uuid, display_name text, subject text, status text, created_at timestamptz, last_message_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator role required';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('open','waiting_user','resolved') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid support status';
  END IF;
  RETURN QUERY
  SELECT t.id,t.user_id,coalesce(i.display_name,'회원'),t.subject,t.status,t.created_at,t.last_message_at
  FROM public.support_threads t
  LEFT JOIN LATERAL (
    SELECT x.display_name FROM public.identities x WHERE x.user_id=t.user_id ORDER BY x.id LIMIT 1
  ) i ON true
  WHERE p_status IS NULL OR t.status=p_status
  ORDER BY CASE WHEN t.status='open' THEN 0 WHEN t.status='waiting_user' THEN 1 ELSE 2 END,
           t.last_message_at DESC,t.id DESC
  LIMIT greatest(1,least(coalesce(p_limit,100),250));
END $$;

CREATE OR REPLACE FUNCTION public.admin_support_thread_messages(p_actor uuid, p_thread uuid, p_limit integer DEFAULT 500)
RETURNS TABLE(message_id uuid, sender_kind text, sender_user_id uuid, body text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator role required';
  END IF;
  RETURN QUERY SELECT m.id,m.sender_kind,m.sender_user_id,m.body,m.created_at
  FROM public.support_messages m WHERE m.thread_id=p_thread
  ORDER BY m.created_at ASC,m.id ASC
  LIMIT greatest(1,least(coalesce(p_limit,500),1000));
END $$;

CREATE OR REPLACE FUNCTION public.admin_support_reply(p_actor uuid, p_key uuid, p_thread uuid, p_body text)
RETURNS TABLE(message_id uuid, sender_kind text, body text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_body text := pg_catalog.btrim(coalesce(p_body,'')); v_id uuid; v_at timestamptz;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator role required';
  END IF;
  IF p_key IS NULL OR p_thread IS NULL OR pg_catalog.char_length(v_body) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid administrator support reply';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.support_threads t WHERE t.id=p_thread) THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='support thread not found';
  END IF;
  SELECT m.id,m.created_at INTO v_id,v_at FROM public.support_messages m WHERE m.idempotency_key=p_key;
  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM public.support_messages m WHERE m.id=v_id AND m.thread_id=p_thread AND m.sender_user_id=p_actor AND m.sender_kind='admin' AND m.body=v_body) THEN
      RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='idempotency key reused with different administrator support reply';
    END IF;
    RETURN QUERY SELECT v_id,m.sender_kind,m.body,v_at FROM public.support_messages m WHERE m.id=v_id;
    RETURN;
  END IF;
  INSERT INTO public.support_messages(thread_id,sender_user_id,sender_kind,body,idempotency_key)
  VALUES(p_thread,p_actor,'admin',v_body,p_key) RETURNING id,support_messages.created_at INTO v_id,v_at;
  UPDATE public.support_threads SET status='waiting_user',updated_at=v_at,last_message_at=v_at WHERE id=p_thread;
  PERFORM public.admin_append_audit_event(p_actor,'admin.support.replied',p_thread,p_key,
    pg_catalog.jsonb_build_object('messageId',v_id::text));
  RETURN QUERY SELECT v_id,'admin'::text,v_body,v_at;
END $$;

CREATE OR REPLACE FUNCTION public.admin_support_set_status(p_actor uuid, p_thread uuid, p_status text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator role required';
  END IF;
  IF p_status NOT IN ('open','waiting_user','resolved') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid support status';
  END IF;
  UPDATE public.support_threads SET status=p_status,updated_at=pg_catalog.clock_timestamp() WHERE id=p_thread;
  IF NOT FOUND THEN RETURN false; END IF;
  PERFORM public.admin_append_audit_event(p_actor,'admin.support.status_changed',p_thread,NULL,
    pg_catalog.jsonb_build_object('status',p_status));
  RETURN true;
END $$;

ALTER FUNCTION public.support_create_thread(uuid,uuid,text,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.support_my_threads(uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.support_thread_messages(uuid,uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.support_add_message(uuid,uuid,uuid,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_support_threads(uuid,text,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_support_thread_messages(uuid,uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_support_reply(uuid,uuid,uuid,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_support_set_status(uuid,uuid,text) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.support_create_thread(uuid,uuid,text,text),
  public.support_my_threads(uuid,integer), public.support_thread_messages(uuid,uuid,integer),
  public.support_add_message(uuid,uuid,uuid,text), public.admin_support_threads(uuid,text,integer),
  public.admin_support_thread_messages(uuid,uuid,integer), public.admin_support_reply(uuid,uuid,uuid,text),
  public.admin_support_set_status(uuid,uuid,text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.support_create_thread(uuid,uuid,text,text),
  public.support_my_threads(uuid,integer), public.support_thread_messages(uuid,uuid,integer),
  public.support_add_message(uuid,uuid,uuid,text), public.admin_support_threads(uuid,text,integer),
  public.admin_support_thread_messages(uuid,uuid,integer), public.admin_support_reply(uuid,uuid,uuid,text),
  public.admin_support_set_status(uuid,uuid,text) TO moneyverse_app;
