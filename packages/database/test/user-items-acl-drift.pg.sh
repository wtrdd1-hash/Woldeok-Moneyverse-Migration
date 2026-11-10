#!/usr/bin/env bash
# Read-only fail-closed ACL drift gate; DATABASE_URL must point at the intended DB.
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
command -v psql >/dev/null || { echo 'BLOCKED: psql unavailable' >&2; exit 2; }
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# psql's ON_ERROR_STOP fails closed on missing role/table and query errors.
# Read-only transaction prevents accidental changes to the target database.

result="$(psql "$DATABASE_URL" -X -q -A -t -v ON_ERROR_STOP=1 -c 'BEGIN READ ONLY' -f "$SCRIPT_DIR/user-items-acl-schema-presence.verify.sql" -f "$SCRIPT_DIR/user-items-acl-drift.readonly.sql" -c 'ROLLBACK')"
if [[ -n "$result" ]]; then
  printf 'FAIL: user_items app-role ACL drift detected:\n%s\n' "$result" >&2
  exit 1
fi
echo 'PASS: user_items app-role table ACL has no unexpected grants'
