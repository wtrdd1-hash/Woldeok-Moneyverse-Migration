BEGIN;

-- 1. member_board_get 함수에 author_user_id 추가
DROP FUNCTION IF EXISTS public.member_board_get(uuid, uuid);
CREATE FUNCTION public.member_board_get(p_actor uuid, p_post uuid)
RETURNS TABLE(
  post_id uuid, title text, body text, author_name text, author_user_id uuid, created_at timestamptz,
  updated_at timestamptz, mine boolean, image_storage_key text, image_alt_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_post IS NULL
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='28000';
  END IF;
  RETURN QUERY
  SELECT p.id, p.title, p.body, public.member_board_author_name(p.author_user_id), p.author_user_id, p.created_at, p.updated_at,
    p.author_user_id=p_actor, p.image_storage_key, p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.id=p_post AND p.deleted_at IS NULL;
END;
$$;

-- 2. member_board_public_get 함수에 author_user_id 추가
DROP FUNCTION IF EXISTS public.member_board_public_get(uuid);
CREATE FUNCTION public.member_board_public_get(p_post uuid)
RETURNS TABLE(
  post_id uuid, title text, body text, author_name text, author_user_id uuid, created_at timestamptz,
  updated_at timestamptz, mine boolean, image_storage_key text, image_alt_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_post IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.body,
    public.member_board_author_name(p.author_user_id),
    p.author_user_id,
    p.created_at,
    p.updated_at,
    false,
    p.image_storage_key,
    p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.id = p_post AND p.deleted_at IS NULL;
END;
$$;

-- 3. member_board_comment_list 함수에 author_user_id 추가
DROP FUNCTION IF EXISTS public.member_board_comment_list(uuid, uuid, integer);
CREATE FUNCTION public.member_board_comment_list(p_actor uuid, p_post uuid, p_limit integer)
RETURNS TABLE(
  comment_id uuid, body text, author_name text, author_user_id uuid, created_at timestamptz, mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_post IS NULL OR p_limit NOT BETWEEN 1 AND 200
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.body,
    public.member_board_author_name(c.author_user_id),
    c.author_user_id,
    c.created_at,
    c.author_user_id = p_actor
  FROM public.member_board_comments c
  JOIN public.member_board_posts p ON p.id = c.post_id AND p.deleted_at IS NULL
  WHERE c.post_id = p_post AND c.deleted_at IS NULL
  ORDER BY c.created_at, c.id
  LIMIT p_limit;
END;
$$;

-- 4. member_board_public_comment_list 함수에 author_user_id 추가
DROP FUNCTION IF EXISTS public.member_board_public_comment_list(uuid, integer);
CREATE FUNCTION public.member_board_public_comment_list(p_post uuid, p_limit integer)
RETURNS TABLE(
  comment_id uuid, body text, author_name text, author_user_id uuid, created_at timestamptz, mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_post IS NULL OR p_limit NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.body,
    public.member_board_author_name(c.author_user_id),
    c.author_user_id,
    c.created_at,
    false
  FROM public.member_board_comments c
  JOIN public.member_board_posts p
    ON p.id = c.post_id AND p.deleted_at IS NULL
  WHERE c.post_id = p_post AND c.deleted_at IS NULL
  ORDER BY c.created_at, c.id
  LIMIT p_limit;
END;
$$;

-- 5. member_board_create_with_image 함수 갱신
DROP FUNCTION IF EXISTS public.member_board_create_with_image(uuid, text, text, uuid, text, text);
CREATE FUNCTION public.member_board_create_with_image(
  p_actor uuid, p_title text, p_body text, p_key uuid,
  p_image_storage_key text, p_image_alt_text text
)
RETURNS TABLE(
  post_id uuid, title text, body text, author_name text, author_user_id uuid, created_at timestamptz,
  updated_at timestamptz, mine boolean, image_storage_key text, image_alt_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE v_id uuid; v_author uuid;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL OR p_title IS NULL OR p_body IS NULL
    OR char_length(p_title) NOT BETWEEN 1 AND 120 OR char_length(p_body) NOT BETWEEN 1 AND 5000
    OR p_title ~ '[<>[:cntrl:]]' OR p_body ~ '[<>[:cntrl:]]'
    OR ((p_image_storage_key IS NULL) <> (p_image_alt_text IS NULL))
    OR (p_image_storage_key IS NOT NULL AND (
      p_image_storage_key !~ '^[0-9a-f-]{36}\.(png|jpg|webp)$'
      OR char_length(p_image_alt_text) NOT BETWEEN 1 AND 300 OR p_image_alt_text ~ '[<>[:cntrl:]]'))
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('moneyverse:board-post:'||p_key::text,0));
  SELECT id,author_user_id INTO v_id,v_author FROM public.member_board_posts WHERE idempotency_key=p_key;
  IF FOUND THEN
    IF v_author<>p_actor THEN RAISE EXCEPTION USING ERRCODE='28000'; END IF;
  ELSE
    INSERT INTO public.member_board_posts(author_user_id,idempotency_key,title,body,image_storage_key,image_alt_text)
    VALUES(p_actor,p_key,p_title,p_body,p_image_storage_key,p_image_alt_text)
    RETURNING id INTO v_id;
  END IF;

  RETURN QUERY
  SELECT p.id,p.title,p.body,public.member_board_author_name(p.author_user_id),p.author_user_id,p.created_at,p.updated_at,true,
    p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p WHERE p.id=v_id;
END;
$$;

-- 6. member_board_update 함수 갱신
DROP FUNCTION IF EXISTS public.member_board_update(uuid, uuid, text, text, uuid);
CREATE FUNCTION public.member_board_update(p_actor uuid,p_post uuid,p_title text,p_body text,p_key uuid)
RETURNS TABLE(
  post_id uuid,title text,body text,author_name text,author_user_id uuid,created_at timestamptz,
  updated_at timestamptz,mine boolean,image_storage_key text,image_alt_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_post IS NULL OR p_key IS NULL OR p_title IS NULL OR p_body IS NULL
    OR char_length(p_title) NOT BETWEEN 1 AND 120 OR char_length(p_body) NOT BETWEEN 1 AND 5000
    OR p_title ~ '[<>[:cntrl:]]' OR p_body ~ '[<>[:cntrl:]]'
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='22023';
  END IF;
  UPDATE public.member_board_posts p SET title=p_title,body=p_body,updated_at=pg_catalog.clock_timestamp()
  WHERE p.id=p_post AND p.author_user_id=p_actor AND p.deleted_at IS NULL;
  RETURN QUERY
  SELECT p.id,p.title,p.body,public.member_board_author_name(p.author_user_id),p.author_user_id,p.created_at,p.updated_at,true,
    p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.id=p_post AND p.author_user_id=p_actor AND p.deleted_at IS NULL;
END;
$$;

-- 7. 1:1 쪽지용 활성 회원 닉네임 검색 함수
CREATE OR REPLACE FUNCTION public.chat_search_active_users(p_actor uuid, p_query text, p_limit integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid,
  display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_trimmed text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000';
  END IF;

  v_trimmed := trim(p_query);
  IF v_trimmed IS NULL OR char_length(v_trimmed) < 1 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (u.id)
    u.id,
    coalesce(i.display_name, '사용자')
  FROM public.users u
  JOIN public.identities i ON i.user_id = u.id
  WHERE u.status = 'active'::public.user_status
    AND u.id <> p_actor
    AND i.display_name ILIKE '%' || v_trimmed || '%'
  ORDER BY u.id, i.linked_at DESC
  LIMIT coalesce(p_limit, 10);
END;
$$;

-- 권한 부여
ALTER FUNCTION public.member_board_get(uuid,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_public_get(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_comment_list(uuid,uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_public_comment_list(uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_create_with_image(uuid,text,text,uuid,text,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_update(uuid,uuid,text,text,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.chat_search_active_users(uuid,text,integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.member_board_get(uuid,uuid), public.member_board_public_get(uuid),
  public.member_board_comment_list(uuid,uuid,integer), public.member_board_public_comment_list(uuid,integer),
  public.member_board_create_with_image(uuid,text,text,uuid,text,text), public.member_board_update(uuid,uuid,text,text,uuid),
  public.chat_search_active_users(uuid,text,integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.member_board_get(uuid,uuid), public.member_board_public_get(uuid),
  public.member_board_comment_list(uuid,uuid,integer), public.member_board_public_comment_list(uuid,integer),
  public.member_board_create_with_image(uuid,text,text,uuid,text,text), public.member_board_update(uuid,uuid,text,text,uuid),
  public.chat_search_active_users(uuid,text,integer) TO moneyverse_app;

COMMIT;
