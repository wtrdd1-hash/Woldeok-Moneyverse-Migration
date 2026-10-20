-- v2026.10.20.976 — draft-only AI blog editorial foundation.
-- No publishing function, no API/grant for moneyverse_app, no legacy JSON mutation.
-- All operations are owner-only until actor-bound server guards and source QA exist.
-- Forward-only migration; pre-existing economy tables/privileges must not change.
BEGIN;

CREATE TABLE public.blog_editorial_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES public.users(id),
  locale text NOT NULL CHECK (locale IN ('ko','en','ja','zh')),
  jurisdiction text NOT NULL CHECK (jurisdiction IN ('KR','US','JP','CN')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 10 AND 180),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.blog_editorial_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.blog_editorial_topics(id),
  idempotency_key uuid NOT NULL UNIQUE,
  recorded_by uuid NOT NULL REFERENCES public.users(id),
  canonical_url text NOT NULL CHECK (canonical_url ~ '^https://[^[:space:]<>"'']+$' AND char_length(canonical_url) <= 2000),
  publisher text NOT NULL CHECK (char_length(publisher) BETWEEN 2 AND 200),
  license_label text NOT NULL CHECK (char_length(license_label) BETWEEN 2 AND 100),
  as_of_at timestamptz NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  UNIQUE (id, topic_id),
  CONSTRAINT blog_evidence_freshness CHECK (expires_at > retrieved_at)
);

CREATE TABLE public.blog_editorial_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.blog_editorial_topics(id),
  primary_source_id uuid NOT NULL,
  idempotency_key uuid NOT NULL UNIQUE,
  author_actor uuid NOT NULL REFERENCES public.users(id),
  locale text NOT NULL CHECK (locale IN ('ko','en','ja','zh')),
  revision integer NOT NULL CHECK (revision > 0),
  title text NOT NULL CHECK (char_length(title) BETWEEN 10 AND 180),
  body_md text NOT NULL CHECK (char_length(body_md) BETWEEN 100 AND 50000),
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (primary_source_id, topic_id)
    REFERENCES public.blog_editorial_sources(id, topic_id),
  UNIQUE (topic_id, locale, revision)
);

CREATE TABLE public.blog_editorial_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  draft_id uuid NOT NULL REFERENCES public.blog_editorial_drafts(id),
  reviewer_actor uuid NOT NULL REFERENCES public.users(id),
  draft_sha256 text NOT NULL CHECK (draft_sha256 ~ '^[a-f0-9]{64}$'),
  decision text NOT NULL CHECK (decision IN ('REJECT','CHANGES_REQUESTED')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 2000),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
-- Approvals are deliberately not enabled. v975.3–v975.5 must add source-claim
-- verification, separate actor-bound reviewer/publisher permissions and approval receipts.

CREATE TABLE public.blog_editorial_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES public.blog_editorial_topics(id),
  actor_id uuid NOT NULL REFERENCES public.users(id),
  event_type text NOT NULL CHECK (event_type IN (
    'TOPIC_CREATED', 'SOURCE_RECORDED', 'DRAFT_APPENDED', 'REVIEW_RECORDED'
  )),
  record_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- Never delete or change a previously recorded source, revision, review or audit.
CREATE FUNCTION public.blog_editorial_reject_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'blog editorial records are immutable: append a revision instead';
END;
$$;

CREATE TRIGGER blog_editorial_topics_immutable BEFORE UPDATE OR DELETE
  ON public.blog_editorial_topics FOR EACH ROW EXECUTE FUNCTION public.blog_editorial_reject_mutation();
CREATE TRIGGER blog_editorial_sources_immutable BEFORE UPDATE OR DELETE
  ON public.blog_editorial_sources FOR EACH ROW EXECUTE FUNCTION public.blog_editorial_reject_mutation();
CREATE TRIGGER blog_editorial_drafts_immutable BEFORE UPDATE OR DELETE
  ON public.blog_editorial_drafts FOR EACH ROW EXECUTE FUNCTION public.blog_editorial_reject_mutation();
CREATE TRIGGER blog_editorial_reviews_immutable BEFORE UPDATE OR DELETE
  ON public.blog_editorial_reviews FOR EACH ROW EXECUTE FUNCTION public.blog_editorial_reject_mutation();
CREATE TRIGGER blog_editorial_audit_immutable BEFORE UPDATE OR DELETE
  ON public.blog_editorial_audit FOR EACH ROW EXECUTE FUNCTION public.blog_editorial_reject_mutation();

-- Privilege containment: apply only to new tables, never to all of public schema.
REVOKE ALL ON TABLE public.blog_editorial_topics FROM PUBLIC, moneyverse_app;
REVOKE ALL ON TABLE public.blog_editorial_sources FROM PUBLIC, moneyverse_app;
REVOKE ALL ON TABLE public.blog_editorial_drafts FROM PUBLIC, moneyverse_app;
REVOKE ALL ON TABLE public.blog_editorial_reviews FROM PUBLIC, moneyverse_app;
REVOKE ALL ON TABLE public.blog_editorial_audit FROM PUBLIC, moneyverse_app;
REVOKE ALL ON SEQUENCE public.blog_editorial_audit_id_seq FROM PUBLIC, moneyverse_app;

