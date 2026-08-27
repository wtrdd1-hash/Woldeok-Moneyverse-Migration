-- Public content is a publication boundary, not a raw table read.  The web
-- process receives only published, vetted text/media fields and can mutate
-- content only through the audited commands below.  Legacy prototype rows
-- are deliberately returned to draft state so they cannot become public
-- without being reviewed under this policy.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.announcements, public.photos
  FROM PUBLIC, moneyverse_app;

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS content_state text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.announcements
SET content_state = 'draft',
    published_at = NULL,
    created_at = coalesce(created_at, pg_catalog.clock_timestamp()),
    updated_at = coalesce(updated_at, pg_catalog.clock_timestamp())
WHERE content_state IS NULL;

ALTER TABLE public.announcements
  ALTER COLUMN content_state SET DEFAULT 'draft',
  ALTER COLUMN content_state SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT pg_catalog.clock_timestamp(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT pg_catalog.clock_timestamp(),
  ALTER COLUMN updated_at SET NOT NULL;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.announcements'::regclass
      AND conname = 'announcements_content_state_check'
  ) THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_content_state_check
      CHECK (content_state IN ('draft', 'published'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.announcements'::regclass
      AND conname = 'announcements_publication_state_check'
  ) THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_publication_state_check
      CHECK (
        (content_state = 'draft' AND published_at IS NULL)
        OR (content_state = 'published' AND published_at IS NOT NULL)
      );
  END IF;
END;
$do$;

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS content_state text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_host text;

-- No historical storage key is treated as a public image URL.  A vetted
-- external HTTPS URL and an explicit publication command are now required.
UPDATE public.photos
SET content_state = 'draft',
    visibility = 'private',
    published_at = NULL,
    updated_at = coalesce(updated_at, pg_catalog.clock_timestamp())
WHERE content_state IS NULL;

ALTER TABLE public.photos
  ALTER COLUMN content_state SET DEFAULT 'draft',
  ALTER COLUMN content_state SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT pg_catalog.clock_timestamp(),
  ALTER COLUMN updated_at SET NOT NULL;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.photos'::regclass
      AND conname = 'photos_content_state_check'
  ) THEN
    ALTER TABLE public.photos
      ADD CONSTRAINT photos_content_state_check
      CHECK (content_state IN ('draft', 'published'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.photos'::regclass
      AND conname = 'photos_publication_state_check'
  ) THEN
    ALTER TABLE public.photos
      ADD CONSTRAINT photos_publication_state_check
      CHECK (
        (content_state = 'draft' AND visibility = 'private' AND published_at IS NULL)
        OR (content_state = 'published' AND visibility = 'public' AND published_at IS NOT NULL)
      );
  END IF;
END;
$do$;

CREATE INDEX IF NOT EXISTS announcements_public_feed_idx
  ON public.announcements (published_at DESC, id DESC)
  WHERE content_state = 'published';
CREATE INDEX IF NOT EXISTS photos_public_feed_idx
  ON public.photos (published_at DESC, id DESC)
  WHERE content_state = 'published' AND visibility = 'public';

CREATE TABLE IF NOT EXISTS public.content_command_receipts (
  idempotency_key uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL REFERENCES public.users(id),
  command text NOT NULL CHECK (command IN (
    'announcement.save', 'announcement.publication',
    'photo.save', 'photo.publication'
  )),
  request_hash bytea NOT NULL CHECK (pg_catalog.octet_length(request_hash) = 32),
  result_id uuid NOT NULL,
  result_published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- This is an infrastructure trust boundary.  No browser or normal content
-- operator can add a host.  A reviewed migration or database-owner workflow
-- must configure each exact host before any external image can be saved.
CREATE TABLE IF NOT EXISTS public.content_allowed_image_hosts (
  host text PRIMARY KEY,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (
    host ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
  )
);

CREATE TABLE IF NOT EXISTS public.content_status_sources (
  source_key text PRIMARY KEY,
  display_name text NOT NULL,
  public_visible boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  stale_after_seconds integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (source_key ~ '^[a-z][a-z0-9_-]{2,63}$'),
  CHECK (stale_after_seconds BETWEEN 15 AND 86400)
);

CREATE TABLE IF NOT EXISTS public.content_status_snapshots (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  source_key text NOT NULL REFERENCES public.content_status_sources(source_key),
  state text NOT NULL CHECK (state IN ('operational', 'degraded', 'outage', 'maintenance')),
  detail text,
  observed_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  UNIQUE (source_key, observed_at)
);

CREATE INDEX IF NOT EXISTS content_status_snapshots_latest_idx
  ON public.content_status_snapshots (source_key, observed_at DESC, id DESC);

-- These keys are configuration, not user-submitted labels. They remain
-- "unknown" until a separately provisioned, trusted status writer records a
-- recent snapshot; the application role never receives that write privilege.
INSERT INTO public.content_status_sources (
  source_key, display_name, public_visible, active, stale_after_seconds, sort_order
) VALUES
  ('web', '웹 서비스', true, true, 180, 10),
  ('minecraft', '마인크래프트 서버', true, true, 180, 20)
ON CONFLICT (source_key) DO NOTHING;

REVOKE ALL PRIVILEGES ON TABLE public.content_command_receipts,
  public.content_allowed_image_hosts,
  public.content_status_sources,
  public.content_status_snapshots
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.content_require_operator(p_actor_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_actor_user_id
      AND user_row.status = 'active'::public.user_status
      AND role_row.role = 'operator'::public.admin_role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active content operator role required';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_normalize_plain_text(
  p_value text,
  p_max_length integer,
  p_multiline boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_text text;
BEGIN
  IF p_value IS NULL OR p_max_length IS NULL OR p_max_length < 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'plain text is required';
  END IF;

  v_text := pg_catalog.replace(pg_catalog.replace(p_value, E'\r\n', E'\n'), E'\r', E'\n');
  IF p_multiline THEN
    v_text := pg_catalog.replace(v_text, E'\t', ' ');
    v_text := pg_catalog.regexp_replace(v_text, ' +', ' ', 'g');
    v_text := pg_catalog.regexp_replace(v_text, E' *\n *', E'\n', 'g');
    v_text := pg_catalog.regexp_replace(v_text, E'\n\n\n+', E'\n\n', 'g');
  ELSE
    v_text := pg_catalog.regexp_replace(v_text, '[[:space:]]+', ' ', 'g');
  END IF;
  v_text := pg_catalog.btrim(v_text);

  IF pg_catalog.char_length(v_text) = 0
    OR pg_catalog.char_length(v_text) > p_max_length
    OR v_text ~ '[<>]'
    OR pg_catalog.regexp_replace(v_text, E'\n', '', 'g') ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid plain text';
  END IF;
  RETURN v_text;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_normalize_storage_key(p_storage_key text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_key text;
BEGIN
  IF p_storage_key IS NULL OR p_storage_key <> pg_catalog.btrim(p_storage_key) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid storage key';
  END IF;
  v_key := p_storage_key;
  IF pg_catalog.char_length(v_key) < 1
    OR pg_catalog.char_length(v_key) > 255
    OR v_key !~ '^[A-Za-z0-9][A-Za-z0-9._/-]*$'
    OR v_key ~ '(^|/)([.]|[.][.])(/|$)'
    OR v_key ~ '//' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid storage key';
  END IF;
  RETURN v_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_normalize_image_host(p_host text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_host text;
BEGIN
  IF p_host IS NULL OR p_host <> pg_catalog.btrim(p_host) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid image host';
  END IF;
  v_host := pg_catalog.lower(p_host);
  IF p_host <> v_host
    OR v_host !~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
    OR v_host ~ '^[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid image host';
  END IF;
  RETURN v_host;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_validate_external_image_url(p_image_url text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_match text[];
  v_host text;
BEGIN
  IF p_image_url IS NULL
    OR p_image_url <> pg_catalog.btrim(p_image_url)
    OR pg_catalog.char_length(p_image_url) < 12
    OR pg_catalog.char_length(p_image_url) > 2048 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid external image URL';
  END IF;

  SELECT pg_catalog.regexp_match(
    p_image_url,
    '^https://([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+)(:443)?/([A-Za-z0-9._~%/@:+,;=!-]*)$'
  ) INTO v_match;
  IF v_match IS NULL OR p_image_url ~ '(%[^0-9A-Fa-f]|%$)' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid external image URL';
  END IF;

  v_host := public.content_normalize_image_host(v_match[1]);
  IF NOT EXISTS (
    SELECT 1
    FROM public.content_allowed_image_hosts AS host_row
    WHERE host_row.host = v_host
      AND host_row.active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'external image host is not configured';
  END IF;
  RETURN v_host;
END;
$$;

-- Configuration is intentionally not granted to moneyverse_app. A trusted
-- deployment/migration workflow must opt a host in before content operators
-- can reference it.
CREATE OR REPLACE FUNCTION public.content_configure_image_host(
  p_host text,
  p_active boolean DEFAULT true
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_host text;
BEGIN
  IF p_active IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'image host active flag is required';
  END IF;
  v_host := public.content_normalize_image_host(p_host);
  INSERT INTO public.content_allowed_image_hosts (host, active)
  VALUES (v_host, p_active)
  ON CONFLICT (host) DO UPDATE SET active = EXCLUDED.active;
  RETURN v_host;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.content_list_published_announcements(
  p_limit integer DEFAULT 20
)
RETURNS TABLE(announcement_id uuid, title text, body text, published_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'announcement limit must be between 1 and 100';
  END IF;
  RETURN QUERY
  SELECT announcement_row.id, announcement_row.title, announcement_row.body, announcement_row.published_at
  FROM public.announcements AS announcement_row
  WHERE announcement_row.content_state = 'published'
    AND announcement_row.published_at <= pg_catalog.clock_timestamp()
  ORDER BY announcement_row.published_at DESC, announcement_row.id DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_list_published_photos(
  p_limit integer DEFAULT 24
)
RETURNS TABLE(photo_id uuid, image_url text, alt_text text, published_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'photo limit must be between 1 and 100';
  END IF;
  RETURN QUERY
  SELECT photo_row.id, photo_row.image_url, photo_row.alt_text, photo_row.published_at
  FROM public.photos AS photo_row
  JOIN public.content_allowed_image_hosts AS host_row
    ON host_row.host = photo_row.image_host
   AND host_row.active
  WHERE photo_row.content_state = 'published'
    AND photo_row.visibility = 'public'
    AND photo_row.published_at <= pg_catalog.clock_timestamp()
    AND photo_row.image_url IS NOT NULL
    AND (
      photo_row.image_url LIKE ('https://' || host_row.host || '/%')
      OR photo_row.image_url LIKE ('https://' || host_row.host || ':443/%')
    )
  ORDER BY photo_row.published_at DESC, photo_row.id DESC
  LIMIT p_limit;
END;
$$;

-- Status source configuration and snapshot ingestion are deliberately
-- database-owner operations. The web role is never granted these functions,
-- so a request body cannot register a source or declare a service healthy.
CREATE OR REPLACE FUNCTION public.content_configure_status_source(
  p_source_key text,
  p_display_name text,
  p_public_visible boolean,
  p_active boolean,
  p_stale_after_seconds integer,
  p_sort_order integer DEFAULT 0
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_source_key text;
  v_display_name text;
BEGIN
  IF p_source_key IS NULL OR p_source_key <> pg_catalog.btrim(p_source_key) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid status source key';
  END IF;
  v_source_key := pg_catalog.lower(p_source_key);
  IF p_source_key <> v_source_key OR v_source_key !~ '^[a-z][a-z0-9_-]{2,63}$'
    OR p_public_visible IS NULL OR p_active IS NULL
    OR p_stale_after_seconds IS NULL OR p_stale_after_seconds < 15 OR p_stale_after_seconds > 86400
    OR p_sort_order IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid status source configuration';
  END IF;
  v_display_name := public.content_normalize_plain_text(p_display_name, 80, false);
  INSERT INTO public.content_status_sources (
    source_key, display_name, public_visible, active, stale_after_seconds, sort_order
  ) VALUES (
    v_source_key, v_display_name, p_public_visible, p_active, p_stale_after_seconds, p_sort_order
  )
  ON CONFLICT (source_key) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      public_visible = EXCLUDED.public_visible,
      active = EXCLUDED.active,
      stale_after_seconds = EXCLUDED.stale_after_seconds,
      sort_order = EXCLUDED.sort_order;
  RETURN v_source_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_record_server_status(
  p_source_key text,
  p_state text,
  p_detail text,
  p_observed_at timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_source_key text;
  v_state text;
  v_detail text;
  v_snapshot_id uuid;
  v_existing_state text;
  v_existing_detail text;
BEGIN
  IF p_source_key IS NULL OR p_source_key <> pg_catalog.btrim(p_source_key) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid status source';
  END IF;
  v_source_key := pg_catalog.lower(p_source_key);
  v_state := pg_catalog.lower(pg_catalog.btrim(coalesce(p_state, '')));
  IF v_source_key !~ '^[a-z][a-z0-9_-]{2,63}$'
    OR v_state NOT IN ('operational', 'degraded', 'outage', 'maintenance')
    OR p_observed_at IS NULL
    OR p_observed_at < pg_catalog.clock_timestamp() - interval '10 minutes'
    OR p_observed_at > pg_catalog.clock_timestamp() + interval '1 minute' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid server status snapshot';
  END IF;
  IF p_detail IS NULL THEN
    v_detail := NULL;
  ELSE
    v_detail := public.content_normalize_plain_text(p_detail, 280, false);
  END IF;
  PERFORM 1
  FROM public.content_status_sources AS source_row
  WHERE source_row.source_key = v_source_key
    AND source_row.active
  FOR KEY SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'configured active status source required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'moneyverse:content-status:' || v_source_key || ':' || p_observed_at::text,
      0
    )
  );
  SELECT snapshot.id, snapshot.state, snapshot.detail
  INTO v_snapshot_id, v_existing_state, v_existing_detail
  FROM public.content_status_snapshots AS snapshot
  WHERE snapshot.source_key = v_source_key
    AND snapshot.observed_at = p_observed_at
  FOR UPDATE;
  IF FOUND THEN
    IF v_existing_state IS DISTINCT FROM v_state OR v_existing_detail IS DISTINCT FROM v_detail THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'status snapshot identity was reused with different data';
    END IF;
    RETURN v_snapshot_id;
  END IF;

  INSERT INTO public.content_status_snapshots (source_key, state, detail, observed_at)
  VALUES (v_source_key, v_state, v_detail, p_observed_at)
  RETURNING id INTO v_snapshot_id;
  RETURN v_snapshot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.content_public_status()
RETURNS TABLE(source_key text, display_name text, state text, detail text, observed_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    source_row.source_key,
    source_row.display_name,
    CASE
      WHEN snapshot_row.id IS NULL
        OR snapshot_row.observed_at < pg_catalog.clock_timestamp()
          - source_row.stale_after_seconds * interval '1 second'
      THEN 'unknown'
      ELSE snapshot_row.state
    END AS state,
    CASE
      WHEN snapshot_row.id IS NULL
        OR snapshot_row.observed_at < pg_catalog.clock_timestamp()
          - source_row.stale_after_seconds * interval '1 second'
      THEN NULL
      ELSE snapshot_row.detail
    END AS detail,
    CASE
      WHEN snapshot_row.id IS NULL
        OR snapshot_row.observed_at < pg_catalog.clock_timestamp()
          - source_row.stale_after_seconds * interval '1 second'
      THEN NULL
      ELSE snapshot_row.observed_at
    END AS observed_at
  FROM public.content_status_sources AS source_row
  LEFT JOIN LATERAL (
    SELECT snapshot.id, snapshot.state, snapshot.detail, snapshot.observed_at
    FROM public.content_status_snapshots AS snapshot
    WHERE snapshot.source_key = source_row.source_key
    ORDER BY snapshot.observed_at DESC, snapshot.id DESC
    LIMIT 1
  ) AS snapshot_row ON true
  WHERE source_row.active
    AND source_row.public_visible
  ORDER BY source_row.sort_order ASC, source_row.source_key ASC;
END;
$$;

ALTER FUNCTION public.content_require_operator(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_normalize_plain_text(text, integer, boolean) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_normalize_storage_key(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_normalize_image_host(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_validate_external_image_url(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_configure_image_host(text, boolean) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_save_announcement(uuid, uuid, text, text, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_set_announcement_publication(uuid, uuid, boolean, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_save_photo(uuid, uuid, text, text, text, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_list_published_announcements(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_list_published_photos(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_configure_status_source(text, text, boolean, boolean, integer, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_record_server_status(text, text, text, timestamptz) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_public_status() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.content_require_operator(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_normalize_plain_text(text, integer, boolean) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_normalize_storage_key(text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_normalize_image_host(text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_validate_external_image_url(text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_configure_image_host(text, boolean) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_save_announcement(uuid, uuid, text, text, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_set_announcement_publication(uuid, uuid, boolean, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_save_photo(uuid, uuid, text, text, text, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_list_published_announcements(integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_list_published_photos(integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_configure_status_source(text, text, boolean, boolean, integer, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_record_server_status(text, text, text, timestamptz) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_public_status() FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.content_list_published_announcements(integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_list_published_photos(integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_public_status() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_save_announcement(uuid, uuid, text, text, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_set_announcement_publication(uuid, uuid, boolean, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_save_photo(uuid, uuid, text, text, text, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_set_photo_publication(uuid, uuid, boolean, uuid, uuid) TO moneyverse_app;

COMMIT;
