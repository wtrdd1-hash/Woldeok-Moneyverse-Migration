\set ON_ERROR_STOP on
INSERT INTO public.users(id) VALUES
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222') ON CONFLICT DO NOTHING;
SET ROLE moneyverse_app;
DO $$
DECLARE
  first_receipt record;
  replay_receipt record;
  request_count integer;
BEGIN
  SELECT * INTO first_receipt
  FROM public.privacy_create_my_request(
    '11111111-1111-4111-8111-111111111111'::uuid,
    'access', NULL,
    '33333333-3333-4333-8333-333333333333'::uuid
  );
  IF first_receipt.replayed OR first_receipt.status <> 'received' THEN
    RAISE EXCEPTION 'first privacy request was not recorded';
  END IF;
  SELECT * INTO replay_receipt
  FROM public.privacy_create_my_request(
    '11111111-1111-4111-8111-111111111111'::uuid,
    'access', NULL,
    '33333333-3333-4333-8333-333333333333'::uuid
  );
  IF first_receipt.request_id IS DISTINCT FROM replay_receipt.request_id
    OR replay_receipt.replayed IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'privacy request idempotency failed';
  END IF;
  SELECT count(*) INTO request_count
  FROM public.privacy_list_my_requests('11111111-1111-4111-8111-111111111111'::uuid, 30);
  IF request_count <> 1 THEN
    RAISE EXCEPTION 'owner receipt list incorrect';
  END IF;
  SELECT count(*) INTO request_count
  FROM public.privacy_list_my_requests('22222222-2222-4222-8222-222222222222'::uuid, 30);
  IF request_count <> 0 THEN
    RAISE EXCEPTION 'cross-user request leaked';
  END IF;
  BEGIN
    PERFORM public.privacy_create_my_request(
      '11111111-1111-4111-8111-111111111111'::uuid,
      'correction', 'different payload',
      '33333333-3333-4333-8333-333333333333'::uuid
    );
    RAISE EXCEPTION 'mismatched replay accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;
  BEGIN
    PERFORM count(*) FROM public.privacy_data_subject_requests;
    RAISE EXCEPTION 'app role direct table read permitted';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  BEGIN
    INSERT INTO public.privacy_data_subject_requests DEFAULT VALUES;
    RAISE EXCEPTION 'app role direct table write permitted';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
  BEGIN
    PERFORM public.privacy_create_my_request(
      '99999999-9999-4999-8999-999999999999'::uuid,
      'access', NULL,
      '44444444-4444-4444-8444-444444444444'::uuid
    );
    RAISE EXCEPTION 'inactive account accepted';
  EXCEPTION WHEN SQLSTATE '28000' THEN
    NULL;
  END;
END $$;
RESET ROLE;
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.privacy_data_subject_requests;
  IF n <> 1 THEN RAISE EXCEPTION 'expected one persisted privacy request, got %', n; END IF;
END $$;
SELECT 'PASS privacy owner-scoped replay and DB receipt' AS result;
