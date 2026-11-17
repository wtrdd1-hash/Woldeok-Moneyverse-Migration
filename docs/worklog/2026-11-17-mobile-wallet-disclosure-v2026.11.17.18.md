# v2026.11.17.18 — Mobile wallet and disclosure incident worklog

Status: INVESTIGATING / NOT DEPLOYED. Dedicated branch: `fix/mobile-wallet-disclosure-v2026.11.17.18`.

## Before change (2026-11-17 KST)
- User screenshots show `/wallet` full-page data-load failure and oversized mobile stock disclosure dialog at `/stocks`.
- Source authority: `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/DOCUMENTATION_POLICY.md`, `AGENTS.md`. These are living authorities; current plan is not proof of production implementation.
- GitHub `origin/main`: `e96e8f81f4d6b99b221392a2b6fe46356361b145`; local `main`: `d926d8f8bc7ae5f386cc5e4b45b616a67ef27894` (10 local unpublished commits), therefore editing only isolated worktree, not main.
- Observed public anonymous GET: `/wallet` 200 HTML but wallet failure UI; `/api/v1/wallet?recent=50` 404, `/api/v1/bank/loans` 404, `/api/v1/rewards/availability` 404, `/api/v1/stocks/portfolio` 200, `/api/v1/auth/session` 200 with generated CSRF string despite no session cookie.
- Spring source has `/api/wallet/overview` rather than Next's `/api/v1/wallet` contract, and currently uses client-supplied or default user UUID and an `100000` fallback: this endpoint MUST NOT be substituted for the authenticated wallet/ledger contract.
- No credentials extracted, no user data read, no financial writes or migrations. No test/stage/prod deployment performed.

## Target and acceptance gates
1. Correct unauthenticated auth-session handling without breaking legitimate session flows; protect against incorrect/forged identity.
2. Preserve wallet financial truth; use only the authenticated source ledger. Do not display fake zero, pretend balances or data for the wrong user.
3. Improve failure-state UX and mobile stock dialog viewport / accessible close and action layout without compromising required information.
4. Add automated regression tests and record exact test results.
5. Recheck `origin/main` during work, review diff, separate Test/Production evaluation and release notes. Production release gated on real authenticated end-to-end API, ledger, security, and rollback checks.

## Intermediate evidence (2026-11-18 KST)
- Re-fetched GitHub `origin/main` at midpoint: `e96e8f81f4d6b99b221392a2b6fe46356361b145` unchanged. Integrated plan still marked finance/security P0 RELEASE HOLD.
- TDD initial Spring compile failure (missing new endpoint) was expected RED; after implementation targeted Spring test passed. Frontend popup test initially required correcting test selectors; result PASS.
- Owner-bound canonical wallet read, owner-bound bank/reward SQL function reads, authenticated stock ownership and anonymous auth-session 401 implemented only in isolated branch. Retired fake-balance/direct-write wallet routes fail closed.
- No Production/Test Nginx or systemd mutation; existing production data unaffected.


## Final evidence (isolated verification, 2026-11-18 KST)
- `./gradlew test bootJar --offline --no-daemon`: BUILD SUCCESSFUL; 35 JUnit XML suites, 135 tests, 0 failures/errors/skips.
- Real Spring embedded random-port HTTP with H2 test DB: anonymous session, wallet, bank loans, rewards, stock portfolio/history return 401; legacy overview/balance/transfer return 503. No real financial writes.
- `NODE_ENV=test pnpm exec vitest run src/components/stock-disclosure-ticker.test.tsx src/app/api/wallet/summary/route.test.ts`: 12/12 pass.
- `NODE_ENV=test pnpm exec tsc --noEmit --pretty false`: PASS; `git diff --check`: PASS.
- Remaining P0 before official Test/Production: real authenticated session/consent/CSRF verification, true PostgreSQL 17.11 finance-role read test and double-entry reconciliation, actual Next+Spring mobile E2E, broader regression and independent rollback. This is NOT PRODUCTION_VERIFIED. Branch and PR are a review candidate only.
- Public update: `docs/updates/v2026.11.17.18-mobile-wallet-disclosure.md` / `.ko.md`.
