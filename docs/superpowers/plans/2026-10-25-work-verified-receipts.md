# Verified Work Payout Receipts — bounded implementation plan

**Scope:** P1 read-only user feature. The current work page displays the latest 20 `work_my_receipts` records as "claimed" even when `transaction_id` is null. Distinguish EXP-only from ledger-confirmed WLD and failed verification. No rewards are minted and no applied migration changes.

**Design:** Owner identity is derived from session. Repository reads `work_my_receipts(actor)` (SECURITY DEFINER) and joins a grouped owner cash/bank posting aggregate by `transaction_id`, constrained by owner and matching positive amount. No direct app DML or PUBLIC grant. `VERIFIED` requires non-null ledger transaction with net owner credit matching reward; `EXP_ONLY` requires zero WLD and no transaction; other cases are `UNVERIFIED` and are excluded from verified sum. SQL amounts are strings, sums use BigInt, only recent 20. Backend `GET /api/v1/work/earnings` returns verified WLD/EXP counts and receipts; errors propagate (not fabricated zero). Web `/work/earnings` is private/no-store/noindex, with accessible status labels and link from `/work`; Android `/app-api/v1/work/earnings` via existing guarded gateway, tested for auth/no-store. Rollback is code-only, no ledger or migration writes.

**Tasks / red-green:**
1. Repository: add failing tests for owner-only SQL, missing transaction, wrong-owner, partial amount, zero-WLD and huge integer strings; implement verified read and aggregate.
2. Controller: add failing session/auth/error propagation tests; implement read-only GET route with no body or user id input.
3. Frontend: add failing render/contract tests for empty, verified, EXP-only, unverified and unavailable; implement dedicated page and navigation.
4. Android: add failing gateway/contract route tests; confirm authenticated pass-through and private cache behavior.
5. Isolated real PostgreSQL: read-only transaction, role ACL, synthetic fixture only if truly isolated, rollback; no Production/dev 5433 writes.
6. Run targeted and full lint/typecheck/build/test/audit/accessibility/SEO/app-api/E2E. Recheck latest main and integrated plan before merge; if any gate fails, keep Draft PR and Production HOLD.

**Acceptance:** no false WLD payment, no Number precision loss, no cross-user rows, no fallback fake success, 20-item limit accurately disclosed, no main or Production change until all gates PASS.
