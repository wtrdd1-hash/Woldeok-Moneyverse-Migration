-- NEW 282 migration: DRAFT ONLY. Do not apply to production-linked DB.
-- Verified public help articles; no publishing or source import in this slice.
-- An approved source + independent reviewer + unexpired evidence is mandatory.
BEGIN;
CREATE TABLE public.help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL CHECK (locale IN ('ko','en')),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 100),
  category text NOT NULL CHECK (category IN ('account','wallet','shop','community','support')),
  state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','in_review','published','retracted')),
  published_revision_id uuid,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(locale,slug)
);
CREATE TABLE public.help_article_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.help_articles(id) ON DELETE RESTRICT,
  revision_no bigint NOT NULL CHECK (revision_no > 0),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 240),
  body_plain text NOT NULL CHECK (char_length(body_plain) BETWEEN 1 AND 12000),
  source_url text NOT NULL CHECK (source_url ~ '^https://[^[:space:]<>"'']+$'),
  source_sha256 text NOT NULL CHECK (source_sha256 ~ '^[a-f0-9]{64}$'),
  reviewed_until timestamptz NOT NULL,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  approved_by uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(article_id,revision_no),
  UNIQUE(article_id,id),
  CONSTRAINT independent_review CHECK (approved_by IS NULL OR approved_by <> author_id)
);
ALTER TABLE public.help_articles ADD CONSTRAINT help_published_revision_fk
  FOREIGN KEY (id,published_revision_id) REFERENCES public.help_article_revisions(article_id,id) ON DELETE RESTRICT;
CREATE INDEX help_public_order ON public.help_articles(locale,category,state,updated_at DESC,id DESC);
CREATE INDEX help_revision_freshness ON public.help_article_revisions(reviewed_until);
REVOKE ALL ON TABLE public.help_articles FROM PUBLIC, moneyverse_app;
REVOKE ALL ON TABLE public.help_article_revisions FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.help_public_search(p_locale text, p_category text, p_query text, p_limit integer)
RETURNS TABLE(article_id uuid, locale text, slug text, category text, title text, summary text, published_at timestamptz)
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.id, a.locale, a.slug, a.category, r.title, r.summary, r.published_at
  FROM public.help_articles a
  JOIN public.help_article_revisions r ON r.id = a.published_revision_id AND r.article_id = a.id
  WHERE p_locale IN ('ko','en') AND a.locale = p_locale
    AND (p_category IS NULL OR (p_category IN ('account','wallet','shop','community','support') AND a.category = p_category))
    AND char_length(coalesce(p_query,'')) <= 100
    AND a.state = 'published' AND r.published_at IS NOT NULL AND r.approved_by IS NOT NULL
    AND r.approved_by <> r.author_id AND r.reviewed_until > clock_timestamp()
    AND (coalesce(p_query,'') = '' OR strpos(lower(r.title), lower(p_query)) > 0
      OR strpos(lower(r.summary), lower(p_query)) > 0)
  ORDER BY r.published_at DESC, a.id DESC
  LIMIT greatest(1,least(coalesce(p_limit,20),50))
$$;
CREATE FUNCTION public.help_public_article(p_locale text, p_slug text)
RETURNS TABLE(article_id uuid, locale text, slug text, category text, title text, summary text, body_plain text, source_url text, published_at timestamptz)
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.id, a.locale, a.slug, a.category, r.title, r.summary, r.body_plain, r.source_url, r.published_at
  FROM public.help_articles a
  JOIN public.help_article_revisions r ON r.id = a.published_revision_id AND r.article_id = a.id
  WHERE p_locale IN ('ko','en') AND a.locale = p_locale AND a.slug = p_slug
    AND a.state = 'published' AND r.published_at IS NOT NULL AND r.approved_by IS NOT NULL
    AND r.approved_by <> r.author_id AND r.reviewed_until > clock_timestamp()
