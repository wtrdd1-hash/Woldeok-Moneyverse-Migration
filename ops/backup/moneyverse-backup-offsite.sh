#!/usr/bin/env bash
set -euo pipefail
umask 077

ARCHIVE="${1:?usage: moneyverse-backup-offsite.sh ARCHIVE}"
OFFSITE_REMOTE="${OFFSITE_REMOTE:?OFFSITE_REMOTE is required (for example: remote:moneyverse)}"

fail() { echo "offsite-backup: $*" >&2; exit 1; }
command -v rclone >/dev/null || fail "rclone is required"
command -v sha256sum >/dev/null || fail "sha256sum is required"
[[ -f "$ARCHIVE" && -f "$ARCHIVE.sha256" ]] || fail "archive/checksum missing"
[[ "$OFFSITE_REMOTE" == *:* ]] || fail "OFFSITE_REMOTE must be an rclone remote, not a local path"
[[ "$OFFSITE_REMOTE" != *$'\n'* && "$OFFSITE_REMOTE" != *$'\r'* ]] || fail "invalid OFFSITE_REMOTE"

DIR="$(dirname "$ARCHIVE")"
BASE="$(basename "$ARCHIVE")"
(cd "$DIR" && sha256sum -c "$BASE.sha256") >/dev/null
LOCAL_SHA="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
TARGET="${OFFSITE_REMOTE%/}/$BASE"
TARGET_SUM="$TARGET.sha256"

# --immutable is deliberate: a previously uploaded backup object must never be
# replaced in place. Corrections are new timestamped backup objects.
rclone copyto --immutable --no-traverse "$ARCHIVE" "$TARGET"
rclone copyto --immutable --no-traverse "$ARCHIVE.sha256" "$TARGET_SUM"
REMOTE_SHA="$(rclone cat "$TARGET" | sha256sum | awk '{print $1}')"
[[ "$REMOTE_SHA" == "$LOCAL_SHA" ]] || fail "remote checksum mismatch for $TARGET"

printf 'offsite-backup: OK archive=%s remote=%s sha256=%s immutable=true\n' "$ARCHIVE" "$TARGET" "$LOCAL_SHA"
