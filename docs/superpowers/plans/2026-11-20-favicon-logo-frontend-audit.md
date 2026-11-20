# Favicon logo and frontend audit implementation plan

> Execute inline using Superpowers executing-plans; retain an independent final code review.

**Goal:** Use the actual Production favicon as the native shell logo and inspect the real frontend.
**Spec:** Owner instruction to use the existing favicon; docs/design/OFFICIAL_ICON_AND_BRAND_ASSETS.md.
**Architecture:** Reuse the existing byte-identical /assets/mv39/favicon.ico. Change only shared presentation markup, preserving API, sessions, money and routing contracts.
**Tech stack:** Spring MVC, Thymeleaf, JUnit/MockMvc and browser QA.

## Constraints and review focus
- Keep exact integer money and existing Korean product copy.
- Reuse the favicon; do not generate or redraw an icon.
- Decorative logo alt must be empty beside the existing brand name; fixed dimensions prevent layout shift.
- Sidebar and mobile drawer must share the same image and keyboard-accessible home link.
- Existing asset URLs, unknown-version routing and backend/member access controls remain compatible.
- The owner clarified Nov18 as the design authority; use the NOV18 authority and approved references. Favicon acceptance is not whole-design acceptance.

## Task 1: Render the favicon in the shared native chrome
- [ ] Add rendered-page assertions to NativePresentationIsolationTest: two brand IMG elements using /assets/mv39/favicon.ico with empty alt and fixed32px dimensions, plus an explicit shortcut icon link; GET icon must match packaged bytes without cookies.
- [ ] Run focused Gradle test; expect logical missing-logo assertions to fail before production edits.
- [ ] In templates/shared/chrome.html replace both brand SPANs with the specified IMG and add icon link in commonHead. Existing CSS fixes the brand mark box; no shared CSS/JS edits or new asset paths.
- [ ] Run focused tests, full Spring tests and bootJar, applicable Node tests/security/whitespace checks.
- [ ] Record RED/GREEN and review the complete source delta independently before integration.

## Task 2: Verify the actual frontend and release state
- [ ] Inspect home, hubs and calculators at320/390/1440, five locales, menu/dialog/keyboard, search and inputs; follow member links as guest without claiming authenticated QA.
- [ ] Record observed errors, mixed renderer/sample destinations and the unresolved original-design reference separately from passes.
- [ ] Re-fetch main, integrate reviewed source, require exact-main CI and protected Test artifact/browser verification before any authorized public-presentation-only release. Preserve active legacy routes and rollback.

## Task 3: Replace reachable public sample pages with source-backed native screens
Owner explicitly requests Nov18 design, real backend data and backend defect fixes. Existing app.js already consumes canonical same-origin stocks/catalog/board APIs. Reuse that reviewed renderer rather than fabricate market/shop/community figures.
- [ ] Extend NativePresentationIsolationTest with /stocks, /shop, /board: assert page key, actual favicon and no 12,580/+2.41% sample markup. Observe403 RED before implementation.
- [ ] Add com.moneyverse.presentation.NativePublicFeaturePageController (presentation-only package outside full backend component scan), explicit import and GET/HEAD allowlist for those3 public HTML routes only. Keep all APIs/member/admin paths denied in this process.
- [ ] Reuse mv43/home with negotiated page keys and SSR hero labels. app.js retains exact existing hash and same-origin API requests. Do not add fake trade/purchase/submit success controls.
- [ ] Verify exact public API rows against visible rows, empty/error behavior and locale/mobile accessibility; authenticated trade/purchase/admin acceptance remains separate.
- [ ] Add admin favicon rendered-markup regression to AdminDashboardPageTest, observeRED and replace the2 admin logo marks. Do not redirect private admin traffic to the stateless public process.
