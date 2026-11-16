# Backup Safety Recovery — v2026.11.17.1 Worklog

## Start — 2026-11-17 00:51 KST
- Scope: owner-approved safe removal of retired 04:00 backup cron, an independently isolated PostgreSQL restore drill, and investigation of existing backup alert/off-host replication. Production data and encrypted backups MUST NOT be deleted, rewritten or restored into production.
- Source baseline: origin/main `86777fb2d5a1f8bbc680453368c0a5f04b5c7715`; own isolated branch `fix/backup-legacy-cron-restore-v2026.11.17.1`. Existing independent `log-retention-admin-console` worktree is not modified; main has merged system log UI #3201.
- Authority: docs/planning/PROJECT_PLAN(.ko).md > docs/planning/INTEGRATED_PLANNING_MASTER(.ko).md > docs/operations/backup-and-recovery(.ko).md, docs/DOCUMENTATION_POLICY(.ko).md.
- Observed fault: debian user crontab has a single entry `0 4 * * * /srv/moneyverse-data/releases/production-current/scripts/backup/backup-r2-free.sh ...`; backup.log repeatedly says `Permission denied`. That script is intentionally retired and unsafe to re-enable. Separate encrypted systemd timer enabled and recently successful.
- Guardrails: verify clean crontab snapshot, no unwanted crontab edits, do not chmod/restart retired script; isolate PostgreSQL restore in network-none Docker with no production credentials; any off-host connector must be verified rather than assumed.

## Mid — 2026-11-17 00:55–01:00 KST
- Re-fetched origin/main mid-task: `86777fb2d5`, own worktree unchanged by collaborators.
- Tests/gates: 6 Node cron safety tests PASS; 16 Telegram bridge tests PASS. Local Test frontend on port 3101 responded HTTP 308 redirect; Spring on 4550 returned health HTTP 200. External HTTPS endpoints timed out, so remote Test/browser E2E NOT claimed.
- Backed up original Debian crontab privately (SHA-256 `9da6fc2dda60f5d1c9d243df8c37d72f5fff9844b0950b57ff1e5365dbaa00b0`). Removed one exact 04:00 line, afterward 0 cron lines; encrypted timer remained active/enabled/last result success; 60 archived ciphertext files preserved; Nginx active and Spring health 200.
- Independent restore of 00:26 encrypted archive into network-none disposable PostgreSQL 17 passed: 276 public tables, 943 ledger transactions, 1,950 postings, 43 account balances, 1653MB restored DB; verified temp DB/container cleanup.
- Telegram monitor watches backup timer/service, paired chat-id file exists; no induced incident/delivery test. Offsite immutable storage unverified.

## End — 2026-11-17 01:08 KST
- Live host correction **PRODUCTION HOST CRON VERIFIED**: retired job absent; new local baseline has zero debian cron entries, encrypted systemd timer stays active/enabled/Result=success, 60 backups intact, Spring health HTTP 200. No app service restart or production promotion was necessary; user and financial data untouched.
- **RESTORE SMOKE VERIFIED** in disposable PostgreSQL; not full financial/photo/application or external disaster recovery certification. Host data copied into isolated database was deleted afterward; off-host remains BLOCKED by missing independently authorized immutable target and credentials.
- GitHub source branch pushed at `2eceaf832266b9daab1615335bfcc1ed4844b795`; PR #3208 opened for read-only regression checker, 8 Node tests, runbook and bilingual changes. Live script remains private under repo policy (operational `*.sh` excluded).
- Tests: 8/8 read-only detector tests, 16/16 Telegram bridge tests, `git diff --check`, live `node scripts/backup/check-legacy-cron.mjs`, isolated pg_restore and table reads. CI for PR pending at log time; **do not claim merged main or exact-SHA Test promotion**.
- Follow-up: prove off-host immutable encrypted replica, remote checksum, regular full DR restore and financial/account invariants, alert delivery on real failure; no fake completion badges.


## End — 2026-11-17 01:08 KST
- Live host correction **PRODUCTION HOST CRON VERIFIED**: retired job absent; new local baseline has zero debian cron entries, encrypted systemd timer stays active/enabled/Result=success, 60 backups intact, Spring health HTTP 200. No app service restart or production promotion was necessary; user and financial data untouched.
- **RESTORE SMOKE VERIFIED** in disposable PostgreSQL; not full financial/photo/application or external disaster recovery certification. Host data copied into isolated database was deleted afterward; off-host remains BLOCKED by missing independently authorized immutable target and credentials.
- GitHub source branch pushed at `2eceaf832266b9daab1615335bfcc1ed4844b795`; PR #3208 opened for read-only regression checker, 8 Node tests, runbook and bilingual changes. Live script remains private under repo policy (operational `*.sh` excluded).
- Tests: 8/8 read-only detector tests, 16/16 Telegram bridge tests, `git diff --check`, live `node scripts/backup/check-legacy-cron.mjs`, isolated pg_restore and table reads. CI for PR pending at log time; **do not claim merged main or exact-SHA Test promotion**.
- Follow-up: prove off-host immutable encrypted replica, remote checksum, regular full DR restore and financial/account invariants, alert delivery on real failure; no fake completion badges.
