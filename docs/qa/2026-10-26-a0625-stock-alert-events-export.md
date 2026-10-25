# A0625 QA — Private Stock Alert Trigger CSV (2026-10-26)

**Verdict: PARTIAL / BLOCKED — Production RELEASE HOLD.** Draft PR #1381.

## Provenance and work isolation
- Debian 13.6 miniPC checked via pc MCP at 06:18 KST; backend, frontend, bot, MCP, nginx, Docker active. Root disk 100% (~927 MiB free), data disk 74%. Worktree on data disk `/srv/moneyverse-data/build-workspaces/a0625-stock-alert-events-csv`, branch `auto/hourly-a-stock-alert-events-csv-20261026-0625`.
- Authoritative GitHub main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` unchanged start/mid/pre-PR; AGENTS, README, EN/KO project plans and integrated planning masters re-read. QA v1285 and unmerged QA integration Draft #1317 reviewed. Planning Draft #1379 is not main.
- Start 229 remote branches (228 non-main) / 225 open PRs; pre-PR 230 remote branches (229 non-main) / 225 PRs, 0 duplicate branch tip SHA, 222 mergeable / 3 conflicts (#1107, #1110, #1143). QA v1285 earlier exhaustive audit: 166 unique-diverged, 59 unique-ahead, 3 conflicting. Other A/B/C/QA/Gemini unique changes protected; no deletion.
- Checkpoints: worklog `5e96dd2881282f8459ab5c93cdd33676a5e08c4c`; code `74e3dff1e5cc6bfef76b28958d484ccfcff1127d`; repaired code `139909e65719909082712ee2e39f517319556aae`; documentation head recorded in PR.

## User-facing feature and boundaries
- Member `/stocks/alerts` offers native keyboard-accessible EN/KO link to **latest 100 virtual-stock alert triggers** CSV, not all-time history, real securities, executed trades or WLD settlement receipts.
- Session/Authenticated/Consent guarded Nest `GET /api/v1/stocks/alerts/events/snapshot` derives actor from session; existing PostgreSQL SECDEF `stock_alert_events_list(actor,100)` is the only data read. No migration, ledger write or table grant.
- Next `/stocks/alerts/events.csv` authenticates and rejects malformed, duplicate, over-100 or inconsistent data before any download; preserves bigint integer-string precision, UTC timestamps and formula/control/bidi CSV safety; private/no-store/noindex/nosniff on success and errors.
- Android `/app-api/v1/stocks/alerts/events/snapshot` forwards member cookie, forces no-store/noindex including upstream errors; generated EN/KO mobile API references now contain 180 endpoints.

## TDD and exact-code local gates
- RED: backend missing snapshot method 3 FAIL; frontend missing serializer/route; Android cache test FAIL. GREEN: backend focused **4 PASS** including Nest anonymous route refusal; frontend CSV/Next/Android **20 PASS**; UI SSR/a11y **2 PASS**.
- At code SHA `139909e65719909082712ee2e39f517319556aae`: typecheck **PASS**; lint **PASS** (0 errors, 1,128 warnings); backend/frontend/contract/database package build **PASS**; API contract **PASS** (180 endpoints, 639 controller methods); bot **8 PASS**.
- Full `pnpm test` **FAIL**: backend 1,317 PASS/398 SKIP; frontend **1,409 PASS/6 FAIL** (SEO/i18n 3, login touch target 1, calculator registration link 1, admin M2 1); DB 15 PASS/3 SKIP; contract 38 PASS. Existing separate QA Draft #1317 is unmerged. Skips are not passes.
- Audits **FAIL**: prod 2 HIGH; full 2 CRITICAL/10 HIGH/11 MODERATE/3 LOW; bot 1 CRITICAL/5 HIGH. No bypass or dependency change.
- Initial lint error on deliberately unsafe test number literal fixed to `Number(string)`; initial build environment used symlinked/stale Next 16.3.8, corrected only this worktree's dependencies to lockfile Next 16.4.2. Canonical `pnpm build` then PASS; no other worktree modified.

## Isolated PostgreSQL and release gate
- Isolated PG17.11 `wdmv_v761_test_acl` (281 migrations): transaction-local alert rule/event fixture, `moneyverse_app` owner 1 / foreign actor 0, exact trigger price `9007199254740995` WLD, function EXECUTE allowed, direct event SELECT and ledger INSERT denied, `ROLLBACK` leaves 0 rows. No Production DB writes. Database function uses supplied actor; Nest session is mandatory identity boundary.
- Test Candidate #40236038750 **FAIL** (classify/policy PASS, runtime-check FAIL, build/production gate SKIP). Official Test `/api/version` = `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production = `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither is candidate. No authenticated exact-SHA official Test web/Android/finance E2E, isolated restore or approved GitOps gate.
- P0 unresolved: root disk 100%, shared dev/Production DB and wildcard 5433, excessive app-role DML/PUBLIC bank function grants, historical migration 266 provenance, frontend regression and security audit failures.
- **No main merge, Test/Production promotion, DB migration, ledger write, service restart or branch deletion.** Rollback now: leave Draft PR #1381 unmerged; future release reversal would revert the read-only route/link/contract in reviewed change. All incomplete or unique branches preserved.
