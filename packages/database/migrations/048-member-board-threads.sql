-- The member board becomes a board: a list, a post of its own, edits, replies.
--
-- 044 gave it one screen. Every post's full body was inline, there was no way
-- to correct a typo, and there was nowhere to reply. Three changes follow:
--
--   * `member_board_list` stops returning `body`. Fifty posts carried up to
--     250 KB of text the list never rendered, on a page that re-renders after
--     every write — which is what made writing a post feel slow. A list row
--     needs a title, an author, a date and a reply count. The body belongs to
--     `member_board_get`, which one post's page calls.
--   * `member_board_update` lets an author correct their own post, and
--     `updated_at` records that it happened. A silently edited post in a
--     shared thread is worse than no edit at all.
--   * `member_board_comments` is a new table, reachable only through
--     functions, exactly as the posts table already is.
--
-- Changing `member_board_list`'s result columns needs DROP and CREATE rather
-- than CREATE OR REPLACE: PostgreSQL refuses to replace a function whose
-- RETURNS TABLE shape differs.

BEGIN;

ALTER TABLE public.member_board_posts ADD COLUMN updated_at timestamptz;

-- Same shape as member_board_posts, and the same reasons: an idempotency key
-- so a double-submitted form replies once, a soft delete so a removed reply
-- leaves the thread's history intact, and no grant to moneyverse_app.
CREATE TABLE public.member_board_comments (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.member_board_posts(id) ON DELETE RESTRICT,
  author_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  idempotency_key uuid NOT NULL UNIQUE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000 AND body !~ '[<>[:cntrl:]]'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  deleted_at timestamptz
);

CREATE INDEX member_board_comments_thread_idx
  ON public.member_board_comments(post_id, created_at, id)
  WHERE deleted_at IS NULL;

REVOKE ALL ON public.member_board_comments FROM PUBLIC, moneyverse_app;

