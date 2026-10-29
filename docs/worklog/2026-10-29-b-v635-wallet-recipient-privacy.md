# B v635 — Wallet recipient privacy boundary

## Before work (2026-10-29 15:34 KST)
- Debian 13.6 miniPC status/exec/read tools invoked. Backend, frontend, Nginx, Docker and development DB reachable. Disk root 69%, data 65%, tmp 35%.
- Main starting SHA `9ebc5613845ba2e8179a0051e86db996593c8a19` after refresh. Isolated branch `auto/hourly-b-v635-wallet-recipient-privacy-20261029-1535` and worktree under `build-workspaces`.
- Read AGENTS, README, bilingual living plans, QA v1367, open PRs, CI. Existing #1687 handles qs audit; B #1852/#1858 handle treasury/stock league. Selected privacy discrepancy issue #1855, not overlapping them.

## In progress
- RED: 6 backend direct-controller tests and 5 frontend privacy tests failed before code change. Separate fake P2P receipt assertion failed before correction.
- Changed NestJS name search to authenticated/consented 410; removed service/repository `ILIKE` member discovery. Retired Next proxy with 410/no-store and removed P2P nickname search in favor of exact recipient-supplied UUID. Eliminated fabricated transaction ID fallback and misleading real-time notification claim.
- Backend HTTP regression verifies 410, no-store, no profile read. No DB migration or finance mutation.

## Finished / release gates
- Gate outputs and exact SHA are recorded in the independent miniPC v635 logs and Draft PR. Owner approval for the exact-UUID-only policy and Android/client compatibility is pending.
- P0 ambiguous transfer retry #1854, durable ledger receipt, P2P metadata idempotency and outbox notification delivery are **not** solved by this change.
- **No main merge, no Test deployment, no Production promotion** unless the complete release gates pass. Existing scheduled workers untouched.

## Verified gates (2026-10-29 15:45 KST)
- RED: backend 6, frontend 5 and false P2P receipt 1. GREEN: backend 10/10 targeted including real NestJS HTTP 410/no-store; frontend 5/5 targeted.
- `pnpm test`: PASS. Contract 38 PASS; database package 46 PASS / 4 SKIPPED; backend 1,975 PASS / 440 SKIPPED; frontend 1,921 PASS. SQL-backed cases skipped where no isolated DB was configured.
- `pnpm typecheck`: PASS. `pnpm build`: PASS (Next.js 609 static pages). `pnpm lint`: PASS (0 errors, 1,088 preexisting warnings).
- `pnpm audit --prod`: FAIL, 1 moderate `qs@6.16.0` advisory, owned by separate Draft PR #1687; not silently bypassed.
- Real PostgreSQL full integration, Android authenticated E2E, owner policy approval, official isolated Test exact-SHA and Production release gates: BLOCKED/HOLD. No financial DB writes.
