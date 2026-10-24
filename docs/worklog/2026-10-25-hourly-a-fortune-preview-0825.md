# Development A — Fortune-cookie truth and verified nonfinancial preview (08:25 KST)

## BEFORE (2026-10-25 08:20 KST)
- Debian 13.6 PC: backend/frontend/nginx/docker/MCP active; root disk 100% (453 MiB available), separate /srv/moneyverse-data 99 GiB available.
- Authoritative `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (local `main` deliberately not modified).
- Remote branch count 122; open PR count 117; prior A #1236 exact SHA CI failed. Earlier A/B/C/Gemini drafts are unmerged and protected; no branch deletion.
- Read AGENTS.md, README.md, both PROJECT_PLAN language versions, INTEGRATED_PLANNING_MASTER.md, previous QA/worklogs and open PR titles.
- P0 user-facing defect: pet fortune POST claims 500–1000 WLD without ledger transaction; browser independently invents a bonus and displays `WLD instantly paid` even when its API request fails. The app gateway excludes `engagement`, so this API path cannot currently be reached from Android or web.
- Selected safe P0/P1 user feature: authenticated, **nonfinancial** fortune preview with verified server quote, no fake reward, and fail-closed legacy POST. Keep all WLD balances and applied migrations immutable; no app-role DML.
- Design constraints: explicit PREVIEW status, `rewardPosted:false`, no daily claim or fabricated affinity, no wallet-updated event, no anonymous preview, no arbitrary gateway engagement access, no production/Test deployment.

## IN PROGRESS
- [ ] TDD RED: backend preview + retired claim, frontend failure/success truth, narrow Android gateway path.
- [ ] GREEN: implement minimal authenticated GET, frontend quote-only flow, app-api allowlist, tests.
- [ ] Validate isolated real PostgreSQL ACL, Typecheck, lint, tests, build, audit, official exact-SHA CI.

## FINISHED
- Pending verification. Production RELEASE HOLD; rollback = revert feature commit (no DB migration or data writes).
