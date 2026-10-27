# v2026.10.27.1380 — Engineering-blog quality incident and editorial design (work log)

Status: **BEFORE WORK / PLANNING ONLY**. Scope: screenshot-reported TECH article mismatch; no application, database, publisher, Test or Production changes.

- [x] Start from fetched `origin/main` SHA `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c` in isolated worktree/branch `docs/blog-tech-editorial-v1380-20261027`; preserve other team worktrees.
- [x] Prioritize `docs/planning/INTEGRATED_PLANNING_MASTER{,.ko}.md`, `AGENTS.md`, `DOCS_INDEX.md`, editorial specifications v975/v1107/v1108.
- [x] Confirm code evidence in `frontend/src/app/blog/[slug]/blog-post-client.tsx` and `frontend/src/app/blog/blog-data.ts`.
- [ ] IN PROGRESS: author topic-specific TECH/finance editorial separation, technical evidence requirements, quality gate and existing-content remediation design in English and Korean.
- [ ] MIDPOINT: refetch and compare latest `origin/main` and related branch `auto/hourly-c-blog-editorial-gate-v1102-20261027-1945` before final.
- [ ] FINISHED: docs-only cross-reference, validate diff and links, push isolated branch, open draft PR/issue, final evidence and release state.

Observed root causes before change: unconditional compound-calculator insertion following markdown block index 1; TECH template points to `/tools/compound-calculator`; generic finance introduction/market table/portfolio CTA copied into every category; TECH performance numbers stated as measured without reproducible artifact; read-time fixed 6 and views randomized on generated posts. This work is a planning response, not a successful site fix.

Hard constraints: no auto-unpublish after review deadline (v1108); only manual authorized editorial withdrawal or revision. No unverified quantitative or financial claims, no fabricated references. Preserve GREEN/AMBER/RED publisher policy and financial release gates.
