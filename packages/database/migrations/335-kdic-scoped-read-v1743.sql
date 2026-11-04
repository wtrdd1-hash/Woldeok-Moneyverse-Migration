-- v2026.11.04.1743: correct real official Test KDIC HTTP500 without
-- granting the untrusted web principal direct financial-table SELECT.
-- Existing Production broad KDIC SELECT grants are not extended here.
-- Nonmonetary read functions only: no premium charge, payout or issuance.
BEGIN;

CREATE OR REPLACE FUNCTION public.kdic_read_fund_v1743()
RETURNS SETOF public.deposit_insurance_funds
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $kdic$
 SELECT f.* FROM public.deposit_insurance_funds AS f
 ORDER BY f.id LIMIT 1
$kdic$;

CREATE OR REPLACE FUNCTION public.kdic_read_institutions_v1743()
RETURNS SETOF public.insured_institutions
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $kdic$
 SELECT i.* FROM public.insured_institutions AS i
 ORDER BY i.total_deposits_wld DESC,i.id
 LIMIT 200
$kdic$;

CREATE OR REPLACE FUNCTION public.kdic_read_recent_premiums_v1743(
  p_actor uuid,p_limit integer
)
RETURNS TABLE(
  id uuid,institution_id varchar(64),institution_name text,
  quarter varchar(32),assessed_deposit_base bigint,
  premium_amount_wld bigint,status varchar(32),created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $kdic$
BEGIN
 IF p_actor IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10 THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid KDIC operator request';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.users u
   JOIN public.user_roles r ON r.user_id=u.id
   WHERE u.id=p_actor AND u.status='active'::public.user_status
     AND public.admin_role_holder(p_actor, 'operator'::public.admin_role)
 ) THEN
   RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active KDIC administrator role required';
 END IF;
 RETURN QUERY
 SELECT p.id,p.institution_id,
   coalesce(i.institution_name,p.institution_id)::text,
   p.quarter,p.assessed_deposit_base,p.premium_amount_wld,p.status,p.created_at
 FROM public.deposit_insurance_premiums p
 LEFT JOIN public.insured_institutions i ON i.id=p.institution_id
 ORDER BY p.created_at DESC,p.id DESC
 LIMIT p_limit;
END
$kdic$;

CREATE OR REPLACE FUNCTION public.kdic_read_recent_payouts_v1743(
 p_actor uuid,p_limit integer
)
RETURNS TABLE(
 id uuid,institution_id varchar(64),institution_name text,
 user_id uuid,display_name text,original_deposit_wld bigint,
 payout_amount_wld bigint,status varchar(32),
 reason varchar(255),created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $kdic$
BEGIN
 IF p_actor IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10 THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid KDIC operator request';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.users u
   JOIN public.user_roles r ON r.user_id=u.id
   WHERE u.id=p_actor AND u.status='active'::public.user_status
     AND public.admin_role_holder(p_actor, 'operator'::public.admin_role)
 ) THEN
   RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active KDIC administrator role required';
 END IF;
 RETURN QUERY
 SELECT p.id,p.institution_id,
   coalesce(i.institution_name,p.institution_id)::text,
   p.user_id,coalesce(mp.display_name,'예금자')::text,
   p.original_deposit_wld,p.payout_amount_wld,p.status,p.reason,p.created_at
 FROM public.deposit_insurance_payouts p
 LEFT JOIN public.insured_institutions i ON i.id=p.institution_id
 LEFT JOIN public.member_profiles mp ON mp.user_id=p.user_id
 ORDER BY p.created_at DESC,p.id DESC
 LIMIT p_limit;
END
$kdic$;

ALTER FUNCTION public.kdic_read_fund_v1743() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.kdic_read_institutions_v1743() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.kdic_read_recent_premiums_v1743(uuid,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.kdic_read_recent_payouts_v1743(uuid,integer) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.kdic_read_fund_v1743() FROM PUBLIC,moneyverse_app;
REVOKE ALL ON FUNCTION public.kdic_read_institutions_v1743() FROM PUBLIC,moneyverse_app;
REVOKE ALL ON FUNCTION public.kdic_read_recent_premiums_v1743(uuid,integer) FROM PUBLIC,moneyverse_app;
REVOKE ALL ON FUNCTION public.kdic_read_recent_payouts_v1743(uuid,integer) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.kdic_read_fund_v1743() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.kdic_read_institutions_v1743() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.kdic_read_recent_premiums_v1743(uuid,integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.kdic_read_recent_payouts_v1743(uuid,integer) TO moneyverse_app;

COMMIT;