-- Owner-only entrypoints. Public / app role intentionally receive NO EXECUTE.
CREATE FUNCTION public.blog_editorial_topic_create(
  p_actor uuid, p_key uuid, p_locale text, p_jurisdiction text, p_title text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_locale NOT IN ('ko','en','ja','zh')
    OR p_jurisdiction NOT IN ('KR','US','JP','CN')
    OR char_length(btrim(coalesce(p_title,''))) NOT BETWEEN 10 AND 180 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid blog topic input';
  END IF;
  INSERT INTO public.blog_editorial_topics(idempotency_key, created_by, locale, jurisdiction, title)
    VALUES(p_key, p_actor, p_locale, p_jurisdiction, btrim(p_title))
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id INTO v_id;
  IF v_id IS NULL THEN
    SELECT id INTO v_id FROM public.blog_editorial_topics
      WHERE idempotency_key=p_key AND created_by=p_actor
        AND locale=p_locale AND jurisdiction=p_jurisdiction AND title=btrim(p_title);
    IF v_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='topic idempotency key payload mismatch';
    END IF;
  ELSE
    INSERT INTO public.blog_editorial_audit(topic_id,actor_id,event_type,record_id)
      VALUES(v_id,p_actor,'TOPIC_CREATED',v_id);
  END IF;
  RETURN v_id;
END $$;

CREATE FUNCTION public.blog_editorial_source_record(
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
    OR p_expires <= clock_timestamp()
    OR p_as_of > clock_timestamp() + interval '5 minutes' THEN
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

CREATE FUNCTION public.blog_editorial_draft_append(
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
  SELECT EXISTS(SELECT 1 FROM public.blog_editorial_sources
    WHERE id=p_source AND topic_id=p_topic AND expires_at > clock_timestamp())
    INTO v_valid;
  IF NOT v_valid THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='source unavailable or expired';
  END IF;
  -- Retry a previously committed request without incrementing revision.
  SELECT id INTO v_id FROM public.blog_editorial_drafts
    WHERE idempotency_key=p_key AND topic_id=p_topic AND author_actor=p_actor
      AND primary_source_id=p_source AND locale=p_locale
      AND title=btrim(p_title) AND body_md=p_body;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  IF EXISTS(SELECT 1 FROM public.blog_editorial_drafts WHERE idempotency_key=p_key) THEN
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='draft idempotency key payload mismatch';
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

-- Review actions are REJECT / CHANGES_REQUESTED only. There is NO approval
-- action until deterministic claim validation and a distinct reviewer/publisher
-- privilege boundary are deployed and verified.
CREATE FUNCTION public.blog_editorial_review_record(
  p_actor uuid, p_key uuid, p_draft uuid, p_sha256 text,
  p_decision text, p_reason text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_id uuid; v_draft public.blog_editorial_drafts%ROWTYPE;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_draft IS NULL
    OR p_decision NOT IN ('REJECT','CHANGES_REQUESTED')
    OR char_length(btrim(coalesce(p_reason,''))) NOT BETWEEN 10 AND 2000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='review is not eligible for approval';
  END IF;
  SELECT * INTO v_draft FROM public.blog_editorial_drafts WHERE id=p_draft;
  IF v_draft.id IS NULL OR v_draft.author_actor=p_actor OR v_draft.content_sha256 IS DISTINCT FROM p_sha256 THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='self-review or revision-hash mismatch';
  END IF;
  SELECT id INTO v_id FROM public.blog_editorial_reviews
    WHERE idempotency_key=p_key AND draft_id=p_draft AND reviewer_actor=p_actor
      AND draft_sha256=p_sha256 AND decision=p_decision AND reason=btrim(p_reason);
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  INSERT INTO public.blog_editorial_reviews
    (idempotency_key,draft_id,reviewer_actor,draft_sha256,decision,reason)
  VALUES(p_key,p_draft,p_actor,p_sha256,p_decision,btrim(p_reason))
  RETURNING id INTO v_id;
  INSERT INTO public.blog_editorial_audit(topic_id,actor_id,event_type,record_id)
    VALUES(v_draft.topic_id,p_actor,'REVIEW_RECORDED',v_id);
  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.blog_editorial_reject_mutation() FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.blog_editorial_topic_create(uuid,uuid,text,text,text) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.blog_editorial_source_record(uuid,uuid,uuid,text,text,text,timestamptz,timestamptz,text) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.blog_editorial_draft_append(uuid,uuid,uuid,uuid,integer,text,text,text) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.blog_editorial_review_record(uuid,uuid,uuid,text,text,text) FROM PUBLIC, moneyverse_app;

COMMIT;
