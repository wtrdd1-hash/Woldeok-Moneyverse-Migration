#!/usr/bin/env bash
# Read-only production data integrity audit. Emits aggregate figures only.
set -euo pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "${DEPLOY_DIR:-$script_dir}"
[ -f .env ] || { echo "no .env in $PWD" >&2; exit 1; }

stack="${STACK:-$(grep -E '^STACK=' .env | tail -1 | cut -d= -f2-)}"
stack="${stack:-wdmv}"
export STACK="$stack"

for tool in docker grep date; do command -v "$tool" >/dev/null || { echo "$tool is required" >&2; exit 1; }; done
[ -f data-audit.sql ] || { echo "data-audit.sql is missing" >&2; exit 1; }

result="$(docker compose run --rm -T backup psql -X -qAt -v ON_ERROR_STOP=1 -f - < data-audit.sql)"
[ -n "$result" ] || { echo "data audit returned no result" >&2; exit 1; }

# Avoid jq as a host dependency. The SQL emits a canonical JSON boolean.
printf '%s\n' "$result"
if ! printf '%s' "$result" | grep -Eq '"healthy"[[:space:]]*:[[:space:]]*true'; then
  echo "DATA AUDIT FAILED: one or more integrity invariants are violated" >&2
  exit 2
fi

echo "data audit healthy at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >&2
