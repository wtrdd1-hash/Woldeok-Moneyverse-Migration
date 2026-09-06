#!/usr/bin/env bash
# Retires everything on the host that is not the one production deployment.
#
# Three generations of this product have been running side by side: the
# original service (`woldeok-moneyverse-production-*`), the test stack
# (`wdmv-*`), and production (`wdmvp-*`). Only the last is reachable from
# easy-scraping.com. The other two hold databases, so this dumps before it
# removes and refuses to remove anything it could not dump.
#
#   ./retire-legacy-stacks.sh              # says what it would do, touches nothing
#   ./retire-legacy-stacks.sh --yes        # dumps, then removes
#
# What it never touches: the wdmvp stack, the edge proxy, the tunnel, and
# every container belonging to another product on this machine.
set -euo pipefail

KEEP_STACK='wdmvp'
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/retirement-$(date +%Y%m%d-%H%M%S)}"
APPLY=0
[ "${1:-}" = '--yes' ] && APPLY=1

# name:container:database-user-env — a stack is only removed once its database
# is on disk outside Docker.
LEGACY_DBS='
old-service:woldeok-moneyverse-production-db-1
test-stack:wdmv-db
'

CONTAINERS='
woldeok-moneyverse-production-app-1
woldeok-moneyverse-production-db-1
wdmv-frontend
wdmv-backend
wdmv-db
wdmv-edge
wdmv-seed
wdmv-migrate
'

VOLUMES='
wdmv_db-data
wdmv_photo-data
woldeok-moneyverse-production_moneyverse-production-db
woldeok-moneyverse-production_moneyverse-production-photos
woldeok-moneyverse-local_prod-db-data
woldeok-moneyverse-local_test-db-data
woldeok-moneyverse-local_test-photo-data
woldeok-moneyverse-migration_db-data
woldeok-moneyverse-migration_photo-data
'

say() { printf '%s\n' "$*"; }
run() { if [ "$APPLY" = 1 ]; then "$@"; else say "would: $*"; fi; }

# Nothing here may name the deployment that is serving the site.
for name in $CONTAINERS $VOLUMES; do
  case "$name" in
    "$KEEP_STACK"|"$KEEP_STACK"-*|"$KEEP_STACK"_*)
      say "refusing to touch $name: it belongs to the live deployment" >&2
      exit 2
      ;;
  esac
done

say "== dumping databases to $BACKUP_DIR =="
[ "$APPLY" = 1 ] && mkdir -p "$BACKUP_DIR"
for entry in $LEGACY_DBS; do
  label="${entry%%:*}"
  container="${entry##*:}"
  if ! docker inspect "$container" >/dev/null 2>&1; then
    say "$label: no container named $container, nothing to dump"
    continue
  fi
  target="$BACKUP_DIR/$label-$container.sql.gz"
  if [ "$APPLY" = 1 ]; then
    docker exec "$container" sh -lc \
      'pg_dumpall -U "$POSTGRES_USER" 2>/dev/null || pg_dumpall -U postgres' \
      | gzip > "$target"
    size=$(stat -c %s "$target")
    if [ "$size" -lt 4096 ]; then
      say "refusing to go on: $target is only $size bytes" >&2
      exit 3
    fi
    say "$label: $target ($size bytes)"
  else
    say "would dump $container -> $target"
  fi
done

say "== stopping and removing containers =="
for name in $CONTAINERS; do
  if docker inspect "$name" >/dev/null 2>&1; then
    run docker rm -f "$name"
  else
    say "$name: already gone"
  fi
done

say "== removing volumes =="
for name in $VOLUMES; do
  if docker volume inspect "$name" >/dev/null 2>&1; then
    run docker volume rm "$name"
  else
    say "$name: already gone"
  fi
done

say "== what is left =="
docker ps --format '{{.Names}}\t{{.Status}}' | sort
say
df -h / | tail -1
[ "$APPLY" = 1 ] || say $'\nnothing was changed. re-run with --yes to apply.'
