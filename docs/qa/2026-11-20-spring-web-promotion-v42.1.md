# v2026.11.20.42.1 — Real Spring Test candidate, administrator legacy API boundary and two HTML route repairs

**Source:** branch `fix/spring-web-route-qa-v2026.11.20.42`, stacked on [PR #3304](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3304) (finance-safety #3302 + user/admin web #3301/#3303). Reverified `origin/main=f488088bf50eb4659f59782dc0300a9c3bc74c69` on 2026-11-20 KST. **No full Java/frontend/main/Production promotion.**

## Verified Test environment and exact immutable artifact

- Existing protected mini-PC **read-only Test DB** systemd environment was REUSED by reference. No database password extracted/copied, no production account or WLD write. Test Java only binds 127.0.0.1:4682. Forced read-only Hikari, no schema migrations, no ticker/bot credentials, scheduler disabled. The first launch using the regular prod `.env` file failed because that file does not contain Spring datasource variables; using the existing read-only Test environment fixed this without copying secrets.
- Exact clean `./gradlew --offline clean test bootJar --no-daemon`: **271 tests / 0 failures / 0 skipped**; previous 266 + two HTML collision route tests + three legacy admin JSON auth tests. Immutable Spring JAR SHA256 `185f9caed4cc99cfedf5dd5a4b40677ee22ade66d97986730a0237b3a7544698` paired with a frozen `frontend-static` source directory under a SHA-named Test release. No Production service restart.
- Direct real Java/Test PostgreSQL-backed HTTP: `/`200 new EN-first web page (6219B), `/api/v1/board`200 real verified **empty** list rather than `post-wld-*`, `/api/v1/stocks`200, `/admin/analytics.html`302, `/api/v1/admin/users`401, `/collections/index.html`302, `/stocks/alerts/index.html`302.

## Coverage and limits

| Coverage | Result | Does it certify full release? |
| --- | --- | --- |
| Candidate Spring full JUnit + bootJar | **271/271 PASS**, zero skipped | No; unit and H2 MockMvc do not replace authenticated DB money flows |
| Real isolated Spring read-only Test HTTP | Server active; public guest board and stock, roles negative | No; actual real users/admins, write receipts not tested |
| Source static HTML inventory | **281 distinct `.html` routes × 5 GET-only passes = 1,405 checks**: each pass 209 HTTP200/72 HTTP302; HTTP405/500/502/503=0 | **Not** the required G442 180 app routes × 5 full interactive/role passes |
| Actual Chromium Test (no mocked APIs) | **30/30 PASS** across five passes × six widths 320,360,390,430,768,1440 and five auto/manual-supported languages EN/KO/JA/ZH/VI, mobile drawer/Escape, no overflow or JS exceptions | Guest homepage only. Authenticated pages/buttons, 200%/400% zoom and every route not certified |
| OpenAPI source inventory in isolated Test | **987 paths / 658 GET**, alias-inclusive; 208 safe/no-cookie GET checks | Not comprehensive. 15 deliberate 503 unavailable sources remain |
| Anonymous Test API status | **84×200, 108×401, 1×406, 15×503**, 0 synthetic-board flags | No. 200 means HTTP response, not audited ledger/feature parity |
| Legacy `/admin/...` JSON P0 | 13 observed sample paths **200→401** without session after Java `AdminApiBoundaryFilter` covers legacy admin REST routes; HTML retains 302, CSRF/verified role required for writes | Real positive admin-role Test still missing |
| Two legacy HTML aliases | GET `/collections/index.html` and `/stocks/alerts/index.html` initially HTTP405 because `/{id}` PUT/DELETE controller shadows static resource. Added exact Spring GET aliases forwarding to existing canonical trailing-slash pages. Actual Test now HTTP302, canonical page200 | Only two routes repaired |
| ACTUAL scoped Production Nginx correction | Backed-up exact Nginx site, `nginx -t`, graceful reload, public HTTPS old HTML two routes **405→302** to canonical pages. Existing root200, admin302, adminblog302, adminAPI401, stock200 unchanged | This is an **edge alias hotfix only**, not new Spring Jar or full UI |
| Official public Test URL | `https://test.easy-scraping.com/api/version` remains **403** | Blocked; no WAF bypass performed |
| Authenticated multi-actor finance/admin & entire website interactive QA | No actual session credentials/ledger receipts, independent restore or zero-downtime exact-SHA release Test | **BLOCKS full Production promotion** |

## New security discovery and fix

The initial `AdminApiBoundaryFilter` guarded only `/api/v1/admin/**` and `/api/admin/**`. Some older `@RestController` APIs still use `/admin/**` and were anonymously accessible on the raw Spring port despite Nginx `auth_request` guards. Direct isolated Test without a cookie returned HTTP200 for 13 administrator JSON paths including AI-news settings, audit dispositions and blog moderation. `AdminHtmlBoundaryFilter` covers only static admin HTML and SSR, intentionally preserving browser redirects. `AdminApiBoundaryFilter` now guards **all other legacy `/admin/**` REST paths**, even when accessed directly, using the same verified administrator role/CSRF. Test confirmed 13×401; 3 new integration tests, original admin browser redirects unchanged. This critical auth change is **code-only**, not deployed to Production Java. Current public edge has separate Nginx verified-admin protection.

## Release decision

**GO (completed):** only scoped Nginx two-HTML route fix. **HOLD:** Java Spring 42.1 / PC+mobile frontend all-routes Promotion. At least 15 HTTP503 features (quant, derivatives, FX, KDIC, crafting, ventures), 1 HTTP406, missing positive login/ledger E2E, exact official Test 403, G442 full 180 app routes ×5 complete controls/dynamic role/viewport states, independent restore/zero-downtime revert. Existing Production Spring binary and GitHub `main` stay unchanged. Do not conflate these 1,405 GETs with full QA compliance.

[한국어 QA](2026-11-20-spring-web-promotion-v42.1.ko.md) · [Worklog](../worklog/2026-11-20-spring-web-promotion-v42.1.md) · [Prior v41 API findings](../findings/2026-11-19-public-api-matrix-v41.md).
