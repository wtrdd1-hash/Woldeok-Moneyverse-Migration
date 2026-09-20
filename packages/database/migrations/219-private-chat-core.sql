-- 219-private-chat-core.sql
-- Update version: v2026.09.20.311
-- P0 CHAT-305-02: authoritative one-to-one conversation/message persistence.
-- Forward-only: private tables, least-privilege SECURITY DEFINER contracts.

BEGIN;

CREATE TABLE public.private_chat_conversations (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  participant_a_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  participant_b_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','restricted','closed')),
  policy_version text NOT NULL DEFAULT 'v2026.09.20.305',
  latest_sequence bigint NOT NULL DEFAULT 0 CHECK (latest_sequence >= 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  last_message_at timestamptz,
  CHECK (participant_a_id <> participant_b_id),
  CHECK (participant_a_id::text < participant_b_id::text),
  UNIQUE (participant_a_id, participant_b_id)
);

CREATE TABLE public.private_chat_messages (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.private_chat_conversations(id) ON DELETE RESTRICT,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  sequence bigint NOT NULL CHECK (sequence > 0),
  idempotency_key uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000 AND body !~ '[[:cntrl:]]'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  UNIQUE (conversation_id, sequence),
  UNIQUE (conversation_id, sender_id, idempotency_key)
);

CREATE TABLE public.private_chat_participant_state (
  conversation_id uuid NOT NULL REFERENCES public.private_chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  last_read_sequence bigint NOT NULL DEFAULT 0 CHECK (last_read_sequence >= 0),
  muted boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX private_chat_conversation_recency_idx ON public.private_chat_conversations(last_message_at DESC NULLS LAST, id);
CREATE INDEX private_chat_message_history_idx ON public.private_chat_messages(conversation_id, sequence DESC);

REVOKE ALL ON public.private_chat_conversations, public.private_chat_messages, public.private_chat_participant_state FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.private_chat_open(p_actor uuid, p_peer uuid)
RETURNS TABLE(conversation_id uuid, latest_sequence bigint, state text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_a uuid; v_b uuid; v_id uuid;
BEGIN
  IF p_actor IS NULL OR p_peer IS NULL OR p_actor = p_peer
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_actor AND u.status='active'::public.user_status)
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_peer AND u.status='active'::public.user_status)
  THEN RAISE EXCEPTION USING ERRCODE='28000'; END IF;
  IF p_actor::text < p_peer::text THEN v_a:=p_actor; v_b:=p_peer; ELSE v_a:=p_peer; v_b:=p_actor; END IF;
  INSERT INTO public.private_chat_conversations(participant_a_id,participant_b_id)
    VALUES(v_a,v_b) ON CONFLICT(participant_a_id,participant_b_id) DO NOTHING;
  SELECT c.id INTO v_id FROM public.private_chat_conversations c WHERE c.participant_a_id=v_a AND c.participant_b_id=v_b;
  INSERT INTO public.private_chat_participant_state(conversation_id,user_id) VALUES(v_id,p_actor),(v_id,p_peer) ON CONFLICT DO NOTHING;
  RETURN QUERY SELECT c.id,c.latest_sequence,c.state FROM public.private_chat_conversations c WHERE c.id=v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.private_chat_send(p_actor uuid,p_conversation uuid,p_key uuid,p_body text)
RETURNS TABLE(message_id uuid, sequence bigint, body text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_seq bigint; v_id uuid; v_existing_body text;
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_key IS NULL OR p_body IS NULL
     OR char_length(p_body) NOT BETWEEN 1 AND 2000 OR p_body ~ '[[:cntrl:]]'
  THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;
  PERFORM 1 FROM public.private_chat_conversations c WHERE c.id=p_conversation AND c.state='active' AND p_actor IN(c.participant_a_id,c.participant_b_id) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='42501'; END IF;
  SELECT m.id,m.body INTO v_id,v_existing_body FROM public.private_chat_messages m WHERE m.conversation_id=p_conversation AND m.sender_id=p_actor AND m.idempotency_key=p_key;
  IF FOUND THEN
    IF v_existing_body <> p_body THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;
  ELSE
    UPDATE public.private_chat_conversations SET latest_sequence=latest_sequence+1,last_message_at=pg_catalog.clock_timestamp() WHERE id=p_conversation RETURNING latest_sequence INTO v_seq;
    INSERT INTO public.private_chat_messages(conversation_id,sender_id,sequence,idempotency_key,body) VALUES(p_conversation,p_actor,v_seq,p_key,p_body) RETURNING id INTO v_id;
  END IF;
  RETURN QUERY SELECT m.id,m.sequence,m.body,m.created_at FROM public.private_chat_messages m WHERE m.id=v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.private_chat_read(p_actor uuid,p_conversation uuid,p_sequence bigint)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_latest bigint; v_read bigint;
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_sequence IS NULL OR p_sequence < 0 THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;
  SELECT c.latest_sequence INTO v_latest FROM public.private_chat_conversations c WHERE c.id=p_conversation AND p_actor IN(c.participant_a_id,c.participant_b_id);
  IF NOT FOUND OR p_sequence > v_latest THEN RAISE EXCEPTION USING ERRCODE='42501'; END IF;
  UPDATE public.private_chat_participant_state SET last_read_sequence=GREATEST(last_read_sequence,p_sequence),updated_at=pg_catalog.clock_timestamp() WHERE conversation_id=p_conversation AND user_id=p_actor RETURNING last_read_sequence INTO v_read;
  RETURN v_read;
END; $$;

ALTER FUNCTION public.private_chat_open(uuid,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_send(uuid,uuid,uuid,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_read(uuid,uuid,bigint) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.private_chat_open(uuid,uuid), public.private_chat_send(uuid,uuid,uuid,text), public.private_chat_read(uuid,uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.private_chat_open(uuid,uuid), public.private_chat_send(uuid,uuid,uuid,text), public.private_chat_read(uuid,uuid,bigint) TO moneyverse_app;

COMMIT;
