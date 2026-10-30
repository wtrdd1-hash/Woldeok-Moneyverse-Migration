#!/usr/bin/env bash
# Full-schema, isolated PostgreSQL test. Never uses shared/production DB.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
NAME="mv-b-v663-bond-owner-pg-$$"
PASSWORD="$(openssl rand -hex 24)"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --rm -d --network none --name "$NAME" -e POSTGRES_PASSWORD="$PASSWORD" postgres:17.11 >/dev/null
ready=0
for _ in $(seq 1 60); do
  if docker exec "$NAME" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.5
done
if [ "$ready" -ne 1 ]; then echo 'PostgreSQL readiness timeout' >&2; exit 1; fi
sql() { docker exec -i "$NAME" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }
sql <<'SQL'
CREATE ROLE moneyverse_app NOINHERIT;
CREATE ROLE moneyverse_migrator NOINHERIT CREATEROLE;
GRANT moneyverse_migrator TO postgres;
GRANT moneyverse_app TO moneyverse_migrator WITH ADMIN OPTION;
ALTER SCHEMA public OWNER TO moneyverse_migrator;
GRANT ALL ON DATABASE postgres TO moneyverse_migrator;
ALTER DATABASE postgres OWNER TO moneyverse_migrator;
SQL
sql -c 'SET ROLE moneyverse_migrator' -f - < "$ROOT/packages/database/init/001-economy-core.sql" >/dev/null
for file in "$ROOT"/packages/database/migrations/[0-9][0-9][0-9]-*.sql; do
  # 017 creates a protected group; CREATEROLE auto-membership is forbidden by 020.
  if [[ "$file" == */017-* || "$file" == */020-* ]]; then
    sql -f - < "$file" >/dev/null || { echo "Migration failed: $file" >&2; exit 1; }
  else
    sql -c 'SET ROLE moneyverse_migrator' -f - < "$file" >/dev/null || { echo "Migration failed: $file" >&2; exit 1; }
  fi
done
sql -c 'SET ROLE moneyverse_migrator' -f - < "$ROOT/packages/database/test/treasury-bond-owner-read-acl.pg.sql"
