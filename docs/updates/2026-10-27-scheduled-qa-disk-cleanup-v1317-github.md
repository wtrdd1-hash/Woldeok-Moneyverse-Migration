# v2026.10.27.1317 — Scheduled QA and disk hygiene (GitHub)

Status: BRANCH CANDIDATE. No change to application API or data schema.

1. Restore source control for systemd's hourly QA smoke script. Check 26 public HTTP endpoints and a read-only session count. Unexpected HTTP redirects must not be counted as passes; 26 HTTP results are not full authenticated functional QA.
2. Invoke a safe cleaner whenever scheduled QA exits, regardless of success or failure. Only directories under the QA-exclusive scratch root with explicit completion markers, correct ownership, age above 72 hours, and no symlinks may be deleted. Limit each invocation to 20 directories and 2 GiB.
3. Record root/data filesystem capacity before and after cleanup. Protect all database, log/WAL, backup, release, upload, other development worktrees and retained QA evidence.
4. Verification: cleanup unit tests, Bash syntax, actual scheduled runner, health probes and CI checks. Full five-pass route/role/mobile QA remains separate and not certified here.

Repository baseline at start: 584f01a9. Mid-work remote main advanced to 83fc4280 and the isolated branch was fast-forwarded; no application code was overwritten.
