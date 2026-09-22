-- 228-private-chat-moderation-admin.sql
-- Update version: v2026.09.22.354
-- P0 CHAT-305-05: Private Chat Admin Moderation Queue, Evidence Snapshot Viewer and Incident Action Governance.
-- Forward-only: least-privilege SECURITY DEFINER contracts.

BEGIN;

-- 1. 관리자 신고 목록 조회 함수 (Admin List Reports)
CREATE OR REPLACE FUNCTION public.private_chat_admin_list_reports(
  p_actor uuid,
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  report_id uuid,
  reporter_id uuid,
  reporter_username text,
  reporter_nickname text,
  reported_user_id uuid,
  reported_username text,
  reported_nickname text,
  conversation_id uuid,
  reason text,
  details text,
  evidence_count integer,
  status text,
  created_at timestamptz,
  actioned_at timestamptz,
  actioned_by uuid,
  actioner_nickname text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'operator or superadmin role required';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS report_id,
    r.reporter_id,
    COALESCE(u_rep.username, 'unknown') AS reporter_username,
    COALESCE(u_rep.nickname, u_rep.username, '탈퇴한 회원') AS reporter_nickname,
    r.reported_user_id,
    COALESCE(u_tgt.username, 'unknown') AS reported_username,
    COALESCE(u_tgt.nickname, u_tgt.username, '탈퇴한 회원') AS reported_nickname,
    r.conversation_id,
    r.reason,
    r.details,
    COALESCE(jsonb_array_length(r.evidence_snapshot), 0)::integer AS evidence_count,
    r.status,
    r.created_at,
    r.actioned_at,
    r.actioned_by,
    COALESCE(u_act.nickname, u_act.username, NULL) AS actioner_nickname
  FROM public.private_chat_reports r
  LEFT JOIN public.users u_rep ON u_rep.id = r.reporter_id
  LEFT JOIN public.users u_tgt ON u_tgt.id = r.reported_user_id
  LEFT JOIN public.users u_act ON u_act.id = r.actioned_by
  WHERE (p_status IS NULL OR r.status = p_status)
  ORDER BY
    CASE WHEN r.status = 'SUBMITTED' THEN 0 ELSE 1 END,
    r.created_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100)
  OFFSET GREATEST(p_offset, 0);
END; $$;

-- 2. 특정 신고 건의 상세 및 증거 스냅샷 안전 열람 함수 (Admin Get Report & Log Evidence View)
CREATE OR REPLACE FUNCTION public.private_chat_admin_get_report(
  p_actor uuid,
  p_report_id uuid
)
RETURNS TABLE(
  report_id uuid,
  reporter_id uuid,
  reporter_username text,
  reporter_nickname text,
  reported_user_id uuid,
  reported_username text,
  reported_nickname text,
  conversation_id uuid,
  reason text,
  details text,
  evidence_snapshot jsonb,
  status text,
  created_at timestamptz,
  actioned_at timestamptz,
  actioned_by uuid,
  actioner_nickname text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_rec record;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'operator or superadmin role required';
  END IF;

  SELECT
    r.id,
    r.reporter_id,
    r.reported_user_id,
    r.conversation_id,
    r.reason,
    r.details,
    r.evidence_snapshot,
    r.status,
    r.created_at,
    r.actioned_at,
    r.actioned_by
  INTO v_rec
  FROM public.private_chat_reports r
  WHERE r.id = p_report_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Report not found';
  END IF;

  -- 증거 열람 감사 원장 기록 (기획서 14절: 본문 열람 감사 보존)
  INSERT INTO public.audit_logs (
    action, entity, actor_user_id, target_user_id, details
  ) VALUES (
    'CHAT_REPORT_EVIDENCE_VIEWED',
    'private_chat_reports',
    p_actor,
    v_rec.reported_user_id,
    jsonb_build_object(
      'report_id', p_report_id,
      'conversation_id', v_rec.conversation_id,
      'evidence_count', jsonb_array_length(v_rec.evidence_snapshot)
    )
  );

  RETURN QUERY
  SELECT
    r.id AS report_id,
    r.reporter_id,
    COALESCE(u_rep.username, 'unknown') AS reporter_username,
    COALESCE(u_rep.nickname, u_rep.username, '탈퇴한 회원') AS reporter_nickname,
    r.reported_user_id,
    COALESCE(u_tgt.username, 'unknown') AS reported_username,
    COALESCE(u_tgt.nickname, u_tgt.username, '탈퇴한 회원') AS reported_nickname,
    r.conversation_id,
    r.reason,
    r.details,
    r.evidence_snapshot,
    r.status,
    r.created_at,
    r.actioned_at,
    r.actioned_by,
    COALESCE(u_act.nickname, u_act.username, NULL) AS actioner_nickname
  FROM public.private_chat_reports r
  LEFT JOIN public.users u_rep ON u_rep.id = r.reporter_id
  LEFT JOIN public.users u_tgt ON u_tgt.id = r.reported_user_id
  LEFT JOIN public.users u_act ON u_act.id = r.actioned_by
  WHERE r.id = p_report_id;
END; $$;

-- 3. 관리자 신고 건 조치 실행 함수 (Admin Action Report)
CREATE OR REPLACE FUNCTION public.private_chat_admin_action_report(
  p_actor uuid,
  p_report_id uuid,
  p_action text,
  p_note text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_rec record;
  v_status text;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'operator or superadmin role required';
  END IF;

  IF p_action NOT IN ('ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid action. Allowed: ACTIONED_BLOCKED, ACTIONED_WARNED, REJECTED';
  END IF;

  SELECT * INTO v_rec
  FROM public.private_chat_reports
  WHERE id = p_report_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Report not found';
  END IF;

  UPDATE public.private_chat_reports
  SET
    status = p_action,
    actioned_at = pg_catalog.clock_timestamp(),
    actioned_by = p_actor
  WHERE id = p_report_id;

  -- 조치 감사 원장 영구 보존
  INSERT INTO public.audit_logs (
    action, entity, actor_user_id, target_user_id, details
  ) VALUES (
    'CHAT_REPORT_ACTIONED',
    'private_chat_reports',
    p_actor,
    v_rec.reported_user_id,
    jsonb_build_object(
      'report_id', p_report_id,
      'previous_status', v_rec.status,
      'new_status', p_action,
      'note', p_note,
      'conversation_id', v_rec.conversation_id
    )
  );

  RETURN true;
END; $$;

-- 4. 소유권 및 실행 권한 바인딩
ALTER FUNCTION public.private_chat_admin_list_reports(uuid, text, integer, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_admin_get_report(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.private_chat_admin_action_report(uuid, uuid, text, text) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.private_chat_admin_list_reports(uuid, text, integer, integer),
                       public.private_chat_admin_get_report(uuid, uuid),
                       public.private_chat_admin_action_report(uuid, uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.private_chat_admin_list_reports(uuid, text, integer, integer),
                          public.private_chat_admin_get_report(uuid, uuid),
                          public.private_chat_admin_action_report(uuid, uuid, text, text) TO moneyverse_app;

COMMIT;
