-- Gate: zero PUBLIC-executable SECURITY DEFINER routines. App's explicit
-- runtime authority to the eleven pre-existing functions must survive.
DO $$
DECLARE public_count integer; app_explicit_count integer;
BEGIN
 SELECT count(*) INTO public_count FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.prosecdef
 AND has_function_privilege('public',p.oid,'EXECUTE');
 IF public_count<>0 THEN RAISE EXCEPTION 'PUBLIC SECURITY DEFINER EXECUTE count %',public_count; END IF;
 SELECT count(*) INTO app_explicit_count FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.prosecdef AND p.proname IN (
 'admin_credit_grades','admin_loan_book','get_citizen_tax_transparency_receipt',
 'treasury_disburse_citizen_dividend','treasury_disburse_grant',
 'treasury_disburse_targeted_subsidy','treasury_distribute_budget_rule',
 'treasury_execute_market_buyback_burn','treasury_execute_progressive_wealth_tax',
 'treasury_user_donate','verify_economy_supply_invariant')
 AND EXISTS (SELECT 1 FROM aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
 WHERE a.grantee='moneyverse_app'::regrole::oid AND a.privilege_type='EXECUTE');
 IF app_explicit_count<>11 THEN RAISE EXCEPTION 'App explicit EXECUTE count % expected 11',app_explicit_count; END IF;
END $$;
