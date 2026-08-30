-- Make the audit chain reproducible, totally ordered and append-only.
--
-- `audit_logs` has carried an integrity hash since 007, but three properties
-- an evidence chain needs were missing, and each one defeats the chain in a
-- different way:
--
--  1. THE HASH WAS NOT REPRODUCIBLE. 007 fed `jsonb_build_object(...,
--     'createdAt', v_created_at)` a timestamptz. PostgreSQL renders a
--     timestamptz into JSON using the *session* TimeZone, and the function
--     pinned only `search_path`. A verifier connecting from Asia/Seoul would
--     therefore compute a different digest than the writer did from UTC and
--     would report every row as forged. A chain nobody can recompute is
--     decoration. Hash version 2 below formats the timestamp itself, in UTC,
--     with an explicit format string that carries no locale-dependent field.
--
--  2. THE CHAIN HAD NO TOTAL ORDER. The previous row was chosen with
--     `ORDER BY created_at DESC, id DESC`, and `id` is a random uuid. Two
--     rows sharing a clock_timestamp() therefore order arbitrarily, so
--     "the row before this one" was not a stable question and a verifier
--     could not walk the chain. `sequence` is a contiguous bigint handed out
--     under the same advisory lock that serialises the append, so the chain
--     order is now recorded rather than inferred.
--
--  3. ROWS COULD BE REWRITTEN. `moneyverse_app` never held UPDATE or DELETE
--     on the table, but nothing stopped a superuser session, a migration or
--     a psql prompt from editing history in place -- and the linkage hash
--     would still verify, because rewriting a row and leaving its stored
--     hash alone breaks nothing that was being checked. The trigger below is
--     the same one `economy_reconciliation_snapshots` has carried since 018.
--
-- Existing rows keep `hash_version = 1`. They are not rehashed: the point of
-- an append-only log is that yesterday's bytes stay yesterday's bytes. 064's
-- verifier reproduces version 1 rows with the legacy formula pinned to UTC,
-- which succeeds on any server that wrote them under UTC (the deployment
-- does) and otherwise reports them as unverifiable rather than as forged.
--
-- BEGIN/COMMIT: unlike 057 and 059 this file backfills a column and then
-- installs a trigger that would reject that same backfill on a re-run, so
-- the two must land together or not at all.

BEGIN;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS sequence bigint,
  ADD COLUMN IF NOT EXISTS hash_version smallint NOT NULL DEFAULT 1;

-- Order the backfill the way 007 read the chain, so the numbering agrees
-- with the linkage the existing rows already carry. `base` keeps a re-run
-- from restarting at 1 and colliding with rows numbered by an earlier run.
WITH anchor AS (
  SELECT coalesce(max(audit_row.sequence), 0) AS base
  FROM public.audit_logs AS audit_row
),
ordered AS (
  SELECT
    audit_row.id AS audit_id,
    row_number() OVER (ORDER BY audit_row.created_at, audit_row.id) AS position
  FROM public.audit_logs AS audit_row
  WHERE audit_row.sequence IS NULL
)
UPDATE public.audit_logs AS audit_row
SET sequence = anchor.base + ordered.position
FROM ordered, anchor
WHERE audit_row.id = ordered.audit_id;

ALTER TABLE public.audit_logs ALTER COLUMN sequence SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS audit_logs_sequence_key
  ON public.audit_logs (sequence);

-- `hash_version` decides which formula 064 verifies a row with, so a row that
-- can set its own version can choose to be checked by a formula that no longer
-- reproduces -- and 064 reports a failed legacy reproduction as `legacy`, not
-- as a mismatch. Editing a row behind a disabled trigger and flipping its
-- version to 1 would therefore certify the edit. A CHECK closes that, because
-- unlike a trigger a CHECK is still enforced when the trigger is off. Version 1
-- exists only below the watermark: every row that existed before this ran.
DO $do$
DECLARE
  v_watermark bigint;
BEGIN
  SELECT coalesce(max(audit_row.sequence), 0) INTO v_watermark
  FROM public.audit_logs AS audit_row;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraint_row
    WHERE constraint_row.conrelid = 'public.audit_logs'::pg_catalog.regclass
      AND constraint_row.conname = 'audit_logs_hash_version_check'
  ) THEN
    EXECUTE pg_catalog.format(
      'ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_hash_version_check '
      || 'CHECK (hash_version = 2 OR sequence <= %s)',
      v_watermark
    );
  END IF;
END;
$do$;

