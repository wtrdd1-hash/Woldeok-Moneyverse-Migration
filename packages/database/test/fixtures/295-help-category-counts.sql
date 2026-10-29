-- Run only on a disposable isolated PostgreSQL database after migration 295.
BEGIN;
INSERT INTO public.users(id) VALUES
  ('00000000-0000-0000-0000-000000000091'),
  ('00000000-0000-0000-0000-000000000092');
DO $$
DECLARE v_id uuid; v_revision uuid;
BEGIN
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('ko','count-approved','account','published','00000000-0000-0000-0000-000000000091') RETURNING id INTO v_id;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
    VALUES(v_id,1,'Approved','Verified','Public article','https://example.org/approved',repeat('a',64),now()+interval '1 day','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',now()) RETURNING id INTO v_revision;
  UPDATE public.help_articles SET published_revision_id=v_revision WHERE id=v_id;
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('ko','count-expired','account','published','00000000-0000-0000-0000-000000000091') RETURNING id INTO v_id;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
    VALUES(v_id,1,'Expired','Not current','Public article','https://example.org/expired',repeat('b',64),now()-interval '1 day','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',now()) RETURNING id INTO v_revision;
  UPDATE public.help_articles SET published_revision_id=v_revision WHERE id=v_id;
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('ko','count-draft','wallet','draft','00000000-0000-0000-0000-000000000091');
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('en','count-english','wallet','published','00000000-0000-0000-0000-000000000091') RETURNING id INTO v_id;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
    VALUES(v_id,1,'English','Verified','Public article','https://example.org/english',repeat('c',64),now()+interval '1 day','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',now()) RETURNING id INTO v_revision;
  UPDATE public.help_articles SET published_revision_id=v_revision WHERE id=v_id;
END $$;
SET ROLE moneyverse_app;
DO $$
BEGIN
  IF (SELECT article_count FROM public.help_public_category_counts('ko') WHERE category='account') <> 1
     OR (SELECT article_count FROM public.help_public_category_counts('ko') WHERE category='wallet') <> 0
     OR (SELECT article_count FROM public.help_public_category_counts('en') WHERE category='wallet') <> 1
     OR (SELECT count(*) FROM public.help_public_category_counts('fr')) <> 0 THEN
    RAISE EXCEPTION 'category count exposed an expired, draft, wrong-locale or invalid-locale article';
  END IF;
  BEGIN
    PERFORM count(*) FROM public.help_articles;
    RAISE EXCEPTION 'direct help table SELECT unexpectedly granted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS direct help table SELECT denied';
  END;
  RAISE NOTICE 'PASS locale, approved, expiry, zero-count and invalid-locale gates';
END $$;
RESET ROLE;
ROLLBACK;
