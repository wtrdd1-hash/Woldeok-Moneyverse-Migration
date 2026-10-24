# Development A — verified recent ledger CSV (2026-10-24 16:20 KST)
Status: IN PROGRESS / RELEASE HOLD.
Base: origin/main 49788d09494fed3e463651945b83386e87dd47bc.
Branch: auto/hourly-a-wallet-verified-csv-20261024-1620.
System: Debian 13.6, backend/frontend/bot/MCP/nginx/docker active. Live development DB is production-linked: NEVER WRITE.
Read: AGENTS.md, README.md, canonical English/Korean plans, latest planning draft v1224, A1550 QA, open PRs/CI. Open PRs 41; remote branches 43 including main. PR #1107 conflicting. No branch deletion.
Feature: P1 verified owner-only 50-row wallet CSV export, consistent backend and Android app-api read path, safe spreadsheet cells and exact WLD strings. Distinct from unmerged A wallet filters/receipts and B/C work. Existing client CSV exports only the wallet's currently loaded rows; new endpoint fetches 50 owner rows independently.
- [x] Preflight system, repo, branches, CI, policies, planning and QA.
- [x] Isolated branch/worktree from latest main.
- [x] RED tests: owner scope/50 cap, app-api no-store, CSV errors/formula and browser download.
- [x] GREEN: NestJS service/controller, Next BFF CSV route, Android app-api, web CTA.
- [ ] Regression, build/lint/typecheck/unit/contract/security/real isolated PostgreSQL.
- [ ] Mid/merge-preflight main/plans and PR/CI.
- [ ] Final SHA, QA/release, branch preservation and rollback.
Constraints: no schema migration, no ledger write, no direct DB grant, no fabricated success, no production changes.

## 16:25 KST implementation checkpoint
- TDD RED: backend missing exportRecent (3 failing), BFF missing route (4 suite errors). Built workspace contract first to distinguish test setup errors.
- TDD GREEN: backend 26 PASS including mounted HTTP route; frontend 25 PASS including private BFF CSV, formula injection, precision and Android gateway.
- New backend GET /api/v1/wallet/transactions/export: actor from authenticated session only, 50 bounded PostgreSQL ledger entries, exact integer strings, no balance write, no migration, private no-store.
- New private web CSV BFF GET /api/wallet/export and wallet/activity CTAs; Android app-api route uses existing allowlisted wallet group and forced private no-store even when upstream mistakenly returns public cache.
- Midpoint main recheck: 49788d09494fed3e463651945b83386e87dd47bc unchanged; latest planning v1224 branch remains draft, no code overlap.
- Pending full gates, isolated PostgreSQL read and release attestation. No Test/Production deployment.
