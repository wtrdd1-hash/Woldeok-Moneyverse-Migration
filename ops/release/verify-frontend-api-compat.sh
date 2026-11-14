#!/usr/bin/env bash
# Fail closed if the selected Next.js API backend cannot serve the pre-migration authentication contract.
set -euo pipefail
origin="${1:?Usage: verify-frontend-api-compat.sh http://127.0.0.1:PORT}"
case "$origin" in
  http://127.0.0.1:[0-9]*|http://localhost:[0-9]*) ;;
  *) echo 'FAIL: API origin must be an explicit loopback HTTP endpoint' >&2; exit 2 ;;
esac
if [[ ! -n "${INTERNAL_API_TOKEN:-}" ]]; then
  echo 'FAIL: INTERNAL_API_TOKEN is missing' >&2
  exit 2
fi
checks=(
  '/api/v1/auth/policy:200'
  '/api/v1/auth/session:401'
  '/api/v1/admin/security:401'
  '/api/v1/stocks:200'
)
for check in "${checks[@]}"; do
  path="${check%:*}"
  expected="${check##*:}"
  actual="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    --connect-timeout 2 --max-time 6 \
    --header "x-internal-token: ${INTERNAL_API_TOKEN}" \
    --header 'Accept: application/json' "${origin}${path}")" || {
      echo "FAIL: ${path}: unreachable" >&2
      exit 1
    }
  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL: ${path}: expected ${expected}, received ${actual}" >&2
    exit 1
  fi
  echo "PASS: ${path} -> ${actual}"
done
printf 'PASS: authentication and public-read API compatibility at %s\n' "$origin"
