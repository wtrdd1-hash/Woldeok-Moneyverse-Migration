#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${MONEYVERSE_ISOLATED_PG_URL:-}" ]]; then
  echo 'BLOCKED: explicit isolated PostgreSQL URL required' >&2
  exit 2
fi
root="$(cd "$(dirname "$0")/../../.." && pwd)"
result="$(psql "$MONEYVERSE_ISOLATED_PG_URL" -X -A -t -v ON_ERROR_STOP=1 -f "$root/packages/database/test/global-function-default-acl.readonly.sql")"
if [[ -n "$result" ]]; then
  printf 'FAIL: unsafe global function defaults:\n%s\n' "$result" >&2
  exit 1
fi
echo 'PASS: no implicit PUBLIC EXECUTE for migrator-created functions'
