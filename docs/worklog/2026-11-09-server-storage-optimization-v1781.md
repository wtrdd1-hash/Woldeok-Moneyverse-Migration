# Host Storage Optimization — v2026.11.09.1781 (Operations Only)

**Status:** HOST APPLIED / POST-CHECK VERIFIED; application code, official Test and Production releases **UNCHANGED**. [한국어](2026-11-09-server-storage-optimization-v1781.ko.md)

## Start: 2026-11-09 KST
- Scope: authorized Debian 13 `debian13`; no DB mutation, finance data deletion, Docker prune, release rotation, service restart, production deployment or live-source change.
- Source `origin/main` at start and midpoint: `b2980de529eaea505f1387d2bd05e45b7c1c064a`. Isolated branch: `ops/server-optimization-v2026.11.09.1781`.
- Read documentation governance, planning master, integrated master, AGENTS, infrastructure, runtime and releasing references. The living plans remain authoritative; this operations evidence does not advance the product plan.
- Concurrent workspaces were detected, including independent blog v1778 and hourly B/C tasks. No linked worktrees or branches were removed.
- Baseline: Ryzen 7 7735HS / 16 logical CPUs, 1-minute load 0.06, RAM 3,228/13,949 MB (23%). Root `/dev/sdb1` 49% used. Data `/dev/sda1` 55% used (~103 GiB used).
- Core backend, frontend, MCP, Nginx, Docker and test services active. The 17:00 hourly QA reported HTTP 24 PASS, 2 auth-gated NOT TESTED, 0 failed. This is *not* full authenticated functional QA.

## Midpoint: root-cause and guarded cleanup
- `/srv/moneyverse-data/tasks` occupied about 38–39 GiB. Active immutable releases, DB volumes, backup sets, user data and live workspaces were excluded from cleanup.
- Existing root-controlled `ops/disk-cleanup/cache-clean-v20261103.py` was inspected before reuse. It restricts removal to task-local Next.js `.next/cache`, rejects symlinks, non-owner/young files and cross-filesystem content, checks process work directories, re-verifies contents immediately before deletion, and limits the count/bytes per mount.
- First unprivileged dry-run failed only because the existing cleanup lock is root-owned; the subsequent `sudo -n` dry-run succeeded. Evidence: `/srv/moneyverse-data/tasks/mv-server-opt-20261109-1750/cache-dry-run-full.json`.
- Dry-run: 9 eligible historical 2026-11-08 C-worktree Next caches, 8,434,507,776 allocated bytes; root 0 candidates; 0 active/unsafe exceptions. No application or financial data were eligible.
- Before: root available 51,809,927,168 bytes; data available 90,301,984,768 bytes. Main rechecked against origin before applying.

## Applied / verification
- Applied the existing guarded cache cleaner with `--apply`, with rescans and no failed removals. Exactly 9 cache directories removed, 8,434,507,776 allocated bytes reclaimed (7.85 GiB).
- After: root available 51,809,927,168 bytes (unchanged); data available 98,736,492,544 bytes (+8,434,507,776); `df` data usage 55% → 51% (approximately 92 GiB available).
- Post-action `systemctl is-active`: Production backend, Production frontend, Test backend, Test frontend, Nginx and Moneyverse MCP all `active`.
- Public HTTPS `GET https://easy-scraping.com/api/health` returned HTTP 200. No restarts, DB SQL, deployment, financial migration, live release switch, or user data modifications were executed.
- Full CI, authenticated E2E, official Test promotion, and new Production application release: **NOT RUN / NOT APPLICABLE to host cache cleanup**. HTTP 200 does not prove every application function.
- Other observations not silently fixed: three previously failed historical systemd units; occasional 12-second QA route timeouts despite the 17:00 HTTP smoke summary passing; three isolated PostgreSQL clones still running. These require separate ownership/traffic review, not blind termination.
- Source patch contains documentation only; no runtime source changes. No release or rollback required. Preserve immutable prior releases and backups.
- Receipts: local task `WORKLOG.md`, `cache-dry-run-full.json`, `cache-apply-full.json`, `cache-apply-summary.json`. Host artifacts are **not** embedded in GitHub.

## Follow-up
- Keep the existing hourly QA timer, backup timer, logrotate and retention protections enabled; observe the next QA and backup runs.
- Investigate the intermittent SSR smoke timeouts by route before tuning Nginx or altering probes. Investigate dormant failed service units only after confirming dependencies.
- Avoid broad `docker system prune`, manual `rm -rf` on active worktrees, blanket PostgreSQL `VACUUM FULL`, swap flushing, or disabling needed workers.
