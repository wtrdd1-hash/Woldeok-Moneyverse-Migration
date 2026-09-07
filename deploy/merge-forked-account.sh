#!/usr/bin/env bash
# Reattaches an OAuth-created account fork to the account that owns its data.
# Migration 163 owns the policy: balances cross the ledger, current member
# records follow the surviving account, and immutable audit/ledger history
# keeps the original actor id.
#
#   ./merge-forked-account.sh <actor> <keep> <merge> <idempotency-key>
#   ./merge-forked-account.sh <actor> <keep> <merge> <idempotency-key> --yes
set -euo pipefail

ACTOR="${1:?superadmin user id required}"
KEEP="${2:?surviving user id required}"
MERGE="${3:?forked user id required}"
KEY="${4:?idempotency key required}"
APPLY=0
[ "${5:-}" = '--yes' ] && APPLY=1

DEPLOY_DIR="${DEPLOY_DIR:-$HOME/moneyverse-production}"
cd "$DEPLOY_DIR"
env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2-; }
STACK="${STACK:-$(env_value STACK)}"
DATABASE="${DB_NAME:-$(env_value DB_NAME)}"
DB_CONTAINER="${DB_CONTAINER:-${STACK:-wdmvp}-db}"
[ -n "$DATABASE" ] || { echo 'DB_NAME is missing from the deployment environment' >&2; exit 2; }

psql_run() {
  docker exec "$DB_CONTAINER" sh -lc \
    'PGPASSWORD="$POSTGRES_PASSWORD" exec psql -X -v ON_ERROR_STOP=1 -U moneyverse_migrator -d "$1" -v actor="$2" -v keep="$3" -v merge="$4" -v key="$5" "${@:6}"' \
    _ "$DATABASE" "$ACTOR" "$KEEP" "$MERGE" "$KEY" "$@"
}

echo "database: $DATABASE"
echo "actor:    $ACTOR"
echo "keep:     $KEEP"
echo "merge:    $MERGE"
echo "mode:     $([ "$APPLY" = 1 ] && echo APPLY || echo 'validated dry run')"
echo

statement="SELECT * FROM public.admin_merge_forked_member_account(:'key'::uuid, :'actor'::uuid, :'keep'::uuid, :'merge'::uuid);"
if [ "$APPLY" = 1 ]; then
  psql_run -c "$statement"
else
  psql_run -c "BEGIN; $statement ROLLBACK;"
  echo
  echo 'The complete merge ran inside a rolled-back transaction; nothing was changed.'
  echo 'Re-run with --yes and the same idempotency key to apply it.'
fi
