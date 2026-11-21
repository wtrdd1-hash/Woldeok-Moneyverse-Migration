# Native Spring frontend rebuild implementation plan

> Required skill: superpowers:executing-plans. Owner explicitly approved implementation, maintenance, backend fixes and production promotion; no repeated design approval is needed.

**Goal:** Replace the mixed native/prototype/captured Next frontend with one Nov18 Spring MVC/Thymeleaf design, including all inventoried member and administrator features, using verified backend contracts.

**Current state:** Maintenance is live at exact main93a31e3e44. Dedicated old frontend Production/Test units are stopped. API/DB/session authorities are retained. Maintenance is a separate completed control-plane milestone, not the rebuilt application.

**Authority:** NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1; ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12; ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13; SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28. PR3343/3344 are draft reference proposals. They do not establish new banking/card API availability. Preserve current favicon bytes, six approved palette values, existing Korean product semantics, five locales, PC-first responsive widths320/360/390/430/768/1024/1440/1920 and44px controls/56px support with16px safe gap.

## Global gates
- No generic home dashboard, captured Next HTML, iframe, sample balances, fake charts or invented successful commands as a feature replacement.
- Only one frontend-presentation runtime implementation, with isolated Test and Production generations. API/auth/database/worker ownership stays singular. Expand a read gateway only through fixed reviewed path authorities; no caller-controlled upstream URL/actor/internal token forwarding.
- All private/admin responses no-store/noindex and real current-session/DB role checked. Authentication, CSRF, step-up, owner isolation, amount strings, idempotency and actual receipts remain mandatory. Migration197 retires second factor while AGENTS mandates it: do not silently waive or activate high-risk writes on a fabricated proof. Resolve using a reviewed security implementation and tests before those actions are enabled.
- Exact-source CI/artifact/Test and actual browser acceptance precede replacing maintenance with rebuilt Production. No API/SQL/financial gate is weakened because the owner approved UI deployment. SQL is parsed/tested in authoritative CI, skipped tests are reported separately.
- Worklog before/in progress/finished and pushed checkpoints. Fetch current main during work and before integration. Source/ops independent review as required. Preserve rollback and sessions.

## Task 1 — shared native foundation
Files: templates/shared/admin-shell.html, shared/chrome.html; assets/mv39/favicon.ico; assets/mv43/chrome.css; frontendpresentation/Nov18VisualChromeTest.java.
- [x] Real-render mobile header favicon tests RED→GREEN; current favicon byte equality RED→GREEN. Focused6 passed.
- [ ] Re-run appropriate native/browser suites on new candidate; mark only validated scope.
- [ ] Native member layout fragment is reused across subsequent feature templates; headings/forms/tables/error states/locale/support remain consistent.

## Task 2 — administrator shop: canonical read and honest commands
Files: api/domain/shop/controller/AdminShopController.java; new api/domain/shop/service/AdminShopService.java; new frontendpresentation/AdminShopPageController.java; templates/mv46/admin-shop.html; assets/mv46/admin-shop.css, admin-shop.js; frontendpresentation/UnifiedFrontendApplication.java; ui/mv43-copy.json and existing locale corpus; tests api/domain/shop/AdminShopCanonicalTest.java, frontendpresentation/NativeShopIsolationTest.java; scripts/native-admin-shop.test.mjs.
Interfaces: GET /api/v1/admin/shop/items calls existing public.admin_shop_items(p_actor) with verified DB actor, returns canonical snake_case fields and exact price strings. Existing create/update/delete may not return success without persisted canonical receipts. Unsupported create/delete and writes lacking verified step-up/idempotency remain explicit non-success, not activated via the old synthetic controller. GET /admin/shop renders shared administrator shell after real admin proof; browser fetches exact same-origin canonical endpoint and validates every row/duplicate/amount/stock. Search/category/refresh/details/empty/unavailable work without static item data. No new SQL/grants/migration for read.
- [x] Source/CI tests first: unauthorized and DB failure never sample/empty success; SQL references scoped function not table; canonical38/19digit values remain strings; malformed/duplicate rows fail closed; forged actor ignored; fake writes cannot succeed.
- [x] Implement only tested read and truthful command boundary. Match existing function schema. Do not claim high-risk command acceptance yet.
- [x] Native actual HTTP tests for authenticated/expired/member/denied/source failure/query/escaping/aliases and no DB startup.
- [ ] Browser PC/mobile5locale controls with actual source in protected Test; source CI does not satisfy this live acceptance.
- [ ] Finish canonical write path only after session-bound step-up/idempotency/audit implementation and disposable DB round-trip receipt tests. Existing168 function is not a complete idempotent audit contract.

