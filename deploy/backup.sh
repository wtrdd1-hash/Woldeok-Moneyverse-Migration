#!/usr/bin/env bash
# Takes, checks and expires this deployment's backups. Runs on the host, as
# the user that owns the deployment directory -- not in a container, and not
# as root.
#
# Everything the deployment holds that cannot be rebuilt is in two places: the
# `db-data` volume and the photo store on the host. A logical dump of the first and
# an archive of the second is the whole backup, and both are written to a host
# directory outside either volume, because a copy that shares a disk failure
# with its original is not a backup.
#
#   pg_dump  ->  gzip  ->  openssl enc  ->  BACKUP_DIR/<stack>-<db>-<stamp>...
#
# The dump is produced inside the `backup` compose service as
# `moneyverse_backup`, a role that may read every table and write none of them.
# Compression and encryption happen here, on the host, for two reasons: the
# plaintext dump never touches a disk, and BACKUP_ENCRYPTION_KEY never enters a
# container, an image, or the .env file Docker reads. The key does not live in
# the deployment directory either -- a key found beside the ciphertext, by
# whoever copied the ciphertext, is not doing anything.
#
# docs/BACKUP.md is the procedure, including the restore rehearsal.
set -euo pipefail

usage() {
  cat <<'TEXT'
backup.sh [run|verify|list|init-key]

  run                 take one backup, read it back, expire old ones (default)
  verify [<file>]     prove a backup still decrypts, matches and is fresh
  list                what is retained, without needing the key
  init-key            create the encryption key file, once

Settings come from the deployment's .env, and an environment variable wins:
DEPLOY_DIR, BACKUP_DIR, BACKUP_ENCRYPTION_KEY_FILE, BACKUP_ENCRYPTION_KEY,
BACKUP_COPY_TO, BACKUP_RETAIN_DAYS, BACKUP_RETAIN_WEEKS, BACKUP_MAX_AGE_HOURS,
BACKUP_INCLUDE_PHOTO_OBJECTS.
TEXT
}

# openssl enc has no authenticated cipher: it accepts `-aes-256-gcm` and then
# produces something it cannot itself verify, so AEAD was not on the table.
# Integrity is therefore the manifest's sha256 over the ciphertext plus gzip's
# own CRC over the plaintext, both checked by `verify`. Someone who can rewrite
# a backup file can rewrite the manifest beside it; what this defends against
# is a lost disk, a stolen copy, and bit rot.
readonly CIPHER_LABEL='aes-256-cbc/pbkdf2-sha256-600000'
readonly DUMP_SENTINEL='-- PostgreSQL database dump complete'

die() { echo "$*" >&2; exit 1; }

command="${1:-run}"
if [ "$#" -gt 0 ]; then shift; fi
case "$command" in
  run | verify | list | init-key) : ;;
  -h | --help | help) usage; exit 0 ;;
  *) usage >&2; die "unknown command: $command" ;;
esac

# Named, not inferred from this script's location: a copy run from somewhere
# else would otherwise back up whatever stack happened to be beside it.
cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"
[ -f .env ] || die "no .env in $PWD -- this is not a deployment directory"

# The deployment's own settings, read the way roll.sh and update.sh read them.
env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2-; }

stack="${STACK:-$(env_value STACK)}"
stack="${stack:-wdmv}"
db_name="${DB_NAME:-$(env_value DB_NAME)}"
[ -n "$db_name" ] || die "DB_NAME is set neither in the environment nor in $PWD/.env"
backup_dir="${BACKUP_DIR:-$(env_value BACKUP_DIR)}"
backup_dir="${backup_dir:-$HOME/moneyverse-backups/$stack}"
key_file="${BACKUP_ENCRYPTION_KEY_FILE:-$HOME/.moneyverse-backup-key}"

