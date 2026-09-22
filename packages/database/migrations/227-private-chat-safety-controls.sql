-- 227-private-chat-safety-controls.sql
-- Update version: v2026.09.22.353
-- P0 CHAT-305-05: Block, Mute, Report, Evidence Snapshot and Fail-Closed Enforcement.
-- Forward-only: least-privilege SECURITY DEFINER contracts.

BEGIN;

-- 1. 회원 간 1:1 차단 테이블 (Mutual/Unilateral Safety Block)
CREATE TABLE IF NOT EXISTS public.private_chat_blocks (
  blocker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (blocker_id <> blocked_id),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS private_chat_blocks_blocked_idx ON public.private_chat_blocks(blocked_id);

-- 2. 부적절 대화 신고 및 증거 원장 (Evidence Snapshot & SLA Queue)
CREATE TABLE IF NOT EXISTS public.private_chat_reports (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reported_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  conversation_id uuid NOT NULL REFERENCES public.private_chat_conversations(id) ON DELETE RESTRICT,
  reason text NOT NULL CHECK (reason IN ('spam_promotional', 'fraud_scam', 'abuse_harassment', 'other')),
  details text NOT NULL CHECK (char_length(details) BETWEEN 2 AND 2000),
  evidence_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED')),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  actioned_at timestamptz,
  actioned_by uuid REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS private_chat_reports_status_idx ON public.private_chat_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS private_chat_reports_conversation_idx ON public.private_chat_reports(conversation_id);

REVOKE ALL ON public.private_chat_blocks, public.private_chat_reports FROM PUBLIC, moneyverse_app;

-- 3. 양방향 차단 여부 판정 함수 (Is Blocked Guard)
CREATE OR REPLACE FUNCTION public.private_chat_is_blocked(p_user_a uuid, p_user_b uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  IF p_user_a IS NULL OR p_user_b IS NULL OR p_user_a = p_user_b THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.private_chat_blocks b
    WHERE (b.blocker_id = p_user_a AND b.blocked_id = p_user_b)
       OR (b.blocker_id = p_user_b AND b.blocked_id = p_user_a)
  );
END; $$;

-- 4. 회원 차단 등록 함수 (Block User)
CREATE OR REPLACE FUNCTION public.private_chat_block(p_actor uuid, p_target uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_target IS NULL OR p_actor = p_target
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_actor AND u.status='active'::public.user_status)
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_target)
  THEN RAISE EXCEPTION USING ERRCODE='28000'; END IF;

  INSERT INTO public.private_chat_blocks(blocker_id, blocked_id)
  VALUES (p_actor, p_target)
  ON CONFLICT DO NOTHING;

  -- 감사 원장 기록
  INSERT INTO public.audit_logs (
    action, entity, actor_user_id, target_user_id, details
  ) VALUES (
    'CHAT_USER_BLOCKED',
    'private_chat_blocks',
    p_actor,
    p_target,
    jsonb_build_object('blocked_user_id', p_target, 'timestamp', pg_catalog.clock_timestamp())
  );

  RETURN true;
END; $$;

-- 5. 회원 차단 해제 함수 (Unblock User)
CREATE OR REPLACE FUNCTION public.private_chat_unblock(p_actor uuid, p_target uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_target IS NULL OR p_actor = p_target THEN
    RAISE EXCEPTION USING ERRCODE='28000';
  END IF;

  DELETE FROM public.private_chat_blocks
  WHERE blocker_id = p_actor AND blocked_id = p_target;

  -- 감사 원장 기록
  INSERT INTO public.audit_logs (
    action, entity, actor_user_id, target_user_id, details
  ) VALUES (
    'CHAT_USER_UNBLOCKED',
    'private_chat_blocks',
    p_actor,
    p_target,
    jsonb_build_object('unblocked_user_id', p_target, 'timestamp', pg_catalog.clock_timestamp())
  );

  RETURN true;
END; $$;

-- 6. 대화방 음소거(Mute) 토글 함수
CREATE OR REPLACE FUNCTION public.private_chat_mute(p_actor uuid, p_conversation uuid, p_muted boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_muted IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023';
  END IF;

  PERFORM 1 FROM public.private_chat_conversations c
  WHERE c.id = p_conversation AND p_actor IN (c.participant_a_id, c.participant_b_id);
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE='42501';
  END IF;

  UPDATE public.private_chat_participant_state
  SET muted = p_muted, updated_at = pg_catalog.clock_timestamp()
  WHERE conversation_id = p_conversation AND user_id = p_actor;

  RETURN true;
END; $$;

-- 7. 메시지 전송 프로시저 강화: 양방향 차단 시 Fail-Closed 거절
CREATE OR REPLACE FUNCTION public.private_chat_send(p_actor uuid, p_conversation uuid, p_key uuid, p_body text)
RETURNS TABLE(message_id uuid, sequence bigint, body text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE
  v_seq bigint;
  v_id uuid;
  v_existing_body text;
  v_peer uuid;
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_key IS NULL OR p_body IS NULL
     OR char_length(p_body) NOT BETWEEN 1 AND 2000 OR p_body ~ '[[:cntrl:]]'
  THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;

  SELECT CASE WHEN c.participant_a_id = p_actor THEN c.participant_b_id ELSE c.participant_a_id END
  INTO v_peer
  FROM public.private_chat_conversations c
  WHERE c.id = p_conversation AND c.state = 'active' AND p_actor IN (c.participant_a_id, c.participant_b_id)
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='42501'; END IF;

  -- 양방향 차단 가드: 둘 중 한쪽이라도 차단한 상태면 전송 불가
  IF public.private_chat_is_blocked(p_actor, v_peer) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='chat send rejected: user is blocked';
  END IF;

  SELECT m.id, m.body INTO v_id, v_existing_body
  FROM public.private_chat_messages m
  WHERE m.conversation_id = p_conversation AND m.sender_id = p_actor AND m.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_body <> p_body THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;
  ELSE
    UPDATE public.private_chat_conversations
    SET latest_sequence = latest_sequence + 1, last_message_at = pg_catalog.clock_timestamp()
    WHERE id = p_conversation
    RETURNING latest_sequence INTO v_seq;

    INSERT INTO public.private_chat_messages(conversation_id, sender_id, sequence, idempotency_key, body)
    VALUES (p_conversation, p_actor, v_seq, p_key, p_body)
    RETURNING id INTO v_id;
  END IF;

  RETURN QUERY SELECT m.id, m.sequence, m.body, m.created_at
  FROM public.private_chat_messages m
  WHERE m.id = v_id;
END; $$;

-- 8. 대화 신고 및 최근 메시지 증거 스냅샷 캡처 함수 (Report & Evidence Snapshot)
CREATE OR REPLACE FUNCTION public.private_chat_report(
  p_actor uuid,
  p_conversation uuid,
  p_reason text,
  p_details text
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE
  v_peer uuid;
  v_snapshot jsonb;
  v_report_id uuid;
BEGIN
  IF p_actor IS NULL OR p_conversation IS NULL OR p_reason IS NULL OR p_details IS NULL
     OR p_reason NOT IN ('spam_promotional', 'fraud_scam', 'abuse_harassment', 'other')
     OR char_length(p_details) NOT BETWEEN 2 AND 2000
  THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;

  SELECT CASE WHEN c.participant_a_id = p_actor THEN c.participant_b_id ELSE c.participant_a_id END
  INTO v_peer
  FROM public.private_chat_conversations c
  WHERE c.id = p_conversation AND p_actor IN (c.participant_a_id, c.participant_b_id);

  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='42501'; END IF;

  -- 최근 최대 10개 메시지를 증거 스냅샷으로 캡처
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'sender_id', m.sender_id,
        'sequence', m.sequence,
        'body', m.body,
        'created_at', m.created_at
      ) ORDER BY m.sequence ASC
    ),
    '[]'::jsonb
  ) INTO v_snapshot
  FROM (
    SELECT * FROM public.private_chat_messages
    WHERE conversation_id = p_conversation
    ORDER BY sequence DESC
    LIMIT 10
  ) m;

  INSERT INTO public.private_chat_reports (
    reporter_id, reported_user_id, conversation_id, reason, details, evidence_snapshot
  ) VALUES (
    p_actor, v_peer, p_conversation, p_reason, p_details, v_snapshot
  ) RETURNING id INTO v_report_id;

  -- 감사 원장 기록
  INSERT INTO public.audit_logs (
    action, entity, actor_user_id, target_user_id, details
  ) VALUES (
    'CHAT_CONVERSATION_REPORTED',
    'private_chat_reports',
    p_actor,
    v_peer,
    jsonb_build_object('report_id', v_report_id, 'reason', p_reason, 'conversation_id', p_conversation)
  );

  RETURN v_report_id;
END; $$;

-- 소유권 및 권한 바인딩
ALTER FUNCTION public.private_chat_is_blocked(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_block(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_unblock(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_mute(uuid, uuid, boolean) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_send(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_report(uuid, uuid, text, text) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.private_chat_is_blocked(uuid, uuid),
                       public.private_chat_block(uuid, uuid),
                       public.private_chat_unblock(uuid, uuid),
                       public.private_chat_mute(uuid, uuid, boolean),
                       public.private_chat_send(uuid, uuid, uuid, text),
                       public.private_chat_report(uuid, uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.private_chat_is_blocked(uuid, uuid),
                         public.private_chat_block(uuid, uuid),
                         public.private_chat_unblock(uuid, uuid),
                         public.private_chat_mute(uuid, uuid, boolean),
                         public.private_chat_send(uuid, uuid, uuid, text),
                         public.private_chat_report(uuid, uuid, text, text) TO moneyverse_app;

COMMIT;
