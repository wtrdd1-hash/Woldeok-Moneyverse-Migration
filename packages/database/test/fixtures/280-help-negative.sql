CREATE ROLE help_untrusted NOLOGIN;
SET ROLE help_untrusted;
DO $$ BEGIN
  BEGIN
    PERFORM count(*) FROM public.help_public_search('ko',NULL,'',20);
    RAISE EXCEPTION 'PUBLIC EXECUTE unexpectedly granted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS PUBLIC EXECUTE denied';
  END;
  BEGIN
    PERFORM count(*) FROM public.help_public_status('ko','account-login');
    RAISE EXCEPTION 'PUBLIC status EXECUTE unexpectedly granted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS PUBLIC status EXECUTE denied';
  END;
END $$;
RESET ROLE;
DO $$ DECLARE a uuid; r uuid;
BEGIN
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES('ko','expired-help','account','published','00000000-0000-0000-0000-000000000001') RETURNING id INTO a;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
    VALUES(a,1,'Expired verified help','Expired summary','Expired text','https://example.org/expired',repeat('e',64),clock_timestamp()-interval '1 minute',
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',clock_timestamp()) RETURNING id INTO r;
  UPDATE public.help_articles SET published_revision_id=r WHERE id=a;
END $$;
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.help_public_search('ko',NULL,'Expired',20))<>0 THEN
    RAISE EXCEPTION 'expired article leaked in search';
  END IF;
  IF (SELECT count(*) FROM public.help_public_status('ko','expired-help'))<>0 THEN
    RAISE EXCEPTION 'expired status leaked';
  END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','expired-help'))<>0 THEN
    RAISE EXCEPTION 'expired article leaked in detail';
  END IF;
END $$;
RESET ROLE;
