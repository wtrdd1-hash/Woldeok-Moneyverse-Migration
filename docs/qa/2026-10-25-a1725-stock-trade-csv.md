# A1725 QA — Owner-scoped stock trade CSV export (2026-10-25)

**Verdict: PARTIAL / BLOCKED. Production RELEASE HOLD.** Code implementation and focused verification completed; release gates failed. No WLD mutation, production write, deployment or branch deletion.

## Source, concurrency and exact evidence
- Debian 13.6 miniPC reached through direct system MCP; backend/frontend/bot/mcp/nginx/docker active. Root disk 95–96% used; data disk 57–58% used.
- Authoritative `origin/main` SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5` at start, mid-task and before release decision. AGENTS, README, English/Korean living project plans and integrated masters, previous A1648 QA, all open PRs, branches and recent CI reviewed. Canonical project plan files are in `docs/planning/`, not repository root.
- Isolated branch `auto/hourly-a-stock-history-csv-20261025-1725` and worktree `/srv/moneyverse-tasks/hourly-a-stock-history-csv-20261025-1725`; baseline 168 remote branches / 164 open PRs; final audit 170 remote branches / 166 open PRs. 169 non-main branches have unique unmerged commits; no identical tip SHA or tree; **deleted 0**. Conflicting PRs #1107/#1110/#1143 retained. Other A/B/C/QA/Gemini changes untouched.
- RED tests SHA `0f80b0f20a8deb6ae4e736c14dca371165b92e0a`; implementation SHA `0bd1dbb0e3f74dddf8267a6e2ad48307c94a8d9a`; typed-spy correction and fully rechecked code SHA `2c4d9709c1ff59ef42cd6fd8c4a269a97265f10f`. Draft PR #1305; later documentation SHA differs and is not a new code version.

## P1 feature and safety boundary
- Authenticated member `/stocks/history/export` downloads up to 100 recent own virtual-stock trade rows, sourced from existing backend `/api/v1/stocks/history?limit=100` and PostgreSQL SECURITY DEFINER `stock_my_trades(p_actor,p_limit)`; no fabricated rows or financial settlement.
- Backend requires session/authentication/consent, rejects malformed or out-of-range limit with HTTP 400; defaults to 50. PostgreSQL enforces owner filtering and bounded read. No migration, schema changes or ledger writes.
- Private Next.js server route checks member session before internal API request; CSV preserves integer strings and defuses formula-like cells, escapes quotes and control bytes, rejects invalid amounts/sides and >100 rows. No internal token in browser; private no-store, noindex, nosniff and attachment headers. History page links to export.
- Android app-api forwards bounded query and returns private no-store/noindex JSON; existing cookie/session/consent policy preserved.

## Verification and blockers
- TDD RED: backend 10 failing assertions for missing limit validation, frontend missing CSV serializer/export route; GREEN and final focused backend **10 PASS**, frontend + Android gateway **17 PASS**.
- At code SHA `2c4d9709...`: `pnpm typecheck` **PASS**; `pnpm lint` **PASS** with 0 errors / 1,128 warnings; `pnpm api:contract:check` **PASS**, 179 app endpoints; `pnpm build` **PASS** (backend + Next Turbopack).
- Full `pnpm test` **FAIL**: contract 38 PASS, database 15 PASS/3 SKIPPED, backend 1,323 PASS/398 SKIPPED, frontend 1,404 PASS/**6 FAIL**. Existing failures: SEO route/i18n 3, login 44px target 1, calculator registration link 1, admin M2 telemetry 1. Do not count as success.
- Production dependency audit **FAIL: 2 High**; full dependency audit **FAIL: 2 Critical / 10 High** (26 findings total); bot audit **FAIL: 1 Critical / 5 High**.
- Actual isolated PostgreSQL 17 container `moneyverse-test-db`, database `wdmv_v761_test_acl`: `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app; SELECT count(*) FROM stock_my_trades(unknown_actor,100)` returned 0; direct `virtual_stock_trades` SELECT **false**, ledger_postings INSERT **false**; `ROLLBACK`. This verifies function execution and ACL, not a populated real-member trade E2E.
- Official Test public `/api/version` reported `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, not code SHA. Exact-SHA authenticated Test trade export E2E **BLOCKED**. CI policy/classify initially PASS; runtime checks pending/failing according to PR #1305, no overall PASS attestation.

## Release, rollback and preservation
- **No main merge, Test promotion, Production release, GitOps update, migration, database write, service restart, or branch deletion.** Do not infer readiness from a passing build.
- Candidate rollback: leave Draft PR unmerged/close or revert it if later merged; remove private CSV route/UI and bounded optional query without modifying stock tables, positions or ledger. No data rollback needed because no writes were performed.
- Before any merge: repair six frontend failures and audits on a separately owned repair branch, validate full gates on new SHA, stage exact-SHA Test with real owner-authenticated trade data, and satisfy authorized GitOps release gate and smoke/login/version/DB checks.
- Full evidence logs on host `/srv/moneyverse-data/a1725-*.log`; task worklog `docs/worklog/2026-10-25-hourly-a-stock-history-csv-1725.md`.
