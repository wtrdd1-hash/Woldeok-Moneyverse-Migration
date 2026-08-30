#!/usr/bin/env bash
# Puts one backup back, into a database of its own, and then proves it worked.
#
# Restoring into a NEW database rather than over the live one is the whole
# shape of this script. `docker compose up db` on an empty server runs
# packages/database/init, so the database named in .env already holds the core
# schema before anything is restored into it; a dump replayed on top of that
# collides on the first CREATE TABLE. A fresh database has none of that, costs
# nothing to throw away after a rehearsal, and means a mistake here cannot
# destroy the copy the site is serving.
#
#   restore.sh <backup>                    into <db>_restore_<stamp>
#   restore.sh <backup> --into <db>        into a database you name
#   restore.sh <backup> --photos           also put the photo objects back
#
# <backup> is a file name from `backup.sh list`, with or without the directory
# and with or without the .sql.gz.enc suffix.
#
# What it does NOT do is repoint the deployment: after a successful restore it
# prints the two steps that do, so that decision stays with a person. Photo
# objects are opt-in for the same reason -- there is one photo store, and
# a rehearsal must not write into the one the live site is reading.
#
# docs/BACKUP.md is the procedure this belongs to.
set -euo pipefail

die() { echo "$*" >&2; exit 1; }

usage() {
  cat <<'TEXT'
restore.sh <backup> [--into <database>] [--photos] [--yes]

  --into <database>   restore into this database instead of a generated name
  --photos            also restore the photo objects into the host photo store
  --yes               skip the confirmation prompt (for a scripted rehearsal)

Reads DEPLOY_DIR, BACKUP_DIR, BACKUP_ENCRYPTION_KEY_FILE and
BACKUP_ENCRYPTION_KEY the same way backup.sh does.
TEXT
}

backup_arg=''
target=''
restore_photos=false
assume_yes=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --into) target="${2:-}"; shift 2 ;;
    --photos) restore_photos=true; shift ;;
    --yes) assume_yes=true; shift ;;
    -h | --help) usage; exit 0 ;;
    -*) usage >&2; die "unknown option: $1" ;;
    *) backup_arg="$1"; shift ;;
  esac
done
[ -n "$backup_arg" ] || { usage >&2; die "name the backup to restore"; }

cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"
[ -f .env ] || die "no .env in $PWD -- this is not a deployment directory"

env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2-; }

stack="${STACK:-$(env_value STACK)}"
stack="${stack:-wdmv}"
db_name="${DB_NAME:-$(env_value DB_NAME)}"
[ -n "$db_name" ] || die "DB_NAME is set neither in the environment nor in $PWD/.env"
backup_dir="${BACKUP_DIR:-$(env_value BACKUP_DIR)}"
backup_dir="${backup_dir:-$HOME/moneyverse-backups/$stack}"
key_file="${BACKUP_ENCRYPTION_KEY_FILE:-$HOME/.moneyverse-backup-key}"
export STACK="$stack"
umask 077

for tool in docker openssl gzip sha256sum; do
  command -v "$tool" >/dev/null 2>&1 || die "$tool is required and is not on PATH"
done

# Interpolated into SQL below, so it is checked rather than trusted. Lower case
# because an unquoted identifier folds to it, and a name that only matches
# after folding would leave two different spellings of the same database in the
# operator's notes.
target="${target:-${db_name}_restore_$(date -u +%Y%m%d%H%M%S)}"
case "$target" in
  *[!a-z0-9_]* | '' | [!a-z_]*) die "--into must be a lower-case SQL identifier: $target" ;;
esac

