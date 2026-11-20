# v2026.11.19.40 — Admin + Member Spring Web UI: Shared Visual Tokens, Source Truth and Permission Gating

**Status:** NEW SOURCE CANDIDATE, **DRAFT / FULL PRODUCTION HOLD**. This is a desktop/mobile **website**, not an Android/iOS application. Superseding owner directive: Spring Boot serves all approved web frontend; existing design reference takes precedence over external aesthetic examples. Source base is [v39.1 member homepage](../../docs/updates/v2026.11.19.39.1-approved-home-github.md) `b5e5511acd88a3136eb2673f6fadcb30530436c2` stacked on `origin/main` `f488088bf50eb4659f59782dc0300a9c3bc74c69`. Existing security/finance teammate PR #3302 remains separately owned; no overwrite.

## Precise outcome (implemented in this branch)

- **Web only:** Java Spring MVC server-rendered `/admin` and `/admin/`, Spring classpath static `/` member homepage v39.1, JS enhancements only for locale/manual selection and mobile drawer. No Node/Next runtime needed to serve the new pages.
- **Design:** approved [admin desktop/mobile reference](../design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png) and [member desktop/mobile reference](../design/all-pages-v2026.11.18.12/previews/home.png). Shared navy `#0c1020`, panels `#151d32`, violet `#9c83ff`, blue `#64b7ff`; PC sidebar, tablet collapse, mobile 5-tab navigation, quick links, 56px help action with bottom-bar safe gap, 44px minimum action targets and focus. CSS assets live under `/assets/mv40/`, original member root under `/assets/mv39/`.
- **Auto + manual locale:** same shared persistence implementation `wdmv_locale_preference` (localStorage) and `wdmv_locale` cookie, browser Auto and user-selected EN/KO/JA/ZH/VI. English canonical, Korean second, the other three retained. 112 i18n keys all five defined. Language selection applies to newly authored admin dashboard/member homepage, not yet all 180 legacy pages. Sensitive finance/auth data is never saved in localStorage.
- **Real admin source only:** verify current DB session and role via `AdminAuthService.resolveVerifiedAdminActor`. `AdminDashboardPage` fetches up to 50 member source rows from `AdminGovernanceService.listUsers`, the verified public stock overview via `listStocks`, and feature switch states via `getFeatureSwitchesOverview`. Cards show only **records in this query**, never claimed worldwide totals, national treasury or chart. Each source fails independently; missing source becomes visibly `Unavailable`, overall HTTP 503 for partial data. Price is exact source string (no JS Number WLD) and dynamic text HTML escaped. No fake 'all systems operational', no unverifiable finance balance or public metrics.
- **HTML path protection:** Spring `AdminHtmlBoundaryFilter` gates known HTML and static HTML aliases using real DB admin actor, without hijacking legacy JSON APIs under `/admin/*`. Applies private/no-store and noindex/nofollow/deny-frame/nosniff headers. Anonymous HTML redirects to login; unrelated member requests and /admin/... JSON controller 401 remain unchanged. `/admin.html`, `/admin/index.html`, and `/admin-preview*` aliases redirect authenticated administrators to canonical `/admin` (fake preview eliminated from canonical navigation). Admin API authorization/CSRF remains independently enforced.
- **Preserved routes:** existing `/admin/users`, `/admin/market`, `/admin/controls`, `/admin/economy` Spring protected SSR pages and remaining category routes are linked, **not reimplemented** or claimed operational. Deep legacy admin static pages are shielded from anonymous access where they resolve to HTML, but their data/action parity, all 5 languages and status need individual certification.

## Functional authorization / state matrix