# Retention. Daily backups for two weeks answer "somebody deleted something
# yesterday"; one a week for two months answers "this has been wrong for a
# while", which is the case a fortnight of dailies quietly loses.
retain_days="${BACKUP_RETAIN_DAYS:-14}"
retain_weeks="${BACKUP_RETAIN_WEEKS:-8}"
# `verify` fails on a backup older than this. One missed daily run is a
# warning; a day and a half of silence is a broken backup.
max_age_hours="${BACKUP_MAX_AGE_HOURS:-36}"
# A second location -- a mounted disk, a remote filesystem. Unset means every
# copy of this deployment's data is on one machine, which `run` says out loud.
copy_to="${BACKUP_COPY_TO:-}"
include_photos="${BACKUP_INCLUDE_PHOTO_OBJECTS:-true}"

export STACK="$stack"
# Backups and the key are readable by their owner and by nobody else.
umask 077

if [ "$(id -u)" = 0 ]; then
  echo "warning: running as root. This directory belongs to the deploy user, and backups written as root are files it cannot read." >&2
fi

for tool in docker openssl gzip tar sha256sum date tac; do
  command -v "$tool" >/dev/null 2>&1 || die "$tool is required and is not on PATH"
done

db_run() { docker compose run --rm -T backup "$@"; }
encrypt() {
  openssl enc -aes-256-cbc -md sha256 -pbkdf2 -iter 600000 -salt \
    -pass env:MONEYVERSE_BACKUP_PASS
}
decrypt() {
  openssl enc -d -aes-256-cbc -md sha256 -pbkdf2 -iter 600000 \
    -pass env:MONEYVERSE_BACKUP_PASS
}

