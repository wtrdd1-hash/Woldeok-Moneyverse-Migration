# Backend B v723 — Crafting source/ledger safety hold (2026-11-01)

**Priority:** P0 finance / provenance. **State:** Draft/HOLD; not approved for merge or deployment. **Frontend handoff:** #2330.

## Reproduction and root cause

- Canonical starting main: `9052076301bf1975422731ab50a8b7770dbbe951`.
- A read-only DEV `pg_proc` inspection found `public.crafting_execute(uuid,text,uuid)` owned by `postgres` and executable by `moneyverse_app`. Its implementation updates `user_cash_balances.cash_balance` and inventory rows directly, never calls the canonical `economy_post_transaction`, and only null-checks its idempotency argument. It does not lock/replay an idempotency receipt. No canonical SQL migration in this checkout creates that function; clean 316-migration PostgreSQL replay confirms it is absent. This is a DEV/source provenance discrepancy, not proof that Production ran a crafting transaction.
- Before the patch, `GET /api/v1/crafting/recipes` returned static recipes as available (HTTP 200); a mocked successful service returned HTTP 201 for `POST /api/v1/crafting/execute`. The unmodified service invoked the unsafe function.

## Implemented safety boundary

- Authenticated `GET /api/v1/crafting/recipes` returns **503** problem code `CRAFTING_SOURCE_UNVERIFIED`; no official availability claim.
- Authenticated + consent + CSRF-protected `POST /api/v1/crafting/execute` returns **503** problem code `CRAFTING_LEDGER_UNAVAILABLE`; no WLD debit, inventory write, or fabricated receipt. Service-level execution is also disabled to prevent an internal bypass.
- Crafting module pre-guard middleware sets `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`, including 401/403 and error responses.
- No new endpoint, database migration, role GRANT, ledger posting, API success DTO, or frontend feature is claimed. Existing applied migrations are unchanged.

## Tests and release gates

- RED: 2 HTTP contract tests failed (200/201 instead of 503); 2 service/middleware tests failed.
- GREEN: 7/7 crafting tests, including real Nest HTTP 503 and guard/CSRF metadata; changed-file ESLint, Backend Typecheck and Build PASS.
- Isolated PostgreSQL 17.11: **316 migrations applied**, clean DB `crafting_execute_exists=false`, app ledger DELETE=false, app balance UPDATE=false. Real PostgreSQL session/game integration **37/37 PASS**; container removed. Shared DB not modified.
- Full Backend suite: **2966 PASS / 2 FAIL / 518 SKIP**; both failures are preexisting profile HTTP test fixtures missing the required internal token (QA v1439, existing repair PR #2265). Do not call the full suite PASS.
- Official Test exact candidate SHA, authenticated E2E, frontend craftable-state fix, full CI and GitOps release gates **NOT PASSED**. Production RELEASE HOLD remains mandatory.

## Remaining work

A/C: disable misleading hardcoded craftable badges/buttons and WLD-burn/item-delivery claims; see #2330. DB/QA: reconcile out-of-band DEV function and Production/Test provenance, design a forward-only audited ledger+idempotency settlement with safe replay, owner checks and negative permissions; do not patch applied migrations or delete a live function blindly. Run full clean DB and exact-SHA Test authentication/ledger E2E before any approval.

## Final local gate addendum

- Full workspace Lint PASS (0 errors, 1,022 existing warnings); full workspace Typecheck PASS.
- Mobile API contract generation correctly changed the crafting GET/POST success `responseSchema` to `never` (both are 503-only); regenerated `docs/mobile-api-contract.json` is committed alongside the code. API contract check must be rerun at the new SHA.
- Frontend full Vitest exceeded 185 seconds and was terminated by the bounded runner (exit 124), so no full Frontend PASS claim. Crafting frontend tests were among the completed passing files, but the full suite is **UNVERIFIED**.
- Full Backend 2 failing profile HTTP fixture tests are pre-existing and tracked in QA v1439/#2265. They are not silently waived. Exact-SHA CI and official Test remain required before merge.
