# A 19:00 — Bounded public board page size (DRAFT / RELEASE HOLD)

## Before work — 2026-11-02 19:00 KST
- Baseline: origin/main `3eb1441090cb0602e054908547dcf43bfe4299dd`; separate `auto/hourly-a-20261102-1900-board-page-size` worktree. Existing shared checkout is dirty; do not touch it.
- Read `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md` and Korean secondary `docs/planning/PROJECT_PLAN.ko.md`; audited recent PRs, CI and prior A board filters. Existing latest-50 public PostgreSQL function is the source; no migration or ledger write.
- Gap: public board shows up to 50 posts without a reader-controlled bounded display count. Chosen conservative V1: 10/25/50, optional `limit` GET param; filter within latest 50, not a global archive or cursor pagination. Preserve default API response when no `limit` is supplied.
- Security design: reject unknown/duplicate/invalid limit before DB; use parameterized SQL outer LIMIT *after* stock/title predicates and stable created-at tie-break; return `limitApplied` and `sourceWindow` only for explicit limit. Web and Android must verify provenance, row bounds and duplicate IDs even on empty results; invalid upstream 200 -> 503. No new table grants or applied migration edits. Flag is request-scoped, rollback is omit `limit`.
- Existing release blockers: prior A backend profile auth 401 failures, full dependency audit findings, DEV app-role table DML, official exact-SHA Test and backup restore not proven. All release gates must be remeasured.

## Planned / in progress
- [x] RED tests for Nest validation, PostgreSQL bounded SQL, web and Android provenance.
- [x] GREEN minimal backend, frontend and gateway implementation.
- [ ] Recheck main and integration plan; inspect other open PRs and collisions.
- [ ] Run typecheck, unit, integration, real PostgreSQL read-only, lint, build, security, API/SEO/accessibility and exact-SHA CI.
- [ ] Record final branch/SHA/PR/CI/Test/Production and rollback evidence. No merge or deploy without full gates.

## In progress — 2026-11-02 19:04 KST
- RED: backend 3 failures, frontend 7 failures before implementation; exact files and logs preserved in task evidence.
- GREEN: Nest 23/23 targeted tests, Next 10/10 targeted tests, typecheck PASS, changed-file ESLint PASS. `pnpm install --offline --frozen-lockfile --ignore-scripts` succeeded in isolated worktree.
- Backend parameterizes a post-filter SQL limit inside the existing latest-50 PostgreSQL function. Default unfiltered API shape remains `{posts}`. Explicit limit adds `{limitApplied,sourceWindow}`.
- Public SSR and Android reject unverified success, including empty results. Explicit result pages are no-store/noindex.
- No migration, ledger write, direct table grant, release action, or shared checkout edit.

## Finished
- Pending full gates and exact-SHA Test.
