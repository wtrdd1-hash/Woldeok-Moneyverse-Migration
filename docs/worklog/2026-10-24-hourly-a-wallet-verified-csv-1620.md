# Development A — verified recent ledger CSV (2026-10-24 16:20 KST)
Status: IN PROGRESS / RELEASE HOLD.
Base: origin/main 49788d09494fed3e463651945b83386e87dd47bc.
Branch: auto/hourly-a-wallet-verified-csv-20261024-1620.
System: Debian 13.6, backend/frontend/bot/MCP/nginx/docker active. Live development DB is production-linked: NEVER WRITE.
Read: AGENTS.md, README.md, canonical English/Korean plans, latest planning draft v1224, A1550 QA, open PRs/CI. Open PRs 41; remote branches 43 including main. PR #1107 conflicting. No branch deletion.
Feature: P1 verified owner-only 50-row wallet CSV export, consistent backend and Android app-api read path, safe spreadsheet cells and exact WLD strings. Distinct from unmerged A wallet filters/receipts and B/C work. Existing client CSV exports only the wallet's currently loaded rows; new endpoint fetches 50 owner rows independently.
- [x] Preflight system, repo, branches, CI, policies, planning and QA.
- [x] Isolated branch/worktree from latest main.
- [ ] RED tests: owner scope/50 cap, app-api no-store, CSV errors/formula and browser download.
- [ ] GREEN: NestJS service/controller, Next BFF CSV route, Android app-api, web CTA.
- [ ] Regression, build/lint/typecheck/unit/contract/security/real isolated PostgreSQL.
- [ ] Mid/merge-preflight main/plans and PR/CI.
- [ ] Final SHA, QA/release, branch preservation and rollback.
Constraints: no schema migration, no ledger write, no direct DB grant, no fabricated success, no production changes.
