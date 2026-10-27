# v2026.10.27.1318 — Final scheduled-QA rollout evidence

Status: OPS PRODUCTION_VERIFIED, 2026-10-27 15:15 KST. App Test/Production promotion: NOT APPLICABLE.

- After documentation and code review, GitHub PR #1542 was merged to main as `0da3b88697a40b42c45fdd059453f4714a4fd738`. GitHub CI run `40459521074` passed policy/classify; runtime job was skipped by classification. Direct Node tests: 9/9 passing; shell syntax passed.
- Previous effective systemd unit and runner were backed up to `/srv/moneyverse-data/qa-reports/qa1317-evidence/`. New immutable runner and cleaner copied (matching SHA256) to `/srv/moneyverse-data/qa-scheduler-releases/v1317/`.
- New systemd drop-in `/etc/systemd/system/moneyverse-qa.service.d/20-v1317-safe-disk-hygiene.conf` replaced only scheduled QA ExecStart; web/backend/DB units were not restarted.
- Manual systemd run at 15:14:11–15:14:36 KST: Result=success, exit 0, 24 HTTP 200, two expected login redirects (/bank, /marketplace), zero unexpected errors, read-only session count 410. These 2 auth-gated pages are NOT logged-in functional QA successes.
- QA EXIT cleaner removed one deliberately prepared, marked, old QA-owned 262,153-byte canary; verified absent. No unrelated cache or operational data removed, no material free-space claim.
- Disk after: root 76%, data 69%. Backend/frontend/DB health normal; isolated Test backend `/health` HTTP 200. Hourly timer remains enabled; next scheduled run 16:00 KST (not yet observed when recorded).
- Rollback: remove the single drop-in file and `sudo systemctl daemon-reload`; previous unit ExecStart remains available.
- Full authenticated transaction/admin/mobile/browser and mandatory five-pass QA remain NOT VERIFIED.

This closes the scheduler/disk-hygiene operational change only; do not represent this evidence as full product QA certification.
