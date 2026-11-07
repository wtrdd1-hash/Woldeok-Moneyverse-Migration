# Backend B v749 — Bond state-change CSRF and verified rollover

## Before work (2026-11-02 10:36 KST)
- Base main `a8541927c3a351d980454c66e95a3356c47e0722`.
- QA v1460 Production HOLD: production 14/28 anonymous routes 500; two backend production-mode profile HTTP tests fail; Test exact SHA, independent restore and financial certification blocked.
- Open related #2270 is member bond read verification, not this state-change CSRF scope.
- Scope: Nest admin coupon payout/status and member rollover guards; Next owner rollover BFF token forwarding, validation, no false success. No DB schema/ledger/WLD change.

## Implementation checklist
- [x] RED: actual Nest HTTP guard regression and Next BFF regression tests.
- [x] GREEN: add guards and forward server session CSRF token; fail closed on false update.
- [x] Run focused and workspace checks, inspect CI and Test SHA; record failures without bypassing release gates.
- [x] Re-fetch main and plans, record HOLD blockers and PR.

## In progress
- Worktree isolated; no writes to main or shared services.

## Finished (2026-11-02 10:57 KST) — PARTIAL / BLOCKED
- Start/mid/end `origin/main`: `a8541927c3a351d980454c66e95a3356c47e0722`; branch `auto/hourly-b-v749-bond-write-csrf-20261102-1035`. PR #2458 Draft/HOLD.
- Code SHA tested: `7d86b07c417e9d722dd311da2613b7b2d082a388` (initial code commit `4a63f75ed1c2fa34799e70a4f18f3f47bdb603ba`).
- Nest HTTP 9/9 PASS after RED 9/9 FAIL; Next BFF 4/4 PASS after RED 4/4 FAIL; focused bonds 75 PASS. Backend coupon GET test fixture corrected after new guard dependency.
- Workspace lint exit 0, 0 errors/1,026 warnings; typecheck exit 0; backend/frontend build exit 0 (602 frontend pages); Frontend 2,926 PASS; contract 41 PASS; database 62 PASS/5 SKIP; mobile API contract 184 endpoints matched; security/release/backup subset 26 PASS; Production dependency audit 0 known vulnerabilities.
- Backend full NODE_ENV=test and production-mode each 2,987 PASS/2 FAIL/518 SKIP; existing unrelated profile-private-response HTTP 401 vs expected 200, previously tracked in #2265. Full dependency audit exit 1: 9 advisories (8 moderate, 1 low). Full route ledger check exit 1: missing `artifacts/qa/full-route-ledger.json` (QA1460 baseline blocker).
- Isolated ephemeral PostgreSQL 17.11: 322/322 migrations applied, 48 real DB PASS/2 SKIP, `moneyverse_app` account balance UPDATE=false and ledger DELETE=false in isolated DB. Container stopped/removed; **do not confuse isolated ACL with the unsafe shared DEV grants reported by QA1460**.
- Remote CI for code SHA #2458: release-input, classify, policy, runtime-check, build all PASS; production dispatch skipped. Full Test exact-SHA, authenticated owner E2E, independent off-host restore and GitOps release acceptance NOT PASS.
- Public Test and Production `/api/version` both `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, not candidate. QA1460 Production 14/28 anonymous probes HTTP 500. No main merge, Test/Production deploy, service restart, shared DB/ledger/WLD mutation or collaborator branch deletion.
- Disk ~96% used, 4.1 GiB free at finish. No bulk cleanup. Existing A/B/C/planning/QA schedules unchanged.
- **Release decision: HOLD.** No code-only passing subset overrides failed backend/route-ledger/audit/exact-SHA/E2E/restore gates.


### Midpoint — RED/GREEN evidence (10:37 KST)
- RED: Nest real HTTP 9/9 FAIL (missing/invalid CSRF allowed); Next rollover BFF 4/4 FAIL (no token, accepts invalid payload, false success).
- GREEN: Nest 9/9 PASS; Next 4/4 PASS.
- Added `CsrfGuard` to admin coupon payout/status and `ConsentGuard,CsrfGuard` to owner rollover. Next BFF obtains server-session CSRF, validates UUID/boolean, rejects unconfirmed/mismatched update, and sends private no-store/noindex/no-referrer headers.
- No SQL/migration/ledger/balance changes. Original `origin/main` remains unchanged at midpoint.

### Regression checkpoint (10:44 KST)
- Focused bond suite initially failed at Nest test fixture injection: adding CsrfGuard to admin methods requires the coupon-logs GET-only fixture to override the guard (no session repository provider in that isolated test module). Corrected fixture without weakening production guards.
- Bond suite rerun: 13 files PASS / 75 tests PASS. Whole workspace typecheck exit 0. Whole workspace lint printed 0 errors/1,026 warnings, but wrapper exit capture timed out; targeted exit verification and remaining gates pending.
- Root disk briefly 97%; avoid bulk deletion and avoid concurrent memory-heavy builds.
