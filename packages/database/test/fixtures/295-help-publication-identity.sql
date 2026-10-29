-- Run after 282-help-bootstrap.sql and 282-help-positive.sql in a disposable DB.
SET ROLE moneyverse_app;
DO $$
DECLARE v record; v_digest text;
BEGIN
  SELECT * INTO v FROM public.help_public_article_revision('ko','account-login');
  IF v.published_revision_id IS NULL OR v.article_version <> 1 OR
    v.content_digest !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'published edition identity absent';
  END IF;
  v_digest := encode(sha256(convert_to(
    '["로그인 도움말", "로그인 관련 검증된 안내", "격리 테스트 데이터입니다."]','UTF8')), 'hex');
  IF v.content_digest <> v_digest OR v.content_digest = repeat('a',64) THEN
    RAISE EXCEPTION 'content digest is not bound to rendered content';
  END IF;
  IF EXISTS (SELECT 1 FROM public.help_public_article_revision('ko','unapproved')) OR
     EXISTS (SELECT 1 FROM public.help_public_article_revision('en','account-login')) THEN
    RAISE EXCEPTION 'unapproved or wrong-locale help article exposed';
  END IF;
  BEGIN
    PERFORM count(*) FROM public.help_article_revisions;
    RAISE EXCEPTION 'direct revision SELECT unexpectedly granted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS direct revision SELECT denied';
  END;
END $$;
RESET ROLE;
-- Retraction and review expiry must remove public identity without changing receipts.
BEGIN;
UPDATE public.help_articles SET state='retracted' WHERE locale='ko' AND slug='account-login';
SET ROLE moneyverse_app;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.help_public_article_revision('ko','account-login')) THEN
    RAISE EXCEPTION 'retracted revision exposed';
  END IF;
END $$;
RESET ROLE;
ROLLBACK;
-- Review expiry is immutable: seed a distinct expired revision, never UPDATE a revision.
DO $$ DECLARE a uuid; r uuid;
BEGIN
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('ko','expired-identity','account','published','00000000-0000-0000-0000-000000000001') RETURNING id INTO a;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,
    source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
    VALUES(a,1,'Expired','Expired summary','Expired content','https://example.org/expired',
    repeat('e',64),clock_timestamp()-interval '1 minute',
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',clock_timestamp()) RETURNING id INTO r;
  UPDATE public.help_articles SET published_revision_id=r WHERE id=a;
END $$;
SET ROLE moneyverse_app;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.help_public_article_revision('ko','expired-identity')) THEN
    RAISE EXCEPTION 'expired review exposed';
  END IF;
END $$;
RESET ROLE;
