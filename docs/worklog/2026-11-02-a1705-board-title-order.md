# Development A — Public board title ordering (2026-11-02 17:05 KST)

## BEFORE WORK — v0 / DRAFT / RELEASE HOLD
- Source: latest `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`; independently checked against remote at start. Isolated worktree `auto/hourly-a-20261102-1705-board-title-order`.
- Reviewed AGENTS.md, README.md, canonical `docs/planning/PROJECT_PLAN.md`, Korean `PROJECT_PLAN.ko.md`, integrated master, latest A QA, open PRs, CI and branches. No existing open title-alphabetical board sort PR found; prior A author/reply/date sorting PRs remain separate and unmerged.
- Scope: opt-in, read-only title ordering of the **latest 50** public board posts (not all history), after existing stock and literal title filters. Existing default behavior and no direct table grants. Backend SQL must sort by PostgreSQL C collation + UUID tie-breaker; Next and Android verify explicit sort proof and ordering, reject malformed/duplicate responses, protect no-store/noindex and accessible UI.
- Security: no financial, session, DB schema, or applied migration writes; retain 400/503 fail-closed, no source-truth fabrication. English canonical documentation; Korean secondary. Existing P0 DB ACL and failing backend profile-auth tests are separate blockers.
- Plan: (1) RED regression tests; (2) Backend + PostgreSQL bounded sort; (3) Next UI/SSR + Android proxy proof; (4) contract and English/Korean docs; (5) target/full tests, live DEV PostgreSQL read-only, GitHub CI, Test SHA/Production release gates; (6) integrate only if all gates PASS.
- Status: BEFORE WORK, tests not yet executed. Branches and PRs protected; no deletion.

## IN PROGRESS — v1
Pending implementation and evidence.

## FINISHED — v2
Pending verification; do not interpret this draft as successful development or authorization to merge/release.
