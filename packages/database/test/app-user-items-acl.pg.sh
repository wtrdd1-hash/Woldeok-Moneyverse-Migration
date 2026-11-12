#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
export PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-10}"
export PGOPTIONS="${PGOPTIONS:+$PGOPTIONS }-c statement_timeout=15000 -c lock_timeout=5000"
command -v psql >/dev/null || { echo 'BLOCKED: psql unavailable' >&2; exit 2; }
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
result="$(psql "$DATABASE_URL" -X -q -A -t -v ON_ERROR_STOP=1 \
  -c 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' \
  -f "$script_dir/app-user-items-acl.readonly.sql" \
  -c "SELECT 'USER_ITEMS_ACL_GATE_COMPLETE_v1'" -c 'ROLLBACK')"
proof="$(printf '%s\n' "$result" | grep -Fxc 'USER_ITEMS_ACL_GATE_COMPLETE_v1' || true)"
if [[ "$proof" != 1 ]]; then
  echo 'BLOCKED: user_items ACL completion proof missing or duplicated' >&2
  exit 2
fi
result="$(printf '%s\n' "$result" | grep -Fxv 'USER_ITEMS_ACL_GATE_COMPLETE_v1' || true)"
if [[ -n "$result" ]]; then
  printf 'FAIL: moneyverse_app has forbidden direct user_items privileges:\n%s\n' "$result" >&2
  exit 1
fi
echo 'PASS: moneyverse_app has no direct user_items table privileges'
