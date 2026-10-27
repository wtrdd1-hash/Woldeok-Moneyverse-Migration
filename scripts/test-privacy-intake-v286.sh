#!/usr/bin/env bash
set -euo pipefail
# Disposable PostgreSQL only: never use DATABASE_URL, host network or published ports.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="mv-b-v598-privacy-pg-$$"
ACTOR="11111111-1111-4111-8111-111111111111"
OTHER="22222222-2222-4222-8222-222222222222"
INACTIVE="33333333-3333-4333-8333-333333333333"
KEY="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || :; }
trap cleanup EXIT
docker run -d --rm --network none --name "$NAME" -e POSTGRES_PASSWORD=isolated_test_only postgres:17-alpine >/dev/null
ready=0
for _ in $(seq 1 40); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.5
done
test "$ready" = 1
docker exec -i "$NAME" psql -X -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
CREATE ROLE moneyverse_migrator NOLOGIN;
CREATE ROLE moneyverse_app NOLOGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TABLE public.users (id uuid PRIMARY KEY, status public.user_status NOT NULL);
INSERT INTO public.users VALUES
 ('11111111-1111-4111-8111-111111111111','active'),
 ('22222222-2222-4222-8222-222222222222','active'),
 ('33333333-3333-4333-8333-333333333333','inactive');
