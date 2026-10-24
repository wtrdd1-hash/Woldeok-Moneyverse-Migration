# Development B v510 — Treasury bond ledger containment

**Date:** 2026-10-24 KST 17:34–17:49. **State:** PARTIAL / HOLD. **Issue:** #1151.

## Before work
- [x] Called miniPC system status, shell, and file-read MCP; Debian 13.6, Backend/Frontend/Bot/Nginx/Docker active. File-read MCP returned an empty object; shell supplied actual file contents.
- [x] Fetched `origin/main=49788d09494fed3e463651945b83386e87dd47bc`, read `AGENTS.md`, `README.md`, English and Korean project plans, open PRs, recent CI, and other worktrees.
- [x] Confirmed no open bond-focused PR and created an independent worktree/branch. QA and other A/C work untouched.
- [x] Selected P0: `treasury-bond.repository.ts` directly updates `account_balances` in subscription, repo borrow/repay and coupon/maturity payout without authoritative double-entry ledger postings. This is a source risk, **not proof of Production divergence**. Existing #993 app-role DML and #1053 shared DB further prohibit live mutation testing.
- [x] Internal start log written before changes; implementation plan saved in `docs/superpowers/plans/2026-10-24-bond-unposted-wld-containment.md`.

## In progress
- [x] RED: new backend hold tests failed 8/8 and frontend hold tests failed 2/2. Admin guard tests failed 2/2 before patch.
- [x] GREEN: service and repository both fail closed before DB calls for subscription, repo borrow, repo repay and coupon/maturity payout. Stable HTTP 503 code `bond_ledger_settlement_unavailable`. Invalid subscription quantities still return validation errors.
- [x] Admin coupon and bond status writes require CSRF and recent reauthentication; class-level session, consent, admin and console guards remain.
- [x] Legacy Next coupon POST proxy now returns 503 without backend invocation. Manual coupon payout UI disabled and visibly marked as suspended. Read-only market, holdings and coupon-history routes unchanged.
- [x] Updated obsolete success tests to assert the containment behavior. No migration, WLD, ledger, existing holding or Production DB modification.
- [x] Mid-run main and both plan headings rechecked: main unchanged; planning remains release HOLD. Issue #1151 opened for ledger-first replacement.

## Verification / finished state
- [x] Final focused backend: **22/22 PASS** (service/repository/guards); frontend hold: **2/2 PASS**.
- [x] Backend full local: **1,321 PASS / 398 SKIPPED** (before final admin guard addition; final focused guard suite PASS). No real PG used.
- [x] Frontend full: **1,397 PASS / 5 FAIL**, failures outside changed scope (locale default 1, SEO 3, login touch target 1).
- [x] DB package: **15 PASS / 3 SKIPPED**; API contract check PASS.
- [x] Final typecheck PASS; full ESLint 0 errors / 1,135 warnings; Backend final build PASS; Frontend build PASS (frontend source unchanged after build).
- [ ] Production dependency audit: **FAIL** (2 High: body-parser, multer). Bot audit: **FAIL** (1 Critical, 5 High).
- [ ] Real isolated PostgreSQL, authorized admin E2E, official Test exact-SHA, required CI: **BLOCKED / not verified**.
- [ ] main merge and Production release: **NOT PERFORMED / HOLD**.

## API/DB and rollback contract
- `POST /api/v1/bonds/subscribe`, `/api/v1/bonds/repo-loans/borrow`, `/api/v1/bonds/repo-loans/repay`, `/api/v1/admin/bonds/distribute-coupons` refuse with 503 before any balance mutation. Next `POST /api/admin/bonds/distribute-coupons` refuses with 503.
- `PUT /api/v1/admin/bonds/:id/status` and admin coupon POST now require CSRF + recent reauthentication in addition to existing admin console controls. No DB schema or applied migration change.
- This is temporary containment, **not a complete settlement implementation**. Existing bonds and coupons are not paid while the hold is active. Do not remove until a reviewed SECURITY DEFINER atomic double-entry function, owner-bound idempotent receipts, concurrency/rollback tests, isolated PostgreSQL, user flows and exact-SHA Test evidence exist.
- Rollback of code is not an acceptable Production fix because it re-enables unposted WLD writes; prefer continued HOLD pending an audited replacement.

## Coordination and release
- No other worktree, Gemini, A/C, QA, planning or automation settings were changed. No branches cleaned. All new code is on an independent non-main branch. Production promotion is prohibited while any required gate fails.
