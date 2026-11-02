# A 23:50 — Public board identity proof QA (P1 / DRAFT / HOLD)

**Base main:** `9cade11af53db9f27c2b9f0ea9d39005ea8d0387` (start, midpoint and before final docs). **Code checkpoint:** `9cf83fa98899d06caec6ed9fc3d54f45829455bb`, followed by a no-contract-drift object-key-order fix. Final SHA and CI are tracked on the PR.

## Behavior
The latest-50 `public.member_board_public_list_with_stock(50)` source remains the only PostgreSQL read. Nest rejects malformed/duplicate case-folded post IDs, >50 rows and non-public `mine` claims. Web SSR verifies bounded IDs, counts, timestamps and stock metadata before rendering links. Android app-api refuses unverified 200, malformed JSON and non-JSON successful responses with HTTP 503 and no-store/noindex. Valid empty results remain distinct from unavailable data. No migration, money write, ledger mutation, privilege grant or auth bypass.

## Fresh verification
- TDD RED: backend 3 failures; frontend missing parser/Android unverified response; two additional malformed-content Android RED failures. GREEN backend targeted 11/11, frontend targeted 14/14.
- `pnpm typecheck`: PASS (code checkpoint); `pnpm api:contract:check`: PASS, 184 endpoints and 683 methods after source-order correction.
- `pnpm test`: FAIL due to existing `src/profile/profile-private-response.http.test.ts` two 401-vs-200 cases. Backend 2,984 PASS / 2 FAIL / 518 SKIP; database 62 PASS / 5 SKIP; contract 41 PASS. Not a full-suite pass.
- Frontend entire suite separately: 2,952 PASS. Lint: 0 errors, 1,027 warnings. Backend/frontend build PASS, 602 Next.js static pages.
- `pnpm audit --prod --audit-level=low`: PASS, no known vulnerabilities. All-dependency audit: FAIL, 9 advisories (1 low, 8 moderate).
- DEV PostgreSQL 17.11: READ ONLY, `SET LOCAL ROLE moneyverse_app`, existing public function returned 1 post. DEV `account_balances UPDATE=true`, `user_items DELETE=true` remains P0 #993; this is not Production ACL evidence. No DB writes.
- Remote audit after fetch: 294 total branches including main, 293 non-main, 276 unique unmerged, 17 already merged; 265 open PRs / 29 conflicting at start. Virtual merge with A PRs #2540/#2530/#2519 fails; preserve all branches.

## Unverified release gates
Exact final-SHA official Test authenticated E2E, real multi-row public data, independent backup restore, Production ACL, complete dependency audit and GitOps approval remain BLOCKED. No Test/Production mutation, main merge, branch deletion, runtime restart or rollback performed. The task is a Draft candidate, not a release.

Evidence: `/srv/moneyverse-data/tasks/mv-a-20261102-2350-board-identity-proof/evidence/`.
