-- v2026.11.09.1944: fail closed on modeled-AUM SWF liquidation. The prior
-- implementation minted WLD against simulated portfolio values instead of
-- proving a completed third-party settlement. Preserve historical receipts.
-- No legacy migrations, balances, or postings are rewritten here.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_swf_liquidate_to_vault(
  p_actor uuid,
  p_target_aum numeric DEFAULT 20000000
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $body$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'approver'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'administrator SWF liquidation denied: unauthorized actor';
  END IF;
  -- A quoted valuation is not a settlement receipt, even when an MINT/TREASURY
  -- double-entry journal balances perfectly. Never convert it into spendable WLD.
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'SWF_UNFUNDED_LIQUIDATION_HELD';
END;
$body$;
ALTER FUNCTION public.admin_swf_liquidate_to_vault(uuid, numeric)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_swf_liquidate_to_vault(uuid, numeric)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_swf_liquidate_to_vault(uuid, numeric)
  TO moneyverse_app;
COMMIT;
