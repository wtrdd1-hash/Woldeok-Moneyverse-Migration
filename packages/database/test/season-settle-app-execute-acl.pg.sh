#!/usr/bin/env bash
# Fresh isolated database only; never accepts a shared DATABASE_URL.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
MODE="${1:-full}"
if [[ "$MODE" != full && "$MODE" != baseline ]]; then
  echo "Usage: $0 [full|baseline]" >&2
  exit 2
fi
NAME="mv-b-v731-season-acl-$$"
PASSWORD="$(openssl rand -hex 24)"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --rm -d --network none --name "$NAME" -e POSTGRES_PASSWORD="$PASSWORD" postgres:17.11 >/dev/null
ready=0
for _ in $(seq 1 60); do
  if docker exec "$NAME" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.5
done
if [[ "$ready" != 1 ]]; then echo "PostgreSQL readiness timeout" >&2; exit 1; fi
sql() { docker exec -i "$NAME" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }
sql <<SQL
CREATE ROLE moneyverse_app NOINHERIT;
CREATE ROLE moneyverse_migrator NOINHERIT CREATEROLE;
GRANT moneyverse_migrator TO postgres;
GRANT moneyverse_app TO moneyverse_migrator WITH ADMIN OPTION;
ALTER SCHEMA public OWNER TO moneyverse_migrator;
GRANT ALL ON DATABASE postgres TO moneyverse_migrator;
ALTER DATABASE postgres OWNER TO moneyverse_migrator;
SQL
sql -c "SET ROLE moneyverse_migrator" -f - < "$ROOT/packages/database/init/001-economy-core.sql" >/dev/null
count=0
for file in "$ROOT"/packages/database/migrations/[0-9][0-9][0-9]-*.sql; do
  if [[ "$MODE" == baseline && "$file" == */321-* ]]; then continue; fi
  if [[ "$file" == */017-* || "$file" == */020-* ]]; then
    sql -f - < "$file" >/dev/null || { echo "Migration failed: $file" >&2; exit 1; }
  else
    sql -c "SET ROLE moneyverse_migrator" -f - < "$file" >/dev/null || { echo "Migration failed: $file" >&2; exit 1; }
  fi
  count=$((count + 1))
done
echo "Applied $count numbered migrations ($MODE)"
sql -c "SET ROLE moneyverse_migrator" -f - < "$ROOT/packages/database/test/season-settle-app-execute-acl.pg.sql"
echo "PASS: app EXECUTE revoked, PUBLIC revoked, owner retained, direct call denied"
