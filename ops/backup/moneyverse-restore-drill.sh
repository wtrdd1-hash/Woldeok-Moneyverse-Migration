#!/usr/bin/env bash
set -euo pipefail
umask 077

SOURCE="${1:?usage: moneyverse-restore-drill.sh ARCHIVE_OR_RCLONE_REMOTE}"
BACKUP_KEY_FILE="${BACKUP_KEY_FILE:-/etc/moneyverse/backup.key}"
RESTORE_IMAGE="${RESTORE_IMAGE:-postgres:17.11-alpine}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$(cd "$(dirname "$0")/../.." && pwd)/packages/database/migrations}"
[[ -f "$BACKUP_KEY_FILE" ]] || { echo 'restore-drill: encryption key missing' >&2; exit 1; }
command -v docker >/dev/null || { echo 'restore-drill: docker is required' >&2; exit 1; }
command -v sha256sum >/dev/null || { echo 'restore-drill: sha256sum is required' >&2; exit 1; }

TMP="$(mktemp -d)"
NAME="moneyverse-restore-drill-$$"
PASSWORD="$(openssl rand -hex 24)"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT

SOURCE_KIND=local
ARCHIVE="$SOURCE"
if [[ "$SOURCE" == *:* && ! -f "$SOURCE" ]]; then
  SOURCE_KIND=offsite
  command -v rclone >/dev/null || { echo 'restore-drill: rclone is required for off-host restore' >&2; exit 1; }
  [[ "$SOURCE" != *$'\n'* && "$SOURCE" != *$'\r'* ]] || { echo 'restore-drill: invalid off-host source' >&2; exit 1; }
  BASE="$(basename "$SOURCE")"
  [[ "$BASE" == moneyverse-*.tar.zst.enc ]] || { echo 'restore-drill: unexpected off-host archive name' >&2; exit 1; }
  ARCHIVE="$TMP/$BASE"
  rclone copyto --no-traverse "$SOURCE" "$ARCHIVE"
  rclone copyto --no-traverse "$SOURCE.sha256" "$ARCHIVE.sha256"
fi

[[ -f "$ARCHIVE" && -f "$ARCHIVE.sha256" ]] || { echo 'restore-drill: archive/checksum missing' >&2; exit 1; }
if [[ "$SOURCE_KIND" == offsite ]]; then
  EXPECTED_SHA="$(awk 'NR==1 {print $1}' "$ARCHIVE.sha256")"
  [[ "$EXPECTED_SHA" =~ ^[0-9a-fA-F]{64}$ ]] || { echo 'restore-drill: invalid off-host checksum sidecar' >&2; exit 1; }
  ACTUAL_SHA="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
  [[ "${ACTUAL_SHA,,}" == "${EXPECTED_SHA,,}" ]] || { echo 'restore-drill: off-host archive checksum mismatch' >&2; exit 1; }
else
  (cd "$(dirname "$ARCHIVE")" && sha256sum -c "$(basename "$ARCHIVE").sha256")
fi
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 -pass file:"$BACKUP_KEY_FILE" -in "$ARCHIVE" | zstd -q -d | tar -C "$TMP" -xf -
(cd "$TMP" && sha256sum -c SHA256SUMS)
grep -q '^format=moneyverse-backup-v1$' "$TMP/manifest.txt"

docker run -d --rm --name "$NAME" --network none -e POSTGRES_PASSWORD="$PASSWORD" -e POSTGRES_DB=restore "$RESTORE_IMAGE" >/dev/null
for _ in $(seq 1 60); do
  docker exec -e PGPASSWORD="$PASSWORD" "$NAME" pg_isready -U postgres -d restore >/dev/null 2>&1 && break
  sleep 1
done
docker exec -e PGPASSWORD="$PASSWORD" "$NAME" pg_isready -U postgres -d restore >/dev/null

docker exec -i -e PGPASSWORD="$PASSWORD" "$NAME" pg_restore -U postgres -d restore --no-owner --no-privileges --exit-on-error < "$TMP/database.dump"
SQL="SELECT CASE WHEN to_regclass('public.schema_migrations') IS NULL THEN 1 ELSE 0 END;"
[[ "$(docker exec -e PGPASSWORD="$PASSWORD" "$NAME" psql -X -U postgres -d restore -Atc "$SQL")" == 0 ]] || { echo 'restore-drill: schema_migrations missing' >&2; exit 1; }

expected="$(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -printf '%f\n' | sort)"
actual="$(docker exec -e PGPASSWORD="$PASSWORD" "$NAME" psql -X -U postgres -d restore -Atc 'SELECT filename FROM public.schema_migrations ORDER BY filename')"
[[ "$actual" == "$expected" ]] || { diff -u <(printf '%s\n' "$expected") <(printf '%s\n' "$actual") >&2 || true; echo 'restore-drill: migration set mismatch' >&2; exit 1; }

orphan="$(docker exec -e PGPASSWORD="$PASSWORD" "$NAME" psql -X -U postgres -d restore -Atc 'SELECT count(*) FROM public.ledger_postings p LEFT JOIN public.ledger_transactions t ON t.id=p.transaction_id WHERE t.id IS NULL')"
[[ "$orphan" == 0 ]] || { echo "restore-drill: orphan ledger postings=$orphan" >&2; exit 1; }
unbalanced="$(docker exec -e PGPASSWORD="$PASSWORD" "$NAME" psql -X -U postgres -d restore -Atc "SELECT count(*) FROM (SELECT transaction_id FROM public.ledger_postings GROUP BY transaction_id HAVING sum(CASE WHEN direction='credit' THEN amount ELSE -amount END) <> 0) q")"
[[ "$unbalanced" == 0 ]] || { echo "restore-drill: unbalanced ledger transactions=$unbalanced" >&2; exit 1; }

created="$(sed -n 's/^created_at_utc=//p' "$TMP/manifest.txt")"
printf 'restore-drill: OK source=%s source_kind=%s created_at=%s migrations=%s orphan_postings=0 unbalanced_transactions=0 network=none\n' "$SOURCE" "$SOURCE_KIND" "$created" "$(printf '%s\n' "$actual" | wc -l)"
