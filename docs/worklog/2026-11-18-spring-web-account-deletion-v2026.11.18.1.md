# v2026.11.18.1 — Spring web account-deletion public page migration

**Status:** SOURCE IMPLEMENTED / TEST BLOCKED / RELEASE HOLD (no actual runtime deployment)  
**Date:** 2026-11-18 KST · English canonical | [한국어](2026-11-18-spring-web-account-deletion-v2026.11.18.1.ko.md) · [Stacked draft PR #3253](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3253)

## BEFORE (recorded before code changes)
- Owner directed full web frontend and backend migration to Spring. This is one safe, noncanonical slice, not the complete migration.
- Initial merged `origin/main`: `e96e8f81f4d6b99b221392a2b6fe46356361b145` (2026-11-18). Read AGENTS, documentation governance, living project plan, integrated master, latest Spring migration design and runtime audit.
- Isolated branch `feature/spring-web-account-deletion-v2026.11.18.1`, stacked on the existing Spring web foundation `feature/full-spring-web-foundation-v2026.11.17.2` (PR #3213). No modifications to PR #3249 frontend resilience/logging branch.
- Existing Next `/account-deletion` page renders `DeletionRequestInfo`; policy, contact, retention and security cautions must preserve their meaning. The Next canonical route remains the sole live owner.
- Mini-PC via Desktop Commander: all listed devices offline. Host Gradle, official Test, Nginx, live DB, browser E2E and Production verification unavailable.
- Planned: feature-flagged read-only Spring MVC preview `/spring-web/account-deletion`, bilingual EN/KO, responsive accessible HTML, strict security/cache headers, controller tests.
- No account/finance mutation, secrets, canonical redirect, DB migration or runtime promotion.

## IN PROGRESS (source checkpoint)
- Added `SpringAccountDeletionController.java` with independent property gate; default disabled, no account action. Added `SpringAccountDeletionPreviewDisabledController.java` to guarantee 404 instead of HTML from the broad legacy static SPA fallback.
- Added `templates/spring-web/account-deletion.html` with bilingual policy presentation and live Next account/privacy links; added supplemental responsive CSS.
- Authored 5 MockMvc/JUnit test methods across enabled- and disabled-preview contexts, including locale fallback and noindex/CSP/private requirements. These tests have **not been run**.
- Compared GitHub original `DeletionRequestInfo` to Spring text/HTML: original OAuth, photo, audit/consent retention and legal exception Korean texts all preserved; contact email also preserved in Thymeleaf. This is a **source inspection**, not rendered HTML verification.
- Midpoint merged `main` rechecked: `e96e8f81f4d6b99b221392a2b6fe46356361b145` unchanged.
- Compared with PR #3213 base: initially 15 files added; after fallback hardening 16 new files, 0 parent files changed, 0 collisions with PR #3249.

## FINISHED (source-only closeout)
- Opened draft stacked [PR #3253](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3253) targeting `feature/full-spring-web-foundation-v2026.11.17.2`, not main. Parent head at PR creation `859fc315111f25a9d1921bc72b023c8a027647d9`; candidate head before closeout worklog commit `9327a0e5f3849eb6885af1e654a8250195da30c9`.
- Source and documentation changes are recorded in EN/KO migration spec, changelog, GitHub-facing and internal updates.
- No Gradle test pass asserted: mini-PC remote devices OFFLINE. No official Test rollout, signed-in/browser verification, bank ledger changes, production promotion, service restart or Nginx changes.
- **RELEASE HOLD:** Spring SecurityConfig global permissive/CSRF risks, authenticated and financial G0 tests, exact-SHA Test and rollback/restore evidence are still unresolved. Existing canonical Next page and all 178 pages/124 BFF migration requirements remain.
- Next required step when authorized host is online: reconcile stacked PR with latest main, `./gradlew test --tests 'com.moneyverse.api.domain.web.SpringAccountDeletion*'` then full `./gradlew clean test bootJar` on JDK21, official Test under explicit preview flag, policy/SEO/accessibility/browser parity and no-regression, then reviewed route-owner canary only after all gates.
