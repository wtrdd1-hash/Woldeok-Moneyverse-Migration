-- Isolated full-schema PostgreSQL; no production member rows are read or changed.
INSERT INTO public.treasury_bond_holdings
  (id, user_id, bond_id, units, purchase_price_total_wld, accrued_interest_wld, maturity_at)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', id,
       2, 9007199254740993, 17, now() + interval '48 hours'
FROM public.treasury_bonds WHERE symbol='KTB-01Y';
INSERT INTO public.treasury_bond_holdings
  (id, user_id, bond_id, units, purchase_price_total_wld, accrued_interest_wld, maturity_at)
SELECT 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', id,
       3, 100, 4, now() + interval '72 hours'
FROM public.treasury_bonds WHERE symbol='KTB-03Y';
INSERT INTO public.treasury_bond_repo_loans
  (id, holding_id, user_id, principal_wld, accrued_interest_wld)
VALUES
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 9007199254740993, 5),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 7, 1);
-- Deliberately inconsistent synthetic loan owner must not expose another owner's collateral.
INSERT INTO public.treasury_bond_repo_loans
  (id, holding_id, user_id, principal_wld, accrued_interest_wld, status)
VALUES ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '11111111-1111-4111-8111-111111111111', 99, 0, 'REPAID');
INSERT INTO public.treasury_bond_coupon_logs (user_id, bond_id, event_type, amount_wld)
SELECT '11111111-1111-4111-8111-111111111111', id, 'COUPON_INTEREST', 21
FROM public.treasury_bonds WHERE symbol='KTB-01Y';
INSERT INTO public.treasury_bond_coupon_logs (user_id, bond_id, event_type, amount_wld)
SELECT '11111111-1111-4111-8111-111111111111', id, 'MATURITY_REDEMPTION', 10000
FROM public.treasury_bonds WHERE symbol='KTB-01Y';

SET ROLE moneyverse_app;
DO $test$
DECLARE r record; p text;
BEGIN
 FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'] LOOP
   IF has_table_privilege(current_user, 'public.treasury_bond_holdings', p) OR
      has_table_privilege(current_user, 'public.treasury_bond_repo_loans', p) OR
      has_table_privilege(current_user, 'public.treasury_bonds', p) THEN
     RAISE EXCEPTION 'raw bond member privilege: %', p;
   END IF;
 END LOOP;
 BEGIN
   EXECUTE 'SELECT count(*) FROM public.treasury_bond_holdings';
   RAISE EXCEPTION 'direct holdings SELECT unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
   EXECUTE 'SELECT count(*) FROM public.treasury_bond_repo_loans';
   RAISE EXCEPTION 'direct repo SELECT unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 IF (SELECT count(*) FROM public.bond_public_catalog()) <> 3 THEN
   RAISE EXCEPTION 'public bond catalogue unavailable';
 END IF;
 SELECT * INTO r FROM public.bond_owner_holdings('11111111-1111-4111-8111-111111111111');
 IF r.user_id <> '11111111-1111-4111-8111-111111111111'::uuid OR
    r.purchase_price_total_wld <> '9007199254740993' OR r.hours_left < 0 THEN
   RAISE EXCEPTION 'owner holding precision/scope mismatch';
 END IF;
 IF (SELECT count(*) FROM public.bond_owner_holdings('11111111-1111-4111-8111-111111111111')) <> 1 OR
    (SELECT count(*) FROM public.bond_owner_holdings('22222222-2222-4222-8222-222222222222')) <> 1 THEN
   RAISE EXCEPTION 'cross-owner holdings leaked';
 END IF;
 SELECT * INTO r FROM public.bond_owner_repo_loans('11111111-1111-4111-8111-111111111111');
 IF r.user_id <> '11111111-1111-4111-8111-111111111111'::uuid OR r.principal_wld <> '9007199254740993' THEN
   RAISE EXCEPTION 'repo scope/precision mismatch';
 END IF;
 IF (SELECT count(*) FROM public.bond_owner_repo_loans('11111111-1111-4111-8111-111111111111')) <> 1 OR
    (SELECT count(*) FROM public.bond_owner_repo_loans('22222222-2222-4222-8222-222222222222')) <> 1 THEN
   RAISE EXCEPTION 'cross-owner repo leaked';
 END IF;
 IF (SELECT holders_count FROM public.bond_public_read_totals()) <> '2' OR
    (SELECT coupons_paid_wld FROM public.bond_public_read_totals()) <> '21' OR
    (SELECT repo_active_principal_wld FROM public.bond_public_read_totals()) <> '9007199254741000' THEN
   RAISE EXCEPTION 'aggregate mismatch or maturity principal counted as coupon';
 END IF;
 BEGIN
   PERFORM * FROM public.bond_owner_holdings(NULL::uuid);
   RAISE EXCEPTION 'NULL owner accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL;
 END;
 BEGIN
   PERFORM * FROM public.bond_owner_repo_loans('00000000-0000-0000-0000-000000000000'::uuid);
   RAISE EXCEPTION 'zero owner accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL;
 END;
 IF has_function_privilege('public', 'public.bond_owner_holdings(uuid)', 'EXECUTE') OR
    has_function_privilege('public', 'public.bond_owner_repo_loans(uuid)', 'EXECUTE') OR
    has_function_privilege('public', 'public.bond_public_read_totals()', 'EXECUTE') OR
    has_function_privilege('public', 'public.bond_public_catalog()', 'EXECUTE') THEN
   RAISE EXCEPTION 'PUBLIC may execute private bond function';
 END IF;
END;
$test$;
RESET ROLE;
SELECT 'PASS: full-schema bond owner ACL, aggregates, exact money and read-only grants' AS verdict;
