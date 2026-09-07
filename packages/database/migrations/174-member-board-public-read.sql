BEGIN;

-- Public board reading deliberately uses dedicated SECURITY DEFINER read models.
-- The application role still receives no direct table privileges, and all write
-- functions keep their existing active-member checks.
CREATE FUNCTION public.member_board_public_list(p_limit integer)
RETURNS TABLE(
  post_id uuid,
  title text,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz,
  comment_count bigint,
  mine boolean,
  image_storage_key text,
  image_alt_text text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    public.member_board_author_name(p.author_user_id),
    p.created_at,
    p.updated_at,
    (SELECT count(*)
       FROM public.member_board_comments c
      WHERE c.post_id = p.id AND c.deleted_at IS NULL),
    false,
    p.image_storage_key,
    p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT p_limit;
END;
$$;

CREATE FUNCTION public.member_board_public_get(p_post uuid)
RETURNS TABLE(
  post_id uuid,
  title text,
  body text,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz,
  mine boolean,
  image_storage_key text,
  image_alt_text text
)
LANGUAGE plpgsql
STABLE
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
    p.created_at,
    p.updated_at,
    false,
    p.image_storage_key,
    p.image_alt_text
  FROM public.member_board_posts p
  WHERE p.id = p_post AND p.deleted_at IS NULL;
END;
$$;

CREATE FUNCTION public.member_board_public_comment_list(p_post uuid, p_limit integer)
RETURNS TABLE(
  comment_id uuid,
  body text,
  author_name text,
  created_at timestamptz,
  mine boolean
)
LANGUAGE plpgsql
STABLE
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

CREATE FUNCTION public.member_board_public_image_visible(p_storage_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT p_storage_key IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.member_board_posts p
    WHERE p.deleted_at IS NULL AND p.image_storage_key = p_storage_key
  )
$$;

ALTER FUNCTION public.member_board_public_list(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_public_get(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_public_comment_list(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_public_image_visible(text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.member_board_public_list(integer),
  public.member_board_public_get(uuid),
  public.member_board_public_comment_list(uuid, integer),
  public.member_board_public_image_visible(text)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.member_board_public_list(integer),
  public.member_board_public_get(uuid),
  public.member_board_public_comment_list(uuid, integer),
  public.member_board_public_image_visible(text)
TO moneyverse_app;

-- Re-state the table boundary beside the public read models so a future reader
-- cannot mistake public readability for direct application access.
REVOKE ALL PRIVILEGES ON TABLE
  public.member_board_posts,
  public.member_board_comments
FROM PUBLIC, moneyverse_app;

COMMIT;
