# Backend B v550 — Outbound SSRF fetch abort/deadline integrity

## Before work — 2026-10-26 08:35 KST
- Starting `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch `auto/hourly-b-ssrf-abort-deadline-v550-20261026-0835`.
- Read AGENTS.md, README.md, English/Korean living plans, open PRs including #1368, QA #1317/#1391, CI, and A/C/Planning overlap. Scope intentionally excludes IPv4-mapped SSRF #1368 and DNS rebinding #1369.
- Debian 13.6 miniPC services active; root filesystem 100% (735MiB free), data volume 77% (45GiB free). No changes to other worktrees.
- P1 hypothesis: `safeFetch` lets a caller-supplied `RequestInit.signal` override the wrapper's ten-second AbortController; an unresponsive upstream can therefore hold backend requests indefinitely.
- RED: demonstrate caller-signal timeout bypass; GREEN: compose timeout and caller abort without losing either; verify redirects use the same deadline.
- No DB migration, economic write, API shape change or deployment is authorized.

## In progress
- Pending tests and implementation.

## Finished
- Pending gates and release hold.
- RED evidence at 08:36 KST: new 3-test suite reports 2 timeout failures (caller-signal bypass and redirected request), 1 caller-abort PASS. The failures reproduce the real 10-second deadline bypass before implementation.
- GREEN at 08:37 KST: 16/16 SSRF focused tests PASS after combining `AbortController.signal` with caller cancellation via `AbortSignal.any`; same-origin redirect keeps one deadline. Fixed test harness to attach rejection assertions before advancing fake time, eliminating unhandled rejections.
- Mid-run `origin/main` remains `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English/Korean plans rechecked. No conflict with other open PRs.

## Finished — 2026-10-26 08:42 KST (DRAFT / RELEASE HOLD)
- Changed `backend/src/security/ssrf-defense.ts`: compose the mandatory 10-second fetch deadline with a caller-provided abort signal; keep the combined signal across redirect hops. No new API, database, migration, account, financial or ledger writes.
- Added `backend/src/security/ssrf-abort-deadline.test.ts`: timeout despite caller signal, early caller cancellation, single deadline across same-origin redirect. RED 2/3 before fix; GREEN focused 16/16 across three SSRF suites.
- Local gates on code SHA `c625cae721e10801cc7f637fcd86b3e6c8e444a9`: Backend 1,316 PASS / 398 SKIP; Backend build PASS; workspace typecheck PASS; lint 0 errors / 1,128 warnings; contract 38 PASS; DB package 15 PASS / 3 SKIP; mobile API 179 endpoints PASS; repository security/release tests 18 PASS; bot 8 PASS.
- Mandatory blockers: Frontend 1,397 PASS / 6 FAIL (existing SEO, mobile login, calculator registration and M2 regressions); default Turbopack build FAIL (symlinked worktree package resolution); alternate Webpack build FAIL (1GiB Node heap OOM); production dependency audit FAIL (2 High); full audit FAIL (2 Critical, 10 High, 11 Moderate, 3 Low).
- A historical `scripts/check-secrets.sh` command is absent in this checkout; actual repository security/release test suite passed (18/18). No gate was waived or marked green by the missing script.
- Official isolated PostgreSQL/app-role ACL, authenticated core-user E2E, Test exact-SHA, approved release gates: BLOCKED / not run. Existing database containers are owned by other tasks or shared, so they were not mutated. No live database, Test or Production deployment changes.
- Current root filesystem 100% used (~734MiB available); data volume 77% used. Do not delete other teams' artifacts. Storage risk P0 #1170 persists.
- Start/mid/pre-PR main SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, English/Korean planning baseline v1210 unchanged. Open #1368 modifies the same SSRF module for IPv6 mapping: integration must preserve both patches; no cherry-pick or merge attempted.
- PR to remain Draft; Production HOLD until all required checks, exact-SHA Test and authorized GitOps gate pass. Branch cleanup not performed because this branch has unique unmerged code. Scheduled jobs A/B/C/Planning/QA not modified.
