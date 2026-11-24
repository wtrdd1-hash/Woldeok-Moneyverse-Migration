# Frontend inconsistency and denied-route diagnosis — 2026-11-24

**Decision: HOLD whole-site acceptance.** The causes are mismatched runtime artifacts, incomplete presentation routes, broken asset routing and multiple visual implementations. This investigation did not deploy Production, stop services or change database privileges.

## Scope and evidence limits

Inspected28 MiniPC worktrees,36 running related services, effective Nginx configuration and includes,70 recent GitHub PRs and seven major PR check sets. Requested147 concrete routes on each of Production and Test anonymously (294GETs);33 dynamic inventory routes need owned fixtures and were not fabricated. Rendered24 actual desktop/mobile screens plus five separate external HTTPS screens and asset checks.

This is not a review of every historical commit/function or authenticated member/admin/financial acceptance. Existing240-case evidence applies only to the original source-bound artifact, not the now-changed runtime. Fresh owned browser contexts did not reuse user Production sessions.

## Findings

### D01 / P1 — Runtime bytes do not match the displayed revision

Test still claims source7b676e602bc984ab74572d4081655fdb297d176a. The running JAR hashes to e821295b848a1c5ffc64f909d1043ab7875b93be9dd913ce2793f49e40cace49, while the attested CI JAR hashes to a751dc6b8760967c7e3e8bcb7ca0c30fd1a73e9ad7df09548de66fe3a6893706. Entry-by-entry comparison found34 differences, including classes, templates, CSS, scripts and translations.

Current home/CSS bytes match consolidated remote sourcea61f6d8b9d; build-info still says7b. No attribution or modification time is inferred. The primary Production Spring JAR also declares sourceRevision=unverified; its public identity paths do not establish a source-bound frontend.

**Consequence:** prior240-case acceptance is historical and is superseded for the current running file. [Artifact differences](2026-11-24-frontend-diagnosis-artifact-drift.json).

### D02 / P1 — Navigation and security allowlists exceed actual handlers

Test /shop, /board, /quests and /account return403 both at ingress and directly from the presentation service. The real Test backend returns200HTML for those same paths.

UnifiedFrontendApplication permits these GET paths, but MemberPresentationPageController maps only wallet/bank/stocks/support/chat. Runtime class constants confirm those mapped families. Missing handlers/error dispatch meet the denyAll boundary; the result is a blank403. Community and the detailed youth calculator path also lack native routing. A link and permitAll entry do not implement the screen.

Anonymous302 redirects from wallet/bank/admin are expected authentication protection, separate from missing-screen403s. Positive role behavior remains unaccepted. [Boundary comparison](2026-11-24-frontend-diagnosis-boundaries.json).

### D03 / P1 — Production mixes real native pages, exported Next HTML and design examples

Home/login use native Spring chrome; policy pages contain Next assets; shop/status use a different static screen family. Actual renders show Inter versus Pretendard, differing sidebar widths, headers, card density and logo variants.

Production /shop literally displays a design-example disclaimer instead of the product catalogue. The running JAR's static/shop.html contains that disclaimer. Its API literals cover session/logout/reset/stocks/wallet, with no shop catalogue API. It also exposes an administrator navigation item to a fresh guest; this does not establish API authorization bypass.

[Production shop screenshot](2026-11-24-frontend-diagnosis-screenshots/prod-shop-1440.png) · [Titles and styles by route](2026-11-24-frontend-diagnosis-routes-147-two-origins.json).

### D04 / P1 — Production asset ingress breaks otherwise available resources

External HTTPS browser and origin-boundary checks agree:

- Policy CSS /_next/static/css/828951deb2af2cbe.css returns502HTML. The expected file is absent in all three static release roots; the Spring fallback returns404, followed by retired proxy fallback. Sanitized Nginx errors show25 matching connection-refused errors. The actual final legacy fallback listeners refused connections.
- /assets/mv43/public.js returns403 at Production edge but200 JavaScript directly from its backend. The Nginx asset-file map guard refuses an empty mapped path. Tools HTML200 therefore does not prove its script-driven search works.

[External browser asset results](2026-11-24-frontend-diagnosis-browser-asset-integrity.json) · [Edge/backend results](2026-11-24-frontend-diagnosis-production-asset-boundaries.json). An HTTP-only crypto.randomUUID error is excluded from HTTPS product findings. Generic Python-client external403s were also not generalized to browsers.

