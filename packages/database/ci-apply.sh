#!/bin/sh
# Creates the least-privileged application role and applies every numbered
# migration, in the same order and with the same checksum discipline as the
# production migrate.sh. Used by CI, which has a PostgreSQL service.
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"

script_dir="$(cd "$(dirname "$0")" && pwd)"

POSTGRES_USER="$PGUSER" POSTGRES_DB="$PGDATABASE" APP_DB_PASSWORD="$APP_DB_PASSWORD" \
  sh "$script_dir/init/000-create-app-role.sh"

psql -X -v ON_ERROR_STOP=1 -f "$script_dir/init/001-economy-core.sql"

# Production keeps the default /migrations bind mount. CI and local worktrees
# pass their own checkout explicitly so a stale host-level symlink cannot make
# a fresh-database test silently stop at an older migration set.
MIGRATIONS_DIR="$script_dir/migrations" sh "$script_dir/migrate.sh"