## Task 3 — administrator remaining feature families
Files: adminpresentation controllers + templates/mv46/admin-*.html and shared components; api/domain corresponding services/controllers; focused new tests and native DOM tests per family.
- [ ] Replace legacy content/support/help/log/security/operations/catalog pages with native views, beginning with real read authorities. For every screen record route→controller→API→DB function→read shape→commands→proof/tests→status.
- [ ] Implement real admin support queue/detail/reply/status with owner/role/CSRF/audit and persisted receipts; no unrestricted member conversation inspection.
- [ ] Security console shows actual sessions/expiry/current roles; eliminate invented role fallback/900seconds/successful rotation when persistence fails. Review auth/step-up policy before enabling high-risk mutations.
- [ ] Catalog, content, economy, treasury, mint, pension, bonds, FX/KDIC and stock admin operations use canonical functions and ledger invariants. No fixed healthy telemetry, task timestamps or fake triggered commands. Implement missing read paths alongside arguments needed for writes.
- [ ] Per-family TDD and real disposable DB checks; independent permission negative tests; full35tool39static/3dynamic admin inventory acceptance.

## Task 4 — public/member features
Files: frontendpresentation native feature controllers; shared/member-shell.html; templates/mv46/{stocks,shop,quests,board,status,account,bank,work,...}.html; assets/mv46 feature scripts/styles; corresponding canonical backend fixes/tests.
- [ ] Replace five prototype routes with dedicated native screens, real list/detail/filter/search/buttons and meaningful dynamic entity pages. Never render home as missing detail.
- [ ] Implement account/session/profile, wallet/activity/transfers, bank/deposit/pockets, inventory, work/rewards, stocks/portfolio/history/candles/indicators, economic/community families and published content/SEO/policy screens from actual contracts.
- [ ] Follow draft banking UX where supported; no fictional card issuance/network or invented backend.
- [ ] Make support/chat owner-proof and five locales work across every shell; real successful receipt before success and safe memory-only drafts/session change clearing.
- [ ] Calculators have explicit formulas/current assumptions/reference evidence, exact integer handling and deterministic expected-value checks. No financial advice or fake market curves.

## Task 5 — complete acceptance matrix
Files: docs/qa/2026-11-21-native-rebuild-feature-ledger.*, new release receipt, worklog.
- [ ] Bind existing180source candidates/147static/33dynamic plus aliases to native page/action/fixture/roles/locales/viewport cases. Unavailable or missing fixtures stay open, not PASS.
- [ ] Actual browser8widths5locales200%zoom, keyboard/forms/search/filter/tabs/details/dialogs, loading/empty/401/403/409/429/503/offline, no overflow/collision, real source numerics and persisted command receipts.
- [ ] Run authoritative Node/Spring/SQL/permission/idempotency/ownership/security tests with zero unaccounted failures, identify skips. Review fresh whole branch and exact operational apply/inverse.

## Task 6 — integrate and replace maintenance
Files: versioned immutable artifacts/systemd/Nginx proposal and docs/releases acceptance.
- [ ] Fetch/reconcile main, guarded PR integration and exact-main runtime CI/artifact.
- [ ] Isolated protected Test uses same artifact/config scope and independent DB fixture; real authenticated owner/admin positive and cross-user/role negative, existing session continuity and source/process/JAR identity.
- [ ] Prepare replacement Production before removing maintenance, switch only accepted routes/scopes; whole-site completion requires every inventoried functional case accepted.
- [ ] Preserve unrelated concurrent Nginx hardening; current-config CAS and bounded inverse. Observe errors/readiness/actual browser and financial gates as applicable. Record precise deployed/remaining scope; do not call the whole rebuild finished early.

