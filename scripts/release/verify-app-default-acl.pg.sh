#!/usr/bin/env bash
# Real PostgreSQL catalog regression, isolated from every shared Test/Production DB.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
container="mv-b-v762-default-acl-$$"
query_file="$(mktemp)"
cleanup() { rm -f "$query_file"; docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
node --input-type=module -e "import {DEFAULT_TABLE_ACL_SQL} from './scripts/release/verify-app-default-acl.mjs'; process.stdout.write('SELECT COUNT(*) FROM (' + DEFAULT_TABLE_ACL_SQL + ') AS checked_acl;');" > "$query_file"
docker run -d --name "$container" --network none --tmpfs /var/lib/postgresql/data:rw,size=256m -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17.11-alpine >/dev/null
ready=false
for attempt in $(seq 1 30); do
  if [[ "$(docker exec "$container" psql -X -U postgres -tAc 'SELECT 1' 2>/dev/null || true)" == 1 ]]; then ready=true; break; fi
  sleep 1
done
[[ "$ready" == true ]] || { echo 'isolated PostgreSQL failed to start'; exit 1; }
psql() { docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }
psql <<'SQL' >/dev/null
CREATE ROLE moneyverse_app NOINHERIT;
CREATE ROLE moneyverse_migrator NOINHERIT;
SQL
count_acl() { psql -tA < "$query_file" | tr -d '\r\n'; }
[[ "$(count_acl)" == 0 ]] || { echo 'FAIL: clean default ACL should be empty'; exit 1; }
psql <<'SQL' >/dev/null
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public GRANT ALL ON TABLES TO moneyverse_app;
SQL
count="$(count_acl)"
[[ "$count" -ge 7 ]] || { echo "FAIL: destructive app default ACL not detected ($count)"; exit 1; }
psql <<'SQL' >/dev/null
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public REVOKE ALL ON TABLES FROM moneyverse_app;
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator GRANT SELECT ON TABLES TO PUBLIC;
SQL
[[ "$(count_acl)" == 1 ]] || { echo 'FAIL: global PUBLIC table default ACL not detected'; exit 1; }
psql <<'SQL' >/dev/null
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator REVOKE SELECT ON TABLES FROM PUBLIC;
SQL
[[ "$(count_acl)" == 0 ]] || { echo 'FAIL: revoked default ACL still detected'; exit 1; }
echo "PASS: isolated PostgreSQL 17.11 default ACL: clean=0, app ALL=$count, global PUBLIC=1, revoked=0"
