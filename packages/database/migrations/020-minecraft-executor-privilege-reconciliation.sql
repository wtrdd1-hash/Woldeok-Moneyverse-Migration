-- Reconcile the effective privileges of the NOLOGIN Minecraft executor group
-- after 017. PostgreSQL's PUBLIC role can otherwise make extension functions
-- (and a legacy daily-reward overload on an upgraded database) callable even
-- when the group itself has no explicit grant. This migration is intentionally
-- narrow: it changes only effective PUBLIC/group execution paths visible to
-- the executor and reasserts the four Minecraft function boundaries.
BEGIN;

DO $do$
DECLARE
  executor_oid oid;
BEGIN
  SELECT oid
  INTO executor_oid
  FROM pg_catalog.pg_roles
  WHERE rolname = 'moneyverse_minecraft_executor';

  IF executor_oid IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'minecraft executor role from migration 017 is required';
  END IF;

  -- The group role must never itself be a member of another role: a worker
  -- login can SET LOCAL ROLE to this group, and an inherited parent could
  -- otherwise create an unreviewed privilege path.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_auth_members AS membership
    WHERE membership.member = executor_oid
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'minecraft executor group must not be a member of another role';
  END IF;

  -- Membership *in* the group is expected for a separately provisioned,
  -- unprivileged LOGIN worker. Reject protected or otherwise privileged
  -- members that would turn an app/migrator/reconciler credential into a host
  -- operation executor.
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_auth_members AS membership
    JOIN pg_catalog.pg_roles AS member_role ON member_role.oid = membership.member
    WHERE membership.roleid = executor_oid
      AND (
        member_role.rolname IN (
          'moneyverse_app',
          'moneyverse_migrator',
          'moneyverse_reconciler'
        )
        OR member_role.rolsuper
        OR member_role.rolcreatedb
        OR member_role.rolcreaterole
        OR member_role.rolreplication
        OR member_role.rolbypassrls
      )
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'minecraft executor group has an unsafe member role';
  END IF;
END;
$do$;

-- The historical pre-hardening daily-reward overload can exist only on an
-- upgraded database. It is never an approved app/executor API, so remove all
-- grants when present without making a fresh schema migration fail.
DO $do$
BEGIN
  IF pg_catalog.to_regprocedure(
    'public.economy_claim_daily(uuid,uuid,date,bigint)'
  ) IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON FUNCTION public.economy_claim_daily(uuid, uuid, date, bigint)
      FROM PUBLIC, moneyverse_app, moneyverse_reconciler, moneyverse_minecraft_executor;
  END IF;
END;
$do$;

-- First remove every direct function grant from the executor group. This does
-- not alter PUBLIC grants, so the following dynamic loop removes only the
-- PUBLIC paths that are demonstrably effective for this exact group.
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public
  FROM moneyverse_minecraft_executor;

REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_request_approved_operation(uuid, text, uuid)
  FROM PUBLIC, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_get_my_approved_operation(uuid, uuid)
  FROM PUBLIC, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_claim_next_approved_operation(uuid, integer)
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb)
  FROM PUBLIC, moneyverse_app, moneyverse_minecraft_executor;

DO $do$
DECLARE
  function_oid oid;
BEGIN
  FOR function_oid IN
    SELECT procedure_row.oid
    FROM pg_catalog.pg_proc AS procedure_row
    JOIN pg_catalog.pg_namespace AS namespace_row
      ON namespace_row.oid = procedure_row.pronamespace
    WHERE namespace_row.nspname = 'public'
      AND procedure_row.oid NOT IN (
        'public.minecraft_claim_next_approved_operation(uuid,integer)'::pg_catalog.regprocedure,
        'public.minecraft_complete_approved_operation(uuid,uuid,text,text,jsonb)'::pg_catalog.regprocedure
      )
      AND pg_catalog.has_function_privilege(
        'moneyverse_minecraft_executor',
        procedure_row.oid,
        'EXECUTE'
      )
  LOOP
    -- OID::regprocedure is database-produced syntax, never caller input.
    EXECUTE pg_catalog.format(
      'REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC',
      function_oid::pg_catalog.regprocedure
    );
  END LOOP;
END;
$do$;

-- Restore only the reviewed fixed operation boundary. Direct grants for
-- moneyverse_app and moneyverse_reconciler established by earlier migrations
-- remain untouched by the PUBLIC reconciliation above.
-- SECURITY DEFINER routines owned by the migrator use these pgcrypto helpers
-- internally (hashes and UUID defaults). Keep that owner capability explicit
-- rather than retaining a PUBLIC grant that would also reach the executor.
GRANT EXECUTE ON FUNCTION public.digest(bytea, text)
  TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.digest(text, text)
  TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.gen_random_uuid()
  TO moneyverse_migrator;
GRANT USAGE ON SCHEMA public TO moneyverse_minecraft_executor;
GRANT EXECUTE ON FUNCTION public.minecraft_claim_next_approved_operation(uuid, integer)
  TO moneyverse_minecraft_executor;
GRANT EXECUTE ON FUNCTION public.minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb)
  TO moneyverse_minecraft_executor;

DO $do$
DECLARE
  unexpected_function_count integer;
  required_app_function regprocedure;
