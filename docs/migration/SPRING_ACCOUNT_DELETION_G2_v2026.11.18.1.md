# v2026.11.18.1 — Spring MVC account-deletion page (G2 candidate)

**Status:** IMPLEMENTED IN ISOLATED SOURCE BRANCH / TEST BLOCKED / RELEASE HOLD  
**Date:** 2026-11-18 KST | English canonical | [한국어](SPRING_ACCOUNT_DELETION_G2_v2026.11.18.1.ko.md)

## Authority and migration scope
- User direction supersedes the backend-only plan: migrate **all web UI and Next BFF** into Spring as a staged, contract-verified program. This PR implements **one public read-only Next page preview**, not the full conversion.
- Dependency: Spring SSR foundation [PR #3213](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3213), which adds Thymeleaf and Spring-preview infrastructure. Other open frontend-resilience work ([PR #3249](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3249)) is intentionally untouched.
- Existing canonical source: `frontend/src/app/account-deletion/page.tsx` and `frontend/src/components/deletion-request-info.tsx`. Existing canonical URL `/account-deletion` remains routed to Next and is **not retired**.

## Interface and frontend behavior
- **Candidate:** GET `/spring-web/account-deletion` on Spring MVC, enabled **only** by explicit `moneyverse.web.account-deletion-preview-enabled=true`; default absent/false disables the controller bean. Never map external canonical `/account-deletion` to Spring during this candidate.
- **Rendering:** server-side Thymeleaf with no client-side script or form. English default, `?lang=ko` Korean second, unsupported languages fall back to English. Escaped text; no user records, account UUID, token, balance or read/write API.
- **Source parity:** displays existing service/operator identity, three deletion-request steps, original account and privacy links, existing contact email, email-secret warning, retention windows 30 days/90 days/one year/three years, and law/dispute/security exceptions. Policy terms are copied from the current Next component; **a policy-content change requires a synchronized update**.
- **Layout:** reusable Spring-web dark theme, additional responsive CSS, 320px+ single-column-safe wrapping, keyboard focus inherited from shared stylesheet, skip link, semantic headings/lists, no overlapping fixed widgets and reduced-motion support.
- **Security:** `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `nosniff`, no inline scripts and a restrictive Content Security Policy. No action endpoint or privileged data is created.
- **Boundaries:** This preview does **not** submit deletion, verify a user, call Spring financial/identity services, alter PostgreSQL, modify Next, or claim official SEO parity.

## Required verification and release blockers
1. Run `cd spring-backend && ./gradlew test --tests 'com.moneyverse.api.domain.web.SpringAccountDeletion*'` on isolated JDK21 with the existing Spring web parent available, then `./gradlew clean test bootJar`. Treat any baseline failure as a release blocker.
2. In official exact-SHA Test, explicitly enable the preview flag **only there** and verify 200 EN and KO HTML, 404/unregistered when disabled, MIME/style 200, noindex/private/CSP, automated 320/360/768/1280 viewport and keyboard/zoom checks. Avoid using a live user's account.
3. Compare policy copy, retention periods, account/privacy navigation and accessibility against canonical Next in Playwright/browser E2E; verify production `/account-deletion` still serves its existing Next implementation.
4. Full G0–G6 Spring migration blockers remain: real Spring Security/CSRF/admin MFA, finance ledger/single writer, 178 page and 124 BFF parity gates, Android API, official Test and independent restore, exact-SHA canary and zero-downtime rollback.

**Observed here:** GitHub source and five verbatim policy/contact-source checkpoints inspected; all 5 present across the controller+template, feature-flag declaration and test code present. No Gradle/JDK execution or official Test/Production acceptance was possible because all Desktop Commander mini-PC devices were offline.

## Rollback and ownership
The preview flag is OFF unless explicitly set, and the live Next route remains the owner. Disabling the flag or discarding this isolated branch removes the candidate; no DB rollback and no live route switch are required. Do not merge into main or promote before the parent PR and full verification gates.
