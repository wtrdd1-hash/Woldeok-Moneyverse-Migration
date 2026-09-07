BEGIN;

ALTER TABLE public.member_board_posts
  ADD COLUMN image_storage_key text,
  ADD COLUMN image_alt_text text;

ALTER TABLE public.member_board_posts
  ADD CONSTRAINT member_board_posts_image_pair_check CHECK (
    (image_storage_key IS NULL AND image_alt_text IS NULL)
    OR (
      image_storage_key ~ '^[0-9a-f-]{36}\.(png|jpg|webp)$'
      AND char_length(image_alt_text) BETWEEN 1 AND 300
      AND image_alt_text !~ '[<>[:cntrl:]]'
    )
  );

CREATE UNIQUE INDEX member_board_posts_image_storage_key_idx
  ON public.member_board_posts(image_storage_key)
  WHERE image_storage_key IS NOT NULL;

REVOKE ALL PRIVILEGES ON TABLE public.member_board_posts FROM PUBLIC, moneyverse_app;

DROP FUNCTION public.member_board_list(uuid, integer);
CREATE FUNCTION public.member_board_list(p_actor uuid, p_limit integer)
RETURNS TABLE(
  post_id uuid, title text, author_name text, created_at timestamptz,
  updated_at timestamptz, comment_count bigint, mine boolean,
  image_storage_key text, image_alt_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_limit NOT BETWEEN 1 AND 50
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='28000';
  END IF;
  RETURN QUERY
  SELECT p.id,p.title,public.member_board_author_name(p.author_user_id),p.created_at,p.updated_at,
    (SELECT count(*) FROM public.member_board_comments c WHERE c.post_id=p.id AND c.deleted_at IS NULL),
    p.author_user_id=p_actor,p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC,p.id DESC
  LIMIT p_limit;
END;
$$;

DROP FUNCTION public.member_board_get(uuid, uuid);
CREATE FUNCTION public.member_board_get(p_actor uuid, p_post uuid)
RETURNS TABLE(
  post_id uuid, title text, body text, author_name text, created_at timestamptz,
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
  SELECT p.id,p.title,p.body,public.member_board_author_name(p.author_user_id),p.created_at,p.updated_at,
    p.author_user_id=p_actor,p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.id=p_post AND p.deleted_at IS NULL;
END;
$$;

CREATE FUNCTION public.member_board_create_with_image(
  p_actor uuid, p_title text, p_body text, p_key uuid,
  p_image_storage_key text, p_image_alt_text text
)
RETURNS TABLE(
  post_id uuid, title text, body text, author_name text, created_at timestamptz,
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
  SELECT p.id,p.title,p.body,public.member_board_author_name(p.author_user_id),p.created_at,p.updated_at,true,
    p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p WHERE p.id=v_id;
END;
$$;

DROP FUNCTION public.member_board_update(uuid, uuid, text, text, uuid);
CREATE FUNCTION public.member_board_update(p_actor uuid,p_post uuid,p_title text,p_body text,p_key uuid)
RETURNS TABLE(
  post_id uuid,title text,body text,author_name text,created_at timestamptz,
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
  SELECT p.id,p.title,p.body,public.member_board_author_name(p.author_user_id),p.created_at,p.updated_at,true,
    p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.id=p_post AND p.author_user_id=p_actor AND p.deleted_at IS NULL;
END;
$$;

CREATE FUNCTION public.member_board_image_visible(p_actor uuid,p_storage_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_storage_key IS NULL
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN
    RETURN false;
  END IF;
  RETURN EXISTS(
    SELECT 1 FROM public.member_board_posts p
    WHERE p.deleted_at IS NULL AND p.image_storage_key=p_storage_key
  );
END;
$$;

ALTER FUNCTION public.member_board_list(uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_get(uuid,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_create_with_image(uuid,text,text,uuid,text,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_update(uuid,uuid,text,text,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_image_visible(uuid,text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.member_board_list(uuid,integer),public.member_board_get(uuid,uuid),
  public.member_board_create_with_image(uuid,text,text,uuid,text,text),public.member_board_update(uuid,uuid,text,text,uuid),
  public.member_board_image_visible(uuid,text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_board_list(uuid,integer),public.member_board_get(uuid,uuid),
  public.member_board_create_with_image(uuid,text,text,uuid,text,text),public.member_board_update(uuid,uuid,text,text,uuid),
  public.member_board_image_visible(uuid,text) TO moneyverse_app;

COMMIT;
