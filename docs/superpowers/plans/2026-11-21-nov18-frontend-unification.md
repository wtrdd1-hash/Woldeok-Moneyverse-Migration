# Nov18 Frontend Unification Implementation Plan

> For agentic workers: use superpowers:executing-plans inline, with one independent whole-branch review before integration.

**Goal:** Migrate the six remaining source-backed admin read pages into the existing Nov18 shell while keeping the full-site route ledger accurate.
**Architecture:** Explicit read-only admin-presentation controller plus fixed GET-only upstream; no database or mutation imports. Reuse shared/admin-shell and the actual favicon.
**Tech Stack:** Spring MVC, Thymeleaf, HttpClient, JUnit real HTTP, native browser QA.
**Spec:** docs/superpowers/specs/2026-11-21-nov18-frontend-unification-design.md

## Global Constraints
- Palette #0C1020/#151D32/#9C83FF/#64B7FF, text #E9F1FF/#A8BCD8; PC baseline then320px responsive.
- Five locales en/ko/ja/zh/vi; reuse existing approved product labels.
- No SQL, grants, financial mutations, credential forwarding, dependencies or full backend release.
- Exact routes only, private no-store/noindex, escaped output and bounded fixed-source JSON.
- Full-site/all-admin-action completion is not implied by this read-screen stage.

## Review Focus
- Economy requires exact approver role even when upstream reconciliation accepts ordinary admin.
- Host/legacy cookie ambiguity, forged headers and source redirects cannot change identity.
- Missing fields, numeric JSON money, alias conflicts or unavailable snapshots must never become healthy rows/zeros.
- Search is within fetched rows, handles malicious strings/empty results and preserves unsent inputs on language change.
- Language changes,320px/low-height desktop and old/new asset generations preserve navigation and source identity.

## Task1: Live validated read-screen contracts
Files: adminpresentation/AdminSourceClient.java, new AdminReadPageController.java, shared AdminUiResponses.java, existing AdminUiController.java; NativeAdminApplication.java; NativeAdminIsolationTest.java.
- [x] Verify unchanged baseline Spring/native Node.
- [x] Add real-HTTP RED tests for all six page routes, no-cookie/forged/role/source failures, exact approver deny before data request, canonical DTO and integer precision, bounded member query/limit, escaped results and unavailable reconciliation.
- [x] Add only two fixed source paths for business/catalog and admin/economy/reconciliations/latest. Role proof must support an additional exact-role assertion. Share response headers/failure rendering without importing backend services.
- [x] Implement dedicated validated table models and members GET form; preserve source counts, status and existing read-only scope. Money grouping must be string-based; test 38digits and negative delta.
- [x] Focused tests GREEN then full Spring/native suite; record checkpoint.

## Task2: Common shell, copy and responsive UI
Files: templates/shared/admin-shell.html, new templates/mv43/admin-read.html, static/assets/mv43/admin-read.css, static/assets/mv40/admin.js, ui/mv43-copy.json, static/assets/mv39/i18n.js, scripts/native-admin-live.test.mjs.
- [ ] Add rendered and actual JS RED tests for five-language headings/columns/labels, route-active menus, shared single support launcher, localized form hiddenlang without erasing draft, known current template shape.
- [ ] Build all six pages from the shared shell; server-driven columns/rows are escaped text. Status is explicit and refresh is a normal GET.
- [ ] PC tables scroll internally, sidebar remains reachable at600px height, mobile form becomes one column, focus targets44px; no fake empty overlay or hidden controls.
- [ ] Sync exact asset digests across native templates and run asset/copy checks.
- [ ] Actual browser layout/locale/input/keyboard/source-error matrix, full suite and one independent whole-branch review; RED/GREEN any important findings.

## Task3: Exact-source Test and scoped promotion
Files: docs/worklog/2026-11-21-nov18-frontend-unification.ko.md, docs/qa/2026-11-21-nov18-frontend-route-ledger.ko.md, release receipt and current baseline.
- [ ] Fetch main again; normal reviewed PR and required CI. Download exact-main artifact and verify manifest/open-JAR identity in immutable new Test/Production units.
- [ ] Extend only fixed gateway routes (GET/HEAD; preserve existing actual authority), exact private HTML/assets preview, all unchanged boundary/hash baselines and protected Test.
- [ ] Actual signed-in Test8routes PC/mobile/five-language/search/filtered-empty/source-failure/financial-role checks; preview cookie must not leak into Production routing.
- [ ] After acceptance, coordinated CAS/reload/owned rollback of exact reviewed routes/assets; existing session preserved; actual Production checks and screenshots.
- [ ] Documentation checkpoints on task branch/GitHub, final route statuses (other families OPEN), integration and owned-only cleanup after ancestry proof.
