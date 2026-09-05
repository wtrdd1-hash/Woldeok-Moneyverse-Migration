BEGIN;

-- 1. 공지사항 삭제 함수 (content_delete_announcement)
CREATE OR REPLACE FUNCTION public.content_delete_announcement(
  p_actor uuid,
  p_announcement_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR (
    NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role)
    AND NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator privilege required';
  END IF;

  IF p_announcement_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement id required';
  END IF;

  DELETE FROM public.announcements
  WHERE id = p_announcement_id;

  RETURN FOUND;
END;
$$;

-- 2. 관리자용 공지사항 전체 목록 조회 함수 (content_list_all_announcements)
CREATE OR REPLACE FUNCTION public.content_list_all_announcements(
  p_actor uuid
)
RETURNS TABLE(
  announcement_id uuid,
  title text,
  body text,
  content_state text,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR (
    NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role)
    AND NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator privilege required';
  END IF;

  RETURN QUERY
  SELECT 
    a.id AS announcement_id,
    a.title,
    a.body,
    a.content_state,
    a.published_at,
    a.created_at,
    a.updated_at
  FROM public.announcements a
  ORDER BY a.created_at DESC;
END;
$$;

ALTER FUNCTION public.content_delete_announcement(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_list_all_announcements(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.content_delete_announcement(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_list_all_announcements(uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.content_delete_announcement(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_list_all_announcements(uuid) TO moneyverse_app;

-- 3. MINT 계좌 잔액 캐시를 실제 분개 합계(-2,146 WLD)로 동기화 (대사 무결성 정상화)
UPDATE public.account_balances
SET available_amount = -2146,
    updated_at = pg_catalog.clock_timestamp()
WHERE account_id = '23d6fdda-9f38-4cfe-8383-9404f6887ba8';

COMMIT;