manifest="$backup_arg"
case "$manifest" in */*) : ;; *) manifest="$backup_dir/$manifest" ;; esac
case "$manifest" in
  *.manifest.json) : ;;
  *) manifest="${manifest%.sql.gz.enc}.manifest.json" ;;
esac
[ -f "$manifest" ] || die "no manifest at $manifest -- run backup.sh list"
dir="$(dirname "$manifest")"

manifest_string() { sed -n "s/^  \"$2\": \"\\(.*\\)\",\\{0,1\\}\$/\\1/p" "$1" | head -1; }
manifest_raw() { sed -n "s/^  \"$2\": \\(.*\\)\$/\\1/p" "$1" | head -1 | sed 's/,$//'; }
# The key prefix is stripped by name rather than by "everything up to a colon":
# a cutoff value is full of colons, and the greedy form silently returned the
# seconds field of the timestamp.
figure_of() { printf '%s' "$1" | grep -o "\"$2\": *\"\\{0,1\\}[^,\"}]*" | head -1 | sed "s/^\"$2\": *\"\\{0,1\\}//"; }

sql_file="$(manifest_string "$manifest" sql_file)"
photos_file="$(manifest_string "$manifest" photos_file)"
recorded_sha="$(manifest_string "$manifest" sql_sha256)"
recorded_fingerprint="$(manifest_string "$manifest" key_fingerprint)"
recorded_figures="$(manifest_raw "$manifest" figures)"
cutoff="$(figure_of "$recorded_figures" cutoff)"
[ -f "$dir/$sql_file" ] || die "$manifest names $sql_file, which is not in $dir"
[ -n "$cutoff" ] || die "$manifest records no cutoff, so nothing could be compared afterwards"

# Same key handling as backup.sh: never from .env, never from beside the
# ciphertext. The two scripts repeat this rather than share a file because a
# deployment directory holding only one of the pair must still refuse safely.
if grep -qE '^BACKUP_ENCRYPTION_KEY=' .env; then
  die "BACKUP_ENCRYPTION_KEY is in $PWD/.env, where compose loads it into containers and the next deploy ships it. Move it to $key_file."
fi
if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  key="$BACKUP_ENCRYPTION_KEY"
else
  [ -f "$key_file" ] || die "no encryption key at $key_file"
  IFS= read -r key < "$key_file" || true
fi
[ "${#key}" -ge 32 ] || die "the encryption key is ${#key} characters: it must be at least 32"
export MONEYVERSE_BACKUP_PASS="$key"
key_fingerprint="$(printf '%s' "$key" | sha256sum | cut -c1-12)"
[ "$key_fingerprint" = "$recorded_fingerprint" ] || die \
  "$sql_file was written with key $recorded_fingerprint and this host holds $key_fingerprint"

decrypt() {
  openssl enc -d -aes-256-cbc -md sha256 -pbkdf2 -iter 600000 \
    -pass env:MONEYVERSE_BACKUP_PASS
}
# Runs as the postgres OS user inside the db container, which the image's
# pg_hba trusts over the local socket. That is what keeps the migrator's
# password off a command line and out of this host's process list.
migrator_psql() { docker compose exec -u postgres -T db psql -X -v ON_ERROR_STOP=1 "$@"; }

actual_sha="$(sha256sum < "$dir/$sql_file" | cut -d' ' -f1)"
[ "$actual_sha" = "$recorded_sha" ] || die \
  "$sql_file no longer matches the sha256 recorded when it was written"

echo "restoring $sql_file"
echo "  taken at:  $(manifest_string "$manifest" taken_at)  (cutoff $cutoff)"
echo "  from:      $(manifest_string "$manifest" stack) / $(manifest_string "$manifest" database)"
echo "  into:      $target on this host's db container"
if [ "$restore_photos" = true ]; then
  echo "  photos:    ${photos_file:-none in this backup} -> the live photo store"
fi
if [ "$assume_yes" != true ]; then
  printf 'Type the target database name to continue: '
  read -r answer
  [ "$answer" = "$target" ] || die "aborted"
fi

# Roles are cluster-wide and a dump does not carry them, so every grantee it
# mentions has to exist before the first GRANT or the whole transaction rolls
# back. init/000-create-app-role.sh makes moneyverse_app and initdb makes the
# migrator; the others come from migrations this database has not run yet.
# They are read out of the dump rather than listed here so that a role added by
# a later migration does not silently break a restore two years from now.
echo "checking the roles the dump grants to"
mapfile -t wanted < <(decrypt < "$dir/$sql_file" | gzip -cd | grep -ohE 'moneyverse_[a-z_]+' | sort -u)
for role in "${wanted[@]}"; do
  exists="$(migrator_psql -qAt -d postgres \
    -c "SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = '$role'")"
  if [ "$exists" != 1 ]; then
    # NOLOGIN and no password: this restores the privilege boundary the dump
    # describes, not a way in. deploy/seed.sh gives out the logins.
    migrator_psql -q -d postgres -c "CREATE ROLE $role NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS"
    echo "  created missing role $role"
  fi
done

echo "creating $target"
# template0, so the new database inherits nothing that a later dump statement
# would collide with.
migrator_psql -q -d postgres -c "CREATE DATABASE $target OWNER moneyverse_migrator TEMPLATE template0 ENCODING 'UTF8'"

# --single-transaction: a restore that fails halfway leaves an empty database
# and an error, not a half-populated one that looks plausible.
echo "replaying the dump"
decrypt < "$dir/$sql_file" | gzip -cd \
  | migrator_psql --single-transaction -q -d "$target" -f -

echo "recomputing the verification figures"
restored_figures="$(migrator_psql -qAt -d "$target" -v cutoff="$cutoff" -f - < backup-figures.sql)"

mismatch=0
if [ "$restored_figures" != "$recorded_figures" ]; then
  mismatch=1
  echo >&2
  echo "the restored figures differ from the ones recorded when the backup was taken:" >&2
  echo "  recorded: $recorded_figures" >&2
  echo "  restored: $restored_figures" >&2
fi
if [ "$(figure_of "$restored_figures" balance_mismatch_accounts)" != 0 ]; then
  mismatch=1
  echo "accounts whose balance disagrees with their own postings: $(figure_of "$restored_figures" balance_mismatch_accounts)" >&2
fi

if [ "$restore_photos" = true ] && [ -n "$photos_file" ]; then
  [ -f "$dir/$photos_file" ] || die "$manifest names $photos_file, which is not in $dir"
  echo "restoring the photo objects"
  # Unpacked by the backend container's own unprivileged user, which owns that
  # directory; nothing here runs as root, and the archive keeps the 0600 modes
  # the upload path wrote.
  decrypt < "$dir/$photos_file" | gzip -cd \
    | docker compose exec -T backend sh -c \
        'mkdir -m 700 -p /data/moneyverse/photos && exec tar -xf - -C /data/moneyverse/photos'
fi

if [ "$mismatch" != 0 ]; then
  die "restored into $target, but it does not match the manifest. Do not put this copy in front of anyone until the difference is explained."
fi

cat <<DONE

restored into $target and every figure matches the manifest:
  $restored_figures

The deployment is still pointed at $db_name. To move it:
  1. sed -i 's/^DB_NAME=.*/DB_NAME=$target/' $PWD/.env
  2. STACK=$stack docker compose up -d --wait
migrate.sh will find every migration already applied -- the dump carries
schema_migrations -- and seed.sh will hand out this deployment's credentials
again. Drop the restored database instead if this was a rehearsal.
DONE
