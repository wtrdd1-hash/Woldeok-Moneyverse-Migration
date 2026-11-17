# Full web frontend migration to Spring — owner scope override and release gates

**Version:** v2026.11.18.0718 · **Status:** IMPLEMENTATION CANDIDATE / RELEASE HOLD
**Korean:** [한국어](SPRING_WEB_FRONTEND_MIGRATION_v2026.11.18.0718.ko.md) · [Source-derived page inventory](SPRING_WEB_FRONTEND_ROUTE_INVENTORY_v2026.11.18.0718.csv) · [Worklog](../worklog/2026-11-18-spring-web-frontend-v2026.11.18.0718.md)

## Authority and owner decision

The owner's 2026-11-18 instruction expressly expands the earlier **backend-only** Spring migration: the **web frontend must also migrate to a Spring-owned rendering and hosting stack**, not merely proxy every public page to a dummy `index.html`. This supersedes the *end-state* Next.js retention sentence in v2026.11.13.1, not its security, finance, Android, rollback or gradual-cutover requirements. Keep existing Next.js active for routes not actually ported. Java cannot execute browser DOM code: some client JavaScript remains necessary for interactive gameplay, charts and accessibility even when Spring is the web UI server. Do not advertise "100% Spring" while Next SSR/BFF remains.

## Reality and P0 incident on 2026-11-18

- Local Nginx `prod_frontend` and `seo_release_frontend` resolve to Spring `127.0.0.1:4550`, while Spring's static `index.html` is only a generic loading message. Its `SpaWebMvcConfig` routes unmatched user and `/admin/*` paths to that same 475-byte file with misleading HTTP 200, including `/`, `/guide` and `/admin/blog` on observed local Host traffic.
- A separate Next.js **test process**, port 4522, responds with a real ~114 KB homepage; this is evidence that compiled UI still exists, **not** an approved Production release target. Official Production service ownership, release SHA and public edge cutover need independent evidence. Do not point Production at an ephemeral test process.
- Current `SecurityConfig` disables CSRF and uses `.anyRequest().permitAll()`; **all protected-route migration and production promotion are blocked** pending complete session/MFA/CSRF/security review. This page candidate contains no authenticated or financial action.

## Measured page inventory and ownership

Run `find frontend/src/app -name page.tsx` against exact candidate source and reconcile each file with `docs/planning/SPRING_WEB_FRONTEND_ROUTE_INVENTORY_v2026.11.18.0718.csv`. Current baseline: **178** Next pages, **39** under `/admin`, **33** path trees containing dynamic segments. These are *source-file counts*, not 178 functioning production routes or unique localized URLs.

This change supplies exactly **two read-only guest route candidates** (`/`, `/guide`) plus safe review paths (`/spring-ui/home`, `/spring-ui/guide`). Each uses Spring MVC/Thymeleaf, local CSS, English default/Korean second, no artificial balances, no cookies, no third-party scripts. Both live ownership flags default to **false**: `moneyverse.web.spring-home-enabled` and `moneyverse.web.spring-guide-enabled`. Preview routes set `noindex,nofollow`, `private,no-store`. A route is not migrated just because Spring can return HTML for it.

## Implementation waves and responsibilities

1. **P0 restore and edge ownership:** Preserve current release/executable evidence. Prepare *verified* Next runtime on official isolated Test; restore legacy UI routing there. Never return the Spring placeholder with HTTP 200 for routes still owned by Next. Audit Nginx per host, method, route and locale, with explicit migration route overrides and deterministic rollback. No unchecked file replacement, no pointing at temporary `452x` processes.
2. **P1 public read-only web pages:** Migrate homepage (with truthful market/read-model status), guide, content/help/legal, calculators and SEO. Prove content parity, canonical/hreflang, sitemap, `robots`, mobile 320px/200% zoom, WCAG 2.2 AA and site design-language snapshots. New home/guide code is a **candidate**, not full existing content parity.
3. **P2 signed-in UX:** Session rehydration through runtime/reboot/release, login/Discord/OTP/cookie/CSRF, private/no-store caching, account isolation, upload privacy, work, wallet and inventory. Never render member-specific values on a public cached page; never invent zero/empty on upstream failure.
4. **P3 transactional game and finance:** Stock orders, shop, work rewards, casino, bank, bonds, treasury, business, scheduler, websocket/bot and administrator approvals. Verify one canonical writer, PostgreSQL receipt/read models, BigInt WLD and idempotency. No client-side awarding, no fake "success", no bypass of role/MFA controls.
5. **P4 administrators/Android/retirement:** Independently cover every 39 admin routes and all dynamic/locale pages, authorization/negative tests, Android parity, real-time sockets, observability, exact-SHA evidence. Remove Next only when the route inventory has no unmigrated live consumers and comprehensive E2E/restore evidence exists.

For each route record owner, HTTP methods, host, locale, prior Next handler, new Spring template/controller, client scripts, auth/session/CSRF, DB reads/writes, exact candidate SHA, SEO policy, 320px/a11y/parity result, Android and event consumers, fallback, rollback switch and independent reviewer. `UNKNOWN` blocks release, not silently treated as PASS.

## Isolation and release gates

- Use an independent branch/worktree; main and Gemini tasks are not overwritten. Fetch `origin/main` start/mid/final, resolve changes without forced push. EN is canonical; KO second; follow documentation governance.
- Unit tests plus actual HTTP-on-loopback H2 Test profile prove template content, `lang`, CSS, preview noindex, nonfinancial behavior and explicit live feature gates. Clean Gradle test/bootJar must pass at the **final** SHA. Isolated tests are not official edge/Test acceptance.
- Before any operating ingress change: systemd PIDs + symlink release identity, trusted Next baseline, Nginx -t, route/asset and API smoke matrix incl. `/admin/blog`, healthy signed-in member+admin E2E, CSRF/session/MFA and security tests, frontend image/hydration QA, real PostgreSQL safety/finance invariants, off-host backup restore and instant rollback drill; independent approval. Check memory, DB topology, disk and production user sessions.
- Canary: official Test exact SHA → compare signed evidence → very small production cohort with prevalidated upstream and rollback → verify no regression → expand; never disable last healthy UI process beforehand.
- **Current promotion decision:** HOLD. No official Test edge parity, complete 178-route coverage, real authenticated browser proof, security gate, or independent restore has been furnished by this task. This is implementation progress, not a declaration of Production migration.
