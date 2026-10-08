-- Migration 266: public-only KDIC read model with exact BIGINT strings.
-- No direct table grants and no payout/member PII in the public projection.
BEGIN;

CREATE FUNCTION public.kdic_public_portal_snapshot()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $kdic$
  SELECT pg_catalog.jsonb_build_object(
    'fund', pg_catalog.jsonb_build_object(
      'fundName', f.fund_name,
      'totalFundWld', f.total_fund_wld::text,
      'protectionLimitPerUser', f.protection_limit_per_user::text,
      'totalInsuredDepositsWld', f.total_insured_deposits_wld::text,
      'cumulativePremiumsCollectedWld', f.cumulative_premiums_collected_wld::text,
      'cumulativePayoutsWld', f.cumulative_payouts_wld::text,
      'isEmergencyMode', f.is_emergency_mode,
      'updatedAt', f.updated_at
    ),
    'institutions', (
      SELECT COALESCE(
        pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'id', i.id,
          'institutionName', i.institution_name,
          'institutionType', i.institution_type,
          'bisRatioPct', i.bis_ratio_pct,
          'soundnessGrade', i.soundness_grade,
          'totalDepositsWld', i.total_deposits_wld::text,
          'premiumRatePct', i.premium_rate_pct,
          'status', i.status
        ) ORDER BY i.institution_name), '[]'::jsonb)
      FROM public.insured_institutions i
    ),
    'summary', pg_catalog.jsonb_build_object(
      'totalInsuredInstitutions', (SELECT count(*)::integer FROM public.insured_institutions),
      'totalDepositsWld', (SELECT COALESCE(sum(i.total_deposits_wld), 0)::text FROM public.insured_institutions i),
      'averageBisRatioPct', (SELECT COALESCE(round(avg(i.bis_ratio_pct), 1), 0)::double precision FROM public.insured_institutions i),
      'reserveCoverageRatioPct', (
        SELECT COALESCE(
          round((f.total_fund_wld::numeric / nullif(sum(i.total_deposits_wld), 0)::numeric) * 100, 1),
          0
        )::double precision FROM public.insured_institutions i
      )
    )
  )
  FROM public.deposit_insurance_funds f
  WHERE f.id = 'KDIC_MAIN_FUND'
  LIMIT 1;
$kdic$;

REVOKE ALL ON FUNCTION public.kdic_public_portal_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.kdic_public_portal_snapshot() TO moneyverse_app;
COMMIT;
