#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
SHA=0123456789abcdef0123456789abcdef01234567
"$SCRIPT_DIR/write-test-release-env.sh" "$SHA" "$TMP"
grep -qx "PORT=3100" "$TMP/test-backend-release.env"
grep -qx "BUILD_ID=$SHA" "$TMP/test-backend-release.env"
grep -qx "API_ORIGIN=http://127.0.0.1:3100" "$TMP/test-frontend-release.env"
grep -qx "BUILD_ID=$SHA" "$TMP/test-frontend-release.env"
! grep -q "DATABASE_URL\|TOKEN\|SECRET\|PASSWORD" "$TMP/test-backend-release.env"
if "$SCRIPT_DIR/write-test-release-env.sh" not-a-sha "$TMP" >/dev/null 2>&1; then
  echo "expected invalid SHA rejection" >&2
  exit 1
fi
printf "write-test-release-env: tests passed\n"