BEGIN
  SELECT pg_catalog.count(*)
  INTO unexpected_function_count
  FROM pg_catalog.pg_proc AS procedure_row
  JOIN pg_catalog.pg_namespace AS namespace_row
    ON namespace_row.oid = procedure_row.pronamespace
  WHERE namespace_row.nspname = 'public'
    AND procedure_row.oid NOT IN (
      'public.minecraft_claim_next_approved_operation(uuid,integer)'::pg_catalog.regprocedure,
      'public.minecraft_complete_approved_operation(uuid,uuid,text,text,jsonb)'::pg_catalog.regprocedure
    )
    AND pg_catalog.has_function_privilege(
      'moneyverse_minecraft_executor',
      procedure_row.oid,
      'EXECUTE'
    );

  IF unexpected_function_count <> 0
    OR NOT pg_catalog.has_function_privilege(
      'moneyverse_minecraft_executor',
      'public.minecraft_claim_next_approved_operation(uuid,integer)'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'moneyverse_minecraft_executor',
      'public.minecraft_complete_approved_operation(uuid,uuid,text,text,jsonb)'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR pg_catalog.has_function_privilege(
      'moneyverse_app',
      'public.minecraft_claim_next_approved_operation(uuid,integer)'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR pg_catalog.has_function_privilege(
      'moneyverse_app',
      'public.minecraft_complete_approved_operation(uuid,uuid,text,text,jsonb)'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'moneyverse_app',
      'public.minecraft_request_approved_operation(uuid,text,uuid)'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'moneyverse_app',
      'public.minecraft_get_my_approved_operation(uuid,uuid)'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'moneyverse_reconciler',
      'public.economy_record_reconciliation_snapshot()'::pg_catalog.regprocedure,
      'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'moneyverse_app',
      'public.admin_latest_economy_reconciliation_health(uuid)'::pg_catalog.regprocedure,
      'EXECUTE'
    ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'minecraft executor privilege reconciliation did not reach the expected boundary';
  END IF;

  -- The web process must retain only its explicit, reviewed DB APIs after the
  -- PUBLIC cleanup. If an older schema was relying on an implicit PUBLIC grant,
  -- fail the whole migration instead of silently breaking that feature.
  FOR required_app_function IN
    SELECT unnest(ARRAY[
      'public.auth_complete_oauth_login(uuid,public.identity_provider,text,text,text,text)'::pg_catalog.regprocedure,
      'public.auth_session_has_current_consent(uuid)'::pg_catalog.regprocedure,
      'public.discord_user_for_subject(text)'::pg_catalog.regprocedure,
      'public.wallet_active_recipient_by_id(uuid)'::pg_catalog.regprocedure,
      'public.account_list_my_identities(uuid)'::pg_catalog.regprocedure,
      'public.account_link_oauth_identity(uuid,public.identity_provider,text,text)'::pg_catalog.regprocedure,
      'public.account_unlink_identity(uuid,uuid)'::pg_catalog.regprocedure,
      'public.account_soft_delete(uuid)'::pg_catalog.regprocedure,
      'public.economy_transfer(uuid,uuid,uuid,bigint)'::pg_catalog.regprocedure,
      'public.economy_claim_daily(uuid,uuid,date)'::pg_catalog.regprocedure,
      'public.admin_current_roles(uuid)'::pg_catalog.regprocedure,
      'public.admin_record_audit_event(uuid,text,uuid,uuid,jsonb)'::pg_catalog.regprocedure,
      'public.admin_create_approval_request(uuid,text,jsonb,uuid,uuid)'::pg_catalog.regprocedure,
      'public.admin_decide_approval_request(uuid,uuid,text,text,uuid)'::pg_catalog.regprocedure,
      'public.admin_list_approval_requests(uuid,integer)'::pg_catalog.regprocedure,
      'public.admin_recent_audit_events(uuid,integer)'::pg_catalog.regprocedure,
      'public.shop_list_active_items(integer)'::pg_catalog.regprocedure,
      'public.shop_list_my_purchases(uuid,integer)'::pg_catalog.regprocedure,
      'public.shop_purchase(uuid,uuid,uuid)'::pg_catalog.regprocedure,
      'public.content_list_published_announcements(integer)'::pg_catalog.regprocedure,
      'public.content_list_published_photos(integer)'::pg_catalog.regprocedure,
      'public.content_public_status()'::pg_catalog.regprocedure,
      'public.content_save_announcement(uuid,uuid,text,text,uuid,uuid)'::pg_catalog.regprocedure,
      'public.content_set_announcement_publication(uuid,uuid,boolean,uuid,uuid)'::pg_catalog.regprocedure,
      'public.content_save_photo(uuid,uuid,text,text,text,uuid,uuid)'::pg_catalog.regprocedure,
      'public.content_set_photo_publication(uuid,uuid,boolean,uuid,uuid)'::pg_catalog.regprocedure,
      'public.minecraft_request_approved_operation(uuid,text,uuid)'::pg_catalog.regprocedure,
      'public.minecraft_get_my_approved_operation(uuid,uuid)'::pg_catalog.regprocedure,
      'public.privacy_create_my_request(uuid,text,text,uuid)'::pg_catalog.regprocedure,
      'public.privacy_list_my_requests(uuid,integer)'::pg_catalog.regprocedure,
      'public.admin_latest_economy_reconciliation_health(uuid)'::pg_catalog.regprocedure
    ])
  LOOP
    IF NOT pg_catalog.has_function_privilege(
      'moneyverse_app',
      required_app_function,
      'EXECUTE'
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '42501',
        MESSAGE = 'a required web application function lacks an explicit execute grant';
    END IF;
  END LOOP;
END;
$do$;

COMMIT;
