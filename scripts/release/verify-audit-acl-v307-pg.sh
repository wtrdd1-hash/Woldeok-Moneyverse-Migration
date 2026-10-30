#!/usr/bin/env bash
# Isolated PostgreSQL ACL regression: no shared DB, no published ports, no DML to live audit data.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
container="mv-b-audit-acl-v307-$$"
error_log="$(mktemp)"
cleanup() { rm -f "$error_log"; docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --name "$container" --network none \
  --tmpfs /var/lib/postgresql/data:rw,size=256m \
  -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17.11-alpine >/dev/null
# Initdb briefly starts a temporary postmaster before the final service.
# Require two successful SQL probes so a transient bootstrap socket is not mistaken for readiness.
ready=false
for attempt in $(seq 1 30); do
  if [[ "$(docker exec "$container" psql -X -U postgres -tAc 'SELECT 1' 2>/dev/null || true)" == 1 ]]; then
    sleep 1
    if [[ "$(docker exec "$container" psql -X -U postgres -tAc 'SELECT 1' 2>/dev/null || true)" == 1 ]]; then
      ready=true
      break
    fi
  fi
  sleep 1
done
[[ "$ready" == true ]] || { echo 'isolated PostgreSQL did not become ready'; exit 1; }
psql() { docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }
psql <<'SQL' >/dev/null
CREATE ROLE moneyverse_app NOLOGIN NOINHERIT;
CREATE TABLE public.audit_logs(id integer PRIMARY KEY, action text NOT NULL);
INSERT INTO public.audit_logs VALUES (1, 'initial');
GRANT ALL PRIVILEGES ON TABLE public.audit_logs TO moneyverse_app;
GRANT SELECT, UPDATE ON TABLE public.audit_logs TO PUBLIC;
CREATE FUNCTION public.audit_count() RETURNS bigint LANGUAGE sql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp AS $$
  SELECT count(*) FROM public.audit_logs
$$;
REVOKE ALL ON FUNCTION public.audit_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_count() TO moneyverse_app;
SQL
before="$(psql -tA -c "SELECT has_table_privilege('moneyverse_app','public.audit_logs','SELECT'),has_table_privilege('moneyverse_app','public.audit_logs','INSERT'),has_table_privilege('moneyverse_app','public.audit_logs','UPDATE'),has_table_privilege('moneyverse_app','public.audit_logs','DELETE'),has_table_privilege('moneyverse_app','public.audit_logs','TRUNCATE')" | tr -d '\r')"
[[ "$before" == 't|t|t|t|t' ]] || { echo "expected unsafe fixture grant, got $before"; exit 1; }
psql < "$root/packages/database/migrations/307-audit-log-app-acl-lockdown.sql" >/dev/null
public_grants="$(psql -tA -c "SELECT count(*) FROM pg_catalog.pg_class c CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a WHERE c.oid='public.audit_logs'::regclass AND a.grantee=0" )"
[[ "$public_grants" == 0 ]] || { echo "PUBLIC audit privileges remain: $public_grants"; exit 1; }
after="$(psql -tA -c "SELECT has_table_privilege('moneyverse_app','public.audit_logs','SELECT'),has_table_privilege('moneyverse_app','public.audit_logs','INSERT'),has_table_privilege('moneyverse_app','public.audit_logs','UPDATE'),has_table_privilege('moneyverse_app','public.audit_logs','DELETE'),has_table_privilege('moneyverse_app','public.audit_logs','TRUNCATE')" | tr -d '\r')"
[[ "$after" == 'f|f|f|f|f' ]] || { echo "unsafe direct audit grant after migration: $after"; exit 1; }
# Actual SQL must fail as the application role, not merely report denied metadata.
for statement in 'SELECT * FROM public.audit_logs' "UPDATE public.audit_logs SET action='tampered' WHERE id=1" 'DELETE FROM public.audit_logs WHERE id=1' 'TRUNCATE public.audit_logs' "INSERT INTO public.audit_logs VALUES (2,'forged')"; do
  if psql -c "SET ROLE moneyverse_app; $statement" >"$error_log" 2>&1; then
    echo "application SQL unexpectedly succeeded: $statement"; exit 1
  fi
  grep -q 'permission denied for table audit_logs' "$error_log" || {
    cat "$error_log"; exit 1;
  }
done
function_result="$(psql -tA -c 'SET ROLE moneyverse_app; SELECT public.audit_count()' | tail -1)"
[[ "$function_result" == 1 ]] || { echo "SECURITY DEFINER function failed: $function_result"; exit 1; }
count="$(psql -tA -c "SELECT count(*) FROM public.audit_logs WHERE action='initial'")"
[[ "$count" == 1 ]] || { echo 'audit row changed'; exit 1; }
echo 'PASS PostgreSQL 17.11 isolated: grant baseline t/t/t/t/t -> deny f/f/f/f/f, direct SELECT/INSERT/UPDATE/DELETE/TRUNCATE denied; PUBLIC grants revoked, SECURITY DEFINER EXECUTE preserved, audit row unchanged'
