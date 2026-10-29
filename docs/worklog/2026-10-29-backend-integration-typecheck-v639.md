# Backend B v639 — integration compilation and public treasury route repair (DRAFT / RELEASE HOLD)

## Before work — 2026-10-29 19:33 KST
- Debian 13.6 miniPC system status, remote command and file-read MCP invoked (file-read returned empty; shell used for source). Backend/frontend/Discord/Nginx/Docker active; DEV DB reachable. No live DB operations.
- Authoritative start `origin/main`: `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`. Separate worktree/branch `auto/hourly-b-v639-backend-typecheck-20261029-1935`. Read AGENTS, README, both project plans, QA v1371, open PRs and CI. A owns P0 migration lineage #1878; QA owns lint #1883; C owns frontend.
- P1 #1884 reproducible baseline: backend TypeScript failed with 5 errors (missing PublicTreasuryController, duplicated blog listForAdmin and duplicated ServiceUnavailableException); undici error from QA was a missing installed dependency, not a source issue. Frozen offline installation resolves undici.
- The integrated main had dropped the previously available `GET /treasury/public-overview` route while leaving module registration and a regression test importing it. Restore its existing public projection without granting database permissions or changing financial settlement.

## In progress — 2026-10-29 19:34–19:39 KST
- TDD RED: two public treasury HTTP cases fail because the controller is undefined; a new no-store assertion fails on the restored route before the header is added. Backend typecheck RED five errors.
- GREEN: restore public treasury controller from prior implementation, explicitly project only treasury totals and vault name/code/balance, preserve integer WLD strings, forward evidence failures as HTTP 503, add `Cache-Control: no-store`. Remove one identical duplicated `listForAdmin` implementation and one duplicate Nest exception import. Do not alter direct admin blog table access, which still needs a scoped SQL function and separate review.
- Focused tests: 18/18 PASS (public treasury 2, treasury evidence 10, blog visibility 2, dopamine controller 4). Backend TypeScript PASS, Backend build PASS, changed-file ESLint PASS. Contract 41/41 PASS; production dependency audit zero known vulnerabilities.
- Full gates on this branch: Backend 2340 PASS / 243 FAIL / 492 SKIP; Database 52 PASS / 1 FAIL / 4 SKIP (migration parity duplicate IDs); Frontend 2514 PASS / 53 FAIL; full ESLint 3 errors (2 pre-existing frontend, 1 initially introduced by this branch and fixed before final commit). Frontend typecheck/build FAIL (existing JSX escape corruption and 11+ interface errors). Mobile API contract check FAIL due existing NPC affinity schema drift; generated files restored. Bot tests BLOCKED because bot-only npm dependencies are not installed in this isolated worktree. No isolated PostgreSQL exact-SHA or official Test authenticated E2E performed.
- Independent existing P0: main still returns synthetic daily-quest and Pet Fortune WLD success despite older merged safe-hold changes; backend tests show failures. Not fixed in this single P1 task; requires separate fail-closed recovery before release.

## Finished — candidate, release hold
- No SQL migration, ledger write, balance, application DB grant, shared DEV DB, Test, Production or reservation changes. No other worktree or branch removed.
- Main re-fetched mid-run and remained `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`; final head/CI status are recorded in PR and host log after push.
- API contract: restored `GET /treasury/public-overview` public read-only projection, 200 with verified totals and vault whitelist, 503 on unverifiable evidence, `Cache-Control: no-store`. No DB contract change.
- Merge: NO. Test exact-SHA: BLOCKED. Production: HOLD. Do not interpret passing backend typecheck as an end-to-end release gate.
