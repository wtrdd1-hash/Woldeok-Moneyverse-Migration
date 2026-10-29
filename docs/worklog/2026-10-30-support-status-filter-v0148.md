# v2026.10.30.0148 — Owner support status filtering (P1, DRAFT/HOLD)

## Before work — 2026-10-30 01:52 KST
- Baseline remote main: `62c6cd038951d65c94b709302bdaec6e75b080b6`; isolated branch `auto/hourly-a-support-status-20261030-0148` and clean worktree.
- Read AGENTS.md, README.md, English/Korean project plans and integrated plans, QA v1377, PRs and CI. Other workers' branches remain untouched.
- Reproduced 2 failing tests in `backend/src/support/support-status-filter.test.ts`: the web page already forwards `status`, the owner repository already supports bounded status filtering, but the member controller drops the parameter. Android gateway currently does not force private/no-store for support reads.
- Scope: restore owner-only status filter for web, NestJS and Android app-api using existing SECURITY DEFINER `support_my_threads` (no new SQL migration). Add tests and truthful 100-recent limit UI; preserve owner scoping and reject duplicate/invalid query values.
- Release preconditions: full lint, typecheck, build, tests, real isolated PostgreSQL, exact SHA CI, official Test authenticated E2E, independent backup restore and finance/ACL gates. Known main lint errors 3 and financial release blockers are not waived.

## In progress
- [ ] Backend status validation, read-only privacy headers and existing owner SQL contract.
- [ ] Web bounded-results disclosure, Android gateway privacy policy and regression tests.
- [ ] Mid-run main/plan/PR recheck, exact SHA gates and isolated PostgreSQL.

## Finished
- Pending. No main merge, Test/Production deploy, DB mutation, rollback or branch deletion.
