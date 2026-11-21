# v2026.11.19.41 — Integrated Spring Board + Admin Discord API Truth QA

**Scope:** New exact source branch `fix/spring-canonical-board-api-v2026.11.19.41`, stacked isolated integration merge of [security PR #3302](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3302) and [member/admin web PRs #3301/#3303](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3303). Pinned source parents security `a04f3228f76166ce20c89a4bee69170a098e7919` and web `23c6f43675fdebfe9afed6a6897f00f26fe91298`; merge/test baseline `90ec1243da9aedfba5e1fc6c6a84e30e292e60a6` only in own branch, not main. **API Java code NOT promoted to Production.**

| Gate | Actual evidence | Result |
| --- | --- | --- |
| TDD RED | `BoardSourceTruthTest`, `AdminDiscordSourceTruthTest` before changes | Expected compile-test RED (methods and safe constructor unavailable) |
| Focused Board tests | 10 tests for real canonical read/empty/exception, no forged session/CSRF, idempotency and stored receipt | **10/10 PASS** |
| Focused Admin Discord tests | 3 tests for legacy API anonymous 401, verified real empty array and DB failure 503, no fabricated delivery | **3/3 PASS** |
| Historical Phase7 H2 board regression | Old test asserted fake 200 on missing `board_posts` | Updated: H2 missing PostgreSQL source must return **503**, no sample posts. Dedicated actual positive source mapping unit remains PASS |
| Full Spring build | `./gradlew --offline clean test bootJar --no-daemon` | **266 tests / 0 failures / 0 skipped**, executable jar SHA256 `5c0b480e62444c9bb5a27be6185bd849d7e59c786429dab03f6ec1a3f6c032ad` (candidate only) |
| Mobile/desktop member | Actual Chromium local fixture test | **16/16 PASS**, guest/user A→B/expiry, WLD 20-digit exact, widths 320–1920 |
| Mobile/desktop admin | Actual Chromium local fixture test | **13/13 PASS**, drawer, 5-locale auto/manual, widths 320–1920 |
| Real board UI fail-closed | Actual Chromium local mock API combinations | **6/6 PASS**: real UUID post rendered, source 503 or ok:false blocked, synthetic `post-wld` refused, valid empty distinct, no horizontal overflow |
| Source static/locale | `scripts/test_mv39_home.py`, `scripts/test_mv40_admin_locale.js` | 16/16 source contracts; 112 dictionary keys×5 locales |
| DEV PostgreSQL source metadata | Authorized read-only mini-PC DB MCP | `member_board_public_list_with_stock(50)` returns 1 verified row; app role EXECUTE for canonical read and `member_board_create` true. **Not a real post creation** |
| Anonymous real public API | OpenAPI 973 paths, 644 GET; 208 no-cookie safe GET requests | 96×200, 71×401, 29×302, 8×403, 1×301, 1×406, 1×502, 1×503; details in [findings](../findings/2026-11-19-public-api-matrix-v41.md) |
| Scoped Production Nginx privacy | `/admin.html` + 3 preview aliases; `/admin/blog*` protected via existing verified admin auth | **OPERATING HOTFIX SUCCESS:** actual HTTPS 8/8 anonymous redirects, `nginx -t`, graceful reload, preserved root/blog/API regression |
| External official Test | `https://test.easy-scraping.com/api/version` | **403; blocked**. Do not bypass policy |
| Isolated Java Test port 4682 | Run read-only standalone Spring candidate without production credentials | Failed to start: default datasource `127.0.0.1:5432` refused; actual live config uses other DB port; no credentials exported or copied. Not a passed E2E |
| Actual account/finance/admin source QA | Real positive admin + nonadmin + 2 members, ledger receipts/idempotency, DB roles, real post creation | **NOT PERFORMED** |
| Entire site 180 pages × 5 passes & zero-downtime cutover | G442 source route inventory, all role/UI states, exact-SHA Test, independent restore | **NOT PERFORMED — FULL RELEASE HOLD** |

**Source truth changes:** `BoardService.listPosts/listStockPosts` uses canonical public SQL function without generating fallback articles; returned IDs/time/comment counts come from DB, unknown body/author UUID/view/like counts are nullable (not 0). Invalid category/stock symbol rejects 400; DB error returns 503. Board POST binds actor to session, rejects spoofed header, requires CSRF and UUID idempotency, and only returns success after canonical `member_board_create` actual post UUID receipt. Unsupported tagged post request returns explicit 422, not fake tag. AdminDiscordController protects old `/admin/discord-outbox-events` with current DB admin role, exposes only real outbox rows, preserves unknown delivery outcome (no COALESCE delivered), and DB errors fail closed with 503. Member-home recent board uses canonical source only and refuses legacy fabricated IDs.

**Production release status:** TWO tightly scoped Nginx edge protection changes performed and verified (not a frontend or Java deployment). All new Java/UI code remains source candidate. No Finance/DB writes, no production Spring restart, no main merge, and no proof that every API/function works. Current public Board still synthetic; Discord 502 and invalid Java hardcoded green status unresolved; offline/503-only legacy components cannot be called fully implemented. All blockers documented.

[한국어 QA](2026-11-19-spring-api-source-truth-v41.ko.md) · [Ops](../operations/2026-11-19-scoped-admin-edge-v41.md) · [Worklog](../worklog/2026-11-19-web-api-promotion-v41.md).
