#!/usr/bin/env bash
set -euo pipefail
umask 077
ARCHIVE="${1:?usage: moneyverse-backup-verify.sh ARCHIVE}"
BACKUP_KEY_FILE="${BACKUP_KEY_FILE:-/etc/moneyverse/backup.key}"
BACKUP_DB_CONTAINER="${BACKUP_DB_CONTAINER:-woldeok-moneyverse-dev-db-1}"
[[ -f "$ARCHIVE" && -f "$ARCHIVE.sha256" ]] || { echo 'verify: archive/checksum missing' >&2; exit 1; }
(cd "$(dirname "$ARCHIVE")" && sha256sum -c "$(basename "$ARCHIVE").sha256")
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 -pass file:"$BACKUP_KEY_FILE" -in "$ARCHIVE" | zstd -q -d | tar -C "$TMP" -xf -
(cd "$TMP" && sha256sum -c SHA256SUMS)
docker exec -i "$BACKUP_DB_CONTAINER" sh -lc 'pg_restore -l >/dev/null' < "$TMP/database.dump"
zstd -q -t "$TMP/photos.tar.zst"
grep -q '^format=moneyverse-backup-v1$' "$TMP/manifest.txt"
printf 'verify: OK %s\n' "$ARCHIVE"
