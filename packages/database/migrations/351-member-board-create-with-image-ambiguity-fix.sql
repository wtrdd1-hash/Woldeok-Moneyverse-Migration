-- Forward-only fix (2026-11-25 signed-in E2E on Test): member_board_create_with_image
-- failed on every call with 42702 'column reference "author_user_id" is ambiguous'
-- because its RETURNS TABLE column shares the name with the table column read in the
-- idempotency replay check. Every board post through the Spring API failed. The only
-- change is the table alias on that one SELECT; signature, grants and logic are unchanged.
BEGIN;
CREATE OR REPLACE FUNCTION public.member_board_create_with_image(p_actor uuid, p_title text, p_body text, p_key uuid, p_image_storage_key text, p_image_alt_text text)
 RETURNS TABLE(post_id uuid, title text, body text, author_name text, author_user_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, mine boolean, image_storage_key text, image_alt_text text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
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
  SELECT existing.id, existing.author_user_id INTO v_id, v_author FROM public.member_board_posts AS existing WHERE existing.idempotency_key = p_key;
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
$function$;
COMMIT;
