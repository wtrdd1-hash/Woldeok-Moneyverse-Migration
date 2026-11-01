#!/usr/bin/env bash
# Disposable, network-isolated PostgreSQL source-contract check for admin traffic.
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd -P)"
name="mv-c-v1283-traffic-pg-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$name" --network none \
  --tmpfs /var/lib/postgresql/data:rw,size=1024m \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_USER=moneyverse_migrator \
  -e POSTGRES_DB=moneyverse_v1283 \
  -v "$root/packages/database/init:/init:ro" \
  -v "$root/packages/database/migrations:/migrations:ro" \
  postgres:17.11-alpine >/dev/null
ready=false
for attempt in $(seq 1 40); do
  if [[ "$(docker exec "$name" psql -X -U moneyverse_migrator -d moneyverse_v1283 -tAc 'SELECT 1' 2>/dev/null || true)" == 1 ]]; then
    sleep 1
    if [[ "$(docker exec "$name" psql -X -U moneyverse_migrator -d moneyverse_v1283 -tAc 'SELECT 1' 2>/dev/null || true)" == 1 ]]; then ready=true; break; fi
  fi
  sleep 1
done
[[ "$ready" == true ]] || { echo 'isolated database not ready'; exit 1; }

docker exec -i "$name" sh -s <<'SH'
set -eu
export PGUSER=moneyverse_migrator PGDATABASE=moneyverse_v1283
psql -X -v ON_ERROR_STOP=1 -c 'CREATE ROLE moneyverse_app LOGIN NOINHERIT;' >/dev/null
psql -X -v ON_ERROR_STOP=1 -f /init/001-economy-core.sql >/dev/null
psql -X -v ON_ERROR_STOP=1 -c 'CREATE TABLE public.schema_migrations (filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());' >/dev/null
n=0
for f in /migrations/[0-9][0-9][0-9]-*.sql; do
  if ! psql -X -v ON_ERROR_STOP=1 -f "$f" >/tmp/mv-migration.out 2>&1; then
    echo "Migration failed: $(basename "$f")"
    tail -15 /tmp/mv-migration.out
    exit 1
  fi
  file="$(basename "$f")"
  sha="$(sha256sum "$f" | cut -d ' ' -f1)"
  psql -X -v ON_ERROR_STOP=1 -c "INSERT INTO public.schema_migrations(filename,checksum) VALUES ('$file','$sha');" >/dev/null
  n=$((n+1))
done
echo "APPLIED_MIGRATIONS=$n"
psql -X -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO public.users(id, status) VALUES
 ('11111111-1111-4111-8111-111111111111', 'active'),
 ('22222222-2222-4222-8222-222222222222', 'active');
INSERT INTO public.user_roles(user_id, role) VALUES
 ('11111111-1111-4111-8111-111111111111', 'approver');
INSERT INTO public.user_activity_logs(user_id,session_id,event_type,path,metadata)
VALUES ('22222222-2222-4222-8222-222222222222','session-owner','page_view','/stocks','{"country":"KR"}'),
       (NULL,'session-anonymous','page_view','/stocks','{"country":"KR"}');
SET ROLE moneyverse_app;
DO $check$
DECLARE v jsonb;
BEGIN
  IF has_table_privilege(current_user, 'public.user_activity_logs', 'SELECT') THEN
    RAISE EXCEPTION 'app role may read raw traffic';
  END IF;
  IF NOT has_function_privilege(current_user, 'public.admin_activity_traffic_dashboard(uuid,text,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'app role cannot call guarded traffic source';
  END IF;
  SELECT public.admin_activity_traffic_dashboard('11111111-1111-4111-8111-111111111111','day',30) INTO v;
  IF v->>'granularity' <> 'day' OR (v->>'periods')::integer <> 30 OR
     (v->'summary'->>'pageViews')::integer <> 2 OR
     (v->'summary'->>'uniqueSessions')::integer <> 2 OR
     (v->'summary'->>'authenticatedUsers')::integer <> 1 OR
     (v->'summary'->>'anonymousSessions')::integer <> 1 OR
     jsonb_array_length(v->'series') <> 1 OR
     jsonb_array_length(v->'landingPages') <> 1 THEN
    RAISE EXCEPTION 'unexpected traffic contract: %', v;
  END IF;
  BEGIN
    PERFORM public.admin_activity_traffic_dashboard('22222222-2222-4222-8222-222222222222','day',30);
    RAISE EXCEPTION 'nonadmin unexpectedly read traffic';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$check$;
SQL
SH
echo 'PASS: isolated PostgreSQL 17.11, full migrations, app ACL, authorized traffic SQL and nonadmin denial'
