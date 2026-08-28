-- Move the bootstrap administrator list out of the migration and into a table.
--
-- 022 introduced `grant_bootstrap_discord_administrator`, a trigger on
-- `identities` that grants the three admin roles when a verified Discord
-- subject matching a hard-coded list links an account. 043 changed the list.
--
-- A hard-coded list cannot differ between deployments, and that is now the
-- requirement: the test deployment needs an administrator the production one
-- must not have. Editing the list again would grant that account on every
-- database the migration reaches, which is the opposite of what is wanted.
--
-- So the list becomes `bootstrap_discord_operators`, seeded here with exactly
-- the two subjects 043 named -- every existing database keeps the behaviour it
-- has today, byte for byte -- and a deployment adds its own rows out of band
-- (deploy/seed.sh, driven by BOOTSTRAP_DISCORD_ADMIN_IDS).
--
-- The table is reachable only by the migrator. moneyverse_app cannot read it
-- and certainly cannot write it: a web request that could add a row to this
-- table would be a web request that could make itself an administrator.

BEGIN;

CREATE TABLE IF NOT EXISTS public.bootstrap_discord_operators (
  provider_subject text PRIMARY KEY
    CHECK (provider_subject ~ '^[0-9]{5,32}$'),
  note text,
  added_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

REVOKE ALL ON public.bootstrap_discord_operators FROM PUBLIC, moneyverse_app;

-- The two 043 named. Present in every database that has run 043, so seeding
-- them here changes nothing anywhere.
INSERT INTO public.bootstrap_discord_operators (provider_subject, note)
VALUES
  ('886478189520637992', 'from 043-bootstrap-discord-server-operators.sql'),
  ('1481258930909872239', 'from 043-bootstrap-discord-server-operators.sql')
ON CONFLICT (provider_subject) DO NOTHING;

-- Same trigger, same roles, same rule that the grant follows a *verified*
-- Discord subject and never a browser field. Only the source of the list
-- changes.
CREATE OR REPLACE FUNCTION public.grant_bootstrap_discord_administrator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.provider = 'discord'::public.identity_provider
    AND EXISTS (
      SELECT 1 FROM public.bootstrap_discord_operators
      WHERE provider_subject = NEW.provider_subject
    ) THEN
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

-- Grants the roles to an operator who is already linked. The trigger only
-- fires on insert, so an id added to the table after that person's first
-- login would otherwise never take effect. Safe to run repeatedly.
CREATE OR REPLACE FUNCTION public.apply_bootstrap_discord_operators()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_granted integer;
BEGIN
  WITH granted AS (
    INSERT INTO public.user_roles(user_id, role)
    SELECT identity_row.user_id, role_row.role
    FROM public.identities AS identity_row
    JOIN public.bootstrap_discord_operators AS operator
      ON operator.provider_subject = identity_row.provider_subject
    CROSS JOIN (VALUES
      ('operator'::public.admin_role),
      ('approver'::public.admin_role),
      ('server_operator'::public.admin_role)
    ) AS role_row(role)
    WHERE identity_row.provider = 'discord'::public.identity_provider
    ON CONFLICT (user_id, role) DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_granted FROM granted;
  RETURN v_granted;
END;
$$;

ALTER FUNCTION public.apply_bootstrap_discord_operators() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.apply_bootstrap_discord_operators() FROM PUBLIC, moneyverse_app;

SELECT public.apply_bootstrap_discord_operators();

COMMIT;
