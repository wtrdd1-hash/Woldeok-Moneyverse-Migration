# Backend B v729 — Advisor owner HTTP privacy

## Before work — 2026-11-01 20:00 KST
- Scope: P1 owner-specific financial advisor GET diagnosis and POST question responses; private HTTP headers must be set **before** session, consent and CSRF guards.
- Baseline: inspect `origin/main` SHA and advisor controller/module, PR #2295 (frontend advisor truth), QA season SQL P0 #2357 (migration 318 collision). No DB or ledger change.
- Risk: `@Header` on successful controller methods does not cover guard-generated 401/403; a shared intermediary must never cache member financial diagnosis or error context.
- Assumption: bounded security bugfix is authorized by the standing backend automation directive; no new feature or contract response body.
- Design: register advisor-controller-scoped Nest middleware in `AdvisorModule`; use real HTTP tests to verify 200/201, 401/403, 503, HEAD and unrelated public endpoint.
- Checklist: [x] failing HTTP tests [x] code [x] focused tests [x] lint/typecheck/backend build [ ] full tests/CI [x] isolated PostgreSQL; [ ] Test exact-SHA [x] PR HOLD/release decision.

## In progress
- Separate worktree and branch from current `origin/main`; do not modify other agents' branches, main or shared DB.

## Finished
- Pending evidence; no release authorized.

### RED evidence — 20:05 KST
- New real Nest HTTP regression: 6 failed / 1 passed. Guest 401, consent/CSRF 403, success 200/201, source failure 503 and HEAD lacked `Referrer-Policy` and/or private headers; unrelated public route passed.
- Command: `pnpm --filter @moneyverse/backend exec vitest run src/advisor/deoki-advisor.private-response.http.test.ts`.
- Evidence: task `logs/red.log`. No production code changed at RED checkpoint.

### GREEN / in-progress — 20:07 KST
- Implemented production `AdvisorModule` pre-guard controller-scoped HTTP privacy middleware. No DB schema, ledger, WLD, auth/CSRF, route, or response-body changes.
- Advisor focused HTTP/unit/source tests: 23/23 PASS (5 files), including 7 new real HTTP privacy tests.
- Whole-repository lint exit 0 (0 errors, 1022 existing warnings); whole-repository typecheck exit 0; backend build exit 0.
- Fresh main/planning resynchronization recorded in task `logs/mid-sync.log`.
- Release remains HOLD until full test/CI, isolated PostgreSQL and official Test exact-SHA validation.

### Verification — 20:19 KST
- RED commit `bf0478198db8e26b8b7b4b511ba3076d51292bf1`; implementation/code commit `8499bc0473b83245b265c99c4efea63b4636bcbc`.
- `pnpm lint`: PASS, 0 errors / 1022 existing warnings. `pnpm typecheck`: PASS. `pnpm build`: PASS, including Backend and Frontend.
- New advisor HTTP tests 7/7 and complete advisor focused tests 23/23 PASS.
- `pnpm --filter @moneyverse/backend test`: **FAIL** — 2968 PASS, 2 FAIL, 518 SKIP; existing profile owner success fixture expects 200 but gets 401 in `profile-private-response.http.test.ts`. Root `pnpm test` reproduces the same 2 failures; no evidence the advisor change causes them.
- `pnpm --filter @moneyverse/frontend test`: 2902/2902 PASS.
- Mobile app API contract: 184 endpoints match; contract tests 41 PASS; database package tests 62 PASS / 4 SKIP; security/release focused tests 22 PASS.
- Isolated PostgreSQL 17.11: all 316 migrations from current main applied; session real-DB tests 17 PASS; app role ledger DELETE=false and balances UPDATE=false. Existing P0 #2357 season settlement EXECUTE=true remains **unresolved**. Disposable container removed; shared/Production DB unchanged.
- `pnpm audit --prod`: PASS, zero known vulnerabilities. Full `pnpm audit`: FAIL, 9 advisories (8 moderate / 1 low).
- GitHub PR #2367: Draft/HOLD. Exact implementation SHA remote CI `41300482971` SUCCESS, but Test Candidate workflow still in progress at capture. Required Test exact-SHA public gate **FAIL** (`backend_version_unverified`, `frontend_version_unverified`); host gate **BLOCKED** by EACCES on protected Test environment file. No authenticated candidate E2E, independent restore or GitOps release approval.
- Mid and pre-final main SHA unchanged: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; planning EN/KO rechecked. No conflicts with advisor frontend PR #2295, A/C/QA, or pending migration 318 branches.

## Finished — 20:19 KST
- [x] Failing HTTP tests reproduced; [x] production Backend fix; [x] focused tests; [x] lint/typecheck/build; [x] isolated PostgreSQL read-only ACL and session integration.
- [ ] Full local Backend test and root test — two unrelated profile fixture failures.
- [ ] Full dependency audit — 9 advisories.
- [ ] Official Test exact-SHA authenticated E2E / independent restore / GitOps gates — BLOCKED.
- **Disposition:** PARTIAL / BLOCKED, Draft/HOLD PR #2367; **no merge, no Test deployment, no Production deployment**. Other agent worktrees, shared DB and scheduled tasks untouched.
- **Rollback:** remove this module-scoped middleware on the unmerged branch if needed; no DB/data rollback is necessary.
