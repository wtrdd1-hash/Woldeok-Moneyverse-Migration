-- Owner-scoped quarantine metadata only. Existing collection rows have no
-- independently verified issuance receipts; do not grant ownership on read.
-- This forward migration adds no table DML/SELECT to the application role.
BEGIN;

CREATE FUNCTION public.collection_unverified_count(p_actor uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT count(*)::text
  FROM public.user_collections
  WHERE user_id = p_actor;
$$;

ALTER FUNCTION public.collection_unverified_count(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.collection_unverified_count(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.collection_unverified_count(uuid) TO moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.user_collections FROM PUBLIC, moneyverse_app;

COMMIT;
