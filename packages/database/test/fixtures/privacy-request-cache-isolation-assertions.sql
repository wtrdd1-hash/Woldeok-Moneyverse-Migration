-- Read-only owner scope and direct-table ACL checks for unchanged migration 015.
DO $$
BEGIN
  IF current_database() NOT LIKE 'mv_a_privacy_%' THEN
    RAISE EXCEPTION 'refusing non-isolated privacy assertions';
  END IF;
END $$;
INSERT INTO public.privacy_data_subject_requests(
  requester_user_id, request_type, detail, idempotency_key, request_hash)
VALUES (
  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'access', 'A private detail',
  '11111111-1111-4111-8111-111111111111', public.digest('synthetic', 'sha256'));
DO $$
DECLARE v_count integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.privacy_list_my_requests(
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',30);
  IF v_count <> 0 THEN RAISE EXCEPTION 'other member received private detail'; END IF;
  SELECT count(*) INTO v_count FROM public.privacy_list_my_requests(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',30) WHERE detail = 'A private detail';
  IF v_count <> 1 THEN RAISE EXCEPTION 'owner private detail missing'; END IF;
END $$;
SET ROLE moneyverse_app;
DO $$
BEGIN
  BEGIN
    PERFORM 1 FROM public.privacy_data_subject_requests LIMIT 1;
    RAISE EXCEPTION 'direct private table SELECT permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
