-- The single-superadmin model, part two: who the superadmin is, how the
-- designation moves, what happened to two-person approval, and what an
-- administrator's session is now that it is no longer an ordinary one.
--
-- 057 added the enum value and could not use it. Everything here uses it.
--
-- Three decisions worth stating, because each had an alternative that looks
-- reasonable until it is written out:
--
--  1. HOW A SUPERADMIN PASSES THE ROLE CHECKS ALREADY IN THE SCHEMA.
--     `game_catalog_operator`, `content_require_operator`,
--     `admin_set_user_restriction` and a dozen others each test `user_roles`
--     for a literal role. The alternative -- rewriting all fifteen here --
--     was rejected: every rewrite is a verbatim copy of a function whose body
--     belongs to another feature, and a copy freezes that body at today's
--     text, so the next change to stock or content administration silently
--     forks. Instead the designation MATERIALISES the legacy roles: granting
--     'superadmin' also inserts 'operator', 'approver' and 'server_operator',
--     and `admin_revoke_role` refuses to take one of those back while the
--     target is still the superadmin. `admin_role_holder` below is the
--     forward-looking primitive, and every function written from here on
--     uses it instead of a literal.
--
--  2. THE DESIGNATION MOVES; IT IS NEVER REMOVED. A partial unique index
--     allows exactly one superadmin row, which would make "revoke, then
--     grant" a deadlock: revoking the last superadmin leaves nobody who may
--     grant. So `admin_grant_role('superadmin')` transfers -- it deletes the
--     incumbent's row in the same transaction -- and `admin_revoke_role`
--     refuses the role outright.
--
--  3. APPROVAL FUNCTIONS ARE REPLACED, NOT DROPPED. `admin_create_approval_
--     request` and `admin_decide_approval_request` keep their signatures and
--     raise 55000. Dropping them would answer a not-yet-redeployed
--     application with 42883 "function does not exist", which reads as a
--     broken database rather than as a retired feature; 55000 is the code
--     this codebase already uses for "this is switched off".
--
-- No BEGIN/COMMIT: migrate.sh applies each file with `psql -f`, which
-- autocommits per statement, and every statement here is re-runnable.

