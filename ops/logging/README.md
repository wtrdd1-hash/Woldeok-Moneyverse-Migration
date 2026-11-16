# Log archive rollout (v2026.11.17.4)

**Implementation candidate only.** This directory does not install anything and does not run deletions on current Production. The authority is docs/planning/RUNTIME_LOG_RETENTION_ADMIN_CONSOLE_v2026.11.17.3.md, and evidence is in docs/worklog/2026-11-17-log-lifecycle-implementation-v2026.11.17.4.md.

## Design

- Separate UTC-hour files under routine or important / fixed-source / YYYY-MM-DDTHH.jsonl. Routine events expire at 7 days, important at 30 days.
- Closed segments gzip-compressed with SHA256 integrity checks. Important access 5xx/429 preserved separately from 7-day raw Nginx access.
- Ingest fixed Nginx file inode/offset including .1 rotated file, and systemd journal cursor by allowlisted unit. A failed reader does not advance its persistent checkpoint. Crash between archive fsync and cursor commit may duplicate; reader deduplicates stable hashed IDs.
- Redact **before storage**. Spring viewer authorized by SUPERADMIN/open console, with a 5-minute session-bound Discord/Telegram OTP required for important reads.
- Bounded read-only Python archive query, 500-record max, authenticated cursor, no caller-supplied path or shell. Current live mode remains 5-second polling, not SSE.

## Host prerequisites

1. Measure actual route/artifact, active unit names, Nginx paths, journald permissions, service identities, disk volume and growth. Never use the example config blindly. Separate Test/Production log environments and budgets.
2. Create read group moneyverse-logread; add only the trusted Spring backend runtime identity, not public Nginx or frontend worker identities.
3. Provision /var/lib/moneyverse/log-archive owned root:moneyverse-logread with mode 2750 so new subdirectories inherit group; make event files root:moneyverse-logread 0640, never world-readable. Install script /usr/local/libexec/moneyverse-log-lifecycle.py root owned 0755 and real source config /etc/moneyverse/log-archive-sources.json root owned 0640.
4. Run first collector with authorized host operator in isolated Test; then ensure .cursor-key is group-readable 0640 root:moneyverse-logread and .archive-lock is 0640 group-readable, so the Spring identity can validate query HMAC and use a read-only lock. Retain write privilege exclusively for root collector.
5. In Test first, install both systemd service/timer pairs. Collector every minute; compressor/expiry hourly. Enable timers only after storage, permissions and rollback gates.
6. Current /etc/logrotate.d/nginx uses daily rotate 14 with compress + delaycompress. Proposed nginx-logrotate-moneyverse.conf is a REPLACEMENT, not a second overlapping config. Validate with logrotate -d, then isolated Test rotation; prevent missing unprocessed inode.
7. Configure fixed MONEYVERSE_LOG_ARCHIVE_READER and MONEYVERSE_LOG_ARCHIVE_ROOT on the trusted Spring systemd runtime, never from caller parameters. Deploy only via immutable Test release and verified zero-downtime Production process.
8. Monitor collector stale >5 minutes, repeated source failures, inode loss, checksum failure, overdue deletion and disk/inode pressure with warnings at 60/75/85% and urgent response at 90% of measured log quota. Never shorten important retention to quiet alarms.

## QA & release blockers

Run python3 -m unittest discover -s ops/logging/tests -v, JUnit Spring history auth and OTP tests, frontend typecheck/Vitest, real test host API and UI. Verify rotation, UTC 7/30 boundaries, mixed class, invalid/malformed logs, 401/403 role, OTP replay/expiry, browser no-store, independent backup restore and zero-downtime rollback. Never claim historical searchable logs before collector is running and fresh.

The Production/Test API gateway might not route /api/v1/admin/logs/system/history to Spring. Inspect and test its route ownership and require direct/edge negative authorization before any deployment. Existing financial ledger, database backup and immutable audit records are OUT OF SCOPE.
