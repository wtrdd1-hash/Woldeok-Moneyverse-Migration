-- 361: the saving-pocket list read bank_saving_pockets directly; the chain grants the application
-- role INSERT and cosmetic UPDATE columns only (350), never SELECT. Actor-bound read instead.
-- Columns follow the web contract (frontend SavingPocket); money as canonical integer strings.

CREATE OR REPLACE FUNCTION public.bank_owner_pockets(p_actor uuid)
RETURNS TABLE (
  pocket_id uuid,
  pocket_name text,
  balance text,
  target_amount text,
  target_date date,
  theme_color text,
  icon_code text,
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT p.id, p.name::text, p.balance::text, p.target_amount::text, p.target_date,
         p.theme_color::text, p.icon_code::text, p.is_archived, p.created_at, p.updated_at
  FROM public.bank_saving_pockets AS p
  WHERE p_actor IS NOT NULL AND p.user_id = p_actor AND p.is_archived = false
  ORDER BY p.created_at ASC, p.id ASC;
$function$;

ALTER FUNCTION public.bank_owner_pockets(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_owner_pockets(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_owner_pockets(uuid) TO moneyverse_app;
