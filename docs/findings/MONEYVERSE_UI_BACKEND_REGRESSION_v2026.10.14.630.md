# UI/Backend Regression and API Contract Reconciliation — v2026.10.14.630

**State:** v629 follow-up implementation in an isolated branch; full frontend and TypeScript checks passed locally, **not yet a Test/Production acceptance**. The controlling integrated plan remains v2026.10.05.530 with AUTHORITY_DRIFT. Reference v629 PR #833.

## Baseline and root causes

- Started from v629 `34e2c38d8d322592b831664214e7eb6856ac508f`; `origin/main=d4f9cc1978bea6ee1a0e904005fa418cd159b4cd` at start and intermediate checks. Parallel Gemini grant worktree was deliberately not touched.
- Ran pristine main on the same host/test env: **38 failures in 1169 frontend cases**. The previous v629 suite had 39 failures in 1173 cases; the obsolete preview-auction expectation was corrected in v629.
- PR #833 GitHub CI runtime checks failed at `pnpm api:contract:check`: stale `docs/mobile-api-contract.json` and two schema reference languages. Re-generated current 179-endpoint reference and EN/KO docs from backend TypeScript, with pinned pnpm 10.
- Several legacy tests targeted the retired `/casino` page instead of `/arcade`, incorrectly required authenticated `/bank` to be indexed, assumed the public `robots` sitemap had one URL, pinned an old mobile/desktop layout, and expected English dialog close labels in Korean locale. Tests were updated against actual implemented and security-authoritative behavior, not by exposing protected pages.
- Actual fixes: altered light-theme green token to WCAG AA contrast; suppress administrator floating widget overlay via `RouteAwareFloatingUtilities`; preserve accessible Korean modal title and 44px notification action; never change notification unread display without a validated numeric `updatedCount` acknowledgement; ignore stale feed/unread requests when a read-all succeeds; disallow duplicate read-all requests.
- Corrected test setup to use native React 19 async `act`, and rewrote notification race tests using deferred network responses (rather than clobbering `setInterval` used by the testing library). Media relay assertions now use the configured API origin rather than a hardcoded localhost port. GSC unconfigured state must not show imaginary keywords.
- A few source/string contract assertions were modernized for actual responsive markup and realistic mock-economy transparency, and the route-inventory test now includes the implemented `/arcade`.

## Verification evidence

- **Frontend full suite:** `NODE_ENV=test API_ORIGIN=http://127.0.0.1:9 DATABASE_URL=UNREACHABLE_TEST_DB node node_modules/vitest/vitest.mjs run`: **214 test files / 1173 tests passed**, no network calls or real DB required. Log: host `/srv/moneyverse-tasks/ui-api-remediation-v630/frontend-full-final.log`.
- Frontend and backend TypeScript `tsc --noEmit`: both passed, after v630 implementation; old v629 source contract checks: 10 passed, backend fake-financial command checks: 4 passed. Changed-file lint: 0 errors / 4 warnings (unused imports and hook dependency) at intermediate check.
- Exact regeneration of 179-mobile-API reference outputs has been run; `api:contract:check` compares generated files to *committed HEAD*, so it requires a commit and CI re-run for a true passing claim.
- **Not verified:** fresh commit CI, full backend database migrations/SQL transaction invariants, authorized web E2E of admin & financial workflows, a separate same-SHA Test backend and Postgres, production promotion and rollback.
- Simulator-only finance endpoints introduced in v629 remain suspended (503); this work does not implement WLD settlement or claim they are now live.

## Release gates

1. Commit the API contract artifact regeneration and test reconciliation. Run GitHub CI on the new exact commit, not the old v629 SHA.
2. Stage a new immutable exact-SHA Test candidate and verify isolated backend, frontend and database state, with permission/CSRF, fail-closed settlement, and responsive E2E coverage including v530 blocker.
3. Do **not** promote a candidate while v530's independent full-UI acceptance is BLOCKED, or without successful same-SHA Test/CI and a rollback plan; maintain zero-downtime production.

## Contract generator dependency completeness (late finding)

First local regeneration used the shared backend dependency links that were broken in this isolated worktree; this erroneously degraded WLD-branded financial return types to `any`. A repeated comparison against committed HEAD caught the loss. Replaced only the isolated worktree's dependency symlink with a complete read-only backend dependency tree, then regenerated twice with identical SHA-256 outputs. The corrected contract retains branded WLD response structure and must be the committed release artifact. Missing TS dependencies are not an acceptable shortcut for contract generation.

## Post-publication backend CI and proposed forward-only fix

GitHub runtime-check on commit d007d8a6 uncovered seven backend failures despite full frontend success: four old controller tests still expected phantom success from v629 503-blocked financial commands, and three independent PostgreSQL privilege boundary assertions. The four controller tests now require 503 rejection and pass alongside v629 negative API tests (9/9 local focused tests).

The database findings were real, **not test baselines to weaken**: four new SECURITY DEFINER functions unexpectedly remained executable by PUBLIC, migration 269 intentionally removed the app role's raw posting privilege but a legacy assertion expected it, and migrations 260/261/267/268 had granted direct app DML on unaudited casino, black-market, stock, AI, monetary, lottery and donation tables. The new additive migration `270-reconcile-post-233-security-boundaries.sql` revokes PUBLIC execution on all SECURITY DEFINER functions, keeps owner default privileges least-permissive, revokes direct INSERT/UPDATE/DELETE on 12 listed tables plus direct INSERT on treasury_donations, and explicitly preserves the migration-269 denial of the raw ledger primitive. Earlier applied migration SQL was not rewritten.

**Important runtime boundary:** Some newer domain features that depended on these direct grants could now fail closed until a separately audited, idempotent SECURITY DEFINER service command and complete ledger receipt are provided. The migration and related tests must pass a disposable CI Postgres, an isolated Test backend role, app flow regressions and release review before real DB execution; the migration was not applied to live Dev/Test/Production databases during this source change.
