# v2026.10.27.1380 — Engineering-blog quality incident and editorial design (work log)

Status: **FINISHED — DOCUMENTATION PLANNING ONLY**. Scope: screenshot-reported TECH article mismatch; no application, database, publisher, Test or Production changes.

- [x] Start from fetched `origin/main` SHA `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c` in isolated worktree/branch `docs/blog-tech-editorial-v1380-20261027`; preserve other team worktrees.
- [x] Prioritize `docs/planning/INTEGRATED_PLANNING_MASTER{,.ko}.md`, `AGENTS.md`, `DOCS_INDEX.md`, editorial specifications v975/v1107/v1108.
- [x] Confirm code evidence in `frontend/src/app/blog/[slug]/blog-post-client.tsx` and `frontend/src/app/blog/blog-data.ts`.
- [x] IN PROGRESS: author topic-specific TECH/finance editorial separation, technical evidence requirements, quality gate and existing-content remediation design in English and Korean.
- [x] MIDPOINT: refetch and compare latest `origin/main` and related branch `auto/hourly-c-blog-editorial-gate-v1102-20261027-1945` before final.
- [x] FINISHED: docs-only cross-reference, validate diff and links, push isolated branch, open draft PR/issue, final evidence and release state.

Observed root causes before change: unconditional compound-calculator insertion following markdown block index 1; TECH template points to `/tools/compound-calculator`; generic finance introduction/market table/portfolio CTA copied into every category; TECH performance numbers stated as measured without reproducible artifact; read-time fixed 6 and views randomized on generated posts. This work is a planning response, not a successful site fix.

Hard constraints: no auto-unpublish after review deadline (v1108); only manual authorized editorial withdrawal or revision. No unverified quantitative or financial claims, no fabricated references. Preserve GREEN/AMBER/RED publisher policy and financial release gates.

## Midpoint evidence / 중간확인
Re-fetched origin/main after drafting: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c (unchanged). v1102 candidate separately returns 503 EDITORIAL_REVIEW_REQUIRED whereas main legacy generator still bypasses its own editorial helper; planned P0 keeps gate ownership with v1102. Documentation is not a publisher fix.

## Finish / 종료 — 2026-10-27 KST

- Midpoint and late `origin/main` advanced from `59cdc2e0` to `cf56520b`; the isolated docs branch was safely rebased without rewriting any other branch.
- Delivered v1380 English/Korean TECH quality specs; bilingual integrated master notes, DOCS_INDEX and internal/GitHub updates.
- Implementation tracker: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1591.
- Draft planning PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1592.
- Verified docs-only changed-file scope, staged diff whitespace, local relative Markdown links, no live article/DB/publisher modifications. No application lint or build execution claimed for docs-only work; official Test and Production not used.
- **Release state: PLANNED / DRAFT PR, not merged, not implemented, not staged, not deployed.** The screenshot remains a live-remediation candidate until a separate implementation and authorized editorial correction.
