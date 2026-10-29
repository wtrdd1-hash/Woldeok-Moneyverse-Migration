-- Run as postgres on disposable fixture after migration 295.
DO $test$
DECLARE
  v_owner uuid := '00000000-0000-4000-8000-000000000001';
  v_other uuid := '00000000-0000-4000-8000-000000000002';
  v_thread uuid := '00000000-0000-4000-8000-000000000010';
  v_message uuid := '00000000-0000-4000-8000-000000000301';
  v_count integer;
BEGIN
  IF pg_catalog.has_function_privilege('support_public_probe',
       'public.support_my_message_receipt(uuid,uuid,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC execute not revoked';
  END IF;
  IF pg_catalog.has_table_privilege('moneyverse_app','public.support_messages','SELECT')
    OR pg_catalog.has_table_privilege('moneyverse_app','public.support_threads','SELECT') THEN
    RAISE EXCEPTION 'app role can directly read private support tables';
  END IF;
  IF NOT pg_catalog.has_function_privilege('moneyverse_app',
       'public.support_my_message_receipt(uuid,uuid,uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'app role missing function execute';
  END IF;
  SELECT count(*) INTO v_count
  FROM public.support_my_message_receipt(v_owner,v_thread,v_message);
  IF v_count <> 1 THEN RAISE EXCEPTION '201st+ message not found'; END IF;
  SELECT count(*) INTO v_count
  FROM public.support_my_message_receipt(v_owner,v_thread,
       '00000000-0000-4000-8000-000000000302');
  IF v_count <> 1 THEN RAISE EXCEPTION 'same-body distinct receipt lost'; END IF;
  SELECT count(*) INTO v_count
  FROM public.support_my_message_receipt(v_owner,v_thread,
       '00000000-0000-4000-8000-000000000999');
  IF v_count <> 0 THEN RAISE EXCEPTION 'forged receipt returned data'; END IF;
  BEGIN
    PERFORM * FROM public.support_my_message_receipt(v_other,v_thread,v_message);
    RAISE EXCEPTION 'non-owner access not refused';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.support_my_message_receipt(NULL,v_thread,v_message);
    RAISE EXCEPTION 'null actor not refused';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
END $test$;

SET ROLE moneyverse_app;
SELECT message_id, sender_kind, body, created_at
FROM public.support_my_message_receipt(
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000301');
RESET ROLE;
\echo 'PASS: 205-message owner proof, same-body identity, non-owner, missing, ACL'
