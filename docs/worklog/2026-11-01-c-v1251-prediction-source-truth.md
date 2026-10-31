# Development C v1251 — Prediction Market Source Truth (2026-11-01)

**Disposition: P0 safety implementation, DRAFT / RELEASE HOLD.** This is **not** an operational prediction market or an approved WLD settlement feature. English canonical; Korean parity in the adjacent `.ko.md` file.

## Authority and non-overlap
- Baseline `origin/main`: `f13bbce273ffc65e8576170992d82ea00c27a1c9`, fetched at start and again during development. Root `main` has a pre-existing `implementation_plan.md` modification and was not edited.
- Read `AGENTS.md`, root README, `README/README.ko.md`, canonical `docs/planning/PROJECT_PLAN.md` and Korean parity `PROJECT_PLAN.ko.md`; inspected active PRs, CI, A/B/QA and earlier C work. A #2272 announcements, B #2273 bank headers, QA #2271 CI migration, C #2274 enterprise and planning #2275 are separate; no open prediction PR was found.
- Independent `auto/hourly-c-prediction-truth-v1251-20261101-0715` worktree. No changes to other branches, shared development DB, wallet, ledger, migration files or existing production services.

## Proven defect and design decision
- On `origin/main`, `frontend/src/app/prediction/page.tsx` invented four markets, 5,080,000 WLD total pool, odds and volume, and unconditionally opened a successful purchase modal from `handleTrade()` without any network call or WLD ledger receipt. Existing frontend test explicitly asserted the fabricated success. Search found no corresponding NestJS prediction controller or DB settlement contract.
- Rejected options: keep illustrative trades labelled real; create an unledgered trading API; or invent DB balances. Selected reversible **fail-closed** policy: replace the false trading interface with a responsive, keyboard-accessible and screen-reader-announced unavailability notice, and add explicit NestJS 503 read/order endpoints. Native app-api returns 503 without forwarding prediction orders or accepting a success-shaped upstream payload. The unverified group is not advertised as a working mobile API.
- No claim that a real market, position, fee burn, refund or settlement has been implemented. No financial writes. Future enablement requires reviewed actor-bound markets, immutable order/settlement receipts, idempotency, balance authorization and independent real-PostgreSQL security tests.

## TDD and verification
- RED: 3 frontend tests failed on fake state; backend new-route test failed before implementation; Android app-api tests failed on prior 404. GREEN: focused frontend/app-gateway 21 PASS and Nest HTTP 3 PASS (503 and no-store/noindex verified).
- `pnpm lint`: PASS, 0 errors, 1,016 pre-existing warnings. `pnpm typecheck`: PASS. `pnpm build`: PASS with 2GB Node heap. `pnpm api:contract:check`: PASS, 184 mobile endpoints; new disabled prediction group is not advertised.
- `NODE_ENV=test pnpm test`: PASS, frontend 2,906 PASS; backend 2,953 PASS / 517 SKIP; other contract/database/script suites run by root command. Skipped database tests are **not** PASS.
- `pnpm audit --prod --audit-level=high`: exit 0. Full `pnpm audit`: FAIL, 1 low and 8 moderate advisories.
- Isolated PostgreSQL 17.11: attempted on disposable own container, but manual role bootstrap did not reproduce the official migrator privileges: first attempt failed migration 005 (missing migrator), second at 029 (function-owner ACL), third at 020 (unsafe executor membership). Containers removed. **Real PG migration/actor flow remains BLOCKED, not PASS.** No schema changes in this PR.
- Official exact-SHA authenticated Test/E2E, independent restore, full route QA ledger, real edge privacy headers, merged-SHA Test, GitOps release and Production smoke remain **BLOCKED** pending complete gates. Existing global `X-Robots-Tag` issue #2225 is a separate active PR; page-level `robots` metadata is not an edge-header PASS.

## Release and rollback
- DRAFT/HOLD until all required checks are PASS on the final exact HEAD. No main merge, Test/Production deployment, GitOps promotion or WLD transaction. Rollback if later deployed: revert this independent feature commit; do not re-enable fake trading without ledger proof. Preserve the PR and branch until explicitly merged or superseded.
