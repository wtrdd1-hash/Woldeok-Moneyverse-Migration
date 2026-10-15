# v2026.10.15.638 — Runtime/system/function verification work detail

**Work type:** read-only audit, code tests in isolated exact-main worktree, no live writes. **Branch:** `audit/system-function-runtime-v2026.10.15.638`.

## Before work (2026-10-15 09:38 KST)
- On the connected miniPC via $pc MCP, re-read `AGENTS.md`, documentation governance, authoritative project/integrated plans, previous v636/v637 audits and open PRs. Observed `origin/main=c03b0a9b9c3018e7257c4be1d02bcbbf44d59961`, production `prod-v600`, Test alias `test-v618`.
- Created `/srv/moneyverse-tasks/audit-20261015-runtime-v638/00-before.md` before substantive probing. Restricted runtime operations to GET, health, system/log observation and DB SELECT; independent worktree for build/tests.

## During work (09:39–09:50 KST)
- Verified active systemd core services, 0 restarts, `/health` 200, `/api/version` id unknown, timed backup/QA successful one-shot and separate v635 frontend canary running on port 3203.
- Executed `http-smoke.py`: 145 read-only public GET requests, 138×200, 1×401, 6×404, no 5xx; 13 ended at the login page. Saved `http-smoke.json`.
- Summarized nginx access logs without user/IP/credential contents: one transient Oct15 support 502, previous-day stock candle 503s and chunk 500s, Next streaming early closure 37 times on Oct14 only. Anonymous support subsequent retry 401.
- Reproduced stock-candle backend and frontend mismatch with actual stock ID, invalid identifier, nil UUID and fabricated valid-form UUID; recorded nuances rather than conflating every nonexistence with 500.
- Isolated `@moneyverse/contract` had to be built before tests; first test runs failed from missing local module output, not product assertions. Built it then reran frontend 1,206 PASS, backend non-DB 1,185 PASS/29 skip, typecheck/build/mobile API 179-endpoint contract PASS. Bot 4 PASS but additional QA syntax failed. Site-wide route ledger check lacks `--inventory`.
- Development DB SELECT: 241 tables, app role 237 DML grants, 11 publicly callable SECURITY DEFINER routines, ledger 831/1,692 with 0 observed imbalance. Rechecked `origin/main` SHA unchanged; logged `01-midpoint.md`.

## Finished / release status
- Evidence [English](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.md) and [한국어](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.ko.md); raw non-secret logs saved in `/srv/moneyverse-tasks/audit-20261015-runtime-v638`.
- Final decision **BLOCKED**: six 404, API status-mapping mismatch, historic HTTP 5xx, incomplete QA coverage, exposed DB authority and production drift. Source unit/build PASS ≠ live feature acceptance.
- Documentation only. No merge, Test/Prod deployment, DB write, real transaction, account/role/feature-switch mutation, or other-agent worktree changes. Further code changes require separate authorization and exact-SHA Test/rollback gates.
