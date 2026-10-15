-- v683: isolated restored production Test database only. All probes roll back.
BEGIN;
SET LOCAL statement_timeout = '15s';

DO $verify$
DECLARE
  operator_id uuid;
  member_id uuid;
  before_balance numeric;
  before_ledger bigint;
  before_donations bigint;
  amount_result text;
  expected_error boolean;
BEGIN
  IF current_database() <> 'wdmv_treasury_v680' THEN
    RAISE EXCEPTION 'Refusing non-isolated financial database';
  END IF;
  SELECT u.id INTO operator_id FROM public.users u JOIN public.user_roles r ON r.user_id=u.id
   WHERE u.status='active' AND r.role::text IN ('operator','superadmin') LIMIT 1;
  SELECT u.id INTO member_id FROM public.users u
   WHERE u.status='active' AND NOT public.admin_role_holder(u.id,'operator'::public.admin_role)
   LIMIT 1;
  IF operator_id IS NULL OR member_id IS NULL THEN
    RAISE EXCEPTION 'operator or non-admin fixture missing';
  END IF;

  SELECT discrepancy_amount_wld INTO amount_result
  FROM public.treasury_admin_reconciliation(operator_id);
  IF amount_result IS NULL OR amount_result::numeric <= 0 THEN
    RAISE EXCEPTION 'expected real positive fiscal discrepancy';
  END IF;
  expected_error:=false;
  BEGIN
    PERFORM 1 FROM public.treasury_admin_reconciliation(member_id);
  EXCEPTION WHEN SQLSTATE '42501' THEN
    expected_error:=true;
  END;
  IF NOT expected_error THEN RAISE EXCEPTION 'Nonoperator access was not denied'; END IF;

  SELECT sum(balance_wld::numeric) INTO before_balance FROM public.system_treasury_vaults;
  SELECT count(*) INTO before_ledger FROM public.system_treasury_ledger;
  SELECT count(*) INTO before_donations FROM public.treasury_donations;
  expected_error:=false;
  BEGIN
    PERFORM public.treasury_user_donate(member_id,'1','test blocked');
  EXCEPTION WHEN SQLSTATE '55000' THEN
    expected_error:=true;
  END;
  IF NOT expected_error THEN RAISE EXCEPTION 'Unverified donation unexpectedly accepted'; END IF;
  expected_error:=false;
  BEGIN
    PERFORM public.treasury_deposit_donation(member_id,1);
  EXCEPTION WHEN SQLSTATE '55000' THEN
    expected_error:=true;
  END;
  IF NOT expected_error THEN RAISE EXCEPTION 'Legacy donation unexpectedly accepted'; END IF;
  IF before_balance IS DISTINCT FROM (SELECT sum(balance_wld::numeric) FROM public.system_treasury_vaults)
    OR before_ledger <> (SELECT count(*) FROM public.system_treasury_ledger)
    OR before_donations <> (SELECT count(*) FROM public.treasury_donations) THEN
    RAISE EXCEPTION 'Financial DB changed after fail-closed donation tests';
  END IF;
  RAISE NOTICE 'SECURE_TREASURY_V683_PASS: operator/read, nonoperator-denied, donations-paused, no-money-change';
END $verify$;
ROLLBACK;