GRANT SELECT, UPDATE ON public.users TO moneyverse_migrator;
CREATE TABLE public.synthetic_audit_events (actor uuid, action text, target uuid, metadata jsonb);
CREATE FUNCTION public.admin_append_audit_event(uuid,text,uuid,uuid,jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 INSERT INTO public.synthetic_audit_events(actor,action,target,metadata)
 VALUES ($1,$2,$3,$5);
 RETURN pg_catalog.gen_random_uuid();
END; $$;
SQL
docker exec -i "$NAME" psql -X -U postgres -v ON_ERROR_STOP=1 < "$ROOT/packages/database/migrations/015-privacy-data-subject-requests.sql" >/dev/null
# This is the original bug; before applying the new migration, it MUST fail with SQLSTATE 42702.
set +e
BEFORE="$(docker exec "$NAME" psql -X -U postgres -v ON_ERROR_STOP=1 -c "SET ROLE moneyverse_app; SELECT * FROM public.privacy_create_my_request('$ACTOR','access',NULL,'$KEY');" 2>&1)"
BEFORE_RC=$?
set -e
if [ "$BEFORE_RC" -eq 0 ] || ! grep -q 'created_at.*ambiguous' <<< "$BEFORE"; then
  printf 'Unexpected baseline (rc=%s): %s\n' "$BEFORE_RC" "$BEFORE" >&2
  exit 1
fi
echo 'RED confirmed: original migration 015 first-create SQLSTATE 42702 ambiguous created_at'
if [ "${1:-}" = '--red-only' ]; then exit 0; fi
docker exec -i "$NAME" psql -X -U postgres -v ON_ERROR_STOP=1 < "$ROOT/packages/database/migrations/286-privacy-request-returning-binding.sql" >/dev/null
docker exec -i "$NAME" psql -X -U postgres -v ON_ERROR_STOP=1 < "$ROOT/packages/database/migrations/286-privacy-request-returning-binding.sql" >/dev/null
docker exec -i "$NAME" psql -X -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
SET ROLE moneyverse_app;
DO $$
DECLARE
  first_row record;
  again_row record;
  other_row record;
  rejected boolean;
BEGIN
  SELECT * INTO first_row FROM public.privacy_create_my_request(
    '11111111-1111-4111-8111-111111111111','access',NULL,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  IF first_row.request_id IS NULL OR first_row.replayed OR first_row.status <> 'received' THEN
    RAISE EXCEPTION 'first create did not return authoritative receipt';
  END IF;
  SELECT * INTO again_row FROM public.privacy_create_my_request(
    '11111111-1111-4111-8111-111111111111','access',NULL,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  IF again_row.request_id <> first_row.request_id OR NOT again_row.replayed
    OR again_row.created_at <> first_row.created_at THEN
    RAISE EXCEPTION 'identical replay lost receipt';
  END IF;
  rejected := false;
  BEGIN
    PERFORM public.privacy_create_my_request(
      '11111111-1111-4111-8111-111111111111','deletion',NULL,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  EXCEPTION WHEN invalid_parameter_value THEN rejected := true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'conflicting replay was accepted'; END IF;
  SELECT * INTO other_row FROM public.privacy_create_my_request(
    '22222222-2222-4222-8222-222222222222','access',NULL,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  IF other_row.request_id = first_row.request_id OR other_row.replayed THEN
    RAISE EXCEPTION 'cross-owner receipt collision';
  END IF;
  rejected := false;
  BEGIN
    PERFORM public.privacy_create_my_request(
      '33333333-3333-4333-8333-333333333333','access',NULL,
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  EXCEPTION WHEN invalid_authorization_specification THEN rejected := true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'inactive account accepted'; END IF;
  rejected := false;
  BEGIN
    PERFORM 1 FROM public.privacy_data_subject_requests;
  EXCEPTION WHEN insufficient_privilege THEN rejected := true;
  END;
  IF NOT rejected THEN RAISE EXCEPTION 'app role gained direct table SELECT'; END IF;
  IF (SELECT count(*) FROM public.privacy_list_my_requests(
    '11111111-1111-4111-8111-111111111111',30)) <> 1 THEN
    RAISE EXCEPTION 'owner listing wrong';
  END IF;
END; $$;
RESET ROLE;
DO $$
BEGIN
 IF (SELECT count(*) FROM public.privacy_data_subject_requests) <> 2 THEN
   RAISE EXCEPTION 'unexpected row count';
 END IF;
 IF (SELECT count(*) FROM public.synthetic_audit_events) <> 2 THEN
   RAISE EXCEPTION 'audit count mismatch';
 END IF;
 IF EXISTS(SELECT 1 FROM public.synthetic_audit_events
   WHERE metadata ? 'detail') THEN
   RAISE EXCEPTION 'audit leaked request detail';
 END IF;
END; $$;
SQL
# 20 concurrent same-key first creates must converge to one receipt/audit event.
CONCURRENT_KEY="cccccccc-cccc-4ccc-8ccc-cccccccccccc"
QUERY="SET ROLE moneyverse_app; SELECT request_id FROM public.privacy_create_my_request('$ACTOR','access',NULL,'$CONCURRENT_KEY');"
export NAME ACTOR CONCURRENT_KEY QUERY
seq 1 20 | xargs -P 20 -I{} sh -c '
docker exec "$NAME" psql -X -qAt -U postgres -v ON_ERROR_STOP=1 -c "$QUERY" ' > /tmp/mv-b-v598-concurrency-$$.txt
# Above quoted SQL is assembled safely from fixed test-only UUIDs.
UNIQUE_COUNT="$(sort -u /tmp/mv-b-v598-concurrency-$$.txt | wc -l)"
rm -f /tmp/mv-b-v598-concurrency-$$.txt
if [ "$UNIQUE_COUNT" -ne 1 ]; then echo "concurrent receipts diverged: $UNIQUE_COUNT" >&2; exit 1; fi
ROWCOUNT="$(docker exec "$NAME" psql -X -qAt -U postgres -c "SELECT count(*) FROM public.privacy_data_subject_requests WHERE idempotency_key = '$CONCURRENT_KEY'")"
AUDITCOUNT="$(docker exec "$NAME" psql -X -qAt -U postgres -c "SELECT count(*) FROM public.synthetic_audit_events WHERE actor = '$ACTOR'")"
test "$ROWCOUNT" = 1
test "$AUDITCOUNT" = 2
echo 'GREEN: first create, exact replay, conflicting replay, cross-owner, inactive, ACL, owner read, redacted audit, 20 concurrent retries'
