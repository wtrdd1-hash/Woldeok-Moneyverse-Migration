#!/usr/bin/env bash
# Recovers public display names from the oldest retained backup into the live
# database by user UUID. The backup is restored into a disposable database;
# the deployment is never repointed and no economic data is copied back.
set -euo pipefail

cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"
export STACK="${STACK:-wdmv}"
env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2-; }
db_name="${DB_NAME:-$(env_value DB_NAME)}"
backup_dir="$(env_value BACKUP_DIR)"
backup_dir="${backup_dir:-$HOME/moneyverse-backups/$STACK}"

pending="$(docker compose exec -T --user postgres db psql -X -qAt \
  -U moneyverse_migrator -d "$db_name" \
  -c "SELECT count(*) FROM public.identities WHERE display_name LIKE 'enc:v1:rnd:%'")"
[ "${pending:-0}" -gt 0 ] || { echo 'backup display-name recovery: nothing pending'; exit 0; }

manifest="$(find "$backup_dir" -maxdepth 1 -type f \
  -name "$STACK-$db_name-*.manifest.json" -print | sort | head -1)"
[ -n "$manifest" ] || { echo 'backup display-name recovery: no retained backup'; exit 0; }

target="nickname_recovery_$(date -u +%Y%m%d%H%M%S)"
cleanup() {
  docker compose exec -T --user postgres db psql -X -q -d postgres \
    -c "DROP DATABASE IF EXISTS $target" >/dev/null 2>&1 || true
}
trap cleanup EXIT

DEPLOY_DIR="$PWD" DB_NAME="$db_name" STACK="$STACK" \
  bash ./restore.sh "$manifest" --into "$target" --yes >/dev/null

updates="$(mktemp)"
trap 'rm -f "$updates"; cleanup' EXIT
docker compose exec -T --user postgres db psql -X -qAt -F $'\t' \
  -U moneyverse_migrator -d "$target" \
  -c "SELECT user_id::text, encode(convert_to(display_name,'UTF8'),'base64') FROM public.identities WHERE display_name<>'' AND display_name NOT LIKE 'enc:v1:%'" \
  > "$updates"

if [ -s "$updates" ]; then
  {
    cat <<'SQL'
CREATE TEMP TABLE recovered_names(user_id uuid PRIMARY KEY, encoded_name text);
COPY recovered_names(user_id, encoded_name) FROM STDIN;
SQL
    cat "$updates"
    cat <<'SQL'
\.
UPDATE public.identities AS identity
SET display_name = convert_from(decode(recovered.encoded_name, 'base64'), 'UTF8')
FROM recovered_names AS recovered
WHERE identity.user_id = recovered.user_id
  AND identity.display_name LIKE 'enc:v1:rnd:%';
SQL
  } | docker compose exec -T --user postgres db psql -X -q -v ON_ERROR_STOP=1 \
    -U moneyverse_migrator -d "$db_name"
fi

remaining="$(docker compose exec -T --user postgres db psql -X -qAt \
  -U moneyverse_migrator -d "$db_name" \
  -c "SELECT count(*) FROM public.identities WHERE display_name LIKE 'enc:v1:rnd:%'")"
echo "backup display-name recovery: $pending pending before, $remaining remaining"

# If neither retained keys, Discord nor the oldest pre-roll backup contains
# the plaintext, never expose ciphertext as a member name. Keep the stable
# user UUID visible as a temporary, non-secret label. The next OAuth login
# replaces it with the provider's current public display name.
if [ "${remaining:-0}" -gt 0 ]; then
  docker compose exec -T --user postgres db psql -X -q -v ON_ERROR_STOP=1 \
    -U moneyverse_migrator -d "$db_name" \
    -c "UPDATE public.identities SET display_name='회원-' || left(user_id::text, 8) WHERE display_name LIKE 'enc:v1:rnd:%'"
  echo "display-name fallback replaced $remaining unrecoverable ciphertext value(s)"
fi
