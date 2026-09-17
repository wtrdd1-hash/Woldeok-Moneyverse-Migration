#!/usr/bin/env bash
set -euo pipefail

RELEASE_DIR="${1:?usage: prepare-frontend-runtime-cache.sh RELEASE_DIR [RUNTIME_USER] [RUNTIME_GROUP]}"
RUNTIME_USER="${2:-debian}"
RUNTIME_GROUP="${3:-$RUNTIME_USER}"
RELEASES_ROOT="${MONEYVERSE_RELEASES_ROOT:-/srv/moneyverse-data/releases}"

fail() {
  printf 'frontend-cache: %s\n' "$*" >&2
  exit 1
}

command -v realpath >/dev/null || fail 'realpath is required'
id "$RUNTIME_USER" >/dev/null 2>&1 || fail "runtime user does not exist: $RUNTIME_USER"
getent group "$RUNTIME_GROUP" >/dev/null 2>&1 || fail "runtime group does not exist: $RUNTIME_GROUP"

ROOT_REAL="$(realpath -e "$RELEASES_ROOT")"
RELEASE_REAL="$(realpath -e "$RELEASE_DIR")"
case "$RELEASE_REAL/" in
  "$ROOT_REAL/"*) ;;
  *) fail "release must be below $ROOT_REAL" ;;
esac

NEXT_DIR="$RELEASE_REAL/frontend/.next"
[[ -d "$NEXT_DIR" ]] || fail "Next.js build directory is missing: $NEXT_DIR"
CACHE_DIR="$NEXT_DIR/cache"
FETCH_CACHE_DIR="$CACHE_DIR/fetch-cache"
install -d -m 0755 "$CACHE_DIR" "$FETCH_CACHE_DIR"
if [[ "$(id -u)" -eq 0 ]]; then
  chown -R "$RUNTIME_USER:$RUNTIME_GROUP" "$CACHE_DIR"
elif [[ "$(id -un)" != "$RUNTIME_USER" ]]; then
  fail "run as root or as $RUNTIME_USER"
fi

PROBE="$FETCH_CACHE_DIR/.runtime-write-probe.$$"
cleanup() { rm -f "$PROBE"; }
trap cleanup EXIT

if [[ "$(id -un)" == "$RUNTIME_USER" ]]; then
  : >"$PROBE"
elif [[ "$(id -u)" -eq 0 ]]; then
  command -v runuser >/dev/null || fail 'runuser is required for runtime-user verification'
  runuser -u "$RUNTIME_USER" -- sh -c ': > "$1"' sh "$PROBE" || \
    fail "$RUNTIME_USER cannot write $FETCH_CACHE_DIR"
else
  fail "cannot verify runtime-user write access"
fi

rm -f "$PROBE"
trap - EXIT
printf 'frontend-cache: OK release=%s cache=%s owner=%s:%s\n' \
  "$RELEASE_REAL" "$CACHE_DIR" "$RUNTIME_USER" "$RUNTIME_GROUP"
