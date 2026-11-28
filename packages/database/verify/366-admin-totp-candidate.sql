-- Synthetic verification for 366-admin-totp-candidate.sql. Run as the migrator against a
-- disposable database; everything happens in one transaction that is rolled back.
-- Each check raises (and stops the script under ON_ERROR_STOP) when the behaviour is wrong.
\set ON_ERROR_STOP 1
BEGIN;

-- Fixture: a superadmin (a), an operator (b), a second superadmin (c), a member (m).
DO $$
DECLARE a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); m uuid := gen_random_uuid();
  sa1 uuid := gen_random_uuid(); sa2 uuid := gen_random_uuid(); sb uuid := gen_random_uuid();
  sc uuid := gen_random_uuid(); sm uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.users(id) VALUES (a),(b),(c),(m);
  INSERT INTO public.user_roles(user_id, role) VALUES (a,'superadmin'),(b,'operator'),(c,'superadmin');
  INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at, reauthenticated_at)
  SELECT s, encode(gen_random_bytes(32),'hex'), encode(gen_random_bytes(32),'hex'), u, now() + interval '1 hour', now()
  FROM (VALUES (sa1,a),(sa2,a),(sb,b),(sc,c),(sm,m)) AS v(s,u);
  PERFORM set_config('t.a', a::text, true); PERFORM set_config('t.b', b::text, true);
  PERFORM set_config('t.c', c::text, true); PERFORM set_config('t.m', m::text, true);
  PERFORM set_config('t.sa1', sa1::text, true); PERFORM set_config('t.sa2', sa2::text, true);
  PERFORM set_config('t.sb', sb::text, true); PERFORM set_config('t.sc', sc::text, true); PERFORM set_config('t.sm', sm::text, true);
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

-- A member cannot enrol; another actor's session cannot be used.
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.m')::uuid, current_setting('t.sm')::uuid, repeat('A',44), 'test-k1');
  RAISE EXCEPTION 'member enrolled';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sb')::uuid, repeat('A',44), 'test-k1');
  RAISE EXCEPTION 'enrolled through another session';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;

-- Enrol a: the new secret is pending until confirmed against its own version.
DO $$ DECLARE r record; BEGIN
  IF public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, repeat('A',44), 'test-k1') THEN
    RAISE EXCEPTION 'first enrolment reported a replacement'; END IF;
  SELECT * INTO r FROM public.admin_totp_sealed_secret(current_setting('t.a')::uuid);
  IF r.confirmed OR r.secret_ciphertext IS NOT NULL OR r.pending_ciphertext <> repeat('A',44) OR r.pending_version IS NULL THEN
    RAISE EXCEPTION 'pending enrolment row: %', r; END IF;
  PERFORM set_config('t.pv1', r.pending_version::text, true);
  BEGIN
    PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint, r.pending_version);
    RAISE EXCEPTION 'unconfirmed credential verified';
  EXCEPTION WHEN sqlstate '55000' THEN NULL; END;
  BEGIN
    PERFORM public.admin_totp_confirm_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, current_setting('t.now')::bigint - 3, r.pending_version);
    RAISE EXCEPTION 'stale confirmation accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  -- A code checked against some other credential version cannot confirm this one.
  BEGIN
    PERFORM public.admin_totp_confirm_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, current_setting('t.now')::bigint - 1, gen_random_uuid());
    RAISE EXCEPTION 'confirmation against another version accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  IF NOT public.admin_totp_confirm_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, current_setting('t.now')::bigint - 1, r.pending_version) THEN
    RAISE EXCEPTION 'confirmation failed'; END IF;
END $$;

DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.a')::uuid);
  IF NOT (r.enrolled AND r.enforced) THEN RAISE EXCEPTION 'requirement after enrolment: %', r; END IF;
  SELECT * INTO r FROM public.admin_totp_sealed_secret(current_setting('t.a')::uuid);
  IF r.secret_ciphertext <> repeat('A',44) OR r.key_id <> 'test-k1' OR NOT r.confirmed
     OR r.credential_version::text <> current_setting('t.pv1') OR r.pending_ciphertext IS NOT NULL THEN
    RAISE EXCEPTION 'active row after confirmation: %', r; END IF;
  PERFORM set_config('t.v1', r.credential_version::text, true);
END $$;

-- The confirmation step is spent; unknown scope and wrong version are refused.
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint - 1, current_setting('t.v1')::uuid);
  RAISE EXCEPTION 'replayed step accepted';
EXCEPTION WHEN sqlstate '23505' THEN NULL; END $$;
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'everything', current_setting('t.now')::bigint, current_setting('t.v1')::uuid);
  RAISE EXCEPTION 'unknown scope accepted';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint, gen_random_uuid());
  RAISE EXCEPTION 'verification against another version accepted';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;

