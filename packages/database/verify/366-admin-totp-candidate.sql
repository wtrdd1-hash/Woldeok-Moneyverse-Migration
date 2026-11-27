-- Synthetic verification for 366-admin-totp-candidate.sql. Run as the migrator against a
-- disposable database; everything happens in one transaction that is rolled back.
-- Each check raises (and stops the script under ON_ERROR_STOP) when the behaviour is wrong.
\set ON_ERROR_STOP 1
BEGIN;

-- Fixture: a superadmin (a), an operator (b), a member (m); sessions re-authenticated now.
DO $$
DECLARE a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); m uuid := gen_random_uuid();
  sa1 uuid := gen_random_uuid(); sa2 uuid := gen_random_uuid(); sb uuid := gen_random_uuid(); sm uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.users(id) VALUES (a),(b),(m);
  INSERT INTO public.user_roles(user_id, role) VALUES (a,'superadmin'),(b,'operator');
  INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at, reauthenticated_at)
  SELECT s, encode(gen_random_bytes(32),'hex'), encode(gen_random_bytes(32),'hex'), u, now() + interval '1 hour', now()
  FROM (VALUES (sa1,a),(sa2,a),(sb,b),(sm,m)) AS v(s,u);
  PERFORM set_config('t.a', a::text, true); PERFORM set_config('t.b', b::text, true); PERFORM set_config('t.m', m::text, true);
  PERFORM set_config('t.sa1', sa1::text, true); PERFORM set_config('t.sa2', sa2::text, true);
  PERFORM set_config('t.sb', sb::text, true); PERFORM set_config('t.sm', sm::text, true);
  PERFORM set_config('t.now', floor(extract(epoch FROM clock_timestamp()) / 30)::bigint::text, true);
END $$;

SET LOCAL ROLE moneyverse_app;

-- The application role holds no privilege on the new tables.
DO $$ DECLARE t text; p text; BEGIN
  FOREACH t IN ARRAY ARRAY['public.admin_totp_credentials','public.admin_totp_proofs','public.admin_totp_attempts'] LOOP
    FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
      IF has_table_privilege('moneyverse_app', t, p) THEN RAISE EXCEPTION 'app holds % on %', p, t; END IF;
    END LOOP;
  END LOOP;
END $$;

-- Not enrolled, switch disabled: nothing is required.
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.a')::uuid);
  IF r.enrolled OR r.enforced THEN RAISE EXCEPTION 'requirement before enrolment: %', r; END IF;
END $$;

-- A member cannot enrol.
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.m')::uuid, current_setting('t.sm')::uuid, repeat('A',44), 'test-k1');
  RAISE EXCEPTION 'member enrolled';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;

-- Another actor's session cannot be used to enrol.
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sb')::uuid, repeat('A',44), 'test-k1');
  RAISE EXCEPTION 'enrolled through another session';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;

-- Enrol and confirm a.
DO $$ BEGIN
  IF public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, repeat('A',44), 'test-k1') THEN
    RAISE EXCEPTION 'first enrolment reported a replacement'; END IF;
  -- Not confirmed yet: verification refuses.
  BEGIN
    PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint);
    RAISE EXCEPTION 'unconfirmed credential verified';
  EXCEPTION WHEN sqlstate '55000' THEN NULL; END;
  -- A step far from now is refused.
  BEGIN
    PERFORM public.admin_totp_confirm_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, current_setting('t.now')::bigint - 3);
    RAISE EXCEPTION 'stale confirmation accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  IF NOT public.admin_totp_confirm_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, current_setting('t.now')::bigint - 1) THEN
    RAISE EXCEPTION 'confirmation failed'; END IF;
END $$;

DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.a')::uuid);
  IF NOT (r.enrolled AND r.enforced) THEN RAISE EXCEPTION 'requirement after enrolment: %', r; END IF;
  SELECT * INTO r FROM public.admin_totp_sealed_secret(current_setting('t.a')::uuid);
  IF r.secret_ciphertext <> repeat('A',44) OR r.key_id <> 'test-k1' OR NOT r.confirmed THEN RAISE EXCEPTION 'sealed secret row: %', r; END IF;
END $$;

-- The confirmation step is spent: verifying with it again is a replay.
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint - 1);
  RAISE EXCEPTION 'replayed step accepted';
EXCEPTION WHEN sqlstate '23505' THEN NULL; END $$;

-- An unknown scope is refused.
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'everything', current_setting('t.now')::bigint);
  RAISE EXCEPTION 'unknown scope accepted';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;

-- Verify for economy.treasury in sa1: proof is bound to actor, session and scope.
DO $$ DECLARE v_expires timestamptz; BEGIN
  v_expires := public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint);
  IF v_expires < clock_timestamp() + interval '290 seconds' OR v_expires > clock_timestamp() + interval '301 seconds' THEN
    RAISE EXCEPTION 'proof lifetime %', v_expires - clock_timestamp(); END IF;
  IF NOT public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury') THEN RAISE EXCEPTION 'own proof invalid'; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'economy.treasury') THEN RAISE EXCEPTION 'cross-session proof valid'; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'backup.restore') THEN RAISE EXCEPTION 'cross-scope proof valid'; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.b')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury') THEN RAISE EXCEPTION 'cross-actor proof valid'; END IF;
