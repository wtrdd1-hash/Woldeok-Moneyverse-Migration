#!/bin/sh
# Applies numbered SQL migrations exactly once per database.
# This runs as the migrator role, never as the application role.
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"

psql -X -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

# A finalized 013 content migration was accidentally written after an earlier
# immutable revision had already been recorded on the long-lived test stack.
# Never rewrite that DB record. Instead, accept only this exact, documented
# historical-to-final checksum pair; migration 016 reconciles the schema and
# function definitions before the application starts. Any other mismatch
# remains a hard failure.
historical_checksum_is_recognized() {
  historical_filename="$1"
  historical_applied_checksum="$2"
  historical_current_checksum="$3"
  [ "$historical_filename" = "013-content-and-status.sql" ] \
    && [ "$historical_applied_checksum" = "8d00d5344de3e9dfef087005de03a17e5a3534a371179318dd510c73ff9f97e6" ] \
    && [ "$historical_current_checksum" = "9aafa25747128cbdd0dda0f699b4f1626e7befc4d81ee816133a8bc111b21cf0" ]
}

historical_content_revision_seen=0

# Production uses the /migrations bind mount. Local/CI callers can point at
# their own checkout so concurrent worktrees never share a global symlink.
migrations_dir="${MIGRATIONS_DIR:-/migrations}"

for migration in "$migrations_dir"/*.sql; do
  [ -f "$migration" ] || continue

  filename="$(basename "$migration")"
  checksum="$(sha256sum "$migration" | awk '{print $1}')"
  applied_checksum="$(
    psql -X -qAt -v ON_ERROR_STOP=1 \
      -v migration_filename="$filename" <<'SQL'
SELECT checksum FROM public.schema_migrations WHERE filename = :'migration_filename';
SQL
  )"

  if [ -n "$applied_checksum" ]; then
    if [ "$applied_checksum" != "$checksum" ]; then
      if historical_checksum_is_recognized "$filename" "$applied_checksum" "$checksum"; then
        echo "Historical migration revision recognized: $filename; reconciliation migration must run" >&2
        historical_content_revision_seen=1
        continue
      fi
      echo "Refusing to run changed migration: $filename" >&2
      exit 1
    fi
    echo "Migration already applied: $filename"
    continue
  fi

  echo "Applying migration: $filename"
  psql -X -v ON_ERROR_STOP=1 -f "$migration"
  psql -X -v ON_ERROR_STOP=1 \
    -v migration_filename="$filename" \
    -v migration_checksum="$checksum" <<'SQL'
INSERT INTO public.schema_migrations (filename, checksum)
VALUES (:'migration_filename', :'migration_checksum');
SQL
done

# Never report success after accepting the one historical revision unless the
# immutable follow-up repair was also recorded. The loop verifies 016's own
# checksum before reaching this guard.
if [ "$historical_content_revision_seen" -eq 1 ]; then
  reconciliation_applied="$(
    psql -X -qAt -v ON_ERROR_STOP=1 <<'SQL'
SELECT CASE WHEN EXISTS (
  SELECT 1
  FROM public.schema_migrations
  WHERE filename = '016-content-and-status-reconciliation.sql'
) THEN '1' ELSE '0' END;
SQL
  )"
  if [ "$reconciliation_applied" != "1" ]; then
    echo "Historical 013 revision requires 016-content-and-status-reconciliation.sql" >&2
    exit 1
  fi
fi
