# Backend B v552 — case-insensitive route rate-limit parity (DRAFT / RELEASE HOLD)

## Before work — 2026-10-26 10:35 KST
- Debian 13.6 miniPC checked with status, shell, and file MCP tools. Root filesystem 99% used; data volume 82% used. Do not delete other workers' data.
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch: `auto/hourly-b-rate-tier-case-v552-20261026-1035`.
- Read AGENTS.md, README.md, English/Korean living plans, open PRs and CI, QA #1317, A/C branches. Existing B #1380 edits client-IP identity in same module; preserve its change during later integration.
- Reproduction: Express 5.1.0 matches `/API/V1/AUTH/discord/authorize` and `/API/V1/WALLET/transfers` against lowercase routes, but `tierFor` compares case-sensitive path strings and assigns both the read tier (12000/min), rather than auth (20/min) or sensitive (60/min).
- Scope: classify paths consistently with Express case-insensitive routing; do not change rate budgets, authentication, identity, DB schema, ledger or existing route/DTO contracts.
- Plan: write failing unit regression tests for mixed-case auth, cheap auth read, and API writes; confirm RED; apply minimal case-insensitive matching; confirm GREEN; run workspace checks and CI; keep Draft/HOLD until full gates.

## In progress
- [x] TDD RED verified: 3 failing tests, 25 passing (Express 5.1.0 uppercase route matches)
- [x] Minimal backend fix + regression tests: 28/28 PASS; AUTH_PATH, CHEAP_AUTH_READ and API write prefix match case-insensitively
- [x] Build, typecheck, lint, unit, integration/security/contract checks executed (failures recorded; no false green)
- [x] Mid-run main/plan refresh and other PR collision check (main unchanged; coordinated #1380, QA #1317)
- [x] Draft PR #1400 created, official CI dispatched; final status still pending

## Finished — 2026-10-26 10:45 KST (PARTIAL / BLOCKED)

### Code and contracts
- Backend: `backend/src/security/rate-limit.ts` and `rate-limit.test.ts`. Express 5.1.0 resolves mixed-case paths against lowercase routes; classification now matches its case-insensitive behavior. Auth 20/min, sensitive write 60/min and cheap read 12,000/min budgets unchanged. Non-API lookalikes remain outside the API tier. API routes and DTOs unchanged.
- No schema/migration, authentication/authorization, WLD balance, ledger, or audit writes. No frontend change. All work isolated in this v552 worktree and branch; A/C/Gemini/QA worktrees untouched.
- TDD RED: 3 regression failures (25 passing); GREEN: 28/28 focused. Code-tested commit `0d87a46ce0da9c07232bb330b39d942aeed7111f`.

### Fresh validation (same code tree)
- `pnpm typecheck`: PASS. `pnpm lint`: PASS (0 errors, 1,128 warnings). Backend build: PASS.
- Backend suite: **1,317 PASS / 398 SKIPPED**. Contract package: **38 PASS**. DB package: **15 PASS / 3 SKIPPED**. API contract: **179 endpoints PASS**. Bot: **8/8 PASS**.
- Root `pnpm test`: FAIL because frontend **1,397 PASS / 6 FAIL** (SEO 3, mobile login 1, calculator signup 1, admin M2 1). These existing main failures are addressed in separate QA Draft #1317; not cherry-picked.
- Initial `pnpm build`: FAIL from cross-worktree symlinked dependencies (Next Turbopack root). After `pnpm install --offline --frozen-lockfile` **inside this worktree only**, full default Turbopack `pnpm build`: **PASS**.
- `pnpm audit --prod --audit-level high`: **FAIL (2 High)**. `pnpm audit --audit-level high`: **FAIL (2 Critical, 10 High, 11 Moderate, 3 Low)**. QA #1317 is tracking patched HTTP dependencies; no waiver.
- Repository security scan, control-byte scan, forbidden Prisma command scan: PASS. Security regression scripts: **10/10 PASS**. Root release/storage/backup/security tests: **18/18 PASS**.
- Isolated real PostgreSQL **17.11**, network disabled and no host port/volume: `001` core + **279 forward SQL migrations** applied successfully; 235 public tables. `moneyverse_app` cannot UPDATE ledger transactions, cannot UPDATE balances and cannot DELETE audit logs. Ephemeral container removed. This does not certify authenticated DB E2E or Production ACL.

### Release and coordination
- Starting/mid/closing main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (unchanged). English and Korean plan SHA256: `c1b6cfd5aada1d05` / `73f90946d6e75a4f` (prefixes).
- Draft PR **#1400**, with note to B #1380 (same file, different functions) and QA #1317. Official CI and Build Test Candidate still in progress at this checkpoint; success is not asserted.
- Read-only public Test `/api/version`: `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `/api/version`: `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither is this candidate. No official Test exact-SHA/authenticated E2E, GitOps gate, merge or Production promotion; **HOLD**.
- Root filesystem 93% used / ~7.1GiB free; data volume 82% used / ~36GiB free at last check. No cleanup of contributor branches, no reservation changes. If a gate remains failed or unverified, keep this PR Draft and Production forbidden.
- Internal evidence: `/srv/moneyverse-data/build-workspaces/mv-b-v552-logs/` (red, green, build, lint, full test, audit, security, isolated PG, CI notes). GitHub evidence: this worklog and PR #1400.
