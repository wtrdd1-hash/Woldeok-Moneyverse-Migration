-- Member-owned, not-yet-published gallery submission withdrawal.
-- A committed tombstone retains the daily quota and idempotency proof while
-- removing the draft row, so existing media, queue and publication functions
-- immediately refuse the orphaned private image. Never delete media bytes here.
BEGIN;

CREATE TABLE public.member_photo_withdrawals (
  idempotency_key uuid PRIMARY KEY,
  actor uuid NOT NULL,
  photo_id uuid NOT NULL UNIQUE,
  request_hash bytea NOT NULL,
  storage_key_digest bytea NOT NULL,
  submitted_at timestamptz NOT NULL,
  withdrawn_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
CREATE INDEX member_photo_withdrawals_actor_day_idx
  ON public.member_photo_withdrawals(actor, submitted_at);

ALTER TABLE public.member_photo_withdrawals OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON TABLE public.member_photo_withdrawals FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.member_withdraw_pending_photo(
  p_actor uuid, p_photo_id uuid, p_idempotency_key uuid
)
RETURNS TABLE(photo_id uuid, withdrawn_at timestamptz, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_hash bytea;
  v_actor uuid;
  v_photo uuid;
  v_existing_hash bytea;
  v_withdrawn_at timestamptz;
  v_owner uuid;
  v_state text;
  v_published_at timestamptz;
  v_storage_key text;
  v_submitted_at timestamptz;
BEGIN
  IF p_actor IS NULL OR p_photo_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'withdrawal identity required';
  END IF;
  v_hash := public.digest(
    pg_catalog.jsonb_build_object('actor', p_actor::text, 'photo', p_photo_id::text)::text,
    'sha256'
  );
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:member-photo-withdraw:' || p_idempotency_key::text, 0)
  );

  SELECT w.actor, w.photo_id, w.request_hash, w.withdrawn_at
    INTO v_actor, v_photo, v_existing_hash, v_withdrawn_at
  FROM public.member_photo_withdrawals AS w
  WHERE w.idempotency_key = p_idempotency_key
  FOR UPDATE;
  IF FOUND THEN
    IF v_actor IS DISTINCT FROM p_actor OR v_photo IS DISTINCT FROM p_photo_id
      OR v_existing_hash IS DISTINCT FROM v_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'withdrawal key was reused';
    END IF;
    RETURN QUERY SELECT p_photo_id, v_withdrawn_at, true;
    RETURN;
  END IF;

  SELECT p.uploaded_by, p.content_state, p.published_at, p.storage_key, p.created_at
    INTO v_owner, v_state, v_published_at, v_storage_key, v_submitted_at
  FROM public.photos AS p WHERE p.id = p_photo_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'photo is unavailable for withdrawal';
  END IF;
  IF v_owner IS DISTINCT FROM p_actor THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'photo is unavailable for withdrawal';
  END IF;
  IF v_state IS DISTINCT FROM 'draft' OR v_published_at IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'published photos require operator takedown';
  END IF;

  -- The submit path takes this same owner/day lock before checking the
  -- 5-photo quota. The deleted row and tombstone become visible atomically.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:member-photo-day:' || p_actor::text, 0)
  );
  DELETE FROM public.photos AS p WHERE p.id = p_photo_id;
  INSERT INTO public.member_photo_withdrawals (
    idempotency_key, actor, photo_id, request_hash, storage_key_digest, submitted_at
  ) VALUES (
    p_idempotency_key, p_actor, p_photo_id, v_hash,
    public.digest(v_storage_key, 'sha256'), v_submitted_at
  )
  RETURNING member_photo_withdrawals.withdrawn_at INTO v_withdrawn_at;
  RETURN QUERY SELECT p_photo_id, v_withdrawn_at, false;
END;
$$;

ALTER FUNCTION public.member_withdraw_pending_photo(uuid, uuid, uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_withdraw_pending_photo(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_withdraw_pending_photo(uuid, uuid, uuid)
  TO moneyverse_app;


-- Re-state the immutable 098 submission contract with withdrawn-day quota.
CREATE OR REPLACE FUNCTION public.member_submit_photo(
  p_actor uuid,
  p_key uuid,
  p_storage_key text,
  p_alt_text text
)
RETURNS TABLE(photo_id uuid, submitted_at timestamptz, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  c_daily_limit constant integer := 5;
  v_owner uuid;
  v_key text;
  v_alt text;
  v_today integer;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'photo submission identity is required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:member-photo:' || p_key::text, 0)
  );

  -- A withdrawn submission's UUID remains retired, including on retries.
  IF EXISTS (
    SELECT 1 FROM public.member_photo_withdrawals AS w WHERE w.photo_id = p_key
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'withdrawn photo cannot be resubmitted';
  END IF;

  SELECT photo_row.id, photo_row.uploaded_by, photo_row.created_at
  INTO photo_id, v_owner, submitted_at
  FROM public.photos AS photo_row
  WHERE photo_row.id = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'photo submission belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  IF public.feature_switch_state('member_photo_submissions') <> 'enabled' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'photo submissions are closed';
  END IF;

  -- 013's normalisers, so a member's submission is held to the same shape as
  -- an operator's: the key must look like a key, and the caption is stripped
  -- of control characters and length-checked rather than trusted.
  v_key := public.content_normalize_storage_key(p_storage_key);
  v_alt := public.content_normalize_plain_text(p_alt_text, 300, false);

  -- A second lock, on the member rather than on the key: the key lock
  -- serialises retries of one request and does nothing about two different
  -- requests counting the same day, which is how a daily limit gets exceeded.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:member-photo-day:' || p_actor::text, 0)
  );

  SELECT count(*) INTO v_today
  FROM public.photos AS photo_row
  WHERE photo_row.uploaded_by = p_actor
    AND photo_row.created_at
      >= (((pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date)::timestamp
          AT TIME ZONE 'Asia/Seoul');

  -- Withdrawals retain their original submission-day quota even though
  -- the private photo row was removed from all gallery read paths.
  SELECT v_today + count(*) INTO v_today
  FROM public.member_photo_withdrawals AS w
  WHERE w.actor = p_actor
    AND w.submitted_at
      >= (((pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date)::timestamp
          AT TIME ZONE 'Asia/Seoul');

  IF v_today >= c_daily_limit THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'daily photo submission limit reached';
  END IF;

  -- 'draft' with 'private' and no published_at, which is the only combination
  -- `photos_publication_state_check` allows for an unpublished row. The
  -- address is this deployment's own media path; `image_host` stays NULL
  -- because there is no third-party host to check against an allowlist.
  INSERT INTO public.photos (
    id, storage_key, alt_text, visibility, uploaded_by, content_state,
    published_at, image_url, image_host
  ) VALUES (
    p_key, v_key, v_alt, 'private', p_actor, 'draft', NULL, '/media/' || v_key, NULL
  )
  RETURNING photos.id, photos.created_at INTO photo_id, submitted_at;

  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.member_submit_photo(uuid, uuid, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_submit_photo(uuid, uuid, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_submit_photo(uuid, uuid, text, text)
  TO moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.photos FROM PUBLIC, moneyverse_app;
COMMIT;
