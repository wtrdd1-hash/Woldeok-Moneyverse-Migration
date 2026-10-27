-- 20 clients x 5 transactions = 100 independent concurrent transaction attempts.
DO $$
BEGIN
  BEGIN
    PERFORM public.space_purchase(
      '11111111-2222-4333-8444-555555555555',
      'SPACE_STUDIO', 'parallel',
      '33333333-4444-4555-8666-777777777777');
    RAISE EXCEPTION 'unexpected space purchase';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    PERFORM public.city_project_contribute(
      '11111111-2222-4333-8444-555555555555',
      '22222222-3333-4444-8555-666666666666',
      1, '33333333-4444-4555-8666-777777777777');
    RAISE EXCEPTION 'unexpected contribution';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    PERFORM public.space_pay_property_tax(
      '11111111-2222-4333-8444-555555555555',
      '22222222-3333-4444-8555-666666666666',
      1, '33333333-4444-4555-8666-777777777777');
    RAISE EXCEPTION 'unexpected tax';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END $$;
