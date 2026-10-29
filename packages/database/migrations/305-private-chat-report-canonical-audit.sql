-- Forward-only repair for the owner-scoped private chat report receipt.
-- Migration 227 used audit columns absent from the canonical audit schema.
-- Preserve the report insert and audit append in one PostgreSQL transaction.
-- Number 305 is reserved after the concurrent lineage repair (#1878) makes
-- the current 303 source migrations a contiguous 002..304 sequence.
BEGIN;

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

  -- Use the canonical serialized hash-chain append; the old columns were removed.
  PERFORM public.admin_append_audit_event(
    p_actor,
    'chat.conversation.reported',
    v_report_id,
    NULL::uuid,
    pg_catalog.jsonb_build_object(
      'reportId', v_report_id,
      'conversationId', p_conversation,
      'reportedUserId', v_peer,
      'reason', p_reason
    )
  );

  RETURN v_report_id;
END; $$;

ALTER FUNCTION public.private_chat_report(uuid, uuid, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.private_chat_report(uuid, uuid, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.private_chat_report(uuid, uuid, text, text)
  TO moneyverse_app;

-- A receipt function is not a reason to broaden application table access.
REVOKE ALL PRIVILEGES ON TABLE public.private_chat_reports
  FROM PUBLIC, moneyverse_app;
COMMIT;