CREATE TABLE IF NOT EXISTS public.admin_role_designations (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  actor_user_id uuid NOT NULL REFERENCES public.users(id),
  target_user_id uuid NOT NULL REFERENCES public.users(id),
  role public.admin_role NOT NULL,
  operation text NOT NULL CHECK (operation IN ('grant', 'revoke')),
  reason text NOT NULL,
  displaced_user_id uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_role_designations FROM PUBLIC, moneyverse_app;

-- One receipt table for every superadmin command that is not a role change:
-- forced logout here, feature switches and policy versions in 060. The
-- alternative -- a receipt table per command, which is what the game features
-- do -- was rejected because those tables carry domain columns (a trade's
-- price, a loan's principal) that a control-plane command does not have. All
-- these commands record is who ran what against which target and what came
-- back, so one table with a jsonb result is the honest shape.
CREATE TABLE IF NOT EXISTS public.admin_command_receipts (
  idempotency_key uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL REFERENCES public.users(id),
  command text NOT NULL CHECK (command ~ '^[a-z][a-z0-9_.:-]{2,119}$'),
  target_id uuid,
  reason text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_command_receipts FROM PUBLIC, moneyverse_app;

-- Exactly one superadmin. The indexed column is constant inside the
-- predicate, which is how PostgreSQL spells "at most one row matching this".
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_superadmin
  ON public.user_roles (role)
  WHERE role = 'superadmin'::public.admin_role;

-- `admin_action_policies` outlives the workflow it gated: 060 keeps the eight
-- economy action keys as the vocabulary of high-risk actions. What does not
-- outlive it is the column that said two people were needed, so the default
-- is dropped and every remaining row is corrected. The column itself stays --
-- `admin_approval_requests` rows written before today reference it, and this
-- schema does not rewrite history.
ALTER TABLE public.admin_action_policies
  ALTER COLUMN requires_two_person_approval SET DEFAULT false;
UPDATE public.admin_action_policies SET requires_two_person_approval = false
WHERE requires_two_person_approval;

ALTER TABLE public.admin_approval_requests
  ALTER COLUMN requires_two_person_approval SET DEFAULT false;

-- Administrator sessions are separated from member sessions here rather than
-- in a table of their own. A second table would mean a second token, a second
-- cookie and two places that can disagree about whether a session is live;
-- these four columns say when the administrator surface was entered on this
-- session, when it was last used, when it was given up, and which session it
-- rotated away from.
ALTER TABLE public.auth_sessions
  ADD COLUMN IF NOT EXISTS admin_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_rotated_from uuid REFERENCES public.auth_sessions(id);

-- Whether the actor may act in a given role.
--
-- The active-account check is included, unlike `game_catalog_operator` (038),
-- which omits it and therefore admits a restricted or deleted operator. Every
-- new authority question goes through here so that stays fixed in one place.
CREATE OR REPLACE FUNCTION public.admin_role_holder(
  p_actor uuid,
  p_role public.admin_role
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_actor
      AND user_row.status = 'active'::public.user_status
      AND role_row.role IN (p_role, 'superadmin'::public.admin_role)
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_require_superadmin(p_actor uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL
    OR NOT public.admin_role_holder(p_actor, 'superadmin'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'superadmin role required';
  END IF;
END;
$$;

-- Every command in this stack takes a reason and records it. An empty or
-- one-word reason is refused, because the audit trail is now the only account
-- of why an administrator did anything and "fix" is not one.
--
-- Ten characters, not the 3 `user_restrictions` (026) settled on: that floor
-- admits "abc" and was written while two people still had to agree. The older
-- CHECK is left alone -- tightening it would reject rows already stored.
CREATE OR REPLACE FUNCTION public.admin_normalized_reason(p_reason text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text := pg_catalog.btrim(coalesce(p_reason, ''));
BEGIN
  IF pg_catalog.char_length(v_reason) < 10 OR pg_catalog.char_length(v_reason) > 1000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a reason of 10 to 1000 characters is required';
  END IF;
  RETURN v_reason;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_approval_request(
  p_requester_id uuid,
  p_action text,
  p_payload jsonb,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'two-person approval was retired; the superadmin acts alone';
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_decide_approval_request(
  p_approver_id uuid,
  p_approval_request_id uuid,
  p_decision text,
  p_reason text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(approval_request_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'two-person approval was retired; the superadmin acts alone';
END;
$$;

-- Granting a role at run time.
--
-- Until today the only way to become an administrator was to have a Discord
-- id listed in `bootstrap_discord_operators` -- a table the application can
-- neither read nor write -- and then link that identity, which fired a
-- trigger. That is a deployment step, not an operation, and it cannot take
-- anything back.
--
-- Idempotency follows 045: validate, take the advisory lock keyed on the
-- caller's key, replay, check the replayed receipt belongs to the caller
-- (28000), then act.
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
  v_displaced uuid;
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

  -- The bootstrap. With no superadmin designated yet nobody can hold the role
  -- that grants it, so the accounts the deployment already trusts -- the
  -- bootstrap Discord administrators, who hold all three legacy roles -- may
  -- designate the first one, and only that. Every later change needs the
  -- superadmin.
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
    -- Transfer, not a second designation: the partial unique index allows one
    -- row, and revoking the incumbent first would leave nobody able to grant.
    DELETE FROM public.user_roles AS role_row
    WHERE role_row.role = 'superadmin'::public.admin_role
      AND role_row.user_id <> p_target
    RETURNING role_row.user_id INTO v_displaced;

    -- The legacy roles the existing inline checks test for. See the header:
    -- materialising them is what lets a superadmin act on the stock, content
    -- and moderation surfaces without forking their functions.
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
      'displacedUserId', v_displaced::text
    )
  );

  RETURN QUERY SELECT v_designation, v_role::text, v_displaced;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_role(
  p_key uuid,
  p_actor uuid,
  p_target uuid,
  p_role text,
  p_reason text
)
RETURNS TABLE(designation_id uuid, revoked_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_role public.admin_role;
  v_reason text;
  v_existing public.admin_role_designations%ROWTYPE;
  v_designation uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid role revocation';
  END IF;
  IF pg_catalog.lower(pg_catalog.btrim(coalesce(p_role, '')))
    NOT IN ('operator', 'approver', 'server_operator') THEN
    -- 'superadmin' is deliberately absent. The designation moves by being
    -- granted to somebody else; there is no state with nobody holding it.
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'only operator, approver and server_operator can be revoked';
  END IF;
  v_role := pg_catalog.lower(pg_catalog.btrim(p_role))::public.admin_role;
  v_reason := public.admin_normalized_reason(p_reason);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_revoke_role:' || p_key::text, 0)
  );

  SELECT designation_row.* INTO v_existing
  FROM public.admin_role_designations AS designation_row
  WHERE designation_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'role designation receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.role::text;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  -- Stripping a legacy role from the superadmin would take away exactly the
  -- authority the materialisation in admin_grant_role put there.
  IF EXISTS (
    SELECT 1 FROM public.user_roles AS role_row
    WHERE role_row.user_id = p_target AND role_row.role = 'superadmin'::public.admin_role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the superadmin keeps every role; transfer the designation instead';
  END IF;

  DELETE FROM public.user_roles AS role_row
  WHERE role_row.user_id = p_target AND role_row.role = v_role;

  INSERT INTO public.admin_role_designations (
    idempotency_key, actor_user_id, target_user_id, role, operation, reason
  ) VALUES (p_key, p_actor, p_target, v_role, 'revoke', v_reason)
  RETURNING id INTO v_designation;

  PERFORM public.admin_append_audit_event(
    p_actor,
    'admin.role.revoked',
    p_target,
    p_key,
    pg_catalog.jsonb_build_object('role', v_role::text, 'reason', v_reason)
  );

  RETURN QUERY SELECT v_designation, v_role::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_roles(p_actor uuid)
RETURNS TABLE(user_id uuid, display_name text, role text, granted_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.admin_require_superadmin(p_actor);

  RETURN QUERY
  SELECT role_row.user_id,
         coalesce(
           (SELECT identity_row.display_name
            FROM public.identities AS identity_row
            WHERE identity_row.user_id = role_row.user_id
            ORDER BY identity_row.linked_at
            LIMIT 1),
           '사용자'
         ),
         role_row.role::text,
         role_row.granted_at
  FROM public.user_roles AS role_row
  ORDER BY role_row.user_id, role_row.role;
END;
$$;

-- An administrator session is a rotated session, not a flag on the member's.
--
-- Rotation is the point: the token that reaches the console is not the token
-- that was sitting in the browser beforehand, so a session token captured
-- earlier cannot be replayed into it. The caller supplies the new hashes
-- exactly as login does; this function never sees a token in the clear.
--
-- 30 minutes against the member session's 8 hours, and 10 idle minutes inside
-- that. Both are fixed here rather than passed in: an expiry the caller
-- chooses is an expiry an attacker chooses.
--
-- 059 replaces this function to also require a confirmed second factor. It
-- cannot be written that way here, because the table holding the factor does
-- not exist until the next migration and plpgsql resolves the reference when
-- the function runs, not when it is created -- so a forward reference would
-- compile and then fail in production.
CREATE OR REPLACE FUNCTION public.admin_session_open(
  p_session_id uuid,
  p_actor uuid,
  p_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(session_id uuid, expires_at timestamptz, idle_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_current public.auth_sessions%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_new uuid;
BEGIN
  IF p_session_id IS NULL OR p_actor IS NULL
    OR coalesce(pg_catalog.char_length(p_token_hash), 0) < 32
    OR coalesce(pg_catalog.char_length(p_csrf_hash), 0) < 32 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid admin session request';
  END IF;

  SELECT session_row.* INTO v_current
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_session_id
    AND session_row.user_id = p_actor
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > v_now
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a live session for this actor is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  -- Entering the console is itself a step-up, at 300 seconds rather than the
  -- 900 the member surface allows, because this one hands over every control
  -- at once.
  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 300) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  INSERT INTO public.auth_sessions (
    id, token_hash, csrf_hash, user_id, expires_at, created_at,
    prelogin_consent_version_id, prelogin_age_confirmed, prelogin_consented_at,
    reauthenticated_at, admin_opened_at, admin_last_seen_at, admin_rotated_from
  ) VALUES (
    pg_catalog.gen_random_uuid(), p_token_hash, p_csrf_hash, p_actor,
    v_now + pg_catalog.make_interval(mins => 30), v_now,
    v_current.prelogin_consent_version_id, v_current.prelogin_age_confirmed,
    v_current.prelogin_consented_at, v_current.reauthenticated_at, v_now, v_now, p_session_id
  )
  RETURNING id INTO v_new;

  UPDATE public.auth_sessions AS session_row
  SET revoked_at = v_now, admin_closed_at = v_now
  WHERE session_row.id = p_session_id;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.session.opened', v_new, NULL,
    pg_catalog.jsonb_build_object('rotatedFrom', p_session_id::text)
  );

  RETURN QUERY SELECT v_new,
                      v_now + pg_catalog.make_interval(mins => 30),
                      v_now + pg_catalog.make_interval(mins => 10);
END;
$$;

-- Called on every administrator request. It answers with a state rather than
-- raising, because "your console session went idle" is something the surface
-- has to be able to say differently from "you are not an administrator".
CREATE OR REPLACE FUNCTION public.admin_session_touch(
  p_session_id uuid,
  p_actor uuid
)
RETURNS TABLE(state text, expires_at timestamptz, idle_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_session public.auth_sessions%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_session_id IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'session and actor are required';
  END IF;

  SELECT session_row.* INTO v_session
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_session_id AND session_row.user_id = p_actor
  FOR UPDATE;

  IF NOT FOUND OR v_session.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT 'closed'::text, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  IF v_session.admin_opened_at IS NULL OR v_session.admin_closed_at IS NOT NULL THEN
    RETURN QUERY SELECT 'none'::text, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  IF v_session.expires_at <= v_now THEN
    RETURN QUERY SELECT 'expired'::text, v_session.expires_at, NULL::timestamptz;
    RETURN;
  END IF;

  IF v_session.admin_last_seen_at + pg_catalog.make_interval(mins => 10) <= v_now THEN
    RETURN QUERY SELECT 'idle_locked'::text, v_session.expires_at,
                        v_session.admin_last_seen_at + pg_catalog.make_interval(mins => 10);
    RETURN;
  END IF;

  UPDATE public.auth_sessions AS session_row
  SET admin_last_seen_at = v_now
  WHERE session_row.id = p_session_id;

  RETURN QUERY SELECT 'open'::text, v_session.expires_at,
                      v_now + pg_catalog.make_interval(mins => 10);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_session_close(
  p_session_id uuid,
  p_actor uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  UPDATE public.auth_sessions AS session_row
  SET admin_closed_at = v_now,
      revoked_at = coalesce(session_row.revoked_at, v_now)
  WHERE session_row.id = p_session_id
    AND session_row.user_id = p_actor
    AND session_row.admin_opened_at IS NOT NULL
    AND session_row.admin_closed_at IS NULL;
  RETURN FOUND;
END;
$$;

-- Remote forced logout. Revokes every live session a member holds, from
-- somewhere else, which is the only remedy available while an account is
-- being used by somebody who should not have it.
CREATE OR REPLACE FUNCTION public.admin_force_logout(
  p_key uuid,
  p_actor uuid,
  p_target uuid,
  p_reason text
)
RETURNS TABLE(revoked_sessions integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_revoked integer := 0;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid forced logout';
  END IF;
  v_reason := public.admin_normalized_reason(p_reason);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_force_logout:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT (v_existing.result ->> 'revokedSessions')::integer;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  WITH revoked AS (
    UPDATE public.auth_sessions AS session_row
    SET revoked_at = v_now,
        admin_closed_at = CASE
          WHEN session_row.admin_opened_at IS NULL THEN session_row.admin_closed_at
          ELSE coalesce(session_row.admin_closed_at, v_now)
        END
    WHERE session_row.user_id = p_target
      AND session_row.revoked_at IS NULL
      AND session_row.expires_at > v_now
    RETURNING session_row.id
  )
  SELECT pg_catalog.count(*)::integer INTO v_revoked FROM revoked;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'admin.session.force_logout', p_target, v_reason,
    pg_catalog.jsonb_build_object('revokedSessions', v_revoked)
  );

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.session.force_logout', p_target, p_key,
    pg_catalog.jsonb_build_object('reason', v_reason, 'revokedSessions', v_revoked)
  );

  RETURN QUERY SELECT v_revoked;
END;
$$;

ALTER FUNCTION public.admin_role_holder(uuid, public.admin_role) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_require_superadmin(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_normalized_reason(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_create_approval_request(uuid, text, jsonb, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_decide_approval_request(uuid, uuid, text, text, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_grant_role(uuid, uuid, uuid, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_revoke_role(uuid, uuid, uuid, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_roles(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_session_open(uuid, uuid, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_session_touch(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_session_close(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_force_logout(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_role_holder(uuid, public.admin_role) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_require_superadmin(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_normalized_reason(text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_create_approval_request(uuid, text, jsonb, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_decide_approval_request(uuid, uuid, text, text, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_grant_role(uuid, uuid, uuid, text, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_revoke_role(uuid, uuid, uuid, text, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_roles(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_open(uuid, uuid, text, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_touch(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_close(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_force_logout(uuid, uuid, uuid, text) FROM PUBLIC, moneyverse_app;

-- `admin_role_holder`, `admin_require_superadmin` and `admin_normalized_reason`
-- stay internal, like `game_catalog_operator` and `admin_append_audit_event`:
-- they are the primitives other definers call, and an application able to ask
-- "is this user a superadmin" directly is an application able to answer that
-- question in place of the function that should be deciding it.
--
-- The two retired approval functions keep their grants. They exist to answer
-- 55000 to a caller that has not been redeployed yet; taking the grant away
-- would answer 42501 instead, which reads as a broken deployment.
GRANT EXECUTE ON FUNCTION public.admin_create_approval_request(uuid, text, jsonb, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_decide_approval_request(uuid, uuid, text, text, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_grant_role(uuid, uuid, uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_revoke_role(uuid, uuid, uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_roles(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_open(uuid, uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_touch(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_close(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_force_logout(uuid, uuid, uuid, text) TO moneyverse_app;