key_fingerprint=''
load_key() {
  # The key must not be in the file Docker interpolates into containers, and
  # must not be in the directory the deploy workflow overwrites on every roll.
  if grep -qE '^BACKUP_ENCRYPTION_KEY=' .env; then
    die "BACKUP_ENCRYPTION_KEY is in $PWD/.env. A key kept where compose loads it into containers, and where the next deploy ships it, is not separate from the backup: move it to $key_file and delete that line."
  fi

  local key mode resolved_key resolved_backups
  if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
    key="$BACKUP_ENCRYPTION_KEY"
  else
    [ -f "$key_file" ] || die "no encryption key at $key_file -- run '$0 init-key' first, and keep a copy somewhere that survives this host"
    mode="$(stat -c '%a' "$key_file")"
    case "$mode" in
      600 | 400) : ;;
      *) die "$key_file is mode $mode: it must be 600, or every account on this host can read it" ;;
    esac
    resolved_key="$(readlink -f "$key_file")"
    resolved_backups="$(readlink -f "$backup_dir" 2>/dev/null || printf '%s' "$backup_dir")"
    case "$resolved_key" in
      "$resolved_backups"/*) die "$key_file is inside $backup_dir: whoever copies the backups copies the key with them" ;;
      "$PWD"/*) die "$key_file is inside the deployment directory, which the deploy workflow ships and overwrites" ;;
    esac
    IFS= read -r key < "$key_file" || true
  fi

  [ "${#key}" -ge 32 ] || die "the encryption key is ${#key} characters: it must be at least 32"
  export MONEYVERSE_BACKUP_PASS="$key"
  # Twelve hex characters of sha256 over the key: enough to answer "which key
  # was this backup written with", which is the question a restore asks, and
  # nothing anyone can work backwards from.
  key_fingerprint="$(printf '%s' "$key" | sha256sum | cut -c1-12)"
}

# This deployment's own backups, oldest first: the stamp is ISO basic UTC, so a
# lexical sort of the file names is chronological. Narrowed to this stack and
# database because the two deployments on this host can be pointed at one
# directory, and retention must not count the other one's backups as this
# one's -- or expire them.
manifests() {
  local path
  for path in "$backup_dir/$stack-$db_name-"*.manifest.json; do
    if [ -e "$path" ]; then printf '%s\n' "$path"; fi
  done
}

# The manifest is written by this script, one field per line, so these read it
# without needing a JSON parser on the host.
manifest_string() { sed -n "s/^  \"$2\": \"\\(.*\\)\",\\{0,1\\}\$/\\1/p" "$1" | head -1; }
manifest_raw() { sed -n "s/^  \"$2\": \\(.*\\)\$/\\1/p" "$1" | head -1 | sed 's/,$//'; }
# The key prefix is stripped by name rather than by "everything up to a colon":
# a cutoff value is full of colons, and the greedy form silently returned the
# seconds field of the timestamp.
figure_of() { printf '%s' "$1" | grep -o "\"$2\": *\"\\{0,1\\}[^,\"}]*" | head -1 | sed "s/^\"$2\": *\"\\{0,1\\}//"; }

# 20260830T190000Z -> the seconds since the epoch date can do arithmetic on.
epoch_of_stamp() {
  local s="$1"
  date -u -d "${s:0:4}-${s:4:2}-${s:6:2}T${s:9:2}:${s:11:2}:${s:13:2}Z" +%s
}

do_init_key() {
  [ -e "$key_file" ] && die "$key_file exists. Replacing it makes every backup taken with the old key unreadable, so this refuses rather than overwrite."
  # 32 bytes of urandom, hex encoded -- the shape bootstrap-env.sh gives every
  # other secret on this host.
  ( umask 077; head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$key_file" )
  chmod 600 "$key_file"
  load_key
  echo "wrote $key_file (fingerprint ${key_fingerprint})"
  echo "Copy it somewhere that survives this host losing its disk. Without it every backup is noise."
}

# Set before the trap that removes them, and at file scope rather than local to
# do_run, because the trap fires after the function's locals are gone.
sql_tmp=''
photos_tmp=''
manifest_tmp=''
clean_partials() {
  local path
  for path in "$sql_tmp" "$photos_tmp" "$manifest_tmp"; do
    if [ -n "$path" ]; then rm -f -- "$path"; fi
  done
}

do_run() {
  load_key
  mkdir -p "$backup_dir"
  chmod 700 "$backup_dir"

  local stamp base sql_out photos_out manifest_out
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  base="${stack}-${db_name}-${stamp}"
  sql_out="$backup_dir/$base.sql.gz.enc"
  photos_out="$backup_dir/$base.photos.tar.gz.enc"
  manifest_out="$backup_dir/$base.manifest.json"

  # Partial files carry a dot prefix and are renamed only once complete, so an
  # interrupted run leaves nothing that looks like a backup. A rename inside
  # one directory is atomic.
  sql_tmp="$backup_dir/.$base.sql.gz.enc.partial"
  photos_tmp="$backup_dir/.$base.photos.tar.gz.enc.partial"
  manifest_tmp="$backup_dir/.$base.manifest.json.partial"
  trap clean_partials EXIT

  # Taken from the database clock before the dump starts, and the bound every
  # figure in backup-figures.sql is computed against. That file explains why.
  local cutoff
  cutoff="$(db_run psql -X -qAt -v ON_ERROR_STOP=1 -c 'SELECT now()')"
  [ -n "$cutoff" ] || die "the database did not answer as moneyverse_backup -- is BACKUP_DB_PASSWORD set, and has seed.sh run since it was?"

  echo "dumping ${db_name} as moneyverse_backup (cutoff ${cutoff})"
  db_run pg_dump --format=plain --encoding=UTF8 --no-password \
    | gzip -9 \
    | encrypt > "$sql_tmp"

  local figures
  figures="$(db_run psql -X -qAt -v ON_ERROR_STOP=1 -v cutoff="$cutoff" -f - < backup-figures.sql)"
  [ -n "$figures" ] || die "the verification figures came back empty"

  # Photo bytes live in the host directory the backend mounts and their
  # metadata is in the
  # dump. Restoring one without the other gives a gallery of rows pointing at
  # files that are gone, so they are taken together or the run fails. The
  # archive is made inside the backend container because those files are mode
  # 0600 owned by that image's unprivileged user; reading them from anywhere
  # else would mean running something as root.
  local photo_state
  if [ "$include_photos" != true ]; then
    echo "photo object store: BACKUP_INCLUDE_PHOTO_OBJECTS is not true, not archiving"
  else
    photo_state="$(docker compose exec -T backend sh -c \
      '[ -d /data/moneyverse/photos ] && echo present || echo absent' 2>/dev/null || echo unreachable)"
    case "$photo_state" in
      present)
        echo "archiving the photo object store"
        docker compose exec -T backend tar -cf - -C /data/moneyverse/photos . \
          | gzip -9 \
          | encrypt > "$photos_tmp"
        ;;
      absent)
        echo "photo object store: nothing uploaded yet, nothing to archive"
        ;;
      *)
        die "the backend container did not answer, so the photo objects were not archived. Start the stack, or set BACKUP_INCLUDE_PHOTO_OBJECTS=false if this deployment keeps no photos."
        ;;
    esac
  fi

  local sql_sha sql_bytes photos_json offsite
  sql_sha="$(sha256sum < "$sql_tmp" | cut -d' ' -f1)"
  sql_bytes="$(stat -c '%s' "$sql_tmp")"
  if [ -s "$photos_tmp" ]; then
    photos_json="$(printf '"%s",\n  "photos_bytes": %s,\n  "photos_sha256": "%s"' \
      "$base.photos.tar.gz.enc" \
      "$(stat -c '%s' "$photos_tmp")" \
      "$(sha256sum < "$photos_tmp" | cut -d' ' -f1)")"
  else
    photos_json='null,
  "photos_bytes": null,
  "photos_sha256": null'
  fi
  offsite=false
  if [ -n "$copy_to" ]; then offsite=true; fi

  # Plaintext on purpose: `list` has to work, and a restore has to be able to
  # tell which backup covers which point in time, without the key. It carries
  # counts and totals, and nothing about any one member.
  cat > "$manifest_tmp" <<JSON
{
  "schema": "moneyverse-backup/1",
  "stack": "$stack",
  "database": "$db_name",
  "taken_at": "$stamp",
  "cipher": "$CIPHER_LABEL",
  "key_fingerprint": "$key_fingerprint",
  "sql_file": "$base.sql.gz.enc",
  "sql_bytes": $sql_bytes,
  "sql_sha256": "$sql_sha",
  "photos_file": $photos_json,
  "offsite_copy": $offsite,
  "figures": $figures
}
JSON

  mv "$sql_tmp" "$sql_out"
  if [ -s "$photos_tmp" ]; then mv "$photos_tmp" "$photos_out"; fi
  mv "$manifest_tmp" "$manifest_out"
  sql_tmp=''; photos_tmp=''; manifest_tmp=''
  trap - EXIT

  # A backup nobody has read is a guess. Reading this one back before the run
  # reports success is what makes a daily cron line a daily proof.
  verify_backup "$manifest_out"

  if [ -n "$copy_to" ]; then
    mkdir -p "$copy_to"
    cp -p "$sql_out" "$manifest_out" "$copy_to/"
    if [ -f "$photos_out" ]; then cp -p "$photos_out" "$copy_to/"; fi
    echo "copied to $copy_to"
  else
    echo "warning: BACKUP_COPY_TO is unset, so every copy of this data is on this one host. Point it at a mounted disk or a remote path." >&2
  fi

  prune
  echo "backup complete: $sql_out"
}

# Proves one backup is intact, decryptable with the key this host holds, and
# recent. Everything is checked over the whole file: gzip validates its CRC
# only once the last byte has been read, which is why the plaintext goes
# through `tail` rather than being sampled.
verify_backup() {
  local manifest="$1"
  [ -f "$manifest" ] || die "no such manifest: $manifest"
  local dir recorded_fingerprint sql_file recorded_sha taken_at actual_sha
  local tail_bytes photos_file age_hours
  dir="$(dirname "$manifest")"

  recorded_fingerprint="$(manifest_string "$manifest" key_fingerprint)"
  sql_file="$(manifest_string "$manifest" sql_file)"
  recorded_sha="$(manifest_string "$manifest" sql_sha256)"
  taken_at="$(manifest_string "$manifest" taken_at)"
  [ -n "$sql_file" ] || die "$manifest names no dump file"
  [ -f "$dir/$sql_file" ] || die "$manifest names $sql_file, which is not in $dir"

  [ "$recorded_fingerprint" = "$key_fingerprint" ] || die \
    "$sql_file was written with key $recorded_fingerprint and this host holds $key_fingerprint"

  actual_sha="$(sha256sum < "$dir/$sql_file" | cut -d' ' -f1)"
  [ "$actual_sha" = "$recorded_sha" ] || die \
    "$sql_file no longer matches the sha256 recorded when it was written"

  tail_bytes="$(decrypt < "$dir/$sql_file" | gzip -cd | tail -c 400)"
  case "$tail_bytes" in
    *"$DUMP_SENTINEL"*) : ;;
    *) die "$sql_file decompresses but does not end the way a finished pg_dump ends" ;;
  esac

  photos_file="$(manifest_string "$manifest" photos_file)"
  if [ -n "$photos_file" ]; then
    [ -f "$dir/$photos_file" ] || die "$manifest names $photos_file, which is not in $dir"
    decrypt < "$dir/$photos_file" | gzip -cd | tar -tf - > /dev/null
  fi

  age_hours=$(( ( $(date -u +%s) - $(epoch_of_stamp "$taken_at") ) / 3600 ))
  [ "$age_hours" -le "$max_age_hours" ] || die \
    "the newest backup is ${age_hours}h old and the limit is ${max_age_hours}h -- the daily run is not running"

  echo "verified $sql_file: ${age_hours}h old, decrypts with key ${key_fingerprint}, dump ends cleanly${photos_file:+, photo archive readable}"
}

do_verify() {
  load_key
  local manifest
  if [ "$#" -gt 0 ]; then
    manifest="$1"
    case "$manifest" in */*) : ;; *) manifest="$backup_dir/$manifest" ;; esac
    case "$manifest" in
      *.manifest.json) : ;;
      *) manifest="${manifest%.sql.gz.enc}.manifest.json" ;;
    esac
  else
    manifest="$(manifests | tail -1)"
    [ -n "$manifest" ] || die "no backup in $backup_dir"
  fi
  verify_backup "$manifest"
}

