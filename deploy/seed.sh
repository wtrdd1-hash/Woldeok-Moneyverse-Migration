#!/bin/sh
# Per-deployment configuration that must not live in a migration.
#
# A migration reaches every database, which is exactly wrong for the two
# things here: a credential, and a list of administrators that differs between
# the test deployment and the production one. Both are driven by this stack's
# own environment, and both are idempotent.
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
