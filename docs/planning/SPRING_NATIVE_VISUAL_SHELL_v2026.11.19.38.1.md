# Approved UI → Actual Spring-Native Shared Shell — v2026.11.19.38.1

**State: VERIFIED SOURCE CANDIDATE / NOT MERGED OR RELEASED.** Latest owner direction: all Moneyverse web frontend/API must run under Java Spring Boot MVC + Thymeleaf without Next/Node production runtime; migrate all approved 180 screen concepts and 2 administrator mockups, preserve actual data and permissions, do not equate source build with live promotion.

[한국어 명세](SPRING_NATIVE_VISUAL_SHELL_v2026.11.19.38.1.ko.md) · [Route/image verification matrix](../qa/SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md) · [Read-only QA](../qa/2026-11-19-spring-violet-ui-v38.md).

## Visual source of truth (references, not deployed screen captures)

![Admin desktop concept 1660×980](../design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png)

![Admin mobile concept 470×1000](../design/admin-chat-v2026.11.18.13/references/admin-console-mobile.png)

![Home desktop/mobile combined visual concept](../design/all-pages-v2026.11.18.12/previews/home.png)

[All 180 route visual references](../design/all-pages-v2026.11.18.12/README.md) are conceptual images. They are not original-pixel-parity-approved screenshots and are not Java source or functional QA. Every remaining route must retain its original reference/version.

## Implemented in isolated branch

| Actual Spring-rendered route family | Real implementation | Security/function requirements retained |
| --- | --- | --- |
| /admin/users, /admin/market, /admin/economy, /admin/economy/scenario-lab, /admin/controls, /admin/enterprises | Java `LiveAdminUsersPage.renderPage` now emits an external versioned CSS-linked admin layout with 240px desktop sidebar, mobile horizontal scroll nav, authoritative status hints and an accessible no-JS help dock | `AdminAuthService.resolveVerifiedAdminActor`, approver finance checks, escaped names, canonical read sources, explicit 503 and no fake empty/green status remain unchanged |
| /calculators, /tools candidate | Thymeleaf `mv30/hub.html` shares a 56px support `details` launcher and CSS; 17 tool links preserved with actual Spring-verified vs legacy classification | No new stock execution, ledger writes or fabricated tool results |
| /tools/stock-calculator, /tools/compound-calculator | Thymeleaf `mv28/layout :: footer` now renders the same no-JavaScript accessible support dock; head imports v38 CSS | Existing Spring calculator math/GET forms untouched |
| /status | Thymeleaf status page explicitly loads the shared dock CSS via mv28 footer | Verified stale/unknown truth semantics and source-backed service health unchanged |

**Important deployment nuance:** This branch does not replace `/admin` root's existing static HTML or `/` homepage, which the concurrent v37 Gemini owner is editing. Authentication positive flows and other admin pages outside the shared Java render wrapper have not been visually migrated. This is **a reusable foundation for the remaining screens, not 180-page completion.**

## Exact UI and behavior contract

- CSS: `spring-backend/src/main/resources/static/mv-spring/v38/shared-ui.css` (round violet/blue 56px control, bottom desktop 24px and mobile 96px + safe-area, bounded panel, keyboard focus, reduced-motion, 320px); `admin-ui.css` (240px left rail at desktop above 980px, fluid mobile 320px/390px, visual card contrast).
- All native Spring footer pages use one `<details class="mv-support-dock"><summary>...</summary>...</details>` without JavaScript. A status warning says **message sending remains unavailable pending security verification**. Navigational anchors point to existing support/help pages; there is no actor header, chat transport or message receipt fabricated.
- Administrator output includes EN default and KO option, escaping for titles and names, noindex and cache-control no-store. New self-hosted stylesheet required CSP change from `style-src 'unsafe-inline'` to `style-src 'self' 'unsafe-inline'` **only** on admin Java controllers; default-src none and no new script exceptions.
- Does not import React, Next.js RSC, client-side member data, demo balances, hardcoded "connected" status, external CSS/CDN fonts or third-party tracking.
- Server auth/OTP/finance remains authoritative. Login/role errors must block before DB queries and no UI shell may accidentally show personal records.

## Verification and release gates

- RED→GREEN observed: 6 initial admin/Thymeleaf tests; a status CSS omission and two admin CSP regressions were also detected as RED and fixed as GREEN. Final full Java clean `test bootJar` **251/251 tests PASS, 0 fail, 0 skipped**, JAR output SHA256 `ba94b7b999be97f59b2c13e40fd4618fb3859885aeb7d202bb54d616dafd09ef` from local isolated branch snapshot. This identifies a test JAR but does not identify any public deployed instance.
- Embedded Spring random-port/H2 actual HTTP tested: English and Korean `/calculators`, self-hosted CSS 200, unauthenticated `/admin/users` 302 to login. Actual authenticated admin rendering/visual/financial endpoints were not exercised on Production.
- Missing official release gates: real Chrome screenshot reference comparison at 320/360/390/768/1440 and 200% zoom, positive admin/owner/MFA/cross-account/CSRF E2E, finance/ledger and support receipts, exact SHA Test Nginx, immutable rollback and healthy service proof. Production change is **HOLD** until all relevant gates pass.
- GitHub public main (c131ef1 at work start) is not the same as the more advanced local mini-PC integration main (ec22442). A clean isolated PR must target a published integration base containing the verified Java MVC classes, or the source work must be rebased without accidentally including older unrelated unmerged commits. No force push to main.

## Remaining 180-screen execution plan

Every route in the [180-row image matrix](../qa/SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md) is **not certified** until implemented and verified. Prioritize: real user homepage already being repaired by v37, shared design & support shell (v38), admin full route group, login/member wallet/stock/jobs/quests, public content/legal/tools/social, and all Android/API/finance compatibility. Use actual Spring controllers, real database sources and separately signed visual parity for each page. Never hide incomplete routes behind generic design showcase HTML.

**No production promotion, DB/ledger mutation, Nginx restart or other workers' files changed in this branch.**
