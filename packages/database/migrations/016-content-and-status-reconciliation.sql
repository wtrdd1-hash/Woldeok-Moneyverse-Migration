-- Reconciles the one historical 013 revision accepted by test/db/migrate.sh
-- with the finalized content API.  The old revision created the same tables,
-- constraints, and privilege boundary, but four SECURITY DEFINER commands
-- used unqualified RETURNING / SET expressions.  PostgreSQL can resolve those
-- expressions as output variables, causing otherwise-authorized content
-- commands to fail at runtime.  Replacing the command definitions is an
-- immutable, data-preserving repair; it does not rewrite schema_migrations.
--
-- This migration is also safe on a fresh database that already received the
-- finalized 013: CREATE OR REPLACE keeps the identical public signatures and
-- the REVOKE/GRANT statements converge on the intended least-privilege state.
BEGIN;

-- Reassert the publication boundary even if a DBA temporarily granted table
-- access while investigating the historical runtime failure.  The application
-- may use only the explicitly granted DB-owned commands below.
REVOKE ALL PRIVILEGES ON TABLE public.announcements, public.photos,
  public.content_command_receipts, public.content_allowed_image_hosts,
  public.content_status_sources, public.content_status_snapshots
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.content_save_announcement(
  p_actor_user_id uuid,
  p_announcement_id uuid,
  p_title text,
  p_body text,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(announcement_id uuid, published_at timestamptz, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_title text;
  v_body text;
  v_request_hash bytea;
  v_existing_actor uuid;
  v_existing_command text;
  v_existing_hash bytea;
  v_existing_result_id uuid;
  v_existing_published_at timestamptz;
  v_announcement_id uuid;
  v_published_at timestamptz;
BEGIN
  IF p_actor_user_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'content command identity is required';
  END IF;
  PERFORM public.content_require_operator(p_actor_user_id);
  v_title := public.content_normalize_plain_text(p_title, 160, false);
  v_body := public.content_normalize_plain_text(p_body, 12000, true);
  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'actorUserId', p_actor_user_id::text,
      'announcementId', p_announcement_id::text,
      'title', v_title,
      'body', v_body
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
      OR v_existing_command IS DISTINCT FROM 'announcement.save'
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was reused with a different content command';
    END IF;
    RETURN QUERY SELECT v_existing_result_id, v_existing_published_at, true;
    RETURN;
  END IF;

  IF p_announcement_id IS NULL THEN
    INSERT INTO public.announcements AS announcement_row (
      title, body, published_at, created_by, content_state, created_at, updated_at
    ) VALUES (
      v_title, v_body, NULL, p_actor_user_id, 'draft', pg_catalog.clock_timestamp(), pg_catalog.clock_timestamp()
    ) RETURNING announcement_row.id, announcement_row.published_at INTO v_announcement_id, v_published_at;
  ELSE
    UPDATE public.announcements AS announcement_row
    SET title = v_title,
        body = v_body,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_announcement_id
      AND content_state = 'draft'
    RETURNING announcement_row.id, announcement_row.published_at INTO v_announcement_id, v_published_at;
    IF v_announcement_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'draft announcement is unavailable';
    END IF;
  END IF;

  INSERT INTO public.content_command_receipts (
    idempotency_key, actor_user_id, command, request_hash, result_id, result_published_at
  ) VALUES (
    p_idempotency_key, p_actor_user_id, 'announcement.save', v_request_hash, v_announcement_id, v_published_at
  );
  PERFORM public.admin_append_audit_event(
    p_actor_user_id,
    'content.announcement.saved',
    v_announcement_id,
    p_request_id,
    pg_catalog.jsonb_build_object('announcementId', v_announcement_id::text)
  );
  RETURN QUERY SELECT v_announcement_id, v_published_at, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_set_announcement_publication(
  p_actor_user_id uuid,
  p_announcement_id uuid,
  p_publish boolean,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(announcement_id uuid, published_at timestamptz, replayed boolean)
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
  v_published_at timestamptz;
BEGIN
  IF p_actor_user_id IS NULL OR p_announcement_id IS NULL
    OR p_publish IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'content publication identity is required';
  END IF;
  PERFORM public.content_require_operator(p_actor_user_id);
  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'actorUserId', p_actor_user_id::text,
      'announcementId', p_announcement_id::text,
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
      OR v_existing_command IS DISTINCT FROM 'announcement.publication'
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was reused with a different content command';
    END IF;
    RETURN QUERY SELECT v_existing_result_id, v_existing_published_at, true;
    RETURN;
  END IF;

  IF p_publish THEN
    UPDATE public.announcements AS announcement_row
    SET content_state = 'published',
        published_at = coalesce(announcement_row.published_at, pg_catalog.clock_timestamp()),
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_announcement_id
    RETURNING announcement_row.published_at INTO v_published_at;
  ELSE
    UPDATE public.announcements AS announcement_row
    SET content_state = 'draft',
        published_at = NULL,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_announcement_id
    RETURNING announcement_row.published_at INTO v_published_at;
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement is unavailable';
  END IF;

  INSERT INTO public.content_command_receipts (
    idempotency_key, actor_user_id, command, request_hash, result_id, result_published_at
  ) VALUES (
    p_idempotency_key, p_actor_user_id, 'announcement.publication', v_request_hash, p_announcement_id, v_published_at
  );
  PERFORM public.admin_append_audit_event(
    p_actor_user_id,
    CASE WHEN p_publish THEN 'content.announcement.published' ELSE 'content.announcement.unpublished' END,
    p_announcement_id,
    p_request_id,
    pg_catalog.jsonb_build_object('announcementId', p_announcement_id::text, 'published', p_publish)
  );
  RETURN QUERY SELECT p_announcement_id, v_published_at, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_save_photo(
  p_actor_user_id uuid,
  p_photo_id uuid,
  p_storage_key text,
  p_image_url text,
  p_alt_text text,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(photo_id uuid, published_at timestamptz, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_storage_key text;
  v_alt_text text;
  v_image_host text;
  v_request_hash bytea;
  v_existing_actor uuid;
  v_existing_command text;
  v_existing_hash bytea;
  v_existing_result_id uuid;
  v_existing_published_at timestamptz;
  v_photo_id uuid;
  v_published_at timestamptz;
BEGIN
  IF p_actor_user_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'content command identity is required';
  END IF;
  PERFORM public.content_require_operator(p_actor_user_id);
  v_storage_key := public.content_normalize_storage_key(p_storage_key);
  v_alt_text := public.content_normalize_plain_text(p_alt_text, 300, false);
  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'actorUserId', p_actor_user_id::text,
      'photoId', p_photo_id::text,
      'storageKey', v_storage_key,
      'imageUrl', p_image_url,
      'altText', v_alt_text
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
      OR v_existing_command IS DISTINCT FROM 'photo.save'
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was reused with a different content command';
    END IF;
    RETURN QUERY SELECT v_existing_result_id, v_existing_published_at, true;
    RETURN;
  END IF;

  -- Validate the configured host only after an exact idempotent receipt has
  -- been found. A host may be disabled after a successful draft save; a lost
  -- response can still be replayed, while a new save fails closed.
  v_image_host := public.content_validate_external_image_url(p_image_url);

  IF p_photo_id IS NULL THEN
    INSERT INTO public.photos AS photo_row (
      storage_key, alt_text, visibility, uploaded_by, created_at,
      content_state, published_at, updated_at, image_url, image_host
    ) VALUES (
      v_storage_key, v_alt_text, 'private', p_actor_user_id, pg_catalog.clock_timestamp(),
      'draft', NULL, pg_catalog.clock_timestamp(), p_image_url, v_image_host
    ) RETURNING photo_row.id, photo_row.published_at INTO v_photo_id, v_published_at;
  ELSE
    UPDATE public.photos AS photo_row
    SET storage_key = v_storage_key,
        alt_text = v_alt_text,
        image_url = p_image_url,
        image_host = v_image_host,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_photo_id
      AND content_state = 'draft'
    RETURNING photo_row.id, photo_row.published_at INTO v_photo_id, v_published_at;
    IF v_photo_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'draft photo is unavailable';
    END IF;
  END IF;

  INSERT INTO public.content_command_receipts (
    idempotency_key, actor_user_id, command, request_hash, result_id, result_published_at
  ) VALUES (
    p_idempotency_key, p_actor_user_id, 'photo.save', v_request_hash, v_photo_id, v_published_at
  );
  PERFORM public.admin_append_audit_event(
    p_actor_user_id,
    'content.photo.saved',
    v_photo_id,
    p_request_id,
    pg_catalog.jsonb_build_object('photoId', v_photo_id::text, 'imageHost', v_image_host)
  );
  RETURN QUERY SELECT v_photo_id, v_published_at, false;
END;
$$;

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

  SELECT photo_row.image_url, photo_row.image_host
  INTO v_image_url, v_image_host
  FROM public.photos AS photo_row
  WHERE photo_row.id = p_photo_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'photo is unavailable';
  END IF;

  IF p_publish THEN
    v_checked_host := public.content_validate_external_image_url(v_image_url);
    IF v_checked_host IS DISTINCT FROM v_image_host THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'photo image host is unavailable';
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

ALTER FUNCTION public.content_save_announcement(uuid, uuid, text, text, uuid, uuid)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_set_announcement_publication(uuid, uuid, boolean, uuid, uuid)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_save_photo(uuid, uuid, text, text, text, uuid, uuid)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid)
  OWNER TO moneyverse_migrator;

-- Revoke first so the reconciliation is safe even when an accidental grant
-- existed. Then restore the four narrow application commands from finalized
-- 013; configuration and status-writer functions remain database-owner only.
REVOKE ALL PRIVILEGES ON FUNCTION public.content_save_announcement(uuid, uuid, text, text, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_set_announcement_publication(uuid, uuid, boolean, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_save_photo(uuid, uuid, text, text, text, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.content_save_announcement(uuid, uuid, text, text, uuid, uuid)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_set_announcement_publication(uuid, uuid, boolean, uuid, uuid)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_save_photo(uuid, uuid, text, text, text, uuid, uuid)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid)
  TO moneyverse_app;

COMMIT;
