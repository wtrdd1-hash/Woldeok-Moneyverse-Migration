-- A photo a member sends in, and the operator review it waits behind.
--
-- 013 built the gallery for one author: `content_save_photo` calls
-- `content_require_operator` before it does anything else, so the only way a
-- picture reached the site was an operator uploading it. Members asked to be
-- able to put photos on the board themselves.
--
-- REVIEW STAYS. A member submits; an operator publishes. `photos` already has
-- exactly this shape -- `content_state` 'draft'/'published' with a CHECK
-- tying draft to private and unpublished -- and `content_set_photo_publication`
-- (016) is already the operator's half. So this adds the member's half and
-- changes nothing about who may publish. An unreviewed upload is unreachable
-- until somebody with the operator role says otherwise, which is what
-- specification 17.8 asks for and what keeps 18.5's "사용자 업로드가 검토되지
-- 않은 사진" out of every page that could carry an ad.
--
-- WHY THE GALLERY LIST HAD TO CHANGE. `content_list_published_photos` joins
-- `content_allowed_image_hosts` and matches `image_url LIKE 'https://<host>/%'`.
-- That allowlist exists so an operator cannot embed an image from an
-- arbitrary origin -- a real control, and it stays. But it means a photo
-- whose bytes live in this deployment's own private store can never appear,
-- because its address is a path on this site and not an https URL on somebody
-- else's host. A same-origin `/media/<key>` is strictly safer than any
-- external host the allowlist can hold: no third party learns a reader's IP,
-- and the CSP already permits it. So the list gains that one case and keeps
-- the other unchanged.
--
-- WHY A MEMBER MAY SEE THEIR OWN DRAFT. `content_is_public_storage_key` (028)
-- answers `/media/:key`, and it says no to anything unpublished -- which
-- would mean a member could upload a photo and never see which file they had
-- sent. `content_storage_key_visible` adds the one exception that a member
-- may read back their own submission, on the same shape as 094's profile
-- gate: the viewer is passed in, the database decides, and a caller who
-- passes NULL gets only what is published.

BEGIN;

-- How many photos one member may send in per day.
--
-- A row in the registry rather than a literal, so raising it is a policy
-- change and not a migration. 5 is deliberately low: every submission costs
-- an operator a review, and the queue is the scarce thing here, not the disk.
INSERT INTO public.feature_switches (feature_key, state, title, activation_preconditions, reason)
VALUES (
  'member_photo_submissions',
  'enabled',
  '회원 사진 제출',
  pg_catalog.jsonb_build_array(),
  'members may send photos to the gallery; an operator still publishes them'
)
ON CONFLICT (feature_key) DO NOTHING;

-- May this viewer be served these bytes?
--
-- Published, or their own. Nothing else, and a NULL viewer gets only the
-- published half -- a signed-out visitor reading the gallery.
CREATE OR REPLACE FUNCTION public.content_storage_key_visible(p_viewer uuid, p_storage_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.photos AS photo_row
    WHERE photo_row.storage_key = p_storage_key
      AND (
        (photo_row.content_state = 'published'
          AND photo_row.visibility = 'public'
          AND photo_row.published_at <= pg_catalog.clock_timestamp())
        OR (p_viewer IS NOT NULL AND photo_row.uploaded_by = p_viewer)
      )
  )
$$;

-- A member sends a photo in.
--
-- The caller supplies the row's primary key, which is also the idempotency
-- key -- the template 067 uses, and it is what makes the receipt and the row
-- the same object so neither can exist without the other. The replay branch
-- checks ownership before returning anything.
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

-- What this member has sent in, and where each one got to.
CREATE OR REPLACE FUNCTION public.member_my_photo_submissions(p_actor uuid)
RETURNS TABLE(
  photo_id uuid,
  image_url text,
  alt_text text,
  published boolean,
  submitted_at timestamptz,
  published_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT photo_row.id, photo_row.image_url, photo_row.alt_text,
         photo_row.content_state = 'published', photo_row.created_at, photo_row.published_at
  FROM public.photos AS photo_row
  WHERE photo_row.uploaded_by = p_actor
  ORDER BY photo_row.created_at DESC, photo_row.id DESC
  LIMIT 30
$$;

-- 013's body, plus the same-origin case.
--
-- The external branch is character for character what it was: the join to
-- `content_allowed_image_hosts` and both LIKE patterns. The new branch admits
-- a row whose address is this deployment's own media path AND which carries
-- the storage key that path resolves to -- so an `image_url` of '/media/...'
-- with no matching key still does not qualify.
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
  WHERE photo_row.content_state = 'published'
    AND photo_row.visibility = 'public'
    AND photo_row.published_at <= pg_catalog.clock_timestamp()
    AND photo_row.image_url IS NOT NULL
    AND (
      photo_row.image_url = '/media/' || photo_row.storage_key
      OR EXISTS (
        SELECT 1
        FROM public.content_allowed_image_hosts AS host_row
        WHERE host_row.host = photo_row.image_host
          AND host_row.active
          AND (
            photo_row.image_url LIKE ('https://' || host_row.host || '/%')
            OR photo_row.image_url LIKE ('https://' || host_row.host || ':443/%')
          )
      )
    )
  ORDER BY photo_row.published_at DESC, photo_row.id DESC
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION public.content_storage_key_visible(uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_submit_photo(uuid, uuid, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_my_photo_submissions(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.content_list_published_photos(integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.content_storage_key_visible(uuid, text),
  public.member_submit_photo(uuid, uuid, text, text),
  public.member_my_photo_submissions(uuid),
  public.content_list_published_photos(integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.content_storage_key_visible(uuid, text),
  public.member_submit_photo(uuid, uuid, text, text),
  public.member_my_photo_submissions(uuid),
  public.content_list_published_photos(integer) TO moneyverse_app;

-- Restated. Members write photos through the function, never the table.
REVOKE ALL PRIVILEGES ON TABLE public.photos FROM PUBLIC, moneyverse_app;

COMMIT;
