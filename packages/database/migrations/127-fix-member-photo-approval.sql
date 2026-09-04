-- 123-fix-member-photo-approval.sql
--
-- Fix member photo approval: allow same-origin internal media path (/media/<storage_key>)
-- to be published by operators without failing external host validation.

BEGIN;

CREATE OR REPLACE FUNCTION public.content_set_photo_publication(
  p_actor_user_id uuid,
  p_photo_id uuid,
  p_publish boolean,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(photo_id uuid, published_at timestamptz, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_request_hash bytea;
  v_existing_actor uuid;
  v_existing_command text;
  v_existing_hash bytea;
  v_existing_result_id uuid;
  v_existing_published_at timestamptz;
  v_image_url text;
  v_image_host text;
  v_storage_key text;
  v_checked_host text;
  v_published_at timestamptz;
BEGIN
  IF p_actor_user_id IS NULL OR p_photo_id IS NULL
    OR p_publish IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'content publication identity is required';
  END IF;
  PERFORM public.content_require_operator(p_actor_user_id);
  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'actorUserId', p_actor_user_id::text,
      'photoId', p_photo_id::text,
      'publish', p_publish
    )::text,
    'sha256'
  );

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
      OR v_existing_command IS DISTINCT FROM 'photo.publication'
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was reused with a different content command';
    END IF;
    RETURN QUERY SELECT v_existing_result_id, v_existing_published_at, true;
    RETURN;
  END IF;

  SELECT photo_row.image_url, photo_row.image_host, photo_row.storage_key
  INTO v_image_url, v_image_host, v_storage_key
  FROM public.photos AS photo_row
  WHERE photo_row.id = p_photo_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'photo is unavailable';
  END IF;

  IF p_publish THEN
    -- Internal same-origin media submission from member uploads bypasses external host check
    IF v_image_url = ('/media/' || v_storage_key) THEN
      NULL;
    ELSE
      v_checked_host := public.content_validate_external_image_url(v_image_url);
      IF v_checked_host IS DISTINCT FROM v_image_host THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'photo image host is unavailable';
      END IF;
    END IF;

    UPDATE public.photos AS photo_row
    SET content_state = 'published',
        visibility = 'public',
        published_at = coalesce(photo_row.published_at, pg_catalog.clock_timestamp()),
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_photo_id
    RETURNING photo_row.published_at INTO v_published_at;
  ELSE
    UPDATE public.photos AS photo_row
    SET content_state = 'draft',
        visibility = 'private',
        published_at = NULL,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_photo_id
    RETURNING photo_row.published_at INTO v_published_at;
  END IF;

  INSERT INTO public.content_command_receipts (
    idempotency_key, actor_user_id, command, request_hash, result_id, result_published_at
  ) VALUES (
    p_idempotency_key, p_actor_user_id, 'photo.publication', v_request_hash, p_photo_id, v_published_at
  );
  PERFORM public.admin_append_audit_event(
    p_actor_user_id,
    CASE WHEN p_publish THEN 'content.photo.published' ELSE 'content.photo.unpublished' END,
    p_photo_id,
    p_request_id,
    pg_catalog.jsonb_build_object('photoId', p_photo_id::text, 'published', p_publish)
  );
  RETURN QUERY SELECT p_photo_id, v_published_at, false;
END;
$$;

ALTER FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid)
  OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid)
  TO moneyverse_app;

COMMIT;
