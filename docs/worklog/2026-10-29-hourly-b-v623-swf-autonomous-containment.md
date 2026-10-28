# Backend B v623 — Autonomous SWF synthetic finance containment

## Before work
- Start from latest remote main `35971c600f25869c96f1c666d4b9f58927202730` on independent branch/worktree.
- Read AGENTS, README, EN/KO plans, QA v1356, open PRs and #1275. Prior closed unmerged #1271 is a reference, not integrated; #1746/#1751 overlap the same service file.
- P0: explicit SWF runtime flags allow fabricated 124,000 WLD taxes, direct vault/member balance updates, and non-ledger success notices. No observed Production loss claimed.
- Plan: RED direct-call/scheduler/API tests; remove unsafe autonomous SQL; enforce 503 in Nest and web gateway; preserve read-only and config APIs; rerun tests, CI, security and Test SHA gates.

## In progress
- Implementation pending. No DB, migration, service, deployment, or other automation changes authorized.

## Finished
- Pending tests and release disposition.

### Code checkpoint
- RED: 3 backend and 1 frontend regressions failed on original main (`red-backend.log`, `red-frontend.log`).
- Removed autonomous synthetic tax, portfolio, coupon and direct account balance SQL from `evaluateAndRebalance`; scheduler never arms even with both environment flags. Preserved read-only SWF and config functions, and separate liquidation path (integration with #1751 required).
- Nest admin rebalance endpoint now 503 with CSRF guard; Next admin gateway 503 before any upstream dispatch. This is a safety hold, not a funded SWF implementation.

## Finished — candidate, release HOLD
- Regression RED on original main: Backend 3/3 failed, Next gateway 1/1 failed. GREEN after code: Backend SWF 9/9, Next gateway 1/1.
- Typecheck across workspace PASS, Backend Build PASS, Database package 46 PASS / 4 SKIPPED, mobile API contract 180 PASS. Changed-file lint 0 errors / 1 pre-existing `any` warning. Root lint timed out at 95 seconds; full backend suite first aborted on shared host thread limit and then timed out at 100 seconds with one worker. No claim of full test success.
- Production dependency audit FAIL: 1 Moderate `qs@6.16.0` (QA Draft #1687 already addresses it; avoid duplicate patch). Whole frontend test/build, real-PG schema/role integration, auth/admin E2E, exact-SHA Test, GitOps release gates NOT PASS.
- API: `POST /api/v1/admin/treasury/swf/rebalance` now HTTP 503 `SWF_LEDGER_SETTLEMENT_UNAVAILABLE` with CsrfGuard. Next `POST /api/admin/treasury/swf` returns the same 503 without forwarding. Direct service call returns `executed:false` and no DB/Discord side effects. Read-only GET and config PUT unchanged; no DB migration.
- Integration dependencies: open Draft #1746 (bond coupon) and #1751 (manual SWF liquidation) both touch `auto-swf.service.ts`; #1754 (C) touches SWF UI. Preserve all unique changes during future integration. Frontend C should replace the manual rebalance CTA's generic waiting toast with explicit unavailable wording; this BFF already returns 503.
- Historical 18,000 WLD ledger drift, applied migration/checksum mismatches, broad app DML and 98–99% data disk utilization are independent blockers. This candidate does NOT repair or deploy existing financial data.
- PR must remain Draft + hold. No main merge, Test/Production deployment, migration, DB write, service restart, branch cleanup or schedule change.
