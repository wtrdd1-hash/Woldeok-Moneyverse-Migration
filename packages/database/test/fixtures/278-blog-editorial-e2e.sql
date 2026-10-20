\set ON_ERROR_STOP on
BEGIN;
DO $case$
DECLARE
  v_author uuid := gen_random_uuid();
  v_reviewer uuid := gen_random_uuid();
  v_outsider uuid := gen_random_uuid();
  v_topic uuid;
  v_topic_retry uuid;
  v_source uuid;
  v_draft uuid;
  v_draft_retry uuid;
  v_review uuid;
  v_sha text;
  v_body text := repeat('A documented financial-education method with official references and no live price claim. ', 3);
  v_key uuid := gen_random_uuid();
  v_source_key uuid := gen_random_uuid();
  v_draft_key uuid := gen_random_uuid();
  v_blocked boolean;
BEGIN
  INSERT INTO public.users(id) VALUES(v_author),(v_reviewer),(v_outsider);
  INSERT INTO public.user_roles(user_id,role) VALUES(v_author,'operator'),(v_reviewer,'operator');
  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_topic_create(v_outsider,gen_random_uuid(),'ko','KR','A legitimate financial question');
  EXCEPTION WHEN insufficient_privilege THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'non-operator created topic'; END IF;

  v_topic := public.blog_editorial_topic_create(v_author,v_key,'ko','KR','A legitimate financial question');
  v_topic_retry := public.blog_editorial_topic_create(v_author,v_key,'ko','KR','A legitimate financial question');
  IF v_topic <> v_topic_retry THEN RAISE EXCEPTION 'topic idempotency violation'; END IF;
  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_topic_create(v_author,v_key,'ko','KR','A different financial question');
  EXCEPTION WHEN unique_violation THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'mismatched topic idempotency payload accepted'; END IF;

  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_source_record(v_author,gen_random_uuid(),v_topic,
      'http://127.0.0.1/latest','bad','no license',now(),now()+interval '1 day',repeat('0',64));
  EXCEPTION WHEN invalid_parameter_value THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'unsafe source protocol accepted'; END IF;

  v_source := public.blog_editorial_source_record(v_author,v_source_key,v_topic,
      'https://www.bok.or.kr/sample','Bank of Korea','licensed excerpt',now()-interval '1 day',
      now()+interval '1 day',repeat('a',64));
  IF v_source <> public.blog_editorial_source_record(v_author,v_source_key,v_topic,
      'https://www.bok.or.kr/sample','Bank of Korea','licensed excerpt',now()-interval '1 day',
      now()+interval '1 day',repeat('a',64)) THEN
    RAISE EXCEPTION 'source idempotency violated';
  END IF;

  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_source_record(v_author,v_source_key,v_topic,
      'https://www.bok.or.kr/sample','Altered Publisher','licensed excerpt',now()-interval '1 day',
      now()+interval '1 day',repeat('a',64));
  EXCEPTION WHEN unique_violation THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'mutated source idempotency metadata was accepted'; END IF;

  v_draft := public.blog_editorial_draft_append(v_author,v_draft_key,v_topic,v_source,0,
      'ko','A source-verified financial education title',v_body);
  v_draft_retry := public.blog_editorial_draft_append(v_author,v_draft_key,v_topic,v_source,0,
      'ko','A source-verified financial education title',v_body);
  IF v_draft<>v_draft_retry THEN RAISE EXCEPTION 'draft idempotency violated'; END IF;

  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_draft_append(v_author,gen_random_uuid(),v_topic,v_source,0,
      'ko','A new revision should not overwrite',v_body);
  EXCEPTION WHEN serialization_failure THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'stale draft revision accepted'; END IF;

  SELECT content_sha256 INTO v_sha FROM public.blog_editorial_drafts WHERE id=v_draft;
  IF char_length(v_sha)<>64 THEN RAISE EXCEPTION 'content hash missing'; END IF;

  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_review_record(v_author,gen_random_uuid(),v_draft,v_sha,'REJECT',
      'This is a reviewer note explaining a missing source.');
  EXCEPTION WHEN insufficient_privilege THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'draft author self-review accepted'; END IF;

  v_blocked := false;
  BEGIN
    PERFORM public.blog_editorial_review_record(v_reviewer,gen_random_uuid(),v_draft,v_sha,'APPROVE',
      'Please publish immediately without verification');
  EXCEPTION WHEN invalid_parameter_value THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'approval bypass accepted'; END IF;

  v_review := public.blog_editorial_review_record(v_reviewer,gen_random_uuid(),v_draft,v_sha,
      'CHANGES_REQUESTED','Evidence should match source dates and the local law.');
  IF v_review IS NULL THEN RAISE EXCEPTION 'review rejection not recorded'; END IF;

  v_blocked := false;
  BEGIN
    UPDATE public.blog_editorial_drafts SET title='rewritten after review' WHERE id=v_draft;
  EXCEPTION WHEN object_not_in_prerequisite_state THEN v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'immutable draft was mutated'; END IF;

  IF (SELECT count(*) FROM public.blog_editorial_audit WHERE topic_id=v_topic) <> 4 THEN
    RAISE EXCEPTION 'missing or duplicated audit receipts';
  END IF;
  IF (SELECT count(*) FROM public.blog_editorial_reviews WHERE draft_id=v_draft)<>1 THEN
    RAISE EXCEPTION 'unexpected review records';
  END IF;
  RAISE NOTICE 'FOUNDATION_E2E_PASS topic % draft %: 4 audit receipts, no publish API',v_topic,v_draft;
END $case$;

DO $grants$
DECLARE v_name text;
BEGIN
  FOREACH v_name IN ARRAY ARRAY[
    'blog_editorial_topics','blog_editorial_sources','blog_editorial_drafts',
    'blog_editorial_reviews','blog_editorial_audit'] LOOP
    IF has_table_privilege('moneyverse_app','public.'||v_name,'SELECT')
    OR has_table_privilege('moneyverse_app','public.'||v_name,'INSERT')
    OR has_table_privilege('moneyverse_app','public.'||v_name,'UPDATE')
    OR has_table_privilege('moneyverse_app','public.'||v_name,'DELETE') THEN
      RAISE EXCEPTION 'app role improperly has access to %',v_name;
    END IF;
  END LOOP;
  IF has_function_privilege('moneyverse_app','public.blog_editorial_topic_create(uuid,uuid,text,text,text)','EXECUTE')
    OR has_function_privilege('moneyverse_app','public.blog_editorial_review_record(uuid,uuid,uuid,text,text,text)','EXECUTE') THEN
    RAISE EXCEPTION 'app role may invoke unapproved editorial mutations';
  END IF;
  RAISE NOTICE 'APP_ROLE_DENY_PASS';
END $grants$;
ROLLBACK;
