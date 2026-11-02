-- C v1301: owner-scoped saving-pocket read required by the existing Nest GET.
-- This read is not a balance movement, a settlement receipt or a write API.
BEGIN;

CREATE FUNCTION public.bank_list_pockets(p_actor uuid)
RETURNS TABLE (
  pocket_id uuid,
  name varchar(64),
  balance bigint,
  target_amount bigint,
  target_date date,
  theme_color varchar(32),
  icon_code varchar(32),
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT p.id, p.name, p.balance, p.target_amount, p.target_date,
         p.theme_color, p.icon_code, p.is_archived, p.created_at, p.updated_at
  FROM public.bank_saving_pockets AS p
  WHERE p.user_id = p_actor
  ORDER BY p.created_at DESC, p.id
$function$;

ALTER FUNCTION public.bank_list_pockets(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_list_pockets(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_list_pockets(uuid) TO moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.bank_saving_pockets FROM PUBLIC, moneyverse_app;

COMMIT;
