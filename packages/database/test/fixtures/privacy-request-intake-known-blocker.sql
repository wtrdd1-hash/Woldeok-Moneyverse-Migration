-- Assertions against the exact unchanged migration 015 in a disposable database.
DO $$
DECLARE
  v_first uuid;
  v_replay uuid;
  v_replayed boolean;
  v_count integer;
BEGIN
  IF current_database() NOT LIKE 'mv_a_privacy_%' THEN
    RAISE EXCEPTION 'refusing non-isolated privacy assertions';
  END IF;
  SELECT request_id, replayed INTO v_first, v_replayed
    FROM public.privacy_create_my_request(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'access', 'A private detail',
      '22222222-2222-4222-8222-222222222222');
  IF v_first IS NULL OR v_replayed THEN RAISE EXCEPTION 'first receipt missing'; END IF;
  SELECT request_id, replayed INTO v_replay, v_replayed
    FROM public.privacy_create_my_request(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'access', 'A private detail',
      '22222222-2222-4222-8222-222222222222');
  IF v_replay <> v_first OR NOT v_replayed THEN RAISE EXCEPTION 'idempotent replay changed'; END IF;
  SELECT count(*) INTO v_count FROM public.privacy_list_my_requests(
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',30);
  IF v_count <> 0 THEN RAISE EXCEPTION 'other member received private detail'; END IF;
  SELECT count(*) INTO v_count FROM public.privacy_list_my_requests(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',30) WHERE detail = 'A private detail';
  IF v_count <> 1 THEN RAISE EXCEPTION 'owner private detail missing'; END IF;
  BEGIN
    PERFORM public.privacy_create_my_request(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','deletion','changed payload',
      '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'conflicting receipt replay accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
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
