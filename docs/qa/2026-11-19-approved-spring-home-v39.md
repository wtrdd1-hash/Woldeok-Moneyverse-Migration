# v2026.11.19.39.1 — Spring approved home QA / Release HOLD

**Target:** `spring-backend/src/main/resources/static/index.html` and `assets/mv39/`; source only, no Production rollout. Main baseline `f488088bf50eb4659f59782dc0300a9c3bc74c69`.

| Gate | Evidence | Result |
| --- | --- | --- |
| Pre-implementation RED | `scripts/test_mv39_home.py` against original homepage | 0/10 FAIL as intended |
| Source contract GREEN | same script after source correction | 16/16 PASS |
| JavaScript syntax | `node --check` both app.js and i18n.js | PASS |
| Real Chromium fixture browser | `scripts/qa_mv39_browser.js` on isolated localhost 4777 static source | 16/16 PASS |
| Viewports | 320/360/390/430/768/1024/1440/1920px, no document horizontal overflow | 8/8 fixture PASS |
| i18n | EN / KO / JA / ZH / VI; browser Auto + persistence | PASS in fixture browser |
| Account crossing | intercepted fixture session A → B → expiry; old WLD cleared; 20-digit WLD kept exact | PASS (mocked APIs ONLY) |
| Spring artifact | `spring-backend/./gradlew --offline bootJar --no-daemon` | PASS, Java17/Spring static artifact build |
| Entire Java suite | `--offline clean test bootJar` | **FAIL: 237 tests run, 38 failed** (auth, finance, false-success/security; existing Java sources unmodified). Do not claim baseline proven without separate run |
| Live source read (anonymous) | `127.0.0.1:4550` GET `/api/v1/auth/session`, `/api/v1/wallet/summary`, `/api/v1/stocks`, `/api/v1/board` | HTTP 200 API responses. Session anonymous, wallet value NULL; stock backed by SQL. Board returns fabricated fallback posts and is blocked on homepage |
| Authenticated real DB ledger matching | Owner session + source-derived numerical reconciliation | **NOT RUN** |
| Official Test exact candidate SHA | `https://test.easy-scraping.com/api/version` | **403**, BLOCKED (do not bypass network policy) |
| Production, no-downtime cutover and rollback | Exact-SHA Test, session continuity, backout | **NOT RUN — HOLD** |

**Security blockers:** Existing `StockController` could previously select a fallback actor for private portfolio; existing `BoardService.listPosts()` fabricates `post-wld-*` posts. This candidate avoids consuming those endpoints for its homepage; it does not remediate these backend issues. All financial/quest/reward actions and 179 other visual routes remain separately gated. Original Spring homepage had hardcoded Treasury/sample metrics, intentionally removed.

**Screenshots:** [1440px English PC](../design/mv39/home-1440-en.png) · [390px Korean mobile](../design/mv39/home-390-ko.png). Captured headless via local static fixture, **not** a screenshot of live Production or a real signed-in user account.

**Release decision: HOLD.** The user's production approval remains recorded, but authorization does not override failed security/full test gates, official Test 403, source-attested rollback, or concurrent Gemini edits. No production mutation or main merge executed.
