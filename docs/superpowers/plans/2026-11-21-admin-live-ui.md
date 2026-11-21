# Admin Live UI Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline; one independent whole-branch review before integration.

**Goal:** Restore the actual admin dashboard/system-log screen using the Nov18 desktop baseline and responsive layout.
**Architecture:** Explicitly imported read-only admin renderer; fixed loopback HTTP source verifies existing administrator cookies and returns canonical data. No database or session mutation components.
**Tech Stack:** Spring MVC, Thymeleaf, Java HttpClient, JUnit/MockMvc, native browser QA.
**Spec:** docs/superpowers/specs/2026-11-21-admin-live-ui-design.md

## Global Constraints
- Existing favicon and Nov18 #0C1020/#151D32/#9C83FF/#64B7FF design; preserve five languages and integer money strings.
- No new dependencies/credentials/grants/SQL/financial mutations; only fixed GET upstream paths; no redirects or forwarded identity/internal credentials.
- No-store/noindex and escaped private content; authenticated backend evidence, not sample counts.

## Review Focus
- Forged actor/internal headers cannot replace a real administrator cookie; test guest/forged/role denial.
- Upstream outage/HTML/redirect/invalid role/oversized payload must not become healthy metrics; test each source shape/error.
- Raw log HTML/scripts/secrets cannot execute or be persisted; test escaped rendering and absence of cache/cookie/session storage.
- Desktop admin shell must survive longest locale and320px/zoom; actual browser matrix and keyboard/menu test.
- Routing/assets must preserve prior public source, private APIs, signup holds and Test privacy; scoped proposal regression before reload.

## Task 1: Isolated authenticated renderer and live admin home
Files: new spring-backend/src/main/java/com/moneyverse/adminpresentation/{NativeAdminApplication,AdminSourceClient,AdminUiController}.java; MoneyverseSpringApplication.java; new corresponding src/test/java classes; reuse mv43/admin.html/UiPageRenderer/UiLocale/AdminNavigation.
- [x] Add failing integration tests using real loopback HttpServer responses: fixed upstream/cookie forwarding only, roles/guest/403/503/redirect/invalid JSON, component isolation and denied mutations.
- [x] Run focused tests; expected logical absence RED.
- [x] Implement strict bounded GET HTTP client and explicit admin-only MVC/security configuration; dashboard uses actual AdminGovernanceDtos.
- [x] Run focused and full Spring tests; expected zero failures/errors/skips.
- [x] Commit inspected source/test checkpoint and update worklog.

## Task 2: Source-backed system logs and responsive common shell
Files: templates/mv43/admin.html fragments/new admin-system-logs.html; static/assets/mv43/admin-live.css/js; ui/mv43-copy.json and matching i18n.js; corresponding rendered/browser tests.
- [x] Add rendered-page assertions for actual filter/line/source reads, escaped logs, unavailable/empty states, no fake success. Observe RED.
- [x] Extract common admin layout fragments, reuse favicon/nav/support, add bounded GET controls and properly localized data/error status.
- [x] Verify source response values and shapes against rendered output and language switches; keep language changes from erasing current filter.
- [x] PC-first browser matrix1440/1920→1024/768/430/390/360/320 plus200%/keyboard; fix observed regressions through RED→GREEN.
- [x] Full Spring/native Node/security/asset checks, independent review, final source freeze.

## Task 3: Source-bound Test and scoped Production
- [x] Fetch current main; integrate only reviewed source after required CI. Download exact-main native artifact and verify manifest/JAR.
- [x] Stage isolated stateless loopback Test and standby Production services; verify no DB/session/scheduler beans, process/open JAR and protected authenticated preview.
- [x] Compare-and-swap reviewed Nginx route/asset changes; preserve legacy APIs, financial/signup/actuator holds and Test privacy, rollback and old assets.
- [x] Actual authenticated PC/mobile/dashboard/log queries and anonymous denial after cutover; record limits and remaining35-route action matrix.
- [x] Record and integrate scoped release evidence through a documentation follow-up PR; retain the final ancestry/owned-branch cleanup receipt on the host.

## Scoped acceptance limits
The two read-only screens were promoted at main98b5dec0283f after exact-main CI and authenticated Test/Production checks. CSS/deviceScaleFactor reflow is not physical browser zoom. Five log sources were available; FRONTEND remains unavailable because the legacy backend references a removed unit. Backend defense fixes are source-only until an independently gated full-backend release. Other admin actions, financial/provenance blockers, and the prior separate Next QA failures remain OPEN. See docs/releases/2026-11-21-admin-read-ui-production.ko.md. Final documentation integration/owned branch cleanup is recorded separately.
