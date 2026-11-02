# Development A — Public board title ordering (2026-11-02 17:05 KST)

## BEFORE WORK — v0 / DRAFT / RELEASE HOLD
- Source: latest `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`; independently checked against remote at start. Isolated worktree `auto/hourly-a-20261102-1705-board-title-order`.
- Reviewed AGENTS.md, README.md, canonical `docs/planning/PROJECT_PLAN.md`, Korean `PROJECT_PLAN.ko.md`, integrated master, latest A QA, open PRs, CI and branches. No existing open title-alphabetical board sort PR found; prior A author/reply/date sorting PRs remain separate and unmerged.
- Scope: opt-in, read-only title ordering of the **latest 50** public board posts (not all history), after existing stock and literal title filters. Existing default behavior and no direct table grants. Backend SQL must sort by PostgreSQL C collation + UUID tie-breaker; Next and Android verify explicit sort proof and ordering, reject malformed/duplicate responses, protect no-store/noindex and accessible UI.
- Security: no financial, session, DB schema, or applied migration writes; retain 400/503 fail-closed, no source-truth fabrication. English canonical documentation; Korean secondary. Existing P0 DB ACL and failing backend profile-auth tests are separate blockers.
- Plan: (1) RED regression tests; (2) Backend + PostgreSQL bounded sort; (3) Next UI/SSR + Android proxy proof; (4) contract and English/Korean docs; (5) target/full tests, live DEV PostgreSQL read-only, GitHub CI, Test SHA/Production release gates; (6) integrate only if all gates PASS.
- Status: BEFORE WORK, tests not yet executed. Branches and PRs protected; no deletion.

## IN PROGRESS — v1 / code and contract ready for full gates
- Test-first RED: Backend 3 failing tests, Frontend 8 failing tests before implementation; evidence saved in `evidence/red-*.log`.
- GREEN: Backend 3/3 and Frontend 10/10 target tests after implementation; follow-up tie-breaker tests added. Full typecheck PASS; targeted ESLint PASS. Generated Android contract lists 184 endpoints and optional `sortApplied: title`.
- Implemented opt-in `sort=title` in Nest controller and bounded PostgreSQL read query, Next `/board` UI and SSR proof check, Android gateway validation and cache/noindex/referrer headers. Existing default two-argument call retained. No migration, grant or ledger change.
- Midpoint `origin/main` still `a8541927c3a351d980454c66e95a3356c47e0722`; other A/B/C/QA changes remain separate. Final gates, real PostgreSQL, Test and CI are pending.


## FINISHED — v2 / implementation code complete; release HOLD
- Full evidence: Frontend 2,932 PASS; Backend 2,981 PASS / 2 FAIL / 518 SKIP (pre-existing profile auth); Database 62 PASS / 5 SKIP; Contract 41 PASS; policy 27 PASS; typecheck PASS; lint 0 errors/1,027 warnings. First build OOM with 1,024 MiB heap, retry Frontend PASS with 2,048 MiB. Full dependency audit 9 findings/FAIL; production-only audit PASS; full-route QA ledger missing/BLOCKED.
- Real DEV PostgreSQL READ ONLY/ROLLBACK: public function executable, one public post, SQL and synthetic C order PASS; P0 direct DML rights persist. Test exact-SHA preflight six mismatches and Treasury HTTP 200; authenticated E2E, independent restore, GitOps and rollback provenance BLOCKED.
- Branch audit: start 242 live heads/224 open PRs; end 244/225, 29 conflicts, 0 deletions. Merge-tree conflicts with previous A drafts; protect all unique unmerged changes. Main unchanged. Draft PR #2494; no main merge, Test/Production deploy, DB mutation, restart or rollback. See QA and release HOLD docs. Final PR SHA is recorded in evidence and PR.
