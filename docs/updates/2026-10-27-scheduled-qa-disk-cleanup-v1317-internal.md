# v2026.10.27.1317 — Internal operations update

Status: BRANCH CANDIDATE until independently tested and installed.
- Reconcile hourly QA script missing from current GitHub main, while systemd still executes local legacy copy.
- Preserve hourly 26-path HTTP smoke, but only HTTP 200 counts as a pass. Show session DB probe separately and explicitly label authenticated full-route/5-pass QA as NOT TESTED.
- Always call bounded cleanup on QA exit, even when a route fails.
- Cleanup is limited to QA-owned /tmp/moneyverse-qa-disposable/run-* directories with complete marker, older than 72 h, current UID, no symlinks, maximum 20 runs and 2 GiB per invocation.
- Two-disk pressure recorded before/after; no Docker pruning, no database/backup/release artifact deletion.
- Tests and operational evidence shall be appended to matching worklog.