-- 046 established how a name is resolved: only an active member has one, and
-- a soft-deleted member falls back to the placeholder. Six functions below
-- need that rule and it must not drift between them, so it is stated once.
--
-- Deliberately NOT granted to moneyverse_app. Every other function here
-- checks the caller first; this one takes a user id and has no actor to
-- check, so the application must not be able to call it directly and turn an
-- id into a display name. The functions that do call it are SECURITY DEFINER
-- and run as this function's owner.
CREATE OR REPLACE FUNCTION public.member_board_author_name(p_user uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT coalesce(
    (SELECT i.display_name
     FROM public.identities i
     JOIN public.users au ON au.id = i.user_id
     WHERE i.user_id = p_user AND au.status = 'active'::public.user_status
     ORDER BY i.linked_at LIMIT 1),
    '사용자'
  )
$$;

DROP FUNCTION public.member_board_list(uuid, integer);

CREATE FUNCTION public.member_board_list(p_actor uuid, p_limit integer)
RETURNS TABLE(
  post_id uuid,
  title text,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz,
  comment_count bigint,
  mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_limit NOT BETWEEN 1 AND 50
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    public.member_board_author_name(p.author_user_id),
    p.created_at,
    p.updated_at,
    (SELECT count(*) FROM public.member_board_comments c
      WHERE c.post_id = p.id AND c.deleted_at IS NULL),
    p.author_user_id = p_actor
  FROM public.member_board_posts p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT p_limit;
END;
$$;

-- One post, with its body. Returns no row for a post that does not exist and
-- for one that was deleted, which is the same answer the caller gets either
-- way: a board post is readable by every member, so there is nothing to
-- distinguish and no discovery to prevent.
CREATE OR REPLACE FUNCTION public.member_board_get(p_actor uuid, p_post uuid)
RETURNS TABLE(
  post_id uuid,
  title text,
  body text,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz,
  mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_post IS NULL
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.body,
    public.member_board_author_name(p.author_user_id),
    p.created_at,
    p.updated_at,
    p.author_user_id = p_actor
  FROM public.member_board_posts p
  WHERE p.id = p_post AND p.deleted_at IS NULL;
END;
$$;

-- Returns no row when the post is not the caller's, exactly as
-- `member_board_delete` returns false — the author check is the WHERE clause,
-- not a branch, so there is no path that edits someone else's post.
--
-- p_key is validated and not stored. An edit is last-write-wins, so a
-- replayed edit produces the same row; `member_board_delete` (044) takes one
-- on the same terms, and the write path passes one for every mutation.
CREATE OR REPLACE FUNCTION public.member_board_update(
  p_actor uuid,
  p_post uuid,
  p_title text,
  p_body text,
  p_key uuid
)
RETURNS TABLE(
  post_id uuid,
  title text,
  body text,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz,
  mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_post IS NULL OR p_key IS NULL OR p_title IS NULL OR p_body IS NULL
    OR char_length(p_title) NOT BETWEEN 1 AND 120
    OR char_length(p_body) NOT BETWEEN 1 AND 5000
    OR p_title ~ '[<>[:cntrl:]]' OR p_body ~ '[<>[:cntrl:]]'
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  UPDATE public.member_board_posts p
  SET title = p_title, body = p_body, updated_at = pg_catalog.clock_timestamp()
  WHERE p.id = p_post AND p.author_user_id = p_actor AND p.deleted_at IS NULL;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.body,
    public.member_board_author_name(p.author_user_id),
    p.created_at,
    p.updated_at,
    true
  FROM public.member_board_posts p
  WHERE p.id = p_post AND p.author_user_id = p_actor AND p.deleted_at IS NULL;
END;
$$;

-- Oldest first: a thread is read in the order it was written, which is the
-- opposite of the post list.
CREATE OR REPLACE FUNCTION public.member_board_comment_list(
  p_actor uuid,
  p_post uuid,
  p_limit integer
)
RETURNS TABLE(
  comment_id uuid,
  body text,
  author_name text,
  created_at timestamptz,
  mine boolean
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
    c.created_at,
    c.author_user_id = p_actor
  FROM public.member_board_comments c
  JOIN public.member_board_posts p ON p.id = c.post_id AND p.deleted_at IS NULL
  WHERE c.post_id = p_post AND c.deleted_at IS NULL
  ORDER BY c.created_at, c.id
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_board_comment_create(
  p_actor uuid,
  p_post uuid,
  p_body text,
  p_key uuid
)
RETURNS TABLE(
  comment_id uuid,
  body text,
  author_name text,
  created_at timestamptz,
  mine boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_id uuid;
  v_author uuid;
BEGIN
  IF p_actor IS NULL OR p_post IS NULL OR p_key IS NULL OR p_body IS NULL
    OR char_length(p_body) NOT BETWEEN 1 AND 1000
    OR p_body ~ '[<>[:cntrl:]]'
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status)
    OR NOT EXISTS(SELECT 1 FROM public.member_board_posts WHERE id = p_post AND deleted_at IS NULL) THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  -- The replayed row's author is compared to the caller before it is
  -- returned, the rule 045 standardized: a replayed key that belongs to
  -- someone else is an authorization failure, not a successful write.
  SELECT id, author_user_id INTO v_id, v_author
  FROM public.member_board_comments WHERE idempotency_key = p_key;
  IF FOUND THEN
    IF v_author <> p_actor THEN RAISE EXCEPTION USING ERRCODE = '28000'; END IF;
  ELSE
    INSERT INTO public.member_board_comments(post_id, author_user_id, idempotency_key, body)
    VALUES (p_post, p_actor, p_key, p_body)
    RETURNING id INTO v_id;
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.body,
    public.member_board_author_name(c.author_user_id),
    c.created_at,
    true
  FROM public.member_board_comments c
  WHERE c.id = v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_board_comment_delete(
  p_actor uuid,
  p_comment uuid,
  p_key uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_comment IS NULL OR p_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  UPDATE public.member_board_comments
  SET deleted_at = pg_catalog.clock_timestamp()
  WHERE id = p_comment AND author_user_id = p_actor AND deleted_at IS NULL;
  RETURN FOUND;
END;
$$;

ALTER FUNCTION public.member_board_author_name(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_list(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_get(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_update(uuid, uuid, text, text, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_comment_list(uuid, uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_comment_create(uuid, uuid, text, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_comment_delete(uuid, uuid, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.member_board_author_name(uuid),
  public.member_board_list(uuid, integer),
  public.member_board_get(uuid, uuid),
  public.member_board_update(uuid, uuid, text, text, uuid),
  public.member_board_comment_list(uuid, uuid, integer),
  public.member_board_comment_create(uuid, uuid, text, uuid),
  public.member_board_comment_delete(uuid, uuid, uuid)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION
  public.member_board_list(uuid, integer),
  public.member_board_get(uuid, uuid),
  public.member_board_update(uuid, uuid, text, text, uuid),
  public.member_board_comment_list(uuid, uuid, integer),
  public.member_board_comment_create(uuid, uuid, text, uuid),
  public.member_board_comment_delete(uuid, uuid, uuid)
TO moneyverse_app;

COMMIT;
