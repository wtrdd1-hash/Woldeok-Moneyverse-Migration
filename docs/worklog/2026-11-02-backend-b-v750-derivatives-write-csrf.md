# Backend B v750 — Derivatives Financial Write CSRF Boundary

**2026-11-02 KST | DRAFT / RELEASE HOLD.** Base `a8541927c3a351d980454c66e95a3356c47e0722` (origin/main checked at start/mid). Independent branch `auto/hourly-b-v750-derivatives-write-csrf-20261102-1110`. QA v1460 FAILED/P0; planning v1644 English/Korean parity reviewed. No shared DB, WLD, ledger or applied migration change.

## Scope and overlap review

Reviewed all open PRs, recent A/C/B/QA changes and active planning. P0 burn-draw unsafe settlement was already covered by existing Draft #2403 and issue #2404; abandoned a duplicate *uncommitted* candidate and safely removed only that candidate worktree/branch. Draft #2394 and QA #2398 cover derivatives release-policy assertions, not the Nest write CSRF boundary. No other PR was found changing `backend/src/stock/derivatives.controller.ts` for this guard.

## Confirmed defect and implemented API contract

`DerivativesController` already requires session, authenticated member and current consent at class scope, but the two financial mutation methods had no CSRF guard. Real Nest HTTP tests showed missing or mismatched CSRF returned HTTP 503 (reaching the handler) instead of 403. This is a future-activation vulnerability even while the derivatives ledger and market feed are intentionally unavailable.

- `POST /api/v1/stocks/derivatives/open`: add session-bound `CsrfGuard`. Missing or invalid CSRF now 403; valid session CSRF still 503 `DERIVATIVES_DATA_UNVERIFIED` (no collateral lock, position or WLD transaction).
- `POST /api/v1/stocks/derivatives/:id/close`: same 403/503 behavior (no liquidation or settlement).
- `GET /markets`, `/positions`, `/history` remain unchanged and fail closed on unverified data. No new DB functions, routes, status-200 success, synthetic prices, collateral, or account writes.
- Existing source-truth HTTP test now explicitly bypasses the CSRF guard *only in its fixture* to test the post-auth 503 contract; a separate new HTTP suite uses the real `CsrfGuard` and session-bound token verifier.

No active frontend or Android write call to these endpoints was found in the inspected repository. The `/stocks/derivatives` web page reads only `/markets` and already displays an unavailable state. Do not enable a browser/mobile financial write UI until a server-side CSRF flow, authoritative ledger, idempotency, concurrency and owner receipts have been implemented and independently verified.

## Test evidence

RED: new Nest HTTP suite 6/6 failed against unguarded source (missing/wrong CSRF returned 503, and verifier not called). GREEN: new suite 6/6, existing derivatives provenance 4/4, broader finance truth 4/4. Full lint/typecheck, unit/integration, builds, security, contract, real PostgreSQL and exact-SHA gates are recorded in the miniPC task logs. No skipped suite is counted as passing.

## Release HOLD

This PR is a preventive security hardening change, **not** proof of functional derivatives trading. Require zero-failure full CI, isolated real PostgreSQL, authenticated exact-SHA Test E2E, independent restore and GitOps release gates before merge/Production promotion. Unverified Test/Production executable SHA and existing unrelated P0 QA failures block release. No merge or deployment performed by this worklog.
