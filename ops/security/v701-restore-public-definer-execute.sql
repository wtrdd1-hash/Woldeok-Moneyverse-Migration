-- Emergency rollback ONLY. Restores exactly the previously observed PUBLIC
-- grants if a real downstream principal unexpectedly depended on them.
BEGIN;
SET LOCAL lock_timeout='3s';
GRANT EXECUTE ON FUNCTION public.admin_credit_grades(uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_loan_book(uuid,integer) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_citizen_tax_transparency_receipt(uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_citizen_dividend(uuid,text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_grant(uuid,uuid,text,text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_targeted_subsidy(uuid,text,text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_distribute_budget_rule(uuid,text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_execute_market_buyback_burn(uuid,uuid,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_execute_progressive_wealth_tax(uuid,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_user_donate(uuid,text,text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_economy_supply_invariant() TO PUBLIC;
COMMIT;
