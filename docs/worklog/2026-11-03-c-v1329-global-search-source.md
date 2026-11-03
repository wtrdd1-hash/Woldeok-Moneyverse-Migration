# Development C v1329 — Global Search Query and Viewer Evidence

## BEFORE WORK — 2026-11-03 09:45 KST
- [x] Connected to Debian 13.6 miniPC; backend/frontend/bot/MCP/desktop/Nginx/Docker active; DEV PostgreSQL connected.
- [x] Fetched `origin/main` = `e83ad8a6d1b8d477bfbe661ea3cffd46f270509c`; created isolated `auto/hourly-c-v1329-global-search-truth-20261103-0945` worktree. Shared security audit worktree untouched.
- [x] Read AGENTS.md, README.md, README/README.ko.md, canonical PROJECT_PLAN.md and Korean companion; inspected active PRs, CI, planning, QA and A/B work. No open PR targets this exact global navigation search input/viewer source defect.
- [x] Confirmed defect: `/search` declares `q?: string`, but Next.js may supply repeated `q` as `string[]`; `.slice(0,80)` then `.trim()` can throw. `currentViewer()` also silently converts auth API outage to signed-out, misreporting member search access.
- [ ] RED: add query/viewer source tests and observe failures.
- [ ] GREEN: normalize untrusted query and preserve unknown viewer state; accessible error/retry, no member/admin data leakage.
- [ ] Verify exact SHA with lint/typecheck/build/unit/contract/integration/security/real PostgreSQL/E2E and CI; document each PASS/FAIL/BLOCKED.
- [ ] Re-fetch main during work and before any merge. Do not merge/promote until all required gates pass.

## IN PROGRESS
Pending.

## FINISHED
Pending.
