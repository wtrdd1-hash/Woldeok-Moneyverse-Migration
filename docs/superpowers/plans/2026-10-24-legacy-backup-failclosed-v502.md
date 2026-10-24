# P1 legacy backup fail-closed — Development B v502

## Source and decision

QA issue #1066 reports duplicate root/debian 04:00 Cron entries for a non-executable legacy script. If chmod restores executability, the legacy code writes unencrypted SQL dumps to a Production-linked database path and may upload them. The separate encrypted systemd backup is the only currently supported backup path; its isolated restore drill is still pending. The existing admin trigger launches the legacy script detached and returns success before verifying any archive, and the list marks `.sql.gz` as `VERIFIED` based only on `stat`. These are separate false-positive backup claims.

## Scope / safety

No cron, systemd, credentials, live DB, backups, Production/Test deployment, or other worker branch will be changed. No automatic replacement of a failing cron with an unreviewed encrypted job. Keep the legacy entrypoint but make it **unconditionally fail closed** with a clear diagnostic. The admin API must return HTTP 503 rather than launch it or invent success. Legacy file metadata may be listed but is `PENDING` until a verified restore and evidence path exists. New authenticated backup trigger integration remains a separate gated task. Coordinate with unmerged B #1109 (admin guard/frontend server action); no security guards removed.

## TDD / verification tasks

1. Write Node subprocess regression using fake `sudo`/`aws`, isolated backup directory and no live DB, proving legacy script fails nonzero, produces no `.sql.gz`, and never invokes fake commands. Run RED.
2. Write backend Vitest regression asserting `POST /admin/backups/trigger` rejects with 503 and no subprocess, and metadata-only legacy files are `PENDING`. Run RED.
3. Replace legacy script with explicit fail-closed entrypoint, remove detached backup trigger, return ServiceUnavailableException, mark legacy entries pending. Run GREEN.
4. Register the Node regression in root `pnpm test`, run focused tests, lint/typecheck/build, full tests, audit and CI, record exact SHA. Re-read main/plan mid-run and before any merge; hold release if gates fail.

## API contract

`POST /api/v1/admin/backups/trigger` -> `503 Service Unavailable`, machine-readable `code=BACKUP_TRIGGER_UNAVAILABLE`, no background process and no success receipt. `GET /api/v1/admin/backups` retains fields but `.sql`/`.sql.gz` entries have `status=PENDING` rather than an unsupported verification claim. No DB migration or financial ledger change.
