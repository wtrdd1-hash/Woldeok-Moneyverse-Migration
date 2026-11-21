# Nov18 Visual Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make existing public/member/admin frontend views share the approved Nov18 design while preserving their actual controls, handlers and backend boundaries.

**Architecture:** Reuse existing Spring/Thymeleaf navigation and native tokens. Add a fail-safe, scoped compatibility skin/navigation portal to retained HTML without replacing business DOM; style unavailable document responses without changing status or API behavior.

**Tech Stack:** Java17, Spring Boot MVC/Thymeleaf, existing browser JavaScript/CSS, Node tests, JUnit real HTTP, Nginx, CUA browser QA.

**Spec:** docs/superpowers/specs/2026-11-21-nov18-visual-unification-design.md

## Global Constraints
- Palette #0C1020, #151D32, #9C83FF, #64B7FF, #E9F1FF, #A8BCD8; semantic green/red remain meaningful.
- Existing current favicon artwork, PC-first320/360/390/430/768/1024/1440/1920; touch targets44px; support56px and bottom gap>=16px; reduced motion.
- EN/KO/JA/ZH/VI shell labels; preserve existing account and locale controls, drafts, forms, IDs, handlers and real API URLs.
- MiniPC isolated branch; no DB/ledger/security hold changes; exact-source Test before authorized UI Production release.
- Maintain docs/worklog/2026-11-21-nov18-visual-unification.ko.md and per-plan ignored progress ledger; commit/push checkpoints.

## Review Focus
- Fragment/asset load failure leaves existing navigation and controls usable, never a blank page.
- Hydration/page load/language changes never replace business nodes or lose input drafts.
- Private/admin/financial/API routes retain original authorization, status and mutation handling.
- Long5-language headers at320px keep current favicon and actionable account controls visible.
- Existing support/account controls remain single, focusable and functional; financial/status text is never rewritten.

### Task 1: Shared native presentation regressions
**Files:** Modify templates/shared/admin-shell.html; static/assets/mv43/chrome.css; affected digest references. Test spring-backend/src/test/java/com/moneyverse/frontendpresentation/Nov18VisualChromeTest.java and actual browser layout.
**Interfaces:** Existing sidebar/header fragments and support-fab remain compatible.
- [ ] Add real-render assertions for an explicit visible mobile admin logo and shared responsive support gap contract; record current browser failures.
- [ ] Run focused test and verify RED for missing logo/gap.
- [ ] Add actual favicon header image, minimum16px spacing derived from navigation heights; update affected immutable asset digests.
- [ ] Run focused tests, existing native tests, inspect real320/390/1440 layouts; commit checkpoint.

### Task 2: DB-free shared legacy navigation and skin
**Files:** Create frontendpresentation/Nov18ChromeController.java; templates/mv46/navigation.html; static/assets/mv46/unified.css; static/assets/mv46/unified.js. Modify UnifiedFrontendApplication.java, shared/chrome.html and shared/admin-shell.html fragment declarations only as needed. Create scripts/native-visual-unification.test.mjs and frontendpresentation/Nov18VisualIsolationTest.java.
**Interfaces:** GET /frontend-visual-chrome?section=member|admin&lang=<supported> returns navigation-only fragment, no identity/data requests, private/no-store. /assets/mv46/** serves packaged static presentation assets. Adapter exports window.MVNov18Visual.mount(document) for idempotent real-DOM behavior; uses owned data attributes and never moves/replaces existing main/forms/account/support nodes.
- [ ] Tests: same original form node/value/listener/action after mount; no duplicate portal on repeat; fragment failure leaves old nav; language changes only relabel owned links; no fetch other than fixed same-origin fragment; no private storage or financial number mutation. Real HTTP proves fragment has no private source calls and unknown sections/methods fail closed.
- [ ] Run tests RED before implementation.
- [ ] Implement shared fragment + scoped CSS (palette,242px desktop rail, original header/content offset,44px controls, responsive cards/tables and original header/support retained). Apply known legacy selectors only after portal succeeds.
- [ ] Implement adapter with document-load mount, fixed same-origin URL, safe text labels and idempotence. Preserve original React/business DOM ownership. Unknown layouts remain unchanged and are reported.
- [ ] Run focused/whole native and Spring suites; inspect representative legacy member/admin/calculator/prototype pages with real clients; commit checkpoint.

### Task 3: Inventoried HTML/error wiring and immutable ops proposal
**Files:** Create templates/mv46/error.html; extend Nov18ChromeController for fixed status document views; create ops/nov18-visual-unification/ renderer/plan/check/apply tests and manifest schema. Use existing retained source/artifact/archive patterns; read docs/RELEASING.md before operational edits.
**Interfaces:** Versioned immutable asset bundle/source SHA/digests, exact route allowlist, before config hashes, changed-file allowlist, reversible proposal. Error styling preserves original non-200 status; JSON/API/mutations never rewritten.
- [ ] Tests RED: exact HTML-only injection, no duplicated tags, query/headers/method/body preserved, missing assets/current-main/config drift abort before writes, protected Test/admin auth retained, bounded inverse rollback, API403 remains JSON/not HTML200.
- [ ] Implement proposal generation and read-only check from current Nginx inventory, then apply only to isolated Test after source review/CI.
- [ ] Compare original business controls and sources on68 rendered pages and actual failures; run8 widths/5 shell locales/menus/search/filter/calculators/support tabs. Preserve private captures outside Git; sanitize metadata.
- [ ] Fix regressions with RED→GREEN; commit/push exact-source checkpoint.

### Task 4: Review, integrate, Test and Production visual acceptance
**Files:** Worklog, docs/qa UI evidence and docs/releases acceptance report; only approved immutable deployment artifacts/configs on host.
- [ ] Fresh reviewer checks specification compliance then code quality; separate operational review of exact apply/rollback proposal. Fix Important/Critical findings with tests.
- [ ] Fetch/reconcile current main, required CI, normal PR merge. Re-run exact-main source/artifact/Test identity gates.
- [ ] Preserve a pre-existing signed-in session and actual backend results; Test independence, rollback target availability and service/cache baseline. Authorized visual cutover only after all relevant gates pass.
- [ ] Re-test actual public/member/admin URLs, all route families and mobile/PC consistency; if any remains legacy, document and continue rather than claim whole-site completion.
- [ ] Finish worklog with exact validation/deployment state; remove only owned fully merged branch/worktree after ancestry/no-only-addition checks.
