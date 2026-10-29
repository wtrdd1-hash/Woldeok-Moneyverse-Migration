-- Ephemeral PostgreSQL fixture. Never run against a shared or production DB.
DO $$
DECLARE a uuid; r uuid; i integer;
BEGIN
  FOR i IN 1..7 LOOP
    INSERT INTO public.help_articles(locale,slug,category,state,created_by)
      VALUES('ko','related-wallet-'||i,'wallet','published','00000000-0000-0000-0000-000000000001') RETURNING id INTO a;
    INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
      VALUES(a,1,'Verified wallet '||i,'Approved related summary','Synthetic content','https://example.org/related',repeat('b',64),clock_timestamp()+interval '1 day',
        '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',clock_timestamp()) RETURNING id INTO r;
    UPDATE public.help_articles SET published_revision_id=r WHERE id=a;
  END LOOP;
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES('en','english-wallet','wallet','draft','00000000-0000-0000-0000-000000000001');
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES('ko','draft-wallet','wallet','draft','00000000-0000-0000-0000-000000000001');
END $$;
SET ROLE moneyverse_app;
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.help_public_search('ko','wallet','',8);
  IF n <> 7 THEN RAISE EXCEPTION 'related approved same-category rows expected 7, got %', n; END IF;
  IF (SELECT count(*) FROM public.help_public_search('en','wallet','',8)) <> 0 THEN
    RAISE EXCEPTION 'cross-locale or draft article leaked';
  END IF;
  IF (SELECT count(*) FROM public.help_public_search('ko','account','',8)) <> 1 THEN
    RAISE EXCEPTION 'cross-category article leaked';
  END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','related-wallet-1')) <> 1 THEN
    RAISE EXCEPTION 'approved related source not readable';
  END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','draft-wallet')) <> 0 THEN
    RAISE EXCEPTION 'unapproved related source readable';
  END IF;
  BEGIN
    PERFORM count(*) FROM public.help_articles;
    RAISE EXCEPTION 'related feature unexpectedly granted direct SELECT';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS related source table SELECT denied';
  END;
  RAISE NOTICE 'PASS approved same-category/locale related read, draft isolation and app ACL';
END $$;
RESET ROLE;
