-- Announcement images reuse the private image store. Only published rows make
-- their opaque key public through the media controller.
BEGIN;

ALTER TABLE public.content_command_receipts
  DROP CONSTRAINT content_command_receipts_command_check,
  ADD CONSTRAINT content_command_receipts_command_check CHECK (command IN (
    'announcement.save', 'announcement.image', 'announcement.publication',
    'photo.save', 'photo.publication'
  ));

ALTER TABLE public.announcements
  ADD COLUMN image_storage_key text,
  ADD COLUMN image_alt_text text,
  ADD CONSTRAINT announcements_image_pair_check CHECK (
    (image_storage_key IS NULL AND image_alt_text IS NULL)
    OR (image_storage_key IS NOT NULL AND image_alt_text IS NOT NULL)
  );
CREATE UNIQUE INDEX announcements_image_storage_key_uq
  ON public.announcements(image_storage_key) WHERE image_storage_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.content_set_announcement_image(
  p_actor_user_id uuid,
  p_announcement_id uuid,
  p_storage_key text,
  p_alt_text text,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(announcement_id uuid, published_at timestamptz, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_storage_key text;
  v_alt_text text;
  v_request_hash bytea;
  v_existing_actor uuid;
  v_existing_command text;
  v_existing_hash bytea;
  v_existing_result_id uuid;
  v_existing_published_at timestamptz;
  v_published_at timestamptz;
BEGIN
  IF p_actor_user_id IS NULL OR p_announcement_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement image command identity is required';
  END IF;
  PERFORM public.content_require_operator(p_actor_user_id);
  v_storage_key := public.content_normalize_storage_key(p_storage_key);
  v_alt_text := public.content_normalize_plain_text(p_alt_text, 300, false);
  v_request_hash := public.digest(pg_catalog.jsonb_build_object(
    'actorUserId', p_actor_user_id::text,
    'announcementId', p_announcement_id::text,
    'storageKey', v_storage_key,
    'altText', v_alt_text
  )::text, 'sha256');

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:content-command:' || p_idempotency_key::text, 0)
  );
  SELECT receipt.actor_user_id, receipt.command, receipt.request_hash,
         receipt.result_id, receipt.result_published_at
    INTO v_existing_actor, v_existing_command, v_existing_hash,
         v_existing_result_id, v_existing_published_at
  FROM public.content_command_receipts AS receipt
  WHERE receipt.idempotency_key = p_idempotency_key
  FOR UPDATE;
  IF FOUND THEN
    IF v_existing_actor IS DISTINCT FROM p_actor_user_id
      OR v_existing_command IS DISTINCT FROM 'announcement.image'
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was reused with a different content command';
    END IF;
    RETURN QUERY SELECT v_existing_result_id, v_existing_published_at, true;
    RETURN;
  END IF;

  UPDATE public.announcements AS announcement_row
  SET image_storage_key = v_storage_key,
      image_alt_text = v_alt_text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = p_announcement_id AND content_state = 'draft'
  RETURNING announcement_row.published_at INTO v_published_at;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'draft announcement is unavailable';
  END IF;

  INSERT INTO public.content_command_receipts(
    idempotency_key, actor_user_id, command, request_hash, result_id, result_published_at
  ) VALUES (
    p_idempotency_key, p_actor_user_id, 'announcement.image', v_request_hash,
    p_announcement_id, v_published_at
  );
  PERFORM public.admin_append_audit_event(
    p_actor_user_id, 'content.announcement.image-set', p_announcement_id, p_request_id,
    pg_catalog.jsonb_build_object('announcementId', p_announcement_id::text)
  );
  RETURN QUERY SELECT p_announcement_id, v_published_at, false;
END;
$$;
ALTER FUNCTION public.content_set_announcement_image(uuid, uuid, text, text, uuid, uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_set_announcement_image(uuid, uuid, text, text, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_set_announcement_image(uuid, uuid, text, text, uuid, uuid)
  TO moneyverse_app;

DROP FUNCTION public.content_list_published_announcements(integer);
CREATE FUNCTION public.content_list_published_announcements(p_limit integer DEFAULT 20)
RETURNS TABLE(
  announcement_id uuid, title text, body text, image_url text,
  image_alt_text text, published_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement limit must be between 1 and 100';
  END IF;
  RETURN QUERY
  SELECT announcement_row.id, announcement_row.title, announcement_row.body,
    CASE WHEN announcement_row.image_storage_key IS NULL THEN NULL
      ELSE '/media/' || announcement_row.image_storage_key END,
    announcement_row.image_alt_text, announcement_row.published_at
  FROM public.announcements AS announcement_row
  WHERE announcement_row.content_state = 'published'
    AND announcement_row.published_at <= pg_catalog.clock_timestamp()
  ORDER BY announcement_row.published_at DESC, announcement_row.id DESC
  LIMIT p_limit;
END;
$$;
ALTER FUNCTION public.content_list_published_announcements(integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_list_published_announcements(integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_list_published_announcements(integer) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.content_is_public_storage_key(p_storage_key text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.photos
    WHERE storage_key=p_storage_key AND content_state='published'
      AND visibility='public' AND published_at<=pg_catalog.clock_timestamp()
    UNION ALL
    SELECT 1 FROM public.announcements
    WHERE image_storage_key=p_storage_key AND content_state='published'
      AND published_at<=pg_catalog.clock_timestamp()
  )
$$;
ALTER FUNCTION public.content_is_public_storage_key(text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_is_public_storage_key(text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_is_public_storage_key(text) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.announcements FROM PUBLIC, moneyverse_app;
COMMIT;
