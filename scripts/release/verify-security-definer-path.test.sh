#!/usr/bin/env bash
set -euo pipefail
repo="$(cd "$(dirname "$0")/../.." && pwd -P)"
name="mv-b-v766-secdef-path-$$"
log="$(mktemp)"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; rm -f "$log"; }
trap cleanup EXIT
docker run -d --name "$name" --network none -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17.11-alpine >/dev/null
for i in $(seq 1 40); do
  if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1 && docker exec "$name" psql -U postgres -d postgres -Atc "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
CREATE FUNCTION public.secdef_safe() RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS 'SELECT 1';
SQL
run_gate() { PG_CONTAINER="$name" EXPECTED_DATABASE=postgres "$repo/scripts/release/verify-security-definer-path.sh" >"$log" 2>&1; }
expect_reject() {
  if run_gate; then echo "FAIL: unsafe state accepted ($1)" >&2; exit 1; fi
  if ! grep -q "SECDEF_PATH_BLOCKED" "$log"; then cat "$log" >&2; echo "FAIL: rejection was not the expected security gate ($1)" >&2; exit 1; fi
}
expect_accept() {
  if ! run_gate || ! grep -q "SECDEF_PATH_PASS" "$log"; then cat "$log" >&2; echo "FAIL: safe state rejected ($1)" >&2; exit 1; fi
}
expect_accept "safe routine"
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
CREATE FUNCTION public.invoker_public() RETURNS integer LANGUAGE sql SECURITY INVOKER SET search_path = public AS 'SELECT 1';
SQL
expect_accept "invoker routine outside scope"
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
CREATE FUNCTION public.secdef_public() RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS 'SELECT 1';
SQL
expect_reject "public schema"
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
ALTER FUNCTION public.secdef_public() SET search_path = pg_catalog, pg_temp;
CREATE FUNCTION public.secdef_missing() RETURNS integer LANGUAGE sql SECURITY DEFINER AS 'SELECT 1';
SQL
expect_reject "missing path"
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
ALTER FUNCTION public.secdef_missing() SET search_path = pg_catalog, pg_temp;
CREATE FUNCTION public.secdef_extra() RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS 'SELECT 1';
SQL
expect_reject "extra public path"
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
ALTER FUNCTION public.secdef_extra() SET search_path = pg_catalog, pg_temp;
SQL
expect_accept "remediated routines"
if PG_CONTAINER="$name" EXPECTED_DATABASE=wrong_database "$repo/scripts/release/verify-security-definer-path.sh" >"$log" 2>&1; then
  echo "FAIL: mismatched database accepted" >&2; exit 1
fi
grep -q "database identity mismatch" "$log" || { cat "$log" >&2; exit 1; }
docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
DROP FUNCTION public.secdef_safe();
DROP FUNCTION public.secdef_public();
DROP FUNCTION public.secdef_missing();
DROP FUNCTION public.secdef_extra();
DROP FUNCTION public.invoker_public();
SQL
expect_reject "no routines"
echo "PASS isolated PostgreSQL: safe, invoker excluded, public schema, missing path, extra schema, repair, wrong database, empty inventory"
