# Backend B v742 — FX financial write CSRF and admin console guard (2026-11-02)

**Status: DRAFT / RELEASE HOLD.** Baseline `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`, checked at start, mid and after local verification. Branch `auto/hourly-b-v742-fx-csrf-20261102-0437` is isolated from A/C/QA/Gemini work.

## Reproduced P1 boundary

The FX controller exposes four administrator financial POST operations (`/admin/fx/intervene`, `/admin/fx/swaps/drawdown`, `/admin/fx/forward/settle`, `/admin/fx/halt`) behind a role check but without an open administrator console session or session-bound CSRF check. Three member financial POST operations (`/fx/forward/contract`, `/fx/swap/wld-to-usd`, `/fx/swap/usd-to-wld`) likewise lacked CSRF validation. The FX service currently returns 503 for financial mutations; this is a **latent authorization contract gap**, not evidence of an actual unauthorized money transfer. Future financial enablement must not silently bypass these boundaries.

## Implementation and contract

- Require `AdminSessionGuard` and `CsrfGuard` for each of the four admin FX POST routes, after existing session, consent, authenticated-user and administrator role guards.
- Require `CsrfGuard` for each of the three member FX POST routes after the existing session and authenticated-user guards.
- Invalid or missing session-bound CSRF returns HTTP 403 before invoking any financial service method. A missing admin console returns 403; an idle-locked/expired console returns 401. Valid authorization still reaches the existing fail-closed financial service and returns 503.
- Preserve GET behavior, route paths, response DTOs, session identity, DB schema, migration lineage, ledger, WLD balances and runtime service state.
- The existing public FX GET-only HTTP fixture overrides the newly discovered CSRF guard to avoid requiring a database provider for an unrelated mocked read; a separate new HTTP suite exercises the **real** CSRF and admin-console guards with a stubbed SessionRepository.

## Test evidence (local candidate, no Test or Production deployment)

- TDD RED: 18 of 19 new HTTP tests failed before the fix; GREEN: 19/19 new FX HTTP tests passed, plus 8/8 FX financial mutation hold tests and 2/2 public FX HTTP tests.
- Workspace TypeScript typecheck PASS; ESLint PASS with 0 errors and 1,027 pre-existing warnings; Backend build PASS; Frontend build PASS after retrying with 2,048 MB heap (1,024 MB first attempt failed with V8 OOM).
- Frontend full test command PASS. Backend full tests FAIL: two pre-existing profile privacy HTTP tests expect 200 but receive 401; all other backend tests passed/skipped. See existing repair PR #2265; do not mark global regression gate green.
- Contract 41 PASS; database package 62 PASS/5 SKIP; Android mobile API contract 184 endpoints matched; security/release/backup checks 34 PASS.
- Isolated PostgreSQL 17.11: 322/322 forward migrations applied; real session integration 17 PASS, game integration 20 PASS. `moneyverse_app` has no direct `account_balances.UPDATE` or `ledger_postings.DELETE` grant in this isolated database. No production or shared DB touched; disposable container removed.
- Production dependency audit: 0 known vulnerabilities; full dependency audit FAIL with 9 known dev-dependency findings (1 low, 8 moderate).

## Integration and release blockers

Member FX browser handlers in `frontend/src/app/fx/page.tsx` still issue direct POST requests without session-bound CSRF. The frontend FX financial controls are already intentionally held/disabled under issue #2108, so this change does **not** claim an operational FX trading flow. A/C must use authenticated server actions and the session CSRF token before any future enablement; preserve 401/403/503 UX. No authoritative ledger-backed FX settlement exists. Full backend suite, official isolated Test exact-SHA auth/E2E, CI runtime, independent restore and GitOps release gates are not all PASS. **No merge, Test deployment or Production promotion authorized.**
