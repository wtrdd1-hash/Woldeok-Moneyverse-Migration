# v526 SWF financial mutation containment (P0, release HOLD)

Source: main c9a868b1, issue #1164, QA v1257. Existing ASWF methods write treasury vault/portfolio tables directly, including simulated tax increments, without a demonstrated ledger posting or immutable receipt. B v513 treasury admin guards remain unmerged. Do not enable a write via a frontend-only CSRF patch.

1. RED: backend controller tests assert POST rebalance, POST liquidation and PUT configuration fail with 503 before service calls. Frontend route tests assert the same for browser proxy calls and no upstream mutation; UI test asserts action controls are disabled.
2. GREEN: backend fail-closed controller, frontend 503 no-store responses, and disabled admin action buttons with explicit reason. Keep GET status read-only. No migration or production DB changes.
3. Verify focused tests, backend/frontend typecheck/build/lint, API contract, full tests, security audit and exact SHA CI. Any failure => Draft PR, no merge/deploy.
4. Follow-up separately: privileged session/CSRF/reauth, immutable PostgreSQL ledger-backed SWF settlement, audit receipts, isolated PG, exact-SHA Test E2E, approved release gate.

Rollback: revert unmerged branch only. Never re-enable mutations without independent finance evidence.
