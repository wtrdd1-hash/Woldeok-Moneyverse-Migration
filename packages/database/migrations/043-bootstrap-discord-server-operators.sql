-- The two verified Discord bootstrap administrators may each request a fixed
-- Minecraft operation and may each approve the *other* administrator's
-- request.  They never bypass the database's requester != approver rule.
-- Keep role assignment bound to a verified Discord subject, not a browser
-- field, display name, email address, or Google identity.
BEGIN;

CREATE OR REPLACE FUNCTION public.grant_bootstrap_discord_administrator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.provider = 'discord'::public.identity_provider
    AND NEW.provider_subject IN ('886478189520637992', '1481258930909872239') THEN
    INSERT INTO public.user_roles(user_id, role)
    VALUES
      (NEW.user_id, 'operator'::public.admin_role),
      (NEW.user_id, 'approver'::public.admin_role),
      (NEW.user_id, 'server_operator'::public.admin_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.grant_bootstrap_discord_administrator() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.grant_bootstrap_discord_administrator() FROM PUBLIC, moneyverse_app;

INSERT INTO public.user_roles(user_id, role)
SELECT identity_row.user_id, role_row.role
FROM public.identities AS identity_row
CROSS JOIN (VALUES
  ('operator'::public.admin_role),
  ('approver'::public.admin_role),
  ('server_operator'::public.admin_role)
) AS role_row(role)
WHERE identity_row.provider = 'discord'::public.identity_provider
  AND identity_row.provider_subject IN ('886478189520637992', '1481258930909872239')
ON CONFLICT (user_id, role) DO NOTHING;

COMMIT;
