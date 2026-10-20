\set ON_ERROR_STOP on
-- v1001: committed idempotent responses remain discoverable after source expiry,
-- while a mismatched expected revision cannot silently reuse a prior receipt.
BEGIN;
DO $case$
DECLARE
 v_actor uuid:=gen_random_uuid();
 v_topic uuid;
 v_source uuid;
 v_draft uuid;
 v_key uuid:=gen_random_uuid();
 v_source_key uuid:=gen_random_uuid();
 v_source_asof timestamptz:=clock_timestamp()-interval '1 day';
 v_source_expiry timestamptz:=clock_timestamp()+interval '1.5 seconds';
 v_expired_refused boolean:=false;
 v_rev_mismatch boolean:=false;
 v_body text:=repeat('Financial educational article describes interest and methodology with sources. ',3);
BEGIN
 INSERT INTO public.users(id) VALUES(v_actor);
 INSERT INTO public.user_roles(user_id,role) VALUES(v_actor,'operator');
 v_topic:=public.blog_editorial_topic_create(v_actor,gen_random_uuid(),'ko','KR','Idempotency retry financial guide topic');
 v_source:=public.blog_editorial_source_record(
  v_actor,v_source_key,v_topic,'https://www.bok.or.kr/education/test',
  'Bank of Korea','licensed excerpt',v_source_asof,
  v_source_expiry,repeat('c',64));
 v_draft:=public.blog_editorial_draft_append(
  v_actor,v_key,v_topic,v_source,0,'ko','Source-backed idempotent financial draft',v_body);
 BEGIN
  PERFORM public.blog_editorial_draft_append(
   v_actor,v_key,v_topic,v_source,7,'ko','Source-backed idempotent financial draft',v_body);
 EXCEPTION WHEN unique_violation THEN v_rev_mismatch:=true;
 END;
 IF NOT v_rev_mismatch THEN
  RAISE EXCEPTION 'REDAUDIT_EXPECTED_REVISION_REPLAY_NOT_REJECTED';
 END IF;
 PERFORM pg_sleep(1.7);
 IF v_source IS DISTINCT FROM public.blog_editorial_source_record(
  v_actor,v_source_key,v_topic,'https://www.bok.or.kr/education/test',
  'Bank of Korea','licensed excerpt',v_source_asof,v_source_expiry,repeat('c',64)) THEN
  RAISE EXCEPTION 'EXPIRED_SOURCE_REPLAY_LOST_COMMITTED_RECEIPT';
 END IF;
 BEGIN
  PERFORM public.blog_editorial_source_record(
   v_actor,gen_random_uuid(),v_topic,'https://www.bok.or.kr/education/another',
   'Bank of Korea','licensed excerpt',v_source_asof,v_source_expiry,repeat('c',64));
 EXCEPTION WHEN invalid_parameter_value THEN v_expired_refused:=true;
 END;
 IF NOT v_expired_refused THEN
  RAISE EXCEPTION 'EXPIRED_SOURCE_ACCEPTED_AS_NEW_EVIDENCE';
 END IF;
 v_expired_refused:=false;
 BEGIN
  PERFORM public.blog_editorial_draft_append(
   v_actor,gen_random_uuid(),v_topic,v_source,1,'ko','A second distinct financial draft revision',v_body);
 EXCEPTION WHEN invalid_parameter_value THEN v_expired_refused:=true;
 END;
 IF NOT v_expired_refused THEN
  RAISE EXCEPTION 'EXPIRED_SOURCE_ACCEPTED_FOR_NEW_DRAFT';
 END IF;
 IF v_draft IS DISTINCT FROM public.blog_editorial_draft_append(
  v_actor,v_key,v_topic,v_source,0,'ko','Source-backed idempotent financial draft',v_body) THEN
  RAISE EXCEPTION 'REDAUDIT_EXPIRED_SOURCE_RETRY_RETURNED_NEW_DRAFT';
 END IF;
 IF has_function_privilege('moneyverse_app',
  'public.blog_editorial_source_record(uuid,uuid,uuid,text,text,text,timestamptz,timestamptz,text)','EXECUTE')
  OR has_function_privilege('moneyverse_app',
  'public.blog_editorial_draft_append(uuid,uuid,uuid,uuid,integer,text,text,text)','EXECUTE') THEN
  RAISE EXCEPTION 'APP_ROLE_REGAINED_FUNCTION_EXECUTE';
 END IF;
 RAISE NOTICE 'BLOG_IDEMPOTENCY_REPLAY_PASS';
END $case$;
ROLLBACK;
