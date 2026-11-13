#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL required}"
command -v psql >/dev/null || { echo 'BLOCKED: psql unavailable' >&2; exit 2; }
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PGCONNECT_TIMEOUT="${PGCONNECT_TIMEOUT:-10}"
export PGOPTIONS="${PGOPTIONS:+$PGOPTIONS }-c statement_timeout=15000 -c lock_timeout=5000"
result="$(psql "$DATABASE_URL" -X -q -A -t -v ON_ERROR_STOP=1 \
  -c 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' \
  -f "$script_dir/app-default-acl.readonly.sql" \
  -c "SELECT 'DEFAULT_ACL_GATE_COMPLETE_v1'" -c 'ROLLBACK')"
proof="$(printf '%s\n' "$result" | grep -Fxc 'DEFAULT_ACL_GATE_COMPLETE_v1' || true)"
if [[ "$proof" != 1 ]]; then echo 'BLOCKED: completion proof missing or duplicated' >&2; exit 2; fi
violations="$(printf '%s\n' "$result" | grep -Fxv 'DEFAULT_ACL_GATE_COMPLETE_v1' || true)"
if [[ -n "$violations" ]]; then printf 'FAIL: forbidden future-object app grants:\n%s\n' "$violations" >&2; exit 1; fi
echo 'PASS: no forbidden app default grants from migrator'
