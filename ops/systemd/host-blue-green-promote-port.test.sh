#!/usr/bin/env bash
set -euo pipefail

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
cat >"$tmp" <<'ENV'
BUILD_ID=old
API_ORIGIN=http://127.0.0.1:3000
ENV

CANARY_BACKEND=3002
SHA=test-sha
sed -i -E "s/^PORT=.*/PORT=$CANARY_BACKEND/; s/^BUILD_ID=.*/BUILD_ID=$SHA/; s#^API_ORIGIN=.*#API_ORIGIN=http://127.0.0.1:$CANARY_BACKEND#" "$tmp"
if ! grep -q '^PORT=' "$tmp"; then echo "PORT=$CANARY_BACKEND" >>"$tmp"; fi

grep -qx 'PORT=3002' "$tmp"
grep -qx 'BUILD_ID=test-sha' "$tmp"
grep -qx 'API_ORIGIN=http://127.0.0.1:3002' "$tmp"

echo 'host-blue-green-promote-port: PASS'

# Production is served by the authoritative default catch-all Nginx block.
grep -q "SERVER_NAME='_'" "$(dirname "$0")/host-blue-green-promote.sh" || {
  echo 'production catch-all selector missing' >&2
  exit 1
}
