# v2026.11.18.8 — Cloudflare email rewrite vs strict-CSP Spring legal contact repair

**English primary** · [한국어](2026-11-18-spring-policy-cf-email-v2026.11.18.8.ko.md) · STARTED / NO PATCH RELEASE YET

## BEFORE — 2026-11-18 08:46 KST
- Owner wants ALL web frontend rebuilt with Spring. Earlier isolated v18.7 legal SSR **really is live** for 5 public canonical routes, but this is PARTIAL (173 other Next pages, 124 BFF and finance/auth still pending). Do not represent as 100% migrated.
- Authoritative `main` SHA `e96e8f81f4d6b99b221392a2b6fe46356361b145`, living and integrated plan previously re-read and v18.7 release receipt updated. Independent clean patch branch from `feat/spring-public-policy-ssr-v2026.11.18.7` (draft #3259); never modify another contributor's worktree. Existing v18.7 Test :4580 / Prod :4581 active; old v18.6 Spring canonical and original Spring/backend, P0 Next and dedicated Spring preview running.
- **Real P0 edge defect:** external `https://easy-scraping.com/privacy?lang=ko` HTTP 200 SSR but Cloudflare rewrites operator email `mailto:jungchwimisaenghwal63@gmail.com` to `/cdn-cgi/l/email-protection#...` and injects `email-decode.min.js`. Spring origin HTML has correct mailto and zero script tags; strict `Content-Security-Policy: default-src 'none'` blocks the injected JavaScript, so contact cannot reliably be used. We confirmed actual HTML path and compared edge vs origin, not inferred from HTTP codes. Cloudflare documents `<!--email_off-->..<!--/email_off-->` inline bypass for specific emails (without globally weakening bot protection) and configuration rules by endpoint.
- TDD: add unit verification to render all five canonical/preview policy email links within comment-scope bypass; RED first. Preserve literal source policy paragraphs, generated source text/href/heading parity and no-js CSP. Build new immutable Java21 Spring JAR, exact Test :4582 and Production :4583 sidecars. New Nginx exact-route include for v18.8 (same 5 pages + CSS) replaces v18.7 only after real Test external HTML shows `mailto` and **NO Cloudflare injected JS**, and browser CSP intact. Roll back only our specific include on any fail, preserve login/finance/admin/Next/P0 and no operational PG writes.

## MIDPOINT
Pending.

## CLOSEOUT
Pending.
