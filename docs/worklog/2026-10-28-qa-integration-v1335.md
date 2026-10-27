# QA v1335 — Independent Integration of PR #1635 and PR #1644 (DRAFT / HOLD)

## Before work
- Baseline: main `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; authoritative English/Korean integrated planning documents rechecked.
- PR #1635 `efb7f93a71e868fc4a0bdf27c54fda898afa2cf9` had exact-SHA CI success, but not official Test certification. PR #1644 `5a084b757ac272d189fec25ef742810cd3dade53` had exact-SHA CI failure in the database boundary test.
- Use an isolated QA worktree; preserve all contributor branches and uncommitted work. No live database mutation.

## Investigation and correction
- Reproduced the main lint failures (two unnecessary escapes) and duplicate migration 283 / missing 285 sequence. PR #1644's actual CI failed 1 of 2,341 backend tests because `database-boundary.db.test.ts` expected 11 DML privileges intentionally revoked by migration 285. Restoring those privileges would be a security regression.
- The already-reviewed fixture correction in PR #1635 resolves this stale expectation. Locally integrated both exact heads without textual merge conflicts. This branch contains the original candidates plus this worklog; no additional application-code patch was needed.
- The root cause, reproduction, severity and safe remediation were posted to PR #1644 in GitHub comment 6455018904.

## Fresh isolated verification
- Local merge before this documentation commit: `346f36c95ab3b89776bf1759458e91b2905bc6f1`.
- Offline frozen install, ESLint, typecheck, production build, DB migration parity, Discord dependency audit: exit 0.
- Disposable PostgreSQL 17.11: 285 migrations (002–286) applied; full root `pnpm test` exit 0: backend 2,281 PASS / 60 SKIP; frontend 1,686 PASS; DB package 38 PASS / 3 SKIP; API contract 38 PASS. Discord bot 11/11 PASS; bot audit 0 vulnerabilities. Skips are not passes.
- This evidence is for the local integration tree, not official exact-commit GitHub CI or Test. GitHub CI for this new branch must be checked after push.

## Independent main and operations audit
- Main: typecheck/build PASS; lint 2 errors, full root test migration parity FAILED; isolated backend 1,688 PASS / 430 SKIP; frontend 1,681 PASS; bot 8/8 after offline install; root production audit exit 0 (1 moderate), bot audit Critical 1 / High 5.
- 381 non-main branches: 226 unique, 20 ahead, 133 conflicts, 2 ancestral/merged; 375 open PR (360 draft, 15 ready). All ready PRs have failed or skipped checks. Preserve every branch pending provenance review.
- Read-only development DB: 241 public tables, 235 app-update/delete tables, 3 PUBLIC legacy bank functions, balanced ledger 890 transactions/1,810 postings, no orphan/unposted/imbalanced transactions, zero account balance projection mismatches; applied migration checksum mismatches 219/220/221/234/266.
- Production/Test public smoke 40/40 HTTP 200; mobile guest Chromium 24/24 HTTP 200, zero horizontal overflow; 171 page inventory. Authenticated finance/admin/mobile E2E and five-pass full-route coverage NOT VERIFIED.
- Official Test release identity gate ENOENT (dangling pointer), Production release manifest ENOENT. Encrypted systemd backup verified; separate legacy 04:00 cron fails permission denied, do not enable plaintext-capable backup script; independent restore NOT VERIFIED.

## Final disposition
- DRAFT / HOLD. CI must run against this branch's **final** SHA. No main merge, Test/Production promotion, production restart, live DB/ledger/permission changes, or branch deletion. Official Test exact-SHA, finance authorization, checksum provenance, security, authenticated E2E and GitOps approval remain mandatory.
- Detailed evidence: `/srv/moneyverse-data/qa-reports/qa1335-evidence/`; internal report: `/srv/moneyverse-data/tasks/Moneyverse-QA-v2026.10.28.1335-internal.md`.