Pre-flight: shared locale catalog and immutable asset digests are common to all tasks; update digest consumers together and run existing asset/native suites. AdminSourceClient and read gateway are closed allowlists; expanding a template alone cannot reach a new read. Backend source head and actual retained runtime differ; source passing is not Production correctness. Maintenance must stay until replacement health/acceptance is proven.


## Task2 continuation — scoped canonical administrator catalog backend authority
Observed signed-in Production GET still returns two synthetic camelCase rows from the retained old backend. Do not switch the whole unaccepted backend simply to fix this read. Add a narrowly composed `catalog-read` backend runtime, separate from DB-free presentation: only existing AdminAuthService (same authoritative session/role functions), AdminShopService and a dedicated GET controller; exact catalog GET plus own readiness/version only. No session issuer, scheduler, socket, market worker, other controller, HTML or economic writer bean. Canonical route has exactly one upstream once accepted; this is not a second session/economy authority. Reuse the same approved immutable CI JAR under a separate restricted backend unit/config. No new grant/migration and no member actor header trust.

Files: api/MoneyverseSpringApplication.java; catalogread/CatalogReadApplication.java, CatalogReadController.java; tests catalogread/CatalogReadIsolationTest.java and tagged PostgreSQL actual HTTP extension. Root-managed runtime configuration must use the existing external database environment without printing/copying credentials into Git; require the actual app principal and PostgreSQL read-only transaction before every actor/catalog operation. Missing DB/role/source stays explicit non-success. Existing full application and frontend-presentation behavior remain unchanged.

Tests first: actual HTTP auth/role/owner/exact bigint response; no forged actor; source failure; all mutations/API siblings/documents denied; absent session/jobs/economy beans; no table grant; real PostgreSQL session+role+catalog join using disposable CI fixtures and rolled-back session creation. Source review and exact-main artifact/independent Test before any scoped Production API routing. High-risk shop writes remain a separate unmet security/receipt gate. This backend slice is not deployed by the protected HTML-only preview installer.


## Task2 preview continuation — bind the native page to a genuine protected read canary
Keep the normal catalog endpoint unchanged. Add one server-controlled frontend property admitting only the existing canonical catalog path or the exact protected rebuild QA catalog path; request query/header values cannot choose it. Render the chosen path as a data attribute, consume it through the existing strict owner-before/read/owner-after core, and reject all other paths before any fetch. No generic proxy URL or actor input. This enables real read-only Production data in an ADMIN_PREVIEW_ONLY canary without replacing the public Production API, weakening Test-host admission or pretending it is independent full Test.
Files: AdminShopPageController.java; templates/mv46/admin-shop.html; assets/mv46/admin-shop-core.js and admin-shop.js; current shared asset digest consumers; existing NativeShopIsolationTest/native-admin-shop core/UI tests. RED→GREEN must cover closed endpoint set, trusted HTML binding and normal default, unsafe/foreign endpoints refused before fetch, unchanged owner/session checks and no query override. A separate reviewed operational canary must enforce real existing admin auth, loopback-only canonical backend, immutable exact-main artifact, current configuration ownership and rollback before this private source can be used. No new backend/route is applied by source configuration alone.


## Task1 continuation — administrator shell first-paint accessibility locale
Actual protected browser found English skip/navigation accessibility labels in Korean. Reuse approved existing publicSkip/navigationMain/navigationMobile/menu/close/selectLanguage catalog copy rather than invent/reword product strings. Add real five-locale server-render tests before changing shared/admin-shell.html; verify skip text and sidebar/drawer/bottom navigation/control accessible names before any JavaScript. Keep current layout/logo/routes and dynamic language events; this applies to native shared-shell consumers, not hidden captured legacy pages. Full native Node/Spring regressions and independent source review precede integration. Actual40 layout observations remain an earlierapp727 snapshot until a newly accepted artifact is installed.