-- Verify in sa1: proof bound to actor, session and scope, five minutes.
DO $$ DECLARE v_expires timestamptz; BEGIN
  v_expires := public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'totp.manage', current_setting('t.now')::bigint, current_setting('t.v1')::uuid);
  IF v_expires < clock_timestamp() + interval '290 seconds' OR v_expires > clock_timestamp() + interval '301 seconds' THEN
    RAISE EXCEPTION 'proof lifetime %', v_expires - clock_timestamp(); END IF;
  IF NOT public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'totp.manage') THEN RAISE EXCEPTION 'own proof invalid'; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'totp.manage') THEN RAISE EXCEPTION 'cross-session proof valid'; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'backup.restore') THEN RAISE EXCEPTION 'cross-scope proof valid'; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.b')::uuid, current_setting('t.sa1')::uuid, 'totp.manage') THEN RAISE EXCEPTION 'cross-actor proof valid'; END IF;
END $$;

-- The same step in another session is a replay; another actor's session is refused.
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'backup.restore', current_setting('t.now')::bigint, current_setting('t.v1')::uuid);
  RAISE EXCEPTION 'same step in another session accepted';
EXCEPTION WHEN sqlstate '23505' THEN NULL; END $$;
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sb')::uuid, 'backup.restore', current_setting('t.now')::bigint + 1, current_setting('t.v1')::uuid);
  RAISE EXCEPTION 'verified through another actor session';
EXCEPTION WHEN sqlstate '22023' THEN NULL; END $$;

-- Replacement without a totp.manage proof (sa2 has none) is refused.
DO $$ BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, repeat('B',44), 'test-k1');
  RAISE EXCEPTION 'confirmed credential replaced without proof';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;

-- Replacement with the proof keeps the active factor enforced until the new one is confirmed.
DO $$ DECLARE r record; BEGIN
  IF NOT public.admin_totp_begin_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, repeat('B',44), 'test-k1') THEN
    RAISE EXCEPTION 'replacement not reported'; END IF;
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.a')::uuid);
  IF NOT (r.enrolled AND r.enforced) THEN RAISE EXCEPTION 'pending replacement dropped enforcement: %', r; END IF;
  SELECT * INTO r FROM public.admin_totp_sealed_secret(current_setting('t.a')::uuid);
  IF r.secret_ciphertext <> repeat('A',44) OR r.credential_version::text <> current_setting('t.v1')
     OR r.pending_ciphertext <> repeat('B',44) THEN RAISE EXCEPTION 'replacement row: %', r; END IF;
  IF NOT public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'totp.manage') THEN
    RAISE EXCEPTION 'pending replacement dropped existing proofs'; END IF;
  PERFORM set_config('t.pv2', r.pending_version::text, true);
  -- The active credential still verifies while the replacement is pending.
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'economy.treasury', current_setting('t.now')::bigint + 1, current_setting('t.v1')::uuid);
  -- Confirming the replacement swaps it in and ends every proof made with the old factor.
  PERFORM public.admin_totp_confirm_enrolment(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, current_setting('t.now')::bigint, current_setting('t.pv2')::uuid);
  SELECT * INTO r FROM public.admin_totp_sealed_secret(current_setting('t.a')::uuid);
  IF r.secret_ciphertext <> repeat('B',44) OR r.credential_version::text <> current_setting('t.pv2') OR r.pending_ciphertext IS NOT NULL THEN
    RAISE EXCEPTION 'swap row: %', r; END IF;
  IF public.admin_totp_proof_valid(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'economy.treasury') THEN
    RAISE EXCEPTION 'old-factor proof survived the swap'; END IF;
  -- The old version can no longer verify.
  BEGIN
    PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'economy.treasury', current_setting('t.now')::bigint + 1, current_setting('t.v1')::uuid);
    RAISE EXCEPTION 'old version verified after swap';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
END $$;

-- Revoking the session (logout) invalidates its proof.
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa1')::uuid, 'economy.treasury', current_setting('t.now')::bigint + 1, current_setting('t.pv2')::uuid);
END $$;
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
    PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'backup.restore', current_setting('t.now')::bigint + 1, current_setting('t.pv2')::uuid);
    RAISE EXCEPTION 'locked factor verified';
  EXCEPTION WHEN sqlstate '55000' THEN NULL; END;
END $$;