$$;
REVOKE ALL ON FUNCTION public.help_public_search(text,text,text,integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.help_public_article(text,text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_public_search(text,text,text,integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_public_article(text,text) TO moneyverse_app;

-- Admin authoring requires both a current database role and an open console
-- session; an arbitrary actor UUID is never sufficient to publish.
CREATE TABLE public.help_article_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.help_articles(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  event_kind text NOT NULL CHECK (event_kind IN ('draft_created','published','retracted')),
  request_key uuid NOT NULL UNIQUE,
  request_digest text NOT NULL CHECK (request_digest ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX help_event_article_order ON public.help_article_events(article_id,created_at DESC,id DESC);
REVOKE ALL ON TABLE public.help_article_events FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.help_admin_check(p_actor uuid,p_session uuid,p_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_state text;
BEGIN
  IF p_actor IS NULL OR p_session IS NULL OR p_role NOT IN ('operator','approver') OR
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role::text=p_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='help administrator role required';
  END IF;
  IF p_role='approver' AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='independent approver role required';
  END IF;
  SELECT state INTO v_state FROM public.admin_session_touch(p_session,p_actor);
  IF v_state IS DISTINCT FROM 'open' THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='open admin console session required';
  END IF;
END $$;

CREATE FUNCTION public.help_admin_create_draft(
  p_actor uuid,p_session uuid,p_key uuid,p_locale text,p_slug text,p_category text,
  p_title text,p_summary text,p_body text,p_source_url text,p_source_sha text,p_reviewed_until timestamptz
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_id uuid; v_revision uuid; v_digest text; v_existing public.help_article_events%ROWTYPE;
BEGIN
  PERFORM public.help_admin_check(p_actor,p_session,'operator');
  IF p_key IS NULL OR p_locale NOT IN ('ko','en') OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR char_length(coalesce(p_slug,'')) > 100
    OR p_category NOT IN ('account','wallet','shop','community','support')
    OR char_length(coalesce(p_title,'')) NOT BETWEEN 1 AND 120
    OR char_length(coalesce(p_summary,'')) NOT BETWEEN 1 AND 240
    OR char_length(coalesce(p_body,'')) NOT BETWEEN 1 AND 12000
    OR (p_title||p_summary||p_body) ~ '<[^>]+>'
    OR left(coalesce(p_source_url,''),8) <> 'https://' OR position('@' in p_source_url)>0
    OR char_length(coalesce(p_source_url,''))>2000
    OR p_source_sha !~ '^[a-f0-9]{64}$' OR p_reviewed_until IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid help draft or source';
  END IF;
  v_digest := encode(sha256(convert_to(jsonb_build_array(p_actor,p_locale,p_slug,p_category,
    p_title,p_summary,p_body,p_source_url,p_source_sha,p_reviewed_until)::text,'UTF8')),'hex');
  PERFORM pg_advisory_xact_lock(hashtextextended(p_key::text,0));
  SELECT * INTO v_existing FROM public.help_article_events WHERE request_key=p_key;
  IF FOUND THEN
    IF v_existing.actor_id=p_actor AND v_existing.event_kind='draft_created' AND v_existing.request_digest=v_digest THEN
      RETURN v_existing.article_id;
    END IF;
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='help idempotency payload mismatch';
  END IF;
  IF p_reviewed_until <= clock_timestamp() OR p_reviewed_until > clock_timestamp()+interval '1 year' THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='source review is expired or unbounded';
  END IF;
  INSERT INTO public.help_articles(locale,slug,category,created_by)
    VALUES(p_locale,p_slug,p_category,p_actor) RETURNING id INTO v_id;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,
    source_url,source_sha256,reviewed_until,author_id)
    VALUES(v_id,1,p_title,p_summary,p_body,p_source_url,p_source_sha,p_reviewed_until,p_actor)
    RETURNING id INTO v_revision;
  INSERT INTO public.help_article_events(article_id,actor_id,event_kind,request_key,request_digest)
    VALUES(v_id,p_actor,'draft_created',p_key,v_digest);
  RETURN v_id;
END $$;

CREATE FUNCTION public.help_admin_publish(
  p_actor uuid,p_session uuid,p_key uuid,p_article uuid,p_expected_version bigint
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_article public.help_articles%ROWTYPE; v_revision public.help_article_revisions%ROWTYPE;
  v_existing public.help_article_events%ROWTYPE; v_digest text;
BEGIN
  PERFORM public.help_admin_check(p_actor,p_session,'approver');
  IF p_key IS NULL OR p_article IS NULL OR p_expected_version IS NULL OR p_expected_version<1 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid publication request';
  END IF;
  v_digest := encode(sha256(convert_to(jsonb_build_array(p_actor,p_article,p_expected_version)::text,'UTF8')),'hex');
  PERFORM pg_advisory_xact_lock(hashtextextended(p_key::text,0));
  SELECT * INTO v_existing FROM public.help_article_events WHERE request_key=p_key;
  IF FOUND THEN
    IF v_existing.actor_id=p_actor AND v_existing.article_id=p_article AND
      v_existing.event_kind='published' AND v_existing.request_digest=v_digest THEN
      RETURN v_existing.article_id;
    END IF;
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='help idempotency payload mismatch';
  END IF;
  SELECT * INTO v_article FROM public.help_articles WHERE id=p_article FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002', MESSAGE='help article not found'; END IF;
  IF v_article.version<>p_expected_version OR v_article.state<>'draft' THEN
    RAISE EXCEPTION USING ERRCODE='40001', MESSAGE='help publication version conflict';
  END IF;
  SELECT * INTO v_revision FROM public.help_article_revisions
    WHERE article_id=p_article ORDER BY revision_no DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND OR v_revision.author_id=p_actor THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='independent reviewer required';
  END IF;
  IF v_revision.reviewed_until<=clock_timestamp() OR v_revision.approved_by IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='help source review unavailable';
  END IF;
  UPDATE public.help_article_revisions SET approved_by=p_actor,published_at=clock_timestamp()
    WHERE id=v_revision.id;
  UPDATE public.help_articles SET state='published',published_revision_id=v_revision.id,
    version=version+1,updated_at=clock_timestamp() WHERE id=p_article;
  INSERT INTO public.help_article_events(article_id,actor_id,event_kind,request_key,request_digest)
    VALUES(p_article,p_actor,'published',p_key,v_digest);
  RETURN p_article;
END $$;

CREATE FUNCTION public.help_admin_retract(
  p_actor uuid,p_session uuid,p_key uuid,p_article uuid,p_expected_version bigint
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_article public.help_articles%ROWTYPE; v_existing public.help_article_events%ROWTYPE; v_digest text;
BEGIN
  PERFORM public.help_admin_check(p_actor,p_session,'approver');
  IF p_key IS NULL OR p_article IS NULL OR p_expected_version IS NULL OR p_expected_version<1 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid retraction request';
  END IF;
  v_digest := encode(sha256(convert_to(jsonb_build_array(p_actor,p_article,p_expected_version)::text,'UTF8')),'hex');
  PERFORM pg_advisory_xact_lock(hashtextextended(p_key::text,0));
  SELECT * INTO v_existing FROM public.help_article_events WHERE request_key=p_key;
  IF FOUND THEN
    IF v_existing.actor_id=p_actor AND v_existing.article_id=p_article AND
      v_existing.event_kind='retracted' AND v_existing.request_digest=v_digest THEN
      RETURN v_existing.article_id;
    END IF;
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='help idempotency payload mismatch';
  END IF;
  SELECT * INTO v_article FROM public.help_articles WHERE id=p_article FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002', MESSAGE='help article not found'; END IF;
  IF v_article.version<>p_expected_version OR v_article.state<>'published' THEN
    RAISE EXCEPTION USING ERRCODE='40001', MESSAGE='help retraction version conflict';
  END IF;
  UPDATE public.help_articles SET state='retracted',published_revision_id=NULL,
    version=version+1,updated_at=clock_timestamp() WHERE id=p_article;
  INSERT INTO public.help_article_events(article_id,actor_id,event_kind,request_key,request_digest)
    VALUES(p_article,p_actor,'retracted',p_key,v_digest);
  RETURN p_article;
END $$;

CREATE FUNCTION public.help_admin_queue(p_actor uuid,p_session uuid)
RETURNS TABLE(article_id uuid,locale text,slug text,category text,title text,body_plain text,
  source_url text,source_sha256 text,reviewed_until timestamptz,state text,version bigint,author_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role) THEN
    PERFORM public.help_admin_check(p_actor,p_session,'operator');
  ELSE
    PERFORM public.help_admin_check(p_actor,p_session,'approver');
  END IF;
  RETURN QUERY
  SELECT a.id,a.locale,a.slug,a.category,r.title,r.body_plain,r.source_url,r.source_sha256,
    r.reviewed_until,a.state,a.version,r.author_id
  FROM public.help_articles a JOIN public.help_article_revisions r ON r.article_id=a.id
  WHERE r.revision_no=1 ORDER BY a.updated_at DESC,a.id DESC LIMIT 50;
END $$;

-- Publication evidence and receipts are append-only, including for the migrator.
CREATE FUNCTION public.help_reject_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='help audit events are immutable';
END $$;
CREATE TRIGGER help_events_immutable BEFORE UPDATE OR DELETE ON public.help_article_events
FOR EACH ROW EXECUTE FUNCTION public.help_reject_event_mutation();
CREATE FUNCTION public.help_guard_revision_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='help revisions cannot be deleted';
  END IF;
  IF OLD.approved_by IS NOT NULL OR OLD.published_at IS NOT NULL OR
    NEW.article_id IS DISTINCT FROM OLD.article_id OR NEW.revision_no IS DISTINCT FROM OLD.revision_no OR
    NEW.title IS DISTINCT FROM OLD.title OR NEW.summary IS DISTINCT FROM OLD.summary OR
    NEW.body_plain IS DISTINCT FROM OLD.body_plain OR NEW.source_url IS DISTINCT FROM OLD.source_url OR
    NEW.source_sha256 IS DISTINCT FROM OLD.source_sha256 OR NEW.reviewed_until IS DISTINCT FROM OLD.reviewed_until OR
    NEW.author_id IS DISTINCT FROM OLD.author_id OR NEW.created_at IS DISTINCT FROM OLD.created_at OR
    NEW.approved_by IS NULL OR NEW.published_at IS NULL OR NEW.approved_by=OLD.author_id THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='help revision mutation denied';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER help_revision_immutable BEFORE UPDATE OR DELETE ON public.help_article_revisions
FOR EACH ROW EXECUTE FUNCTION public.help_guard_revision_mutation();
REVOKE ALL ON FUNCTION public.help_reject_event_mutation() FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.help_guard_revision_mutation() FROM PUBLIC, moneyverse_app;

REVOKE ALL ON FUNCTION public.help_admin_check(uuid,uuid,text) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.help_admin_create_draft(uuid,uuid,uuid,text,text,text,text,text,text,text,text,timestamptz) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.help_admin_publish(uuid,uuid,uuid,uuid,bigint) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.help_admin_retract(uuid,uuid,uuid,uuid,bigint) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.help_admin_queue(uuid,uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_admin_create_draft(uuid,uuid,uuid,text,text,text,text,text,text,text,text,timestamptz) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_admin_publish(uuid,uuid,uuid,uuid,bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_admin_retract(uuid,uuid,uuid,uuid,bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_admin_queue(uuid,uuid) TO moneyverse_app;

COMMIT;
