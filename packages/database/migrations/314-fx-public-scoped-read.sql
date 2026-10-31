-- Read-only, aggregate/public FX source boundary. No member wallets, trades or
-- margin contracts are reachable through these functions. Source provenance
-- and quote freshness are a separate publication gate (P1 #2111 / PR #2114).
BEGIN;

CREATE FUNCTION public.fx_public_reserve_status()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT to_jsonb(s) FROM (
    SELECT r.id::text AS id, r.reserve_name AS "reserveName", r.currency,
      r.total_reserves_usd::float8 AS "totalReservesUsd",
      r.target_anchor_rate::float8 AS "targetAnchorRate",
      r.current_rate::float8 AS "currentRate", r.is_halted AS "isHalted",
      r.total_interventions_count AS "totalInterventionsCount",
      r.total_intervened_usd::float8 AS "totalIntervenedUsd",
      r.updated_at AS "updatedAt"
    FROM public.foreign_exchange_reserves AS r
    ORDER BY r.updated_at DESC, r.id DESC LIMIT 1
  ) AS s;
$function$;

CREATE FUNCTION public.fx_public_rate_history(p_limit integer)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s."createdAt" ASC, s.id ASC), '[]'::jsonb)
  FROM (
    SELECT r.id::text AS id, r.rate::float8 AS rate,
      r.change_pct::float8 AS "changePct", r.volume_usd::float8 AS "volumeUsd",
      r.intervention_type AS "interventionType", r.note,
      r.created_at AS "createdAt"
    FROM public.foreign_exchange_rates AS r
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 30), 1), 100)
  ) AS s;
$function$;

CREATE FUNCTION public.fx_public_sdr_allocations()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s."allocationWeightPct" DESC, s.id ASC), '[]'::jsonb)
  FROM (
    SELECT a.id, a.asset_name AS "assetName", a.asset_type AS "assetType",
      a.allocation_weight_pct::float8 AS "allocationWeightPct",
      a.holding_amount::float8 AS "holdingAmount", a.unit,
      a.usd_value::float8 AS "usdValue", a.updated_at AS "updatedAt"
    FROM public.foreign_exchange_asset_allocations AS a
  ) AS s;
$function$;

CREATE FUNCTION public.fx_public_swap_agreements()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s."totalFacilityUsd" DESC, s.id ASC), '[]'::jsonb)
  FROM (
    SELECT a.id, a.counterparty, a.total_facility_usd::float8 AS "totalFacilityUsd",
      a.drawn_amount_usd::float8 AS "drawnAmountUsd",
      (a.total_facility_usd - a.drawn_amount_usd)::float8 AS "availableFacilityUsd",
      a.status, a.interest_rate_pct::float8 AS "interestRatePct",
      a.effective_date AS "effectiveDate", a.expiry_date AS "expiryDate",
      a.updated_at AS "updatedAt"
    FROM public.currency_swap_agreements AS a
  ) AS s;
$function$;

ALTER FUNCTION public.fx_public_reserve_status() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.fx_public_rate_history(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.fx_public_sdr_allocations() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.fx_public_swap_agreements() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.fx_public_reserve_status() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.fx_public_rate_history(integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.fx_public_sdr_allocations() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.fx_public_swap_agreements() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.fx_public_reserve_status() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.fx_public_rate_history(integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.fx_public_sdr_allocations() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.fx_public_swap_agreements() TO moneyverse_app;

-- No broad read grant: the application role may execute only the public DTO
-- projections, never inspect the raw tables or any member-level FX positions.
REVOKE ALL PRIVILEGES ON TABLE public.foreign_exchange_reserves,
  public.foreign_exchange_rates, public.foreign_exchange_asset_allocations,
  public.currency_swap_agreements FROM PUBLIC, moneyverse_app;
COMMIT;
