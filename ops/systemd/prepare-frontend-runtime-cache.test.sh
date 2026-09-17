#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELPER="$SCRIPT_DIR/prepare-frontend-runtime-cache.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
chmod 0755 "$TMP"

RUNTIME_USER="$(id -un)"
RUNTIME_GROUP="$(id -gn)"
ROOT="$TMP/releases"
RELEASE="$ROOT/test-example"
mkdir -p "$RELEASE/frontend/.next/cache/fetch-cache"
printf stale >"$RELEASE/frontend/.next/cache/fetch-cache/existing"

MONEYVERSE_RELEASES_ROOT="$ROOT" \
  "$HELPER" "$RELEASE" "$RUNTIME_USER" "$RUNTIME_GROUP"

test -w "$RELEASE/frontend/.next/cache/fetch-cache"
[[ "$(stat -c '%U:%G' "$RELEASE/frontend/.next/cache")" == "$RUNTIME_USER:$RUNTIME_GROUP" ]]

OUTSIDE="$TMP/outside"
mkdir -p "$OUTSIDE/frontend/.next"
if MONEYVERSE_RELEASES_ROOT="$ROOT" "$HELPER" "$OUTSIDE" "$RUNTIME_USER" "$RUNTIME_GROUP" 2>/dev/null; then
  echo 'expected outside-root release rejection' >&2
  exit 1
fi

printf 'prepare-frontend-runtime-cache: tests passed\n'
