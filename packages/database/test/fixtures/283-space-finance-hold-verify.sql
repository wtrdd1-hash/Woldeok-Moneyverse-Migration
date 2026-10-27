-- Negative ACL checks + authorized layout + 100 denied owner-side attempts.
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.space_purchase(uuid,text,text,uuid)',
    'public.city_project_contribute(uuid,uuid,numeric,uuid)',
    'public.space_pay_property_tax(uuid,uuid,integer,uuid)'
  ] LOOP
    IF pg_catalog.has_function_privilege('moneyverse_app',f,'EXECUTE')
       OR pg_catalog.has_function_privilege('outsider',f,'EXECUTE') THEN
      RAISE EXCEPTION 'unsafe EXECUTE grant remains: %', f;
    END IF;
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    'public.user_spaces','public.city_projects',
    'public.city_project_contributions','public.space_property_tax_payments'
  ] LOOP
    IF pg_catalog.has_table_privilege('moneyverse_app',f,'INSERT')
       OR pg_catalog.has_table_privilege('moneyverse_app',f,'UPDATE')
       OR pg_catalog.has_table_privilege('moneyverse_app',f,'DELETE') THEN
      RAISE EXCEPTION 'unsafe direct DML grant remains: %', f;
    END IF;
  END LOOP;
  IF NOT pg_catalog.has_function_privilege('moneyverse_app','public.space_update_layout(uuid,uuid,jsonb)','EXECUTE')
    OR pg_catalog.has_function_privilege('outsider','public.space_update_layout(uuid,uuid,jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'layout grant is not app-only';
  END IF;
END $$;

SET ROLE moneyverse_app;
DO $$
BEGIN
  IF public.space_update_layout(
      '99999999-2222-4333-8444-555555555555',
      '22222222-3333-4444-8555-666666666666', '{"theme":"intruder"}') THEN
    RAISE EXCEPTION 'cross-owner update unexpectedly succeeded';
  END IF;
  IF NOT public.space_update_layout(
      '11111111-2222-4333-8444-555555555555',
      '22222222-3333-4444-8555-666666666666', '{"theme":"owner"}') THEN
    RAISE EXCEPTION 'legitimate owner update was blocked';
  END IF;
  BEGIN
    UPDATE public.user_spaces SET layout = '{"theme":"bypass"}';
    RAISE EXCEPTION 'direct update unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;

DO $$
DECLARE i integer;
BEGIN
  FOR i IN 1..100 LOOP
    BEGIN
      PERFORM public.space_purchase(
        '11111111-2222-4333-8444-555555555555',
        'SPACE_STUDIO', 'test', '33333333-4444-4555-8666-777777777777');
      RAISE EXCEPTION 'purchase unexpectedly succeeded';
    EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
    END;
    BEGIN
      PERFORM public.city_project_contribute(
        '11111111-2222-4333-8444-555555555555',
        '22222222-3333-4444-8555-666666666666', 1,
        '33333333-4444-4555-8666-777777777777');
      RAISE EXCEPTION 'contribution unexpectedly succeeded';
    EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
    END;
    BEGIN
      PERFORM public.space_pay_property_tax(
        '11111111-2222-4333-8444-555555555555',
        '22222222-3333-4444-8555-666666666666', 1,
        '33333333-4444-4555-8666-777777777777');
      RAISE EXCEPTION 'tax unexpectedly succeeded';
    EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
    END;
  END LOOP;
  IF (SELECT balance FROM public.account_balances LIMIT 1) <> 100000
    OR (SELECT count(*) FROM public.ledger_transactions) <> 0
    OR (SELECT count(*) FROM public.ledger_postings) <> 0
    OR (SELECT layout->>'theme' FROM public.user_spaces LIMIT 1) <> 'owner' THEN
    RAISE EXCEPTION 'hold changed financial state or owner layout';
  END IF;
END $$;