END $$;

-- An earlier step after a later one is a replay too (monotonic).
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'backup.restore', current_setting('t.now')::bigint);
  RAISE EXCEPTION 'same step in another session accepted';
EXCEPTION WHEN sqlstate '23505' THEN NULL; END $$;

-- Verifying through someone else's session is refused.
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sb')::uuid, 'backup.restore', current_setting('t.now')::bigint + 1);
  RAISE EXCEPTION 'verified through another actor session';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;

-- Replacing a confirmed credential needs a totp.manage proof in this session.
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, repeat('B',44), 'test-k1');
  RAISE EXCEPTION 'confirmed credential replaced without proof';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;

-- Revoking the session (logout) invalidates its proof.
RESET ROLE;
UPDATE public.auth_sessions SET revoked_at = now() WHERE id = current_setting('t.sa1')::uuid;
SET LOCAL ROLE moneyverse_app;
DO $$ BEGIN
  IF public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury') THEN RAISE EXCEPTION 'proof survived logout'; END IF;
END $$;

-- Five failures lock the factor; a correct step is then refused while locked.
DO $$ DECLARE r record; i int; BEGIN
  FOR i IN 1..5 LOOP
    SELECT * INTO r FROM public.admin_totp_record_failure(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid);
  END LOOP;
  IF r.failed_attempts <> 5 OR r.locked_until IS NULL OR r.locked_until < clock_timestamp() + interval '14 minutes' THEN RAISE EXCEPTION 'lock state %', r; END IF;
  BEGIN
    PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'backup.restore', current_setting('t.now')::bigint + 1);
    RAISE EXCEPTION 'locked factor verified';
  EXCEPTION WHEN sqlstate '55000' THEN NULL; END;
END $$;

-- Per-session ceiling: 20 attempts in 15 minutes, then refused.
DO $$ DECLARE i int; BEGIN
  FOR i IN 6..20 LOOP PERFORM public.admin_totp_record_failure(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid); END LOOP;
  BEGIN
    PERFORM public.admin_totp_record_failure(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid);
    RAISE EXCEPTION 'ceiling not enforced';
  EXCEPTION WHEN sqlstate '55000' THEN NULL; END;
END $$;

-- An operator cannot revoke another administrator; a superadmin can (with recent step-up).
DO $$ BEGIN
  PERFORM public.admin_totp_revoke(current_setting('t.b')::uuid, current_setting('t.sb')::uuid, current_setting('t.a')::uuid);
  RAISE EXCEPTION 'operator revoked another administrator';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;

RESET ROLE;
-- Enrol b (as the application would) so a can revoke it.
SET LOCAL ROLE moneyverse_app;
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.b')::uuid, current_setting('t.sb')::uuid, repeat('C',44), 'test-k1');
  PERFORM public.admin_totp_confirm_enrolment(current_setting('t.b')::uuid, current_setting('t.sb')::uuid, current_setting('t.now')::bigint);
END $$;
-- a is enrolled, so revoking b needs a's own security.settings proof... a is locked: refused.
DO $$ BEGIN
  PERFORM public.admin_totp_revoke(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, current_setting('t.b')::uuid);
  RAISE EXCEPTION 'enrolled superadmin revoked without own proof';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;
RESET ROLE;
-- Clear a's credential directly (fixture only) so a acts as a non-enrolled superadmin.
DELETE FROM public.admin_totp_credentials WHERE user_id = current_setting('t.a')::uuid;
SET LOCAL ROLE moneyverse_app;
DO $$ DECLARE r record; BEGIN
  IF NOT public.admin_totp_revoke(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, current_setting('t.b')::uuid) THEN RAISE EXCEPTION 'revoke failed'; END IF;
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.b')::uuid);
  IF r.enrolled THEN RAISE EXCEPTION 'revoked credential still enrolled'; END IF;
END $$;

-- The switch makes every administrator enforced; it is seeded disabled.
RESET ROLE;
DO $$ BEGIN
  IF public.feature_switch_state('admin_totp_required') <> 'disabled' THEN RAISE EXCEPTION 'switch not seeded disabled'; END IF;
END $$;
UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'admin_totp_required';
SET LOCAL ROLE moneyverse_app;
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.b')::uuid);
  IF r.enrolled OR NOT r.enforced THEN RAISE EXCEPTION 'switch did not enforce: %', r; END IF;
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.m')::uuid);
  IF r.enforced THEN RAISE EXCEPTION 'member enforced: %', r; END IF;
END $$;

-- Audit rows were written for the factor's events.
RESET ROLE;
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM public.audit_logs WHERE action LIKE 'admin.second_factor.%'
    AND actor_user_id IN (current_setting('t.a')::uuid, current_setting('t.b')::uuid);
  IF n < 6 THEN RAISE EXCEPTION 'expected audit rows, found %', n; END IF;
END $$;

SELECT 'ALL 366 CHECKS PASSED' AS result;
ROLLBACK;
