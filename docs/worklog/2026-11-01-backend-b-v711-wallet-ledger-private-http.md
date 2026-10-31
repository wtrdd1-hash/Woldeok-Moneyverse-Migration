# Backend B v711 — Wallet and ledger HTTP response privacy

## Before work
- Baseline main: f13bbce273ffc65e8576170992d82ea00c27a1c9.
- P1 scope: authenticated wallet balances, ledger activity, transfer receipts, and bank/reward operations in WalletController can respond before method-level `@Header` decorators execute (SessionGuard, ConsentGuard, CsrfGuard). These responses must not inherit public cache/robots/referrer policies.
- Existing draft PRs B #2273 banking, B #2277 activity telemetry, B #2255 chat, B #2207 profile are distinct controllers. No DB, ledger or economic writes.
- Plan: write actual Nest HTTP failing regression for success and guard failures; add middleware to WalletModule scoped to WalletController; re-run focused and full gates; hold merge and release unless all required gates and exact-SHA Test pass.
- State: IN PROGRESS.

## In progress
- RED: 10/11 actual Nest HTTP assertions failed before fix (guard rejections missing all headers; success responses missing robots/referrer). Resource saturation initially caused EAGAIN; taskset 0-1 restored a valid test run.
- GREEN: 11/11 HTTP assertions pass with WalletController-scoped pre-guard middleware; unrelated public route unchanged.
- No API payload, authn/authz, database, migrations, WLD or ledger changes.
- Main rechecked: f13bbce273ffc65e8576170992d82ea00c27a1c9.

- Full workspace typecheck: PASS. Full workspace lint: PASS (0 errors; 1,022 pre-existing warnings).
- Full backend/frontend tests, build, isolated PostgreSQL, and exact-SHA Test remain pending; RELEASE HOLD.

## Finished local implementation and verification (2026-11-01 07:47 KST)
- Added successful POST transfer (201), explicit service-unavailable (503), bank loan and reward availability paths. Final focused Nest HTTP suite: **15/15 PASS**. No actual WLD writes were performed; transfer service is a test double.
- RED verified 10 failures / 1 pass on the original controller. GREEN verified all 15 cases on the middleware implementation.
- Backend full: **2,961 PASS / 517 SKIP** (406 test files pass / 102 skip); exit 0. This run preceded the final four added regression cases, which passed separately.
- Frontend full: **2,901 PASS** (555 files); exit 0.
- Contract: **41 PASS**; database package: **62 PASS / 4 SKIP**; mobile API contract generator/check: PASS.
- Root release/security/backup/route QA preflight: **34 PASS**. Full lint: PASS, zero errors, 1,022 existing warnings. Full typecheck: PASS. Full backend/frontend build: PASS. Changed-file ESLint: PASS.
- Isolated disposable PostgreSQL 17.11: **316/316 forward migrations applied**, wallet/auth/game/shop DB integration **54 PASS / 4 SKIP**. App-role balance UPDATE, ledger DELETE and users SELECT are all denied. The isolated container was removed; no shared DB changed.
- Production-only dependency audit: PASS, zero known vulnerabilities. All-dependency audit: FAIL (1 low, 8 moderate). The combined root `pnpm test` command was not run as a single command; constituent workspace tests and root preflight were executed independently due miniPC cgroup task saturation. An attempted generic `pnpm exec vitest scripts/release` invocation failed because Vitest is not a root executable; the correct Node preflight then passed 34/34.
- Candidate code SHA before final evidence commit: `788e9077a74a81afc865ac48448d43c5b399b0e8`. Main stayed `f13bbce273ffc65e8576170992d82ea00c27a1c9` at start, mid, and final fetch.
- Official Test serves `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production serves `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`. Neither runs the candidate SHA. Authenticated exact-SHA Test E2E, independent restore and GitOps release approval are **BLOCKED**.
- Draft/HOLD PR #2279 created. Initial candidate CI policy/classify/release-input and runtime checks passed; final build and final evidence SHA CI are not yet certified. No merge, Test rollout, Production promotion, shared database modification, WLD movement, or branch cleanup.
- Other automation worktrees and all core recurring schedules were left untouched. The service process check found backend, frontend, Nginx and Docker active.

## Release decision
**PARTIAL / BLOCKED.** This change provides a narrow HTTP privacy defense-in-depth layer. It does not resolve existing P0 finance/DB ACL/schema/checksum findings, nor does it prove actual personal-data exposure. Keep the PR draft with HOLD label and preserve exact-SHA Test and production release gates.