| Operation | Expected/observed source action | Security + truthful result |
|---|---|---|
| Anonymous `/admin`, `/admin.html`, `/admin/analytics` | HTML access | 302 login and private/no-store (MockMvc H2 TEST; **not yet Production**) |
| Anonymous `/api/v1/admin/users`, `/admin/backups/status` | JSON API | Independent 401; **never** convert to HTML 302 |
| Active administrator `/admin` | Current session and active DB role | Query verified row summaries; partial 503; no invented money values. Positive live member session **not yet performed** |
| Expired or non-admin session | Auth service | No member records, no admin HTML. Cross-role E2E **pending** |
| Search, market, economy controls | Existing protected routes | Navigate to original route, preserve operation; write mutation idempotency/CSRF/approval must pass separate live QA |
| HTML alias and preview | Legacy fixture content | Authenticated redirect canonical; anonymous redirect login; no rendering of example fake values |
| 5-language selection | Browser or saved explicit locale | Auto uses navigator; manual persistent; route home+admin; other legacy screens TODO |
| Market source outage | `listStocks()` throws | Cannot show 0 or synthetic quote; partial source failure HTTP 503 |
| Wallet/finance actions | No financial command introduced | Financial behavior unaffected. Dedicated security fixes under PR #3302 need integration before any Production |

## Remaining work: 180 route migration and admin functional completeness

1. **P0 — real backend auth/security:** Merge reviewed source-truth fixes (separate PR #3302), test DB roles, MFA, CSRF, client idempotency, admin signed-in positive and unauthorized negative on actual Test identities; never bypass to make an action look successful.
2. **P0 — real finance/ledger:** exact-source personal wallet/portfolio and Treasury/KDIC/stock/shop order receipts, no fake 200 success, two-account isolation and actual DB read/response proof. Current 38 Java failures and 503-guarded legacy functions block complete parity.
3. **P0 — Test and no-downtime release:** official HTTPS Test candidate SHA, private cache/noindex, public edge, Chrome PC/mobile real-auth, 180-route regression, artifact hash/backup independent restoration, traffic continuity and zero-downtime rollback. Official Test `/api/version` currently 403, not proven. Operator approval does not bypass evidence gates.
4. **P1 — full admin route family:** user directory, roles, economy ledger, items, support tickets/chat, marketing, analytics, logs, Discord, Treasury, content, trading and risk pages. Each needs API endpoint/DB authority map, RBAC, write receipt, idempotency and explicit failure state. Replace remaining static mock snapshots with Spring SSR only after functional parity.
5. **P1 — all-member web views:** wallet, investment, quests, shop, inventory, community, blog and calculators. Apply shared semantic components and 5 locales per route, with 320/390/768/1440, 200% zoom and keyboard tests; keep existing correct features until verified replacement.

## QA evidence, not Production readiness

- Original root/source baseline from v39.1: 237 Spring tests, 38 failed. First attempted all Java with naive admin HTML prefix gate: 247/46; 8 extra failures from wrongly redirecting `/admin/...` JSON APIs. Fixed HTML-only matcher. Subsequent full isolated source: **247 Java tests, 38 failed**, so 0 new failures over known baseline; this is NOT a passing whole suite.
- Focused admin unit and real Spring MVC embedded H2 test: PASS. Chromium isolated **admin fixture** 13/13 across 8 screen widths, drawer, 5 locales, HTML escaping; pre-existing member home fixture 16/16, translation dictionary 112/112×5 PASS.
- No real active administrator credentials or owner ledger used in fixture. Real source is accessed by Java service when an authorized administrator visits the new page; the fixture uses clearly artificial synthetic stock/user values and is strictly local QA. Screenshot paths `docs/design/mv40/` capture the fixture, not the public operating site.
- No global app change, DB write, main merge, Nginx edit, or Production promotion from this branch; failed full tests and official Test 403 are open gates.

[Detailed QA](../qa/2026-11-19-spring-admin-member-web-v40.md) · [worklog](../worklog/2026-11-19-spring-admin-member-web-v40.md) · [한국어 계획](SPRING_ADMIN_MEMBER_WEB_UI_v2026.11.19.40.ko.md).
