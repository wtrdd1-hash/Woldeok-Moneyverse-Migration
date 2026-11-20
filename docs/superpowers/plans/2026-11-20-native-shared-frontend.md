# Native shared frontend implementation plan

> **For agentic workers:** Use superpowers:executing-plans. Existing owner approval selects November18 design and implementation through gated release; execute without another discovery loop.

**Goal:** Replace the homepage static renderer with native Spring MVC/Thymeleaf, establish reusable five-language chrome and safe global support access, then extend the verified shared foundation across route families.
**Architecture:** Explicit MVC routes render classpath templates with shared Thymeleaf fragments. Session-owned data remains client/server API verified; no synthetic financial state. Separate stacked branch preserves the prior integration candidate's final CI identity while both workstreams remain on MiniPC.
**Tech Stack:** Java17, SpringBoot3.3.5, Thymeleaf, browser JavaScript/CSS, Gradle/JUnit and Node tests.
**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md.

## Global Constraints
- Fixed palette #0C1020/#151D32/#9C83FF/#64B7FF/#E9F1FF/#A8BCD8, 56px single support target, 44px controls, safe-area navigation.
- EN/KO/JA/ZH/VI; saved manual selection before Accept-Language then EN. No IP detection or raw translation keys.
- Money remains canonical strings and exact integer arithmetic.
- No sender identity headers/fixed UUID, false message receipts or storage of private drafts; messaging remains visibly unavailable until its P0 contract passes.
- Preserve uncommitted original checkout and old source history; do not claim 180 concept routes are working implementations.
- Exact-source isolated Test/auth/session/rollback gates remain binding for production.

## Review Focus
1. Unsupported/malformed Accept-Language must fall back safely, and q=0 cannot select a language.
2. A saved manual cookie must beat automatic/browser choices without persisting sensitive state.
3. Real HTTP must render Thymeleaf rather than returning a static/captured Next page.
4. Locale changes must preserve page forms and panel state; button must work with Escape/focus/mobile safe area.
5. Missing API evidence must stay unavailable; no sample financial metrics or fabricated support success.

### Task 1: Native homepage and reusable chrome
**Files:** create domain/web/NativeHomeController.java and UiLocale.java under spring-backend/src/main/java/com/moneyverse/api; templates/mv43/home.html and shared/chrome.html; static/assets/mv43/chrome.js and chrome.css; matching NativeHomeWebTest.java; update homepage source contract scripts.
**Interfaces:** UiLocale.resolve(HttpServletRequest) returns a supported language; model `uiLanguage` controls html lang and server chrome; `MV39Locale` remains client content translation authority. Shared fragments own one language control and one support launcher.
- [ ] Add real Spring HTTP tests for all five locales, cookie precedence, malformed/q0 headers, native template identity and escaped metadata.
- [ ] Observe RED on static locale response.
- [ ] Implement explicit / and /index.html MVC routes, SSR navigation/hero and shared head/navigation/support fragments; preserve existing real-data app.js behavior and IDs.
- [ ] Add panel behavior tests; observe RED, then implement native dialog open/close/focus/locale updates without writes or sensitive persistence.
- [ ] Run entire Spring test+bootJar and Node/home contracts; inspect failures, then commit/push checkpoint.

### Task 2: Extend native shared surface
**Files:** Existing native admin/tools/status controllers/templates and supported member page route inventory, matching HTTP tests.
**Interfaces:** Reuse Task1 fragments; preserve each route's real auth/data/HTTP status and existing functionality.
- [ ] Record exact source owners and per-route native/static/error status before converting.
- [ ] Refine exact files and failing tests per route family before behavior changes.
- [ ] Replace hand-built HTML/static shells with shared native views, keeping source ownership, CSRF, role checks and no-store headers.
- [ ] Verify real HTTP five locales and all route-family states, no lost controls or source-backed fields.

### Task 3: Authenticated support and browser/release acceptance
**Files:** Existing support/chat controllers/services, shared panel scripts/templates, related auth/idempotency/source-truth tests and worklog.
**Interfaces:** Existing verified session services, existing owner-scoped PostgreSQL functions and actual receipts; never introduce a second message store.
- [ ] Refine request/receipt contracts and add failing negative/duplicate/ownership tests before enabling sending.
- [ ] Remove fixed actors/random retry keys/false histories; enforce CSRF, max1000, ownership and canonical receipts.
- [ ] Implement authorized panel states only once API gate passes; drafts memory only, clear on logout/account switch.
- [ ] Fresh whole-branch review, exact-source tests, real responsive browser acceptance, main integration and gated Test/production release.

## Plan self-review
Task1's supported locale contract is consumed by Task2 and panel localization. Task2/3 require exact route/API inventories before implementation; no unfinished route may be claimed complete. Public Test403 and CUA attach timeouts currently block release/browser acceptance, not isolated implementation.
