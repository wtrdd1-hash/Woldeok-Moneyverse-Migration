# Frontend Feature Coverage and Runtime Consolidation Plan

> For agentic workers: use superpowers:executing-plans inline, with independent whole-branch source and operational review.

**Goal:** Connect and verify the actual Nov18 frontend while consolidating obsolete renderers and reporting true feature coverage.
**Architecture:** Explicit database-free unified presentation; fixed cookie-only source gateway; versioned static-byte archive; existing financial/API authorities retained.
**Tech Stack:** Spring MVC/Thymeleaf/Java17+, Node native tests, real HTTP, Nginx/systemd, actual browser.
**Spec:** docs/superpowers/specs/2026-11-21-frontend-feature-coverage-consolidation-design.md

## Global Constraints
- Nov18 colors #0C1020/#151D32/#9C83FF/#64B7FF, five locales en/ko/ja/zh/vi, actual favicon.
- No DB/session issuance/jobs/financial writes in presentation; no fake success/metrics or removal of working actions.
- Money remains canonical strings; never render auth/me numeric balance.
- Same-origin CSRF/idempotency/owner checks and private no-store/noindex remain.
- Current acceptance is not all-site/admin-action certification.

## Review Focus
- Any unreferenced unit may still own a worker/local consumer: retire only proven presentation-only units.
- Old/unknown asset versions and HTTP error cache headers must retain byte/security compatibility without old JVM dependencies.
- Encoded/alias member routes must resolve an explicit trusted mapping; no unauthenticated/cross-owner private output.
- Tool account header races/errors must not turn a signed-in owner into a false guest or overwrite dedicated page state.
- Probe diagnostics must reflect actual read attempts, not fake global/DB/host/backup health.

## Task1: Coverage baseline and safe early cleanup
Files: docs/worklog/2026-11-21-frontend-feature-coverage-consolidation.ko.md; docs/qa/2026-11-21-frontend-feature-coverage.json and .ko.md; source inventory helper scripts/qa/frontend-feature-coverage.mjs and scripts/native-feature-coverage.test.mjs (included by the existing native CI glob). Operational receipts outside git.
- [x] Capture current main/runtime/unit/route dependency snapshots; preserve credentials/PII.
- [x] Retire five specifically proven unreferenced database-free Test renderers with PID/config/mode/dependent checks, prior-state rollback and before/after HTTP baselines. Record memory and exact retained dependencies.
- [x] RED→inventory helper that distinguishes routes/actions/API expressions without claiming execution; generate actual source coverage and actual browser metadata for administrator/member routes.
- [x] Establish focused native isolation/client baseline; full CI remains authoritative.

## Task2: One database-free frontend runtime
Files: new spring-backend/src/main/java/com/moneyverse/frontendpresentation/UnifiedFrontendApplication.java, existing api/MoneyverseSpringApplication.java; new frontendpresentation/FrontendIdentityController.java and UnifiedFrontendIsolationTest.java.
- [x] RED real HTTP: accepted public5/admin9 share a process; no database/services/jobs/session components; private role/source failures; mutation/unrelated route denial; source identity and assets.
- [x] Explicit imports and exact GET/HEAD security/resource configuration; existing dedicated modes remain compatible but incomplete stocks/shop/board are not newly exposed.
- [x] GREEN focused tests; keep all existing native tests.

## Task3: Owner-bound user pages and honest diagnostics
Files: new frontendpresentation/MemberPresentationPageController.java; adminpresentation/AdminSourceClient.java; new adminpresentation/AdminProbePageController.java/templates/mv43/admin-probes.html; existing Native frontend templates/assets/copy; behavioral HTTP/client tests.
- [x] RED cookie/owner/alias/encoding/upstream failure cases for wallet/support/chat; import existing templates/client logic without backend auth service or private SSR data.
- [x] Add only inspected fixed GET auth/me proof; canonical signed-in UUID and alias consistency; same-origin client APIs remain authoritative.
- [x] RED tool-account header success/error/race/locale behavior; implement only on tool views using established session contract.
- [x] RED actual bounded admin read-probe outcomes/timings/malformed-source behavior; show real source measurements only, with no host/DB/SLA/backup claim.
- [x] Full native Node + Spring suite/build/security guards; independent whole-source review and RED→GREEN important fixes. Real messaging/financial production mutations are not implied acceptance.

## Task4: Static compatibility and exact-main Test/Production
Files: release/QA/current authority docs and operational scripts/receipts outside git.
- [x] Reviewed normal PR/main required CI; exact-main artifact/packaged identity on one immutable Test/Production pair.
- [x] Verify/export known old/current asset bytes from trusted JARs to root-owned archive; test unknown/private/error-cache behavior and unchanged API holds in real isolated Nginx.
- [x] Fixed read gateway, protected Test preview, stable process and full config inventory/CAS/rollback gates; actual owner routes/form states and five locales/responsive/keyboard.
- [x] Promote only accepted routes, preserve unsupported legacy functions and financial gates; verify Production with Test stopped and session retained.
- [x] Stop/disable superseded presentation units after dependency removal and observations; preserve artifacts. Classify remaining backend/jobs separately.
- [x] Update function ledger, runtime/deployment/cleanup proof, planning/worklog; normal docs integration and owned branch cleanup. Whole-site unsupported functions remain explicit.

Completion is the scoped UI/runtime/coverage audit above, not certification of blocked actions or the whole180-page site. Current defect and fixture acceptance remains OPEN in docs/qa/2026-11-21-live-frontend-after.ko.md. Source PR3334 merged; evidence integration is recorded by its final PR metadata.
