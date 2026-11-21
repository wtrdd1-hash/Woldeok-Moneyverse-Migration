# Existing native public pages: November18 shared chrome

> For agentic workers: use Superpowers subagent-driven-development. Owner already approved the November18 authority and frontend implementation. Do not ask another design approval. Parent runs one implementer at a time.

**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md
**Goal:** Bring existing genuine Spring tools/calculators/status pages into the shared design without losing their source-backed functionality. Captured static tools without real native logic are outside this task and must not be represented as converted.
**Architecture:** Reuse shared/chrome fragments, UiLocale and existing services/controllers/models/calculation functions. Add family-scoped presentation assets only where necessary. Do not rebuild computations, rates, status sources or routes from screenshots.

## Constraints
- Work in an isolated MiniPC worktree from bad193193eab5dfd2a5d37ee95314ec03e4579fe. Original checkout has foreign dirty files: never modify/reset/stash it.
- Fixed navy/violet/blue palette, one56px global support launcher,44px interactive controls, five languages with saved manual preference, EN fallback, responsive narrow screens and reduced-motion.
- Retain existing exact paths/aliases, form fields/values, server validation, model outputs, source status and failures. Do not claim link targets that are still captures as native or operational.
- No API/auth/session/SQL/schema/grant/production workflow changes; no hardcoded source metrics or new financial rates. Preserve original Korean product copy.
- Every language change preserves current calculation inputs/results. Reuse one locale engine; no competing stored language. No private input/draft persistence.
- Do not edit shared/chrome.html or chrome.js, auth/wallet/admin/home templates; parent repairs shared bindings. You may extend UiLocale route scope and both UI catalogs for your distinct family keys. Avoid changing existing unrelated keys.
- Add any new native asset references to existing content-digest generator coverage, or use assets under mv43. Generator and test remain authoritative after parent integration.
- Current CUA approval timed out and public Test403 blocks browser/release acceptance. Do not use other browser automation as a workaround or claim visual QA. This task is isolated source implementation.

## Task 1: Preserve native tools/calculator/status behavior with shared presentation
Files: spring-backend/src/main/java/com/moneyverse/api/domain/tools/SpringNativeCalculatorsController.java, SpringNativeToolHubController.java; existing status page controller discovered by its mv29/status view; spring-backend/src/main/resources/templates/mv28/compound.html, mv28/stock.html, mv28/layout.html, mv29/status.html, mv30/hub.html; family-scoped assets under static/assets/mv43; domain/web/UiLocale.java and ui/mv43-copy.json plus static/assets/mv39/i18n.js; corresponding existing domain/tools tests and a focused native status/shared-page regression test; scripts/native-public.test.mjs if client behavior needs testing.
Interfaces: keep controller request/response/calculation/service contracts unchanged; existing templates receive shared uiLanguage/uiCopy/uiPageKey model. Shared chrome source is parent-owned.
1. Before implementation, fully read actual controllers/services/templates/related tests and authority. Record exact routes, controls, models and current original Korean copy in the task report and append before-work checklist to docs/worklog/2026-11-20-nov18-design-integrate.md.
2. Write real HTTP regressions for every currently native route/alias, all five locales, saved-cookie precedence, one global launcher, no captured Next content, existing calculation inputs/results/invalid states and real status unavailable behavior. Observe logical RED for missing design/locale contracts before code changes.
3. Replace only presentation with shared native shell. Keep native calculation requests/results and truthful live status; preserve support/chat feature gate. Keep all hub destinations/controls.
4. Verify locale changes preserve editable fields through browser-binding contract tests if adding JS. Ensure authored CSS safe-area/44px/overflow rules; do not call this rendered geometry proof.
5. Run focused tests then full isolated Spring test bootJar, Node native/UI/security/release suites, git diff --check; inspect exact counts including skips. Use task-owned temporary media override and test profile. Self-review diff, commit/push only scoped task files under explicit owner checkpoint authorization, return report for independent review. Do not merge main or deploy.
Expected: actual existing native forms/status remain source-backed; tests GREEN with documented RED, source mapping and limitations.

## Review Focus
- No computation/rate/model/validation/control lost while replacing layout.
- Shared UI locale resolves five languages without blank dynamic map lookups or reset fields.
- Singular support/FAB/mobile navigation and correct active page, source failures stay unavailable.
- No captured HTML or fake data introduced; no release certification inferred from authored CSS/tests.