-- Per-session ceiling: after 20 failures in 15 minutes, failures AND correct codes are refused.
RESET ROLE;
UPDATE public.admin_totp_credentials SET locked_until = NULL, failed_attempts = 0 WHERE user_id = current_setting('t.a')::uuid;
SET LOCAL ROLE moneyverse_app;
DO $$ DECLARE i int; BEGIN
  FOR i IN 6..20 LOOP PERFORM public.admin_totp_record_failure(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid); END LOOP;
  BEGIN
    PERFORM public.admin_totp_record_failure(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid);
    RAISE EXCEPTION 'ceiling not enforced on failures';
  EXCEPTION WHEN sqlstate '55000' THEN NULL; END;
END $$;
RESET ROLE;
UPDATE public.admin_totp_credentials SET locked_until = NULL, failed_attempts = 0 WHERE user_id = current_setting('t.a')::uuid;
SET LOCAL ROLE moneyverse_app;
DO $$ BEGIN
  PERFORM public.admin_totp_verify(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, 'backup.restore', current_setting('t.now')::bigint + 1, current_setting('t.pv2')::uuid);
  RAISE EXCEPTION 'ceiling not enforced on a correct code';
EXCEPTION WHEN sqlstate '55000' THEN NULL; END $$;

-- An operator cannot revoke another administrator.
DO $$ BEGIN
  PERFORM public.admin_totp_revoke(current_setting('t.b')::uuid, current_setting('t.sb')::uuid, current_setting('t.a')::uuid);
  RAISE EXCEPTION 'operator revoked another administrator';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;

-- Enrol b so others can revoke it.
DO $$ DECLARE r record; BEGIN
  PERFORM public.admin_totp_begin_enrolment(current_setting('t.b')::uuid, current_setting('t.sb')::uuid, repeat('C',44), 'test-k1');
  SELECT * INTO r FROM public.admin_totp_sealed_secret(current_setting('t.b')::uuid);
  PERFORM public.admin_totp_confirm_enrolment(current_setting('t.b')::uuid, current_setting('t.sb')::uuid, current_setting('t.now')::bigint, r.pending_version);
END $$;
-- a is enrolled and has no security.settings proof in sa2: refused.
DO $$ BEGIN
  PERFORM public.admin_totp_revoke(current_setting('t.a')::uuid, current_setting('t.sa2')::uuid, current_setting('t.b')::uuid);
  RAISE EXCEPTION 'enrolled superadmin revoked without own proof';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;

-- With the switch enabled, an unenrolled superadmin (c) is enforced and cannot revoke others.
RESET ROLE;
DO $$ BEGIN
  IF public.feature_switch_state('admin_totp_required') <> 'disabled' THEN RAISE EXCEPTION 'switch not seeded disabled'; END IF;
END $$;
UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'admin_totp_required';
SET LOCAL ROLE moneyverse_app;
DO $$ BEGIN
  PERFORM public.admin_totp_revoke(current_setting('t.c')::uuid, current_setting('t.sc')::uuid, current_setting('t.b')::uuid);
  RAISE EXCEPTION 'enforced unenrolled superadmin revoked another factor';
EXCEPTION WHEN sqlstate '42501' THEN NULL; END $$;
DO $$ DECLARE r record; BEGIN
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.c')::uuid);
  IF r.enrolled OR NOT r.enforced THEN RAISE EXCEPTION 'switch did not enforce: %', r; END IF;
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.m')::uuid);
  IF r.enforced THEN RAISE EXCEPTION 'member enforced: %', r; END IF;
END $$;
-- With the switch off again, the unenrolled superadmin may revoke (recovery path).
RESET ROLE;
UPDATE public.feature_switches SET state = 'disabled' WHERE feature_key = 'admin_totp_required';
SET LOCAL ROLE moneyverse_app;
DO $$ DECLARE r record; BEGIN
  IF NOT public.admin_totp_revoke(current_setting('t.c')::uuid, current_setting('t.sc')::uuid, current_setting('t.b')::uuid) THEN RAISE EXCEPTION 'revoke failed'; END IF;
  SELECT * INTO r FROM public.admin_totp_requirement(current_setting('t.b')::uuid);
  IF r.enrolled THEN RAISE EXCEPTION 'revoked credential still enrolled'; END IF;
END $$;

-- Audit rows were written for the factor's events.
RESET ROLE;
DO $$ DECLARE n int; BEGIN
  SELECT count(*) INTO n FROM public.audit_logs WHERE action LIKE 'admin.second_factor.%'
    AND actor_user_id IN (current_setting('t.a')::uuid, current_setting('t.b')::uuid, current_setting('t.c')::uuid);
  IF n < 8 THEN RAISE EXCEPTION 'expected audit rows, found %', n; END IF;
END $$;

SELECT 'ALL 366 CHECKS PASSED' AS result;
ROLLBACK;
