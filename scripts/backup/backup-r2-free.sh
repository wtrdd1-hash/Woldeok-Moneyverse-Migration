#!/usr/bin/env bash
# RETIRED: This legacy entry point is intentionally non-operational.
# It previously produced unencrypted local archives and rotated old snapshots.
# The authoritative encrypted backup is managed separately by the Debian
# moneyverse-backup systemd service. Never call it from tests or an API.
set -euo pipefail
printf '%s\n' 'ERROR: legacy backup disabled; use the authorized encrypted backup service and independently verified restore procedure.' >&2
exit 78
