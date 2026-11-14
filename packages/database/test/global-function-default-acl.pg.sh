#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${MONEYVERSE_ISOLATED_PG_URL:-}" ]]; then
  echo 'BLOCKED: explicit isolated PostgreSQL URL required' >&2
  exit 2
fi
root="$(cd "$(dirname "$0")/../../.." && pwd)"
violations="$(psql "$MONEYVERSE_ISOLATED_PG_URL" -X -A -t -v ON_ERROR_STOP=1 -f "$root/packages/database/test/global-function-default-acl.readonly.sql")"
if [[ -n "$violations" ]]; then
  printf 'FAIL: %s\n' "$violations" >&2
  exit 1
fi
echo 'PASS: global function defaults deny PUBLIC EXECUTE'
