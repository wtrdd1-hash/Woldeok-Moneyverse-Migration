#!/usr/bin/env bash
set -euo pipefail
repo="$(cd "$(dirname "$0")/../.." && pwd -P)"
sql="$repo/scripts/release/verify-security-definer-path.sql"
: "${EXPECTED_DATABASE:?Set EXPECTED_DATABASE to the exact intended database name}"
# PG_CONTAINER is for an explicitly selected Docker PostgreSQL instance; otherwise
# use libpq PG* environment variables without exposing a credential in argv.
if [[ -n "${PG_CONTAINER:-}" ]]; then
  docker exec -i "$PG_CONTAINER" sh -c 'exec psql -X -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" -v ON_ERROR_STOP=1 -v expected_database="$1"' sh "$EXPECTED_DATABASE" < "$sql"
else
  command -v psql >/dev/null || { echo "BLOCKED: psql client unavailable" >&2; exit 2; }
  psql -X -v ON_ERROR_STOP=1 -v expected_database="$EXPECTED_DATABASE" < "$sql"
fi
