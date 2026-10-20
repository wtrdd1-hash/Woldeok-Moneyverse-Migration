-- v2026.10.20.1001. Forward-only remediation of v976 draft/source replay.
-- A persisted receipt is historical evidence, even after source expiry.
-- An idempotency key must not silently accept a different expected_revision.
-- Only v278 functions are replaced. NO schema, app grants, financial writes,
-- source TTL extension, editorial approval or publication is introduced.
BEGIN;

CREATE OR REPLACE FUNCTION public.blog_editorial_source_record(
  p_actor uuid, p_key uuid, p_topic uuid, p_url text, p_publisher text,
  p_license text, p_as_of timestamptz, p_expires timestamptz, p_sha256 text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_topic IS NULL OR p_as_of IS NULL OR p_expires IS NULL
    OR p_url !~ '^https://[^[:space:]<>"'']+$' OR char_length(coalesce(p_url,'')) > 2000
    OR char_length(btrim(coalesce(p_publisher,''))) NOT BETWEEN 2 AND 200
    OR char_length(btrim(coalesce(p_license,''))) NOT BETWEEN 2 AND 100
    OR coalesce(p_sha256,'') !~ '^[a-f0-9]{64}$'
    OR p_as_of > clock_timestamp() + interval '5 minutes' THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid or expired source evidence';
  END IF;
  -- Safe replay: an already persisted source receipt must remain retrievable
  -- after its freshness window expires. It does NOT become fresh again.
  SELECT id INTO v_id FROM public.blog_editorial_sources WHERE
    idempotency_key=p_key AND topic_id=p_topic AND recorded_by=p_actor
    AND canonical_url=p_url AND content_sha256=p_sha256
    AND publisher=btrim(p_publisher) AND license_label=btrim(p_license)
    AND as_of_at=p_as_of AND expires_at=p_expires;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  IF EXISTS(SELECT 1 FROM public.blog_editorial_sources WHERE idempotency_key=p_key) THEN
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='source idempotency key payload mismatch';
  END IF;
  IF p_expires <= clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid or expired source evidence';
  END IF;
  INSERT INTO public.blog_editorial_sources
    (idempotency_key,topic_id,recorded_by,canonical_url,publisher,license_label,as_of_at,expires_at,content_sha256)
  VALUES(p_key,p_topic,p_actor,p_url,btrim(p_publisher),btrim(p_license),p_as_of,p_expires,p_sha256)
  ON CONFLICT (idempotency_key) DO NOTHING RETURNING id INTO v_id;
  IF v_id IS NULL THEN
    SELECT id INTO v_id FROM public.blog_editorial_sources WHERE
      idempotency_key=p_key AND topic_id=p_topic AND recorded_by=p_actor
      AND canonical_url=p_url AND content_sha256=p_sha256
      AND publisher=btrim(p_publisher) AND license_label=btrim(p_license)
      AND as_of_at=p_as_of AND expires_at=p_expires;
    IF v_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='source idempotency key payload mismatch';
    END IF;
  ELSE
    INSERT INTO public.blog_editorial_audit(topic_id,actor_id,event_type,record_id)
      VALUES(p_topic,p_actor,'SOURCE_RECORDED',v_id);
  END IF;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.blog_editorial_draft_append(
  p_actor uuid, p_key uuid, p_topic uuid, p_source uuid,
  p_expected_revision integer, p_locale text, p_title text, p_body text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_id uuid; v_current integer; v_locale text; v_valid boolean;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_topic IS NULL OR p_source IS NULL OR p_expected_revision < 0
    OR char_length(btrim(coalesce(p_title,''))) NOT BETWEEN 10 AND 180
    OR char_length(coalesce(p_body,'')) NOT BETWEEN 100 AND 50000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid blog draft input';
  END IF;
  SELECT locale INTO v_locale FROM public.blog_editorial_topics
    WHERE id=p_topic FOR UPDATE;
  IF v_locale IS DISTINCT FROM p_locale THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='draft locale must match topic';
  END IF;
  -- Retry a previously committed request without incrementing revision.
  -- The expected revision is part of the idempotency payload.
  SELECT id INTO v_id FROM public.blog_editorial_drafts
    WHERE idempotency_key=p_key AND topic_id=p_topic AND author_actor=p_actor
      AND primary_source_id=p_source AND locale=p_locale
      AND revision=p_expected_revision+1
      AND title=btrim(p_title) AND body_md=p_body;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  IF EXISTS(SELECT 1 FROM public.blog_editorial_drafts WHERE idempotency_key=p_key) THEN
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='draft idempotency key payload mismatch';
  END IF;
  -- Only *new* draft attempts require a still-current source. Completed
  -- receipts remain valid historical evidence after that source expires.
  SELECT EXISTS(SELECT 1 FROM public.blog_editorial_sources
    WHERE id=p_source AND topic_id=p_topic AND expires_at > clock_timestamp())
    INTO v_valid;
  IF NOT v_valid THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='source unavailable or expired';
  END IF;
  SELECT coalesce(max(revision),0) INTO v_current FROM public.blog_editorial_drafts
    WHERE topic_id=p_topic AND locale=p_locale;
  IF p_expected_revision IS DISTINCT FROM v_current THEN
    RAISE EXCEPTION USING ERRCODE='40001', MESSAGE='draft revision conflict';
  END IF;
  INSERT INTO public.blog_editorial_drafts
    (idempotency_key,topic_id,primary_source_id,author_actor,locale,revision,title,body_md,content_sha256)
  VALUES(p_key,p_topic,p_source,p_actor,p_locale,v_current+1,btrim(p_title),p_body,
         encode(public.digest(convert_to(btrim(p_title)||E'\n'||p_body,'UTF8'),'sha256'),'hex'))
  RETURNING id INTO v_id;
  INSERT INTO public.blog_editorial_audit(topic_id,actor_id,event_type,record_id)
    VALUES(p_topic,p_actor,'DRAFT_APPENDED',v_id);
  RETURN v_id;
END $$;

-- Re-state least-privilege for both replaced entrypoints.
REVOKE ALL ON FUNCTION public.blog_editorial_source_record(
 uuid,uuid,uuid,text,text,text,timestamptz,timestamptz,text
) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.blog_editorial_draft_append(
 uuid,uuid,uuid,uuid,integer,text,text,text
) FROM PUBLIC, moneyverse_app;

COMMIT;
