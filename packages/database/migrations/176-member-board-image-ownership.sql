BEGIN;

CREATE TABLE public.member_board_image_uploads (
  storage_key text PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT member_board_image_uploads_key_check
    CHECK (storage_key ~ '^[0-9a-f-]{36}\.(png|jpg|webp)$')
);

REVOKE ALL PRIVILEGES ON TABLE public.member_board_image_uploads FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.member_board_register_image_upload(p_actor uuid, p_storage_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_storage_key IS NULL
    OR p_storage_key !~ '^[0-9a-f-]{36}\.(png|jpg|webp)$'
    OR NOT EXISTS(
      SELECT 1 FROM public.users
      WHERE id = p_actor AND status = 'active'::public.user_status
    ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.member_board_image_uploads(storage_key, owner_user_id)
  VALUES (p_storage_key, p_actor)
  ON CONFLICT (storage_key) DO UPDATE
    SET owner_user_id = EXCLUDED.owner_user_id
    WHERE public.member_board_image_uploads.owner_user_id = EXCLUDED.owner_user_id;

  RETURN EXISTS(
    SELECT 1
    FROM public.member_board_image_uploads
    WHERE storage_key = p_storage_key AND owner_user_id = p_actor
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.member_board_create_with_image(
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
    IF p_image_storage_key IS NOT NULL AND NOT EXISTS(
      SELECT 1 FROM public.member_board_image_uploads
      WHERE storage_key=p_image_storage_key AND owner_user_id=p_actor
    ) THEN
      RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='board image upload is not owned by actor';
    END IF;

    INSERT INTO public.member_board_posts(author_user_id,idempotency_key,title,body,image_storage_key,image_alt_text)
    VALUES(p_actor,p_key,p_title,p_body,p_image_storage_key,p_image_alt_text)
    RETURNING id INTO v_id;

    IF p_image_storage_key IS NOT NULL THEN
      DELETE FROM public.member_board_image_uploads
      WHERE storage_key=p_image_storage_key AND owner_user_id=p_actor;
    END IF;
  END IF;

  RETURN QUERY
  SELECT p.id,p.title,p.body,public.member_board_author_name(p.author_user_id),p.created_at,p.updated_at,true,
    p.image_storage_key,p.image_alt_text
  FROM public.member_board_posts p WHERE p.id=v_id;
END;
$$;

ALTER FUNCTION public.member_board_register_image_upload(uuid,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_create_with_image(uuid,text,text,uuid,text,text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.member_board_register_image_upload(uuid,text),
  public.member_board_create_with_image(uuid,text,text,uuid,text,text)
FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION
  public.member_board_register_image_upload(uuid,text),
  public.member_board_create_with_image(uuid,text,text,uuid,text,text)
TO moneyverse_app;

COMMIT;
