#!/usr/bin/env bash
# RETIRED — do not reactivate this legacy cron entrypoint.
#
# The former pipeline wrote pg_dump | gzip to a local .sql.gz file and could
# upload that plaintext dump to object storage. The database name in its old
# defaults was also used by the live Production API. A chmod or cron repair
# must never silently re-enable that unsafe data-export path.
#
# The supported backup pipeline is the separately configured, encrypted
# moneyverse-backup.service / moneyverse-backup.timer. Its status, encryption,
# off-host retention and an isolated restore drill must be verified by an
# authorized operator; this script must not start or impersonate that service.
set -euo pipefail
printf '%s\n' 'ERROR: legacy plaintext Moneyverse backup entrypoint is retired and disabled.' \
  'Use the reviewed encrypted systemd backup pipeline; do not re-enable legacy Cron.' >&2
exit 78
