BEGIN;

-- 1. Drop single superadmin partial index to allow multiple superadmins
DROP INDEX IF EXISTS public.user_roles_single_superadmin;

-- 2. Update admin_grant_role function to support multi-superadmin without displacing existing superadmins
CREATE OR REPLACE FUNCTION public.admin_grant_role(
  p_key uuid,
  p_actor uuid,
  p_target uuid,
  p_role text,
  p_reason text
)
RETURNS TABLE(designation_id uuid, granted_role text, displaced_user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_role public.admin_role;
  v_reason text;
  v_existing public.admin_role_designations%ROWTYPE;
  v_displaced uuid := NULL;
  v_designation uuid;
  v_superadmin_exists boolean;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid role grant';
  END IF;
  IF pg_catalog.lower(pg_catalog.btrim(coalesce(p_role, '')))
    NOT IN ('operator', 'approver', 'server_operator', 'superadmin') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown administrative role';
  END IF;
  v_role := pg_catalog.lower(pg_catalog.btrim(p_role))::public.admin_role;
  v_reason := public.admin_normalized_reason(p_reason);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_grant_role:' || p_key::text, 0)
  );

  SELECT designation_row.* INTO v_existing
  FROM public.admin_role_designations AS designation_row
  WHERE designation_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'role designation receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.role::text, v_existing.displaced_user_id;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles AS role_row
    WHERE role_row.role = 'superadmin'::public.admin_role
  ) INTO v_superadmin_exists;

  IF v_superadmin_exists THEN
    PERFORM public.admin_require_superadmin(p_actor);
  ELSIF NOT (
    v_role = 'superadmin'::public.admin_role
    AND public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    AND public.admin_role_holder(p_actor, 'approver'::public.admin_role)
    AND public.admin_role_holder(p_actor, 'server_operator'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'a superadmin must be designated before roles can be granted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_target AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an active target account is required';
  END IF;

  IF v_role = 'superadmin'::public.admin_role THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT p_target, legacy_role
    FROM pg_catalog.unnest(ARRAY[
      'superadmin'::public.admin_role,
      'operator'::public.admin_role,
      'approver'::public.admin_role,
      'server_operator'::public.admin_role
    ]) AS legacy_role
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (p_target, v_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  INSERT INTO public.admin_role_designations (
    idempotency_key, actor_user_id, target_user_id, role, operation, reason, displaced_user_id
  ) VALUES (p_key, p_actor, p_target, v_role, 'grant', v_reason, v_displaced)
  RETURNING id INTO v_designation;

  PERFORM public.admin_append_audit_event(
    p_actor,
    'admin.role.granted',
    p_target,
    p_key,
    pg_catalog.jsonb_build_object(
      'role', v_role::text,
      'reason', v_reason,
      'displacedUserId', NULL
    )
  );

  RETURN QUERY SELECT v_designation, v_role::text, v_displaced;
END;
$$;

ALTER FUNCTION public.admin_grant_role(uuid, uuid, uuid, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_grant_role(uuid, uuid, uuid, text, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, uuid, uuid, text, text) TO moneyverse_app;

-- 3. Register requested Discord IDs to bootstrap_discord_operators
INSERT INTO public.bootstrap_discord_operators (provider_subject, note)
VALUES
  ('889085646768078850', 'Superadmin designated by user'),
  ('1545280111258107934', 'Superadmin designated by user')
ON CONFLICT (provider_subject) DO UPDATE SET note = EXCLUDED.note;

-- 4. Create bootstrap_google_operators table
CREATE TABLE IF NOT EXISTS public.bootstrap_google_operators (
  email text PRIMARY KEY,
  provider_subject text,
  note text,
  added_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
REVOKE ALL ON public.bootstrap_google_operators FROM PUBLIC, moneyverse_app;

INSERT INTO public.bootstrap_google_operators (email, provider_subject, note)
VALUES
  ('woldeog12@gmail.com', '100343387892064653551', 'Superadmin designated by user'),
  ('jungchwimisaenghwal63@gmail.com', NULL, 'Superadmin designated by user')
ON CONFLICT (email) DO UPDATE
  SET provider_subject = COALESCE(EXCLUDED.provider_subject, public.bootstrap_google_operators.provider_subject),
      note = EXCLUDED.note;

-- 5. Update Discord bootstrap trigger to grant superadmin as well
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
      (NEW.user_id, 'superadmin'::public.admin_role),
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
      ('superadmin'::public.admin_role),
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

-- 6. Google bootstrap trigger & procedure
CREATE OR REPLACE FUNCTION public.grant_bootstrap_google_administrator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.provider = 'google'::public.identity_provider
    AND EXISTS (
      SELECT 1 FROM public.bootstrap_google_operators
      WHERE provider_subject = NEW.provider_subject
    ) THEN
    INSERT INTO public.user_roles(user_id, role)
    VALUES
      (NEW.user_id, 'superadmin'::public.admin_role),
      (NEW.user_id, 'operator'::public.admin_role),
      (NEW.user_id, 'approver'::public.admin_role),
      (NEW.user_id, 'server_operator'::public.admin_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.grant_bootstrap_google_administrator() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.grant_bootstrap_google_administrator() FROM PUBLIC, moneyverse_app;

DROP TRIGGER IF EXISTS identities_grant_bootstrap_google_administrator ON public.identities;
CREATE TRIGGER identities_grant_bootstrap_google_administrator
  AFTER INSERT ON public.identities
  FOR EACH ROW EXECUTE FUNCTION public.grant_bootstrap_google_administrator();

CREATE OR REPLACE FUNCTION public.apply_bootstrap_google_operators()
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
    JOIN public.bootstrap_google_operators AS operator
      ON operator.provider_subject = identity_row.provider_subject
    CROSS JOIN (VALUES
      ('superadmin'::public.admin_role),
      ('operator'::public.admin_role),
      ('approver'::public.admin_role),
      ('server_operator'::public.admin_role)
    ) AS role_row(role)
    WHERE identity_row.provider = 'google'::public.identity_provider
    ON CONFLICT (user_id, role) DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_granted FROM granted;
  RETURN v_granted;
END;
$$;

ALTER FUNCTION public.apply_bootstrap_google_operators() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.apply_bootstrap_google_operators() FROM PUBLIC, moneyverse_app;

SELECT public.apply_bootstrap_google_operators();

-- 7. Google OAuth subject matcher procedure callable from app when email matches
CREATE OR REPLACE FUNCTION public.auth_bind_bootstrap_google_admin(
  p_email text,
  p_provider_subject text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_matched boolean := false;
BEGIN
  IF p_email IS NULL OR p_provider_subject IS NULL OR p_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.bootstrap_google_operators
  SET provider_subject = p_provider_subject
  WHERE lower(email) = lower(btrim(p_email));

  IF FOUND THEN
    INSERT INTO public.user_roles(user_id, role)
    VALUES
      (p_user_id, 'superadmin'::public.admin_role),
      (p_user_id, 'operator'::public.admin_role),
      (p_user_id, 'approver'::public.admin_role),
      (p_user_id, 'server_operator'::public.admin_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    v_matched := true;
  END IF;

  RETURN v_matched;
END;
$$;

ALTER FUNCTION public.auth_bind_bootstrap_google_admin(text, text, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.auth_bind_bootstrap_google_admin(text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_bind_bootstrap_google_admin(text, text, uuid) TO moneyverse_app;

-- 8. Explicitly grant superadmin and all roles to the current registered target accounts:
-- Discord: 889085646768078850 (user_id: 39fd17cf-8325-427d-a0c9-39688fa0a748)
-- Google: woldeog12@gmail.com (user_id: ec5cc004-bfe4-4d60-a3c1-d82f2fa1696d)
INSERT INTO public.user_roles(user_id, role)
SELECT u.id, r.role
FROM public.users u
CROSS JOIN (VALUES
  ('superadmin'::public.admin_role),
  ('operator'::public.admin_role),
  ('approver'::public.admin_role),
  ('server_operator'::public.admin_role)
) AS r(role)
WHERE u.id IN (
  '39fd17cf-8325-427d-a0c9-39688fa0a748'::uuid,
  'ec5cc004-bfe4-4d60-a3c1-d82f2fa1696d'::uuid
)
ON CONFLICT (user_id, role) DO NOTHING;

COMMIT;