do_list() {
  local manifest figures found=0
  while IFS= read -r manifest; do
    found=1
    figures="$(manifest_raw "$manifest" figures)"
    printf '%s  key %s  %s bytes  %s ledger tx  balance %s  %s photos\n' \
      "$(manifest_string "$manifest" taken_at)" \
      "$(manifest_string "$manifest" key_fingerprint)" \
      "$(manifest_raw "$manifest" sql_bytes)" \
      "$(figure_of "$figures" ledger_transactions)" \
      "$(figure_of "$figures" account_balance_total)" \
      "$(figure_of "$figures" photos)"
  done < <(manifests)
  [ "$found" = 1 ] || echo "no backup in $backup_dir"
}

# Deletes only what this script wrote, and only by the three names one backup
# owns. Nothing here removes a directory, and the newest backup is never a
# candidate whatever the calendar says.
prune() {
  local kept_weeks=' ' now_epoch first=1
  local manifest stamp base age_days week keep
  now_epoch="$(date -u +%s)"
  while IFS= read -r manifest; do
    stamp="$(manifest_string "$manifest" taken_at)"
    base="$(basename "$manifest" .manifest.json)"
    age_days=$(( ( now_epoch - $(epoch_of_stamp "$stamp") ) / 86400 ))
    week="$(date -u -d "${stamp:0:4}-${stamp:4:2}-${stamp:6:2}" +%G-%V)"

    keep=no
    if [ "$first" = 1 ] || [ "$age_days" -lt "$retain_days" ]; then
      keep=yes
    elif [ $(( age_days / 7 )) -lt "$retain_weeks" ]; then
      # One a week past the daily window: the newest of each ISO week, which is
      # the first one this loop meets walking backwards.
      case "$kept_weeks" in
        *" $week "*) keep=no ;;
        *) keep=yes ;;
      esac
    fi
    first=0

    if [ "$keep" = yes ]; then
      kept_weeks="$kept_weeks$week "
    else
      rm -f -- "$backup_dir/$base.sql.gz.enc" \
               "$backup_dir/$base.photos.tar.gz.enc" \
               "$backup_dir/$base.manifest.json"
      echo "expired $base (${age_days} days old)"
    fi
  done < <(manifests | tac)
}

case "$command" in
  run) do_run ;;
  verify) do_verify "$@" ;;
  list) do_list ;;
  init-key) do_init_key ;;
esac
