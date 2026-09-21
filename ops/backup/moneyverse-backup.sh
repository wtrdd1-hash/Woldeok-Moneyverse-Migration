#!/usr/bin/env bash
set -euo pipefail
umask 077

BACKUP_DEST="${BACKUP_DEST:-/var/backups/moneyverse}"
BACKUP_DB_CONTAINER="${BACKUP_DB_CONTAINER:-woldeok-moneyverse-dev-db-1}"
BACKUP_PHOTO_DIR="${BACKUP_PHOTO_DIR:-/srv/moneyverse-data/images/photos}"
BACKUP_KEY_FILE="${BACKUP_KEY_FILE:-/etc/moneyverse/backup.key}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
HOST="$(hostname -s)"
NAME="moneyverse-${HOST}-${STAMP}"

fail() { echo "backup: $*" >&2; exit 1; }
command -v docker >/dev/null || fail "docker is required"
command -v openssl >/dev/null || fail "openssl is required"
command -v zstd >/dev/null || fail "zstd is required"
[[ -d "$BACKUP_PHOTO_DIR" ]] || fail "photo source missing: $BACKUP_PHOTO_DIR"
[[ -f "$BACKUP_KEY_FILE" ]] || fail "encryption key missing: $BACKUP_KEY_FILE"
[[ "$(stat -c '%a' "$BACKUP_KEY_FILE")" == "600" ]] || fail "backup key must be mode 600"
docker inspect "$BACKUP_DB_CONTAINER" >/dev/null 2>&1 || fail "database container unavailable"
mkdir -p "$BACKUP_DEST"
chmod 700 "$BACKUP_DEST"

DB_HOST_PATH="$(docker inspect "$BACKUP_DB_CONTAINER" --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Source}}{{end}}{{end}}')"
[[ -n "$DB_HOST_PATH" ]] || fail "cannot resolve database data mount"
DEST_DEV="$(findmnt -T "$BACKUP_DEST" -n -o SOURCE)"
DB_DEV="$(findmnt -T "$DB_HOST_PATH" -n -o SOURCE)"
PHOTO_DEV="$(findmnt -T "$BACKUP_PHOTO_DIR" -n -o SOURCE)"
[[ "$DEST_DEV" != "$DB_DEV" ]] || fail "backup destination shares database filesystem ($DEST_DEV)"
[[ "$DEST_DEV" != "$PHOTO_DEV" ]] || fail "backup destination shares photo filesystem ($DEST_DEV)"

WORK="$(mktemp -d "$BACKUP_DEST/.${NAME}.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT

docker exec "$BACKUP_DB_CONTAINER" sh -lc 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$WORK/database.dump"
tar -C "$BACKUP_PHOTO_DIR" -cf - . | zstd -q -T0 -3 -o "$WORK/photos.tar.zst"
cat > "$WORK/manifest.txt" <<MANIFEST
backup_name=$NAME
created_at_utc=$(date -u +%FT%TZ)
host=$HOST
database_container=$BACKUP_DB_CONTAINER
database_device=$DB_DEV
photo_device=$PHOTO_DEV
backup_device=$DEST_DEV
retention_days=$BACKUP_RETENTION_DAYS
format=moneyverse-backup-v1
MANIFEST
(cd "$WORK" && sha256sum database.dump photos.tar.zst manifest.txt > SHA256SUMS)

tar -C "$WORK" -cf - database.dump photos.tar.zst manifest.txt SHA256SUMS | zstd -q -T0 -6 | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -md sha256 -pass file:"$BACKUP_KEY_FILE" \
  -out "$BACKUP_DEST/${NAME}.tar.zst.enc.partial"
mv "$BACKUP_DEST/${NAME}.tar.zst.enc.partial" "$BACKUP_DEST/${NAME}.tar.zst.enc"
sha256sum "$BACKUP_DEST/${NAME}.tar.zst.enc" > "$BACKUP_DEST/${NAME}.tar.zst.enc.sha256"

"$(dirname "$0")/moneyverse-backup-verify.sh" "$BACKUP_DEST/${NAME}.tar.zst.enc"
if [[ -n "${OFFSITE_REMOTE:-}" ]]; then
  "$(dirname "$0")/moneyverse-backup-offsite.sh" "$BACKUP_DEST/${NAME}.tar.zst.enc"
fi
find "$BACKUP_DEST" -maxdepth 1 -type f -name 'moneyverse-*.tar.zst.enc' -mtime "+$BACKUP_RETENTION_DAYS" -delete
find "$BACKUP_DEST" -maxdepth 1 -type f -name 'moneyverse-*.tar.zst.enc.sha256' -mtime "+$BACKUP_RETENTION_DAYS" -delete
printf 'backup: verified %s\n' "$BACKUP_DEST/${NAME}.tar.zst.enc"
