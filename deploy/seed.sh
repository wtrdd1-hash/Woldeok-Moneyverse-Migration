#!/bin/sh
# Per-deployment configuration that must not live in a migration.
#
# A migration reaches every database, which is exactly wrong for what is here:
# two credentials, and a list of administrators that differs between the test
# deployment and the production one. All of it is driven by this stack's own
# environment, and all of it is idempotent.
#
# Runs as the migrator, after migrate.sh, before the backend starts.
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"

# 050 creates moneyverse_status_collector NOLOGIN, the way 018 creates the
# reconciler: the role and its one privilege are schema, the credential is
# deployment. Nothing else in this database is reachable with it.
if [ -n "${STATUS_COLLECTOR_PASSWORD:-}" ]; then
  psql -X -v ON_ERROR_STOP=1 \
    -v collector_password="$STATUS_COLLECTOR_PASSWORD" \
    -v database_name="$PGDATABASE" <<'SQL'
ALTER ROLE moneyverse_status_collector LOGIN PASSWORD :'collector_password';
GRANT CONNECT ON DATABASE :"database_name" TO moneyverse_status_collector;
SQL
  echo "status collector: login granted"
else
  echo "status collector: STATUS_COLLECTOR_PASSWORD unset, leaving the role without a login"
fi

# 018 creates moneyverse_reconciler NOLOGIN and gives it the one function that
# writes a reconciliation snapshot. Until this release nothing could log in as
# it, which is why no snapshot has ever been taken.
if [ -n "${RECONCILER_PASSWORD:-}" ]; then
  psql -X -v ON_ERROR_STOP=1 \
    -v reconciler_password="$RECONCILER_PASSWORD" \
    -v database_name="$PGDATABASE" <<'SQL'
ALTER ROLE moneyverse_reconciler LOGIN PASSWORD :'reconciler_password';
GRANT CONNECT ON DATABASE :"database_name" TO moneyverse_reconciler;
SQL
  echo "reconciler: login granted"
else
  echo "reconciler: RECONCILER_PASSWORD unset, leaving the role without a login"
fi

# The role a logical backup runs as. Unlike the two above, the role itself is
# created here rather than in a numbered migration: the backup has to exist
# before the irreversible migration series it protects, and this release adds
# no migration on purpose. The DO block is the same idempotent shape 050 uses,
# so a later migration can take the role over without conflicting with this.
#
# `pg_read_all_data` is the narrowest role a logical backup can run as. pg_dump
# reads every table by definition, and this membership is exactly SELECT on
# tables, views and sequences plus USAGE on schemas -- the role cannot write a
# row, execute an economy function, or change a grant. It is INHERIT for that
# reason and no other: privileges held through membership are only usable by a
# role that inherits them, and NOINHERIT here -- the flag 018 and 050 both set
# -- would make pg_dump fail with 42501 on the first table.
#
# Absent BACKUP_DB_PASSWORD the role is not created at all, so a database whose
# deployment takes no backups has no backup credential to steal.
if [ -n "${BACKUP_DB_PASSWORD:-}" ]; then
  psql -X -v ON_ERROR_STOP=1 \
    -v backup_password="$BACKUP_DB_PASSWORD" \
    -v database_name="$PGDATABASE" <<'SQL'
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'moneyverse_backup'
  ) THEN
    CREATE ROLE moneyverse_backup
      NOLOGIN
      INHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS;
  END IF;
END;
$do$;
GRANT pg_read_all_data TO moneyverse_backup;
ALTER ROLE moneyverse_backup LOGIN PASSWORD :'backup_password';
GRANT CONNECT ON DATABASE :"database_name" TO moneyverse_backup;
SQL
  echo "backup role: login granted"
else
  echo "backup role: BACKUP_DB_PASSWORD unset, no backup credential in this database"
fi

# A space or comma separated list of Discord user ids. Present on the test
# deployment, absent on production -- which is the whole point of it being
# here rather than in 051.
if [ -n "${BOOTSTRAP_DISCORD_ADMIN_IDS:-}" ]; then
  for subject in $(printf '%s' "$BOOTSTRAP_DISCORD_ADMIN_IDS" | tr ',' ' '); do
    # The column's CHECK rejects anything that is not a Discord snowflake, so a
    # typo fails here rather than silently granting nothing.
    psql -X -v ON_ERROR_STOP=1 -v subject="$subject" <<'SQL'
INSERT INTO public.bootstrap_discord_operators (provider_subject, note)
VALUES (:'subject', 'deployment: BOOTSTRAP_DISCORD_ADMIN_IDS')
ON CONFLICT (provider_subject) DO NOTHING;
SQL
    echo "bootstrap operator: ${subject} recorded"
  done
  # The trigger only fires when an identity is created, so an id added after
  # that person's first login needs this to take effect.
  granted="$(psql -X -qAt -v ON_ERROR_STOP=1 -c 'SELECT public.apply_bootstrap_discord_operators()')"
  echo "bootstrap operator: ${granted} role grant(s) applied to already-linked accounts"
else
  echo "bootstrap operator: BOOTSTRAP_DISCORD_ADMIN_IDS unset, no deployment-specific administrators"
fi