-- The digest of a version 2 row. Split out of the append function because
-- 064's verifier has to compute exactly the same bytes; two copies of a hash
-- formula drift, and the drift only shows up as a false tamper alarm.
--
-- STABLE, not IMMUTABLE: `to_char(timestamp, text)` is itself STABLE. The
-- format string names no month, no day and no era, so nothing here actually
-- varies with lc_time, but claiming IMMUTABLE over a STABLE callee is the
-- kind of lie that is repaid at planning time.
CREATE OR REPLACE FUNCTION public.audit_event_digest(
  p_audit_id uuid,
  p_sequence bigint,
  p_previous_hash text,
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb,
  p_created_at timestamptz,
  p_context jsonb
)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT pg_catalog.encode(
    public.digest(
      pg_catalog.jsonb_build_object(
        'hashVersion', 2,
        'auditId', p_audit_id::text,
        'sequence', p_sequence,
        'previousIntegrityHash', p_previous_hash,
        'actorUserId', p_actor_user_id::text,
        'action', p_action,
        'targetId', p_target_id::text,
        'requestId', p_request_id::text,
        'metadata', p_metadata,
        'createdAt', pg_catalog.to_char(
          p_created_at AT TIME ZONE 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
        ),
        'context', p_context
      )::text,
      'sha256'
    ),
    'hex'
  )
$$;

-- 007's formula, kept only so that rows written before this migration can
-- still be checked. `SET "TimeZone"` supplies the one input the original
-- function left to the session; a row written under a different server
-- timezone will not reproduce, which 064 reports as unverifiable rather
-- than as a mismatch.
CREATE OR REPLACE FUNCTION public.audit_event_digest_v1(
  p_previous_hash text,
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb,
  p_created_at timestamptz
)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = pg_catalog, pg_temp
SET "TimeZone" = 'UTC'
AS $$
  SELECT pg_catalog.encode(
    public.digest(
      pg_catalog.jsonb_build_object(
        'previousIntegrityHash', p_previous_hash,
        'actorUserId', p_actor_user_id::text,
        'action', p_action,
        'targetId', p_target_id::text,
        'requestId', p_request_id::text,
        'metadata', p_metadata,
        'createdAt', p_created_at
      )::text,
      'sha256'
    ),
    'hex'
  )
$$;

-- Unchanged from 007 except for the chain mechanics: the previous row is now
-- chosen by `sequence`, the new row's number is allocated from it, and the
-- digest comes from the shared helper. `FOR UPDATE` is gone -- the advisory
-- lock already serialises appenders for the whole transaction, and a row
-- lock on a table nothing may update bought nothing but contention.
CREATE OR REPLACE FUNCTION public.admin_append_audit_event(
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_audit_id uuid := pg_catalog.gen_random_uuid();
  v_previous_hash text;
  v_previous_sequence bigint;
  v_sequence bigint;
  v_integrity_hash text;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_actor_user_id IS NULL
    OR p_action IS NULL
    OR p_action !~ '^[a-z][a-z0-9_.:-]{2,119}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid audit event identity';
  END IF;

  IF p_metadata IS NULL
    OR pg_catalog.jsonb_typeof(p_metadata) <> 'object'
    OR pg_catalog.octet_length(p_metadata::text) > 16384 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid audit metadata';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin-audit-chain', 0)
  );

  SELECT audit_row.integrity_hash, audit_row.sequence
  INTO v_previous_hash, v_previous_sequence
  FROM public.audit_logs AS audit_row
  ORDER BY audit_row.sequence DESC
  LIMIT 1;

  v_sequence := coalesce(v_previous_sequence, 0) + 1;

  v_integrity_hash := public.audit_event_digest(
    v_audit_id,
    v_sequence,
    v_previous_hash,
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    v_created_at,
    '{}'::jsonb
  );

  INSERT INTO public.audit_logs (
    id,
    sequence,
    hash_version,
    actor_user_id,
    action,
    target_id,
    request_id,
    metadata,
    created_at,
    previous_integrity_hash,
    integrity_hash
  ) VALUES (
    v_audit_id,
    v_sequence,
    2,
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    v_created_at,
    v_previous_hash,
    v_integrity_hash
  );

  RETURN v_audit_id;
END;
$$;

-- Evidence. A migration that genuinely has to touch history must say so out
-- loud with `ALTER TABLE public.audit_logs DISABLE TRIGGER
-- audit_logs_immutable`, which leaves the intent in the migration file where
-- a reviewer sees it.
CREATE OR REPLACE FUNCTION public.audit_reject_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'audit_logs is append-only';
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.audit_logs'::pg_catalog.regclass
      AND trigger_row.tgname = 'audit_logs_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER audit_logs_immutable
      BEFORE UPDATE OR DELETE ON public.audit_logs
      FOR EACH ROW
      EXECUTE FUNCTION public.audit_reject_log_mutation();
  END IF;
END;
$do$;

ALTER FUNCTION public.audit_event_digest(uuid, bigint, text, uuid, text, uuid, uuid, jsonb, timestamptz, jsonb)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_event_digest_v1(text, uuid, text, uuid, uuid, jsonb, timestamptz)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_reject_log_mutation() OWNER TO moneyverse_migrator;

-- The digest helpers stay internal: the application never recomputes a hash,
-- and a role that can compute one is a role that can forge a plausible chain.
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_event_digest(uuid, bigint, text, uuid, text, uuid, uuid, jsonb, timestamptz, jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_event_digest_v1(text, uuid, text, uuid, uuid, jsonb, timestamptz)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_reject_log_mutation()
  FROM PUBLIC, moneyverse_app;

COMMIT;
