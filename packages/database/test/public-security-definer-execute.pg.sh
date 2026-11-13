#!/usr/bin/env bash
# Read-only; requires an explicit isolated/test database URL, never defaults to DEV/Production.
set -euo pipefail
if [[ -z "${MONEYVERSE_ISOLATED_PG_URL:-}" ]]; then
  echo 'BLOCKED: MONEYVERSE_ISOLATED_PG_URL must name an isolated PostgreSQL database' >&2
  exit 2
fi
root="$(cd "$(dirname "$0")/../../.." && pwd)"
results="$(psql "$MONEYVERSE_ISOLATED_PG_URL" -X -A -t -v ON_ERROR_STOP=1 \
  -f "$root/packages/database/test/public-security-definer-execute.readonly.sql")"
if [[ -n "$results" ]]; then
  printf 'FAIL: PUBLIC can execute SECURITY DEFINER functions:\n%s\n' "$results" >&2
  exit 1
fi
echo 'PASS: no PUBLIC-executable SECURITY DEFINER functions'
