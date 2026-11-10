#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL required}"
cd "$(dirname "$0")"
# Fail closed on SQL errors and never commit database changes.
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c 'BEGIN READ ONLY' -f user-items-acl-schema-presence.verify.sql -c 'ROLLBACK'
