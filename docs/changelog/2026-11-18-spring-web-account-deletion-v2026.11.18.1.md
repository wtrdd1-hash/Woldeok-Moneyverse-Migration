# v2026.11.18.1 — Spring frontend: account deletion SSR candidate

**Status:** SOURCE IMPLEMENTED / TEST BLOCKED / RELEASE HOLD. [한국어](2026-11-18-spring-web-account-deletion-v2026.11.18.1.ko.md)

- Added conditional Spring MVC/Thymeleaf read-only preview `/spring-web/account-deletion`; default OFF, with an explicit 404 against the legacy SPA fallback.
- Matched the existing Next account deletion request/retention copy, account/privacy routes and email safety warning; bilingual EN-default/KO, responsive CSS, no JavaScript or account mutations.
- Added Spring MockMvc test source for language, private/noindex/CSP response, route ownership and disabled flag and the explicit fallback 404.
- Kept canonical `/account-deletion` and all Next.js/API/financial functions unchanged.
- Based on Spring web preview PR #3213 and isolated from concurrent frontend resilience PR #3249.
- No authoritative Gradle run, official Test deployment, production switching or database migration. Mini-PC MCP devices offline. See [migration acceptance](../migration/SPRING_ACCOUNT_DELETION_G2_v2026.11.18.1.md) and [worklog](../worklog/2026-11-18-spring-web-account-deletion-v2026.11.18.1.md).
