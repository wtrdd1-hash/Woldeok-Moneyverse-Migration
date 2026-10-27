DO $$
DECLARE a uuid; r uuid;
BEGIN
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('ko','account-login','account','published','00000000-0000-0000-0000-000000000001') RETURNING id INTO a;
  INSERT INTO public.help_article_revisions(article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
    VALUES(a,1,'로그인 도움말','로그인 관련 검증된 안내','격리 테스트 데이터입니다.','https://example.org/evidence',repeat('a',64),now()+interval '1 day','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',now()) RETURNING id INTO r;
  UPDATE public.help_articles SET published_revision_id=r WHERE id=a;
  INSERT INTO public.help_articles(locale,slug,category,state,created_by)
    VALUES ('ko','unapproved','account','draft','00000000-0000-0000-0000-000000000001');
END $$;
SET ROLE moneyverse_app;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.help_public_search('ko',NULL,'로그인',20)) <> 1 THEN
    RAISE EXCEPTION 'approved public search not visible';
  END IF;
  IF (SELECT count(*) FROM public.help_public_search('ko',NULL,'%',20)) <> 0 THEN
    RAISE EXCEPTION 'SQL wildcard was interpreted as pattern';
  END IF;
  IF (SELECT bool_and(reviewed_until > clock_timestamp()) FROM public.help_public_search('ko',NULL,'로그인',20)) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'search review deadline missing or expired';
  END IF;
  IF (SELECT bool_and(reviewed_until > clock_timestamp()) FROM public.help_public_article('ko','account-login')) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'article review deadline missing or expired';
  END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','account-login')) <> 1 THEN
    RAISE EXCEPTION 'approved public article not visible';
  END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','unapproved')) <> 0 THEN
    RAISE EXCEPTION 'unapproved article leaked';
  END IF;
  BEGIN
    PERFORM count(*) FROM public.help_articles;
    RAISE EXCEPTION 'direct table SELECT unexpectedly granted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS direct table SELECT denied';
  END;
  BEGIN
    UPDATE public.help_articles SET state='published';
    RAISE EXCEPTION 'direct table UPDATE unexpectedly granted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS direct table UPDATE denied';
  END;
END $$;
RESET ROLE;