### D05 / P1 — Split HTML artifacts consume one incompatible CSS resource

Test common pages and scoped policy/publication pages originate from different frontend artifacts. Their global CSS route goes to the main modified frontend.

Home expects version queryd852…, policy expects813d…, but both actual browser responses hash to460fe6ee…. The original7b CSS was813d. Resource references and served bytes are inconsistent. Responses measured private/no-store, so cache alone is not asserted as the cause.

Actual HTTPS home/login also emit CSP inline-style violations. Externalize those styles and preserve the policy rather than weakening CSP.

### D06 / P1–P2 — Actual branding/layout regressions

The current Test hero uses a literal W, not the canonical favicon; current consolidated home.html line34 contains it. A correct sidebar icon is insufficient. The v10 game-world backdrop and information structure are also absent from the current home.

At390px the header wraps into multiple rows. The fixed support button overlaps the shop action by56×40.1875px and the support action by56×6.8125px. The earlier reserved-toolbar correction is not preserved in the current runtime. No whole-document horizontal overflow was observed in these sampled screens.

[Desktop](2026-11-24-frontend-diagnosis-screenshots/test-home-1440.png) · [External HTTPS mobile](2026-11-24-frontend-diagnosis-screenshots/https-test-home-390.png) · [Measured overlap](2026-11-24-frontend-diagnosis-external-https-browser.json).

### D07 / P1 — Real-time connection incomplete

The Test external HTTPS home gets404 during the Socket.IO WebSocket handshake. A loaded script or chat button is not real-time acceptance. Validate socket listener, proxy, cookie and Origin contracts on Test.

### D08 / P1 — Test status success now relies on broadened raw-table reads

The previously recorded status503 currently returns200 JSON, with all three states unknown and observation timestamps null. This is not evidence of healthy services.

An app-role READ ONLY transaction now reports SELECT=true on both raw status tables, compared with the prior false measurements. The running class still contains direct table-query SQL. This departs from the required restricted SECURITY DEFINER read-function boundary. This task issued no GRANT/REVOKE, and did not measure Production privileges. [Privilege evidence](2026-11-24-frontend-diagnosis-status-grants.json).

Keep the old503 as history, not a current outage assertion. A boundary-preserving function fix and actual-role tests remain OPEN.

## GitHub and host coordination

- Recent70PRs:16OPEN,36CLOSED,18MERGED. Closure is not integration.
- Main remains9876c09888. Consolidated PR3407 sourcea61f6d8b9d is77commits ahead and unmerged; runtime-check and spring-web-check fail.
- PR3411 fails classification; PR3413 fails Spring checks. Locale candidate PR3416 is green, but is not the current consolidated live frontend.
- The single-design authority proposal PR3417 is unmerged and fails classification. Existing authority combines Nov18 originals, v10 concepts and historical status.180 generated PNGs are not180 implemented functions.
- Four of28worktrees have tracked modifications. The36related running services use about3209MiB. Their existence does not prove resource pressure causes the visual defects; route-specific bytes and failures do. Cleanup requires the active upstream/PID ownership map.

[PR inventory](2026-11-24-frontend-diagnosis-github-pr-inventory.json) · [Major checks](2026-11-24-frontend-diagnosis-pr-checks.json) · [Worktrees](2026-11-24-frontend-diagnosis-worktree-inventory.json).

## Anonymous147-route result per origin

| Status | Production | Test |
| --- | ---: | ---: |
|200|100|19|
|302|43|16|
|401|2|0|
|403|0|112|
|405|1|0|
|503|1|0|

These are HTTP inventory outcomes, not functional passes. Some unsupported Production URLs return a home fallback. The33dynamic routes remain fixture-required. [Raw inventory](2026-11-24-frontend-diagnosis-routes-147-two-origins.json).

## Repair order and acceptance

1. Restore source/JAR/resource identity on Test using immutable CI artifacts; do not apply old acceptance to replaced bytes.
2. Connect each exposed navigation route to its actual handler/API/role/error contract. Reproduce and fix Production asset failures in the matching Test configuration first.
3. Implement the approved common shell and actual favicon consistently, then replace design-example screens with real catalogue/ledger views.
4. Restore the DB read-function boundary and real socket/session/Origin connection.
5. Run route×role×five-language×viewport checks on one exact artifact. Current owner scope remains Test only.

Diagnosis and evidence recording are complete. These defects are not reported fixed, and whole-site acceptance remains OPEN.
