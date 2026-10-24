# Bond unposted WLD containment — implementation plan

> Bounded emergency safety correction; user has explicitly authorized P0/P1 Backend implementation and non-interactive operation.

**Goal:** Prevent any treasury bond WLD balance mutation until it can be posted to the authoritative double-entry ledger with idempotent receipts.

**Root cause:** `treasury-bond.repository.ts` directly updates `account_balances` in subscription, repo borrow/repay, and coupon/maturity distribution without calling a ledger posting function. Existing SQL transactions alone cannot provide ledger integrity.

**Scope:** Fail closed at both service and repository before any DB query; retain read-only endpoints, status configuration and non-WLD rollover. Prevent admin coupon UI from claiming it can pay, and make its legacy POST route return 503. Do not alter existing migrations, real balances, or unrelated developers' branches. This is containment, not a replacement settlement engine.

**Task 1 — RED:** Add service/repository tests for four WLD mutation families asserting 503 and zero DB/repository calls; assert legacy coupon proxy/UI fail closed. Run focused tests to observe failure.

**Task 2 — GREEN:** Add shared hold exception and enforce at both layers; disable coupon action UI and proxy. Preserve validation for invalid subscription quantities.

**Task 3 — verification:** Run focused and existing tests, lint/typecheck/build, API contract, CI, security audit, and isolated Test exact-SHA only if gates pass. Keep Draft PR and Production HOLD on any failure.

**Risk:** All bond purchase/borrow/repay and coupon/maturity settlement become temporarily unavailable. Existing bond holdings and records are untouched. The eventual replacement requires ledger-first SECURITY DEFINER atomic settlement, ownership/limits/idempotency/concurrency tests and UI receipts.
