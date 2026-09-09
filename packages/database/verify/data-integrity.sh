#!/bin/sh
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
psql -X -v ON_ERROR_STOP=1 -f "$script_dir/data-integrity.sql"
