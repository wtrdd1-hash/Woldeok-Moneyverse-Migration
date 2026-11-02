# Backend B v749 — Bond state-change CSRF and verified rollover

## Before work (2026-11-02 10:36 KST)
- Base main `a8541927c3a351d980454c66e95a3356c47e0722`.
- QA v1460 Production HOLD: production 14/28 anonymous routes 500; two backend production-mode profile HTTP tests fail; Test exact SHA, independent restore and financial certification blocked.
- Open related #2270 is member bond read verification, not this state-change CSRF scope.
- Scope: Nest admin coupon payout/status and member rollover guards; Next owner rollover BFF token forwarding, validation, no false success. No DB schema/ledger/WLD change.

## Implementation checklist
- [x] RED: actual Nest HTTP guard regression and Next BFF regression tests.
- [x] GREEN: add guards and forward server session CSRF token; fail closed on false update.
- [ ] Run focused and workspace checks, inspect CI and Test SHA (bond 75 PASS, typecheck PASS; rest pending).
- [ ] Re-fetch main and plans, record HOLD blockers and PR.

## In progress
- Worktree isolated; no writes to main or shared services.

## Finished
- Pending.

### Midpoint — RED/GREEN evidence (10:37 KST)
- RED: Nest real HTTP 9/9 FAIL (missing/invalid CSRF allowed); Next rollover BFF 4/4 FAIL (no token, accepts invalid payload, false success).
- GREEN: Nest 9/9 PASS; Next 4/4 PASS.
- Added `CsrfGuard` to admin coupon payout/status and `ConsentGuard,CsrfGuard` to owner rollover. Next BFF obtains server-session CSRF, validates UUID/boolean, rejects unconfirmed/mismatched update, and sends private no-store/noindex/no-referrer headers.
- No SQL/migration/ledger/balance changes. Original `origin/main` remains unchanged at midpoint.

### Regression checkpoint (10:44 KST)
- Focused bond suite initially failed at Nest test fixture injection: adding CsrfGuard to admin methods requires the coupon-logs GET-only fixture to override the guard (no session repository provider in that isolated test module). Corrected fixture without weakening production guards.
- Bond suite rerun: 13 files PASS / 75 tests PASS. Whole workspace typecheck exit 0. Whole workspace lint printed 0 errors/1,026 warnings, but wrapper exit capture timed out; targeted exit verification and remaining gates pending.
- Root disk briefly 97%; avoid bulk deletion and avoid concurrent memory-heavy builds.
