-- The host-local executor uses a dedicated LOGIN principal provisioned by an
-- operator, then assumes this NOLOGIN group role for each fixed DB function
-- call. Never put a password or a LOGIN role in a migration. This migration
-- fails closed instead of weakening a pre-existing role with the same name.
BEGIN;

DO $do$
DECLARE
  role_row pg_catalog.pg_roles%ROWTYPE;
BEGIN
  SELECT *
  INTO role_row
  FROM pg_catalog.pg_roles
  WHERE rolname = 'moneyverse_minecraft_executor';

  IF NOT FOUND THEN
    CREATE ROLE moneyverse_minecraft_executor
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  ELSIF role_row.rolcanlogin
    OR role_row.rolsuper
    OR role_row.rolcreatedb
    OR role_row.rolcreaterole
    OR role_row.rolinherit
    OR role_row.rolreplication
    OR role_row.rolbypassrls THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'existing moneyverse_minecraft_executor role has unsafe attributes';
  END IF;
END;
$do$;

COMMENT ON ROLE moneyverse_minecraft_executor IS
  'NOLOGIN group role for the host-local approved Minecraft executor; fixed claim/complete functions only';

-- Repeat the operation-table boundary here so this new role cannot inherit a
-- future accidental direct grant. Neither the web app nor the executor gets
-- raw operation/event table access.
REVOKE ALL PRIVILEGES ON TABLE public.minecraft_approved_operations,
  public.minecraft_approved_operation_events
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public
  FROM moneyverse_minecraft_executor;

-- Explicitly re-state the entire Minecraft function boundary. PUBLIC and the
-- executor cannot request/read operations; moneyverse_app cannot claim or
-- complete them. Only the two audited executor queue functions are granted.
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_request_approved_operation(uuid, text, uuid)
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_get_my_approved_operation(uuid, uuid)
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_claim_next_approved_operation(uuid, integer)
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb)
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;

GRANT EXECUTE ON FUNCTION public.minecraft_request_approved_operation(uuid, text, uuid)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.minecraft_get_my_approved_operation(uuid, uuid)
  TO moneyverse_app;

-- Schema USAGE is required to resolve the two explicitly granted functions;
-- it does not grant table access or an ability to create objects.
GRANT USAGE ON SCHEMA public TO moneyverse_minecraft_executor;
GRANT EXECUTE ON FUNCTION public.minecraft_claim_next_approved_operation(uuid, integer)
  TO moneyverse_minecraft_executor;
GRANT EXECUTE ON FUNCTION public.minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb)
  TO moneyverse_minecraft_executor;

COMMIT;
