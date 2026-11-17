# Changelog — v2026.11.18.3 Spring public preview actual deployment

**Status:** Scoped live promotion on Test and Production; whole-site RELEASE HOLD. [한국어](2026-11-18-spring-web-public-canary-v2026.11.18.3.ko.md)

Added H2-only isolated Spring SSR preview profile and deny-by-default GET/HEAD servlet filter, 2 MockMvc tests and immutable artifact/edge roll-back controls. Java21 Spring 143/143 PASS. Test :4576 and Production :4577 run separately, public exact-match Spring preview routes respond 200 with EN/KO and secure private/noindex, missing routes 404, forbidden methods 405. Existing /, admin, API and finance unaffected. [Release receipt](../releases/v2026.11.18.3-spring-web-public-preview.md).
