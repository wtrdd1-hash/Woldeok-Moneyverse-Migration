BEGIN;

-- 1. announcements 테이블에 상단 고정 핀 컬럼 추가
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- 2. 공개 피드 인덱스에 is_pinned 우선 정렬 반영
DROP INDEX IF EXISTS public.announcements_public_feed_idx;
CREATE INDEX announcements_public_feed_idx
  ON public.announcements (is_pinned DESC, published_at DESC, id DESC)
  WHERE content_state = 'published';

-- 3. 공지사항 수정 함수 (content_update_announcement)
CREATE OR REPLACE FUNCTION public.content_update_announcement(
  p_actor uuid,
  p_announcement_id uuid,
  p_title text,
  p_body text,
  p_is_pinned boolean DEFAULT false,
  p_content_state text DEFAULT NULL
)
RETURNS TABLE(
  announcement_id uuid,
  title text,
  body text,
  content_state text,
  is_pinned boolean,
  published_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_title text;
  v_body text;
  v_state text;
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

  v_title := public.content_normalize_plain_text(p_title, 160, false);
  v_body := public.content_normalize_plain_text(p_body, 12000, true);

  IF p_content_state IS NOT NULL THEN
    IF p_content_state NOT IN ('draft', 'published') THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid content state';
    END IF;
    v_state := p_content_state;
  END IF;

  UPDATE public.announcements AS a
  SET title = v_title,
      body = v_body,
      is_pinned = coalesce(p_is_pinned, a.is_pinned),
      content_state = coalesce(v_state, a.content_state),
      published_at = CASE 
        WHEN coalesce(v_state, a.content_state) = 'published' AND a.published_at IS NULL THEN pg_catalog.clock_timestamp()
        WHEN coalesce(v_state, a.content_state) = 'draft' THEN NULL
        ELSE a.published_at
      END,
      updated_at = pg_catalog.clock_timestamp()
  WHERE a.id = p_announcement_id
  RETURNING a.id, a.title, a.body, a.content_state, a.is_pinned, a.published_at, a.updated_at
  INTO announcement_id, title, body, content_state, is_pinned, published_at, updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement not found';
  END IF;

  PERFORM public.admin_append_audit_event(
    p_actor,
    'content.announcement.updated',
    p_announcement_id,
    NULL,
    pg_catalog.jsonb_build_object(
      'announcementId', p_announcement_id::text,
      'title', v_title,
      'isPinned', is_pinned,
      'contentState', content_state
    )
  );

  RETURN NEXT;
END;
$$;

-- 4. 관리자용 공지사항 전체 목록 조회 함수 갱신 (is_pinned 반환 및 핀 우선 정렬)
DROP FUNCTION IF EXISTS public.content_list_all_announcements(uuid);
CREATE OR REPLACE FUNCTION public.content_list_all_announcements(
  p_actor uuid
)
RETURNS TABLE(
  announcement_id uuid,
  title text,
  body text,
  content_state text,
  is_pinned boolean,
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
    a.is_pinned,
    a.published_at,
    a.created_at,
    a.updated_at
  FROM public.announcements a
  ORDER BY a.is_pinned DESC, a.created_at DESC;
END;
$$;

-- 5. 일반 사용자용 발행된 공지사항 목록 조회 함수 갱신 (이미지 필드 보존, is_pinned 반환 및 핀 우선 정렬)
DROP FUNCTION IF EXISTS public.content_list_published_announcements(integer);
CREATE OR REPLACE FUNCTION public.content_list_published_announcements(
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  announcement_id uuid,
  title text,
  body text,
  image_url text,
  image_alt_text text,
  is_pinned boolean,
  published_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement limit must be between 1 and 100';
  END IF;

  RETURN QUERY
  SELECT 
    announcement_row.id,
    announcement_row.title,
    announcement_row.body,
    CASE 
      WHEN announcement_row.image_storage_key IS NULL THEN NULL
      ELSE '/media/' || announcement_row.image_storage_key 
    END AS image_url,
    announcement_row.image_alt_text,
    announcement_row.is_pinned,
    announcement_row.published_at
  FROM public.announcements AS announcement_row
  WHERE announcement_row.content_state = 'published'
    AND announcement_row.published_at <= pg_catalog.clock_timestamp()
  ORDER BY announcement_row.is_pinned DESC, announcement_row.published_at DESC, announcement_row.id DESC
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION public.content_update_announcement(uuid, uuid, text, text, boolean, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_list_all_announcements(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_list_published_announcements(integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.content_update_announcement(uuid, uuid, text, text, boolean, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_list_all_announcements(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_list_published_announcements(integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.content_update_announcement(uuid, uuid, text, text, boolean, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_list_all_announcements(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_list_published_announcements(integer) TO moneyverse_app;

COMMIT;
