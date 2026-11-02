# Development A QA — Bounded Public Board Title Order (2026-11-02 17:05 KST)

**Disposition: P1 CODE IMPLEMENTED / DRAFT / RELEASE HOLD.** No authorization to merge, deploy or claim end-to-end success.

## Source, scope and regression
- Latest remote main `a8541927c3a351d980454c66e95a3356c47e0722` checked at start, midpoint and end. Isolated worktree `auto/hourly-a-20261102-1705-board-title-order`; implementation code SHA `5615ff68a67858bdc616d73f16e9a94ae44940c9`; final documentation SHA recorded in PR and local evidence.
- Opt-in `GET /api/v1/board/public/stock-posts?sort=title` over the **latest 50** rows from `member_board_public_list_with_stock(50)`, after existing stock and literal title filters. PostgreSQL `ORDER BY title COLLATE "C", post_id` is bytewise, not Korean locale alphabetical. No whole-history claim. Default two-argument service call and response preserved.
- Next `/board` exposes accessible GET controls and noindexes query-specific pages; SSR requires `sortApplied: title`. Android gateway rejects duplicate/unknown sort (400), missing proof, malformed/duplicate UUID, unordered and >50 success rows (503), and overrides upstream cache/index/referrer headers. 184-endpoint mobile contract regenerated.
- No new migration, direct DB grant, ledger write, session change or Production mutation. No private identifiers logged in this QA.

## Evidence (code SHA, before final docs)
- RED: Backend 3 failing tests; Frontend 8 failing tests. GREEN: Backend targeted 3/3; Frontend targeted 10/10; tie-order regression added. Frontend full **2,932 PASS**. Backend full **2,981 PASS / 2 FAIL / 518 SKIP**. Two existing `profile-private-response.http.test.ts` cases expect 200 but receive 401; tracked separately in Draft PR #2265. **Backend suite FAIL, not PASS.**
- Database tests 62 PASS / 5 SKIP; contract 41 PASS; policy/security/backup 27 PASS. Typecheck PASS; lint 0 errors / 1,027 warnings. Backend build PASS. First full build FAILED from 1,024 MiB Node heap OOM; frontend retry with 2,048 MiB heap PASS (602 Next page entries). API contract check PASS (184 endpoints).
- Supply chain: production-only audit **0 known vulnerabilities/PASS**; full dependency audit **9 vulnerabilities (1 low, 8 moderate)/FAIL**. Full-route QA ledger check **BLOCKED** because `artifacts/qa/full-route-ledger.json` is absent. Browser accessibility/SEO tests targeted PASS, but authenticated end-to-end/a11y scan not certified.
- Real DEV PostgreSQL 17.11, `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app`: existing public function EXECUTE allowed; actual public posts 1; title sort SQL EXPLAIN and query PASS, synthetic 3-row C collation PASS, ROLLBACK. Real multi-row positive dataset absent. **P0 DEV ACL:** `account_balances` UPDATE and `user_items` DELETE both allowed. Production ACL not established.
- Official Test exact candidate SHA preflight **FAIL**: Test manifest/backend/frontend/artifact/public version still `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, six SHA mismatches. Public Test and Production `/api/treasury/overview` return HTTP 200, not required 503; no independent restore or authenticated Test E2E. No GitOps release gate PASS.

## Branches, CI and disposition
- START live remote heads 242, open PRs 224, conflicts 29; END live heads 244, open PRs 225, conflicts 29. End tracked refs 247 non-main (some stale), 13 merged into main, 234 not ancestors of main. Do not equate stale tracking refs with live remote count. Deleted 0. Merge-tree with A author, reply, period and topic branches reports conflicts; all unique changes preserved.
- PR #2494 remains Draft/HOLD; CI status must be read for exact final SHA. No main merge, Test/Production deploy, DB modification, restart, rollback or branch deletion.
- Evidence directory: `/srv/moneyverse-data/tasks/mv-a-20261102-1705-board-title-order/evidence/`. Retest every required gate at exact final SHA; until full PASS, release remains prohibited.
