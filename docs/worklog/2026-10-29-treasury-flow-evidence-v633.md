# B v633 — Treasury revenue/expenditure evidence boundary (2026-10-29)

## Problem and scope

`TreasuryRepository.getRevenue()` and `getExpenditure()` silently caught failed reads of `public.system_treasury_ledger`, returning successful zero-WLD totals and all-zero categories. A permission failure or database outage must not be presented as an actual absence of treasury flows. This is independent of the open overview/budget work in PR #1810 and the SWF controls in PR #1845.

## API contract

Authenticated, consented admin-only `GET /api/v1/admin/treasury/revenue` and `/expenditure` now return `503` with `TREASURY_REVENUE_EVIDENCE_UNAVAILABLE` and `TREASURY_EXPENDITURE_EVIDENCE_UNAVAILABLE` respectively when the ledger read or parsing fails. Both responses declare `Cache-Control: no-store`. Successful reads with no ledger entries continue returning genuine zero totals and the existing category arrays. The existing auth guards and DTOs are unchanged. Underlying SQL errors are not exposed. No migration, balance change, ledger posting, privilege grant or production database write is introduced.

## Verification evidence

- TDD RED: four failures, two for silent zero on a rejected query and two for missing no-store response metadata. The initial test environment was repaired by installing the pinned lockfile dependencies in this isolated worktree.
- GREEN: 10 focused repository/actual NestJS HTTP tests (503/no-store/privacy and genuine empty-ledger 200).
- Disposable PostgreSQL 17 fixture: 2 PASS; read-only role sees genuine 50 WLD revenue and 20 WLD expenditure, cannot UPDATE, and receives 503 after SELECT is revoked. The disposable container was stopped. This fixture does **not** prove all production migrations.
- `pnpm typecheck` PASS; `pnpm test` PASS (backend 1,965 PASS/442 SKIP; frontend 1,910 PASS; database 46 PASS/4 SKIP; contract 38 PASS).
- `pnpm build` PASS; `pnpm api:contract:check` PASS (180 endpoints); `pnpm lint` PASS after renaming an HTTP-test variable (0 errors/1,091 preexisting warnings).
- `pnpm audit --prod --audit-level moderate` FAIL: preexisting transitive `qs@6.16.0` moderate advisory. Do not mark the release gate green.

## Hold / integration

The admin treasury page currently suppresses the revenue/expenditure sections when `apiOrNull` returns null; a visible unavailable-state design should be coordinated with Frontend C. Full authenticated Test exact-SHA, actual production-schema PostgreSQL, GitOps release gates and post-merge Test/Production smoke are not proven. Keep this PR Draft + hold, do not merge or deploy, and preserve other workers' branches and reservations.
