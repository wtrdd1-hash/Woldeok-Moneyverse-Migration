-- ============================================================================
-- Migration 226: Minor Safety and Emergency Content Takedown System
-- Spec: MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC (P0)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.emergency_content_takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id VARCHAR(32) NOT NULL UNIQUE,
  passcode_hash VARCHAR(128) NOT NULL,
  requester_email VARCHAR(255) NOT NULL,
  requester_type VARCHAR(32) NOT NULL CHECK (requester_type IN ('victim_self', 'legal_guardian', 'authorized_rep', 'third_party')),
  reason_category VARCHAR(64) NOT NULL CHECK (reason_category IN ('non_consensual_private_image', 'underage_harmful_content', 'doxxing_credible_threat', 'impersonation_account_takeover', 'harassment_stalking', 'illegal_content')),
  target_content_url VARCHAR(1024) NOT NULL,
  target_content_type VARCHAR(32) NOT NULL CHECK (target_content_type IN ('board_post', 'board_comment', 'gallery_photo', 'chat_message', 'profile_bio', 'other')),
  description TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED')),
  admin_notes TEXT NULL,
  actioned_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_emergency_takedowns_status_created ON public.emergency_content_takedowns(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_takedowns_case_id ON public.emergency_content_takedowns(case_id);

CREATE TABLE IF NOT EXISTS public.account_age_policy_state (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  age_state VARCHAR(32) NOT NULL DEFAULT 'unknown' CHECK (age_state IN ('unknown', 'adult_confirmed', 'teen_confirmed', 'child_restricted', 'guardian_consent_pending', 'guardian_consent_verified', 'verification_required')),
  jurisdiction_policy_code VARCHAR(8) NOT NULL DEFAULT 'KR',
  assurance_method VARCHAR(32) NOT NULL DEFAULT 'self_declaration',
  guardian_consent_version VARCHAR(32) NULL,
  guardian_consent_at TIMESTAMPTZ NULL,
  verified_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 비회원 공개 긴급 콘텐츠 삭제 접수 프로시저
CREATE OR REPLACE FUNCTION public.safety_submit_emergency_takedown(
  p_requester_email VARCHAR(255),
  p_requester_type VARCHAR(32),
  p_reason_category VARCHAR(64),
  p_target_content_url VARCHAR(1024),
  p_target_content_type VARCHAR(32),
  p_description TEXT,
  p_passcode_hash VARCHAR(128)
)
RETURNS VARCHAR(32)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_case_id VARCHAR(32);
  v_random_suffix VARCHAR(8);
BEGIN
  IF p_requester_email IS NULL OR p_requester_email NOT LIKE '%@%' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid requester email';
  END IF;

  v_random_suffix := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
  v_case_id := 'TKD-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' || v_random_suffix;

  INSERT INTO public.emergency_content_takedowns (
    case_id,
    passcode_hash,
    requester_email,
    requester_type,
    reason_category,
    target_content_url,
    target_content_type,
    description,
    status
  ) VALUES (
    v_case_id,
    p_passcode_hash,
    trim(p_requester_email),
    p_requester_type,
    p_reason_category,
    trim(p_target_content_url),
    p_target_content_type,
    trim(p_description),
    'SUBMITTED'
  );

  RETURN v_case_id;
END;
$function$;

-- 비회원 접수 상태 조회 프로시저 (개인정보 안전 격리)
CREATE OR REPLACE FUNCTION public.safety_get_takedown_status(
  p_case_id TEXT,
  p_passcode_hash TEXT
)
RETURNS TABLE (
  case_id TEXT,
  status TEXT,
  reason_category TEXT,
  target_content_type TEXT,
  actioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    t.case_id,
    t.status,
    t.reason_category,
    t.target_content_type,
    t.actioned_at,
    t.created_at
  FROM public.emergency_content_takedowns t
  WHERE t.case_id = trim(p_case_id)
    AND t.passcode_hash = trim(p_passcode_hash);
END;
$function$;

-- 관리자 긴급 삭제 목록 조회 프로시저
CREATE OR REPLACE FUNCTION public.safety_admin_list_takedowns(
  p_actor UUID,
  p_status_filter TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  case_id TEXT,
  requester_email TEXT,
  requester_type TEXT,
  reason_category TEXT,
  target_content_url TEXT,
  target_content_type TEXT,
  description TEXT,
  status TEXT,
  admin_notes TEXT,
  actioned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'access requires operator or higher';
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.case_id,
    t.requester_email,
    t.requester_type,
    t.reason_category,
    t.target_content_url,
    t.target_content_type,
    t.description,
    t.status,
    t.admin_notes,
    t.actioned_at,
    t.created_at,
    t.updated_at
  FROM public.emergency_content_takedowns t
  WHERE (p_status_filter IS NULL OR t.status = p_status_filter)
  ORDER BY
    CASE WHEN t.status = 'SUBMITTED' THEN 0 WHEN t.status = 'TRIAGED' THEN 1 ELSE 2 END ASC,
    t.created_at DESC
  LIMIT LEAST(p_limit, 100)
  OFFSET GREATEST(p_offset, 0);
END;
$function$;

-- 관리자 긴급 삭제 조치 실행 프로시저
CREATE OR REPLACE FUNCTION public.safety_admin_action_takedown(
  p_actor UUID,
  p_case_id TEXT,
  p_new_status TEXT,
  p_admin_notes TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_updated INT;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'action requires operator or higher';
  END IF;

  IF p_new_status NOT IN ('TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid new status';
  END IF;

  UPDATE public.emergency_content_takedowns
  SET status = p_new_status,
      admin_notes = coalesce(p_admin_notes, admin_notes),
      actioned_at = clock_timestamp(),
      actioned_by = p_actor,
      updated_at = clock_timestamp()
  WHERE case_id = trim(p_case_id);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$function$;

-- 권한 부여
GRANT ALL PRIVILEGES ON TABLE public.emergency_content_takedowns TO moneyverse_app, moneyverse_migrator;
GRANT ALL PRIVILEGES ON TABLE public.account_age_policy_state TO moneyverse_app, moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.safety_submit_emergency_takedown(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR) TO moneyverse_app, moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.safety_get_takedown_status(TEXT, TEXT) TO moneyverse_app, moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.safety_admin_list_takedowns(UUID, TEXT, INT, INT) TO moneyverse_app, moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.safety_admin_action_takedown(UUID, TEXT, TEXT, TEXT) TO moneyverse_app, moneyverse_migrator;
