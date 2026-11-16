# v2026.11.17.2 — Full frontend migration to Spring Boot (owner directive)

English canonical | [한국어](FULL_SPRING_WEB_MIGRATION_v2026.11.17.2.ko.md)

## Authority, baseline and target

2026-11-17 owner directive supersedes the v2026.11.13.1 **backend only, keep Next.js** target choice: convert the ENTIRE web frontend, Next BFF/API middle layer and user/admin UI to Spring as well. The old architecture document remains historic evidence. This does **not** override the ledger, session/consent, OTP/CSRF, Android, SEO, log, independent-restore, exact-SHA Test and zero-downtime production gates.

Refreshed origin/main 8b3e3aca3a8f8504535000c6a02a992acaf3c1a7 contains 178 Next App Router pages and 124 Next API route handlers. The initial 177 count was from a different, stale checked-out worktree. [Source-generated inventory](SPRING_FRONTEND_ROUTE_INVENTORY_v2026.11.17.2.json) lists each file, canonical URL, migration phase and precise completion status. Regenerate/check by the scripts/migration/spring_web_inventory.py CLI.

**Target:** single Spring Boot server delivery for Spring MVC/Thymeleaf SSR views, authenticated Java API/BFF, domain services and web integration; PostgreSQL canonical money single-writer; Spring Security validated sessions, actor identity, administrator role and step-up/Discord-Telegram OTP, CSRF, consent; versioned CSS/static/browser JS for interactions, websocket and accessible responsive UI. Browser JavaScript is still needed for interactive UX: Spring cannot run client JavaScript as Java.

## Layer ownership and contracts

| Layer | Spring target | Mandatory test |
|---|---|---|
| Public SEO SSR | Thymeleaf MVC HTML; correct canonical, metadata, sitemap, public caching | real HTML, robots/headers, accessible locales, 200/404/503 |
| Private account pages | authenticated, consent-bound user data in server view only | 401/403/404, owner swap, noindex/private/no-store/no-referrer |
| Admin surfaces | role + admin session + Discord/Telegram OTP for sensitive operations | anonymous/foreign-role denials, cookie/OTP expiry, audit |
| API and Next BFF | Java handlers preserve every existing route.ts method/DTO contract | real GET/POST etc, validations, 400/401/403/409/429/503 |
| Finances | one authoritative PostgreSQL ledger, exact integer WLD strings and committed receipts | balance/journal parity, replay/concurrency, rollback, audit |
| Browser interactive | JavaScript for forms, tables, charts, realtime, progressive enhancement | keyboard, 320px, 200% zoom, race/session cancellation |
| Nginx/release | exact artifact SHA, canary and reversible routing, no blind switch | health, auth continuity, real public edge and independent restore |

Preserve login/registration, e-mail verification, consent and account deletion, wallet, bank, stocks, bonds, pension, KDIC, mint, treasury, SWF, shop, inventory, clubs, businesses, casino, blog, notifications/chat/socket.io, Minecraft, SEO and all administrator functions, plus Android contracts. Never create successful finance receipts without committed source transactions.

## Staged ownership and acceptance

- **G0 — P0 blocker, NOT DONE.** Independent QA PR #3207 found Spring SecurityConfig default permitAll and CSRF disabled, admin role/session confusion via Next internal gateway, KDIC fake integrity/payout receipts, Treasury/SWF false-success and false-empty. Require deny-by-default Spring admin/finance, authenticated actor binding, admin role/OTP/CSRF, effective least-privilege DB grants and real transaction receipts. No private, financial or administrator Spring traffic cutover before independent Test proof.
- **G1 — IMPLEMENTED as isolated preview, NOT CANONICAL.** Opt-in Thymeleaf Spring MVC /spring-web and /spring-web/status with English first, Korean second, accessible responsive CSS, private/noindex/no-referrer/CSP headers. Status uses existing read-only public.content_public_status() PostgreSQL function. Invalid/unavailable source => HTTP 503, no fake healthy claims. Normal production config has moneyverse.web.preview-enabled OFF, isolated H2 test profile has it ON. Exact canonical / and /status are still Next.
- **G2 — planned public SEO parity.** Home, announcements, status, blog, gallery, help, features, terms/privacy, media/search and correct locale/canonical/sitemap/ads/robots. Real SSR with observed data only.
- **G3 — planned account/member parity.** Registration, login/reauth/OTP, session, consent, profile, account deletion, board, notification, chat/websocket and Android parity, full invalid and owner-switch cases.
- **G4 — planned finance parity.** Wallet, transfer, bank, treasury/mint/SWF, FX, stocks, bonds, pension, KDIC, shop/economy/enterprise; single-writer ledger, idempotency, administrator financial step-up, no synthetic reports, all 401/403/409/429/503/timeout and concurrent test cases.
- **G5 — planned complete administrator parity.** Every page and create/update/delete/read action: logs, auth, support, SEO, shop, money, users, moderation, backups, Discord/Telegram and source-truth finance. Prove role/MFA, CSRF and immutable receipts.
- **G6 — planned retirement.** Exactly **178/178 canonical page paths and 124/124 BFF handlers** must have verified Spring parity in inventory, including dynamic URLs and asset/build versioning. Only after full CI, actual signed-in and browser E2E, real seeded disposable PostgreSQL/Test, independent restore, exact SHA canary and rollback may Next systemd/Nginx/config be retired.

Each route must record original file/method, Spring replacement controller/URL, actor/auth policy, locale/SEO/cache headers, data source proof, empty vs unavailable, client interactions/accessibility, Android parity when applicable, test cases and exact SHA, Test/Production evidence, rollback. A preview URL, auto-generated placeholder or HTTP 200 alone cannot change a row to migrated.

## Current implementation, verification, and release state

- Spring MVC landing and live-status preview tested with MockMvc and strict status reader unit tests. TDD RED was observed before implementation; JDK21 Gradle tests GREEN. Thymeleaf templates escape all DB text, do not display sensitive user balances, and fail closed when authority unavailable.
- Route inventory command: python3 scripts/migration/spring_web_inventory.py --check; tests: python3 -m unittest discover -s scripts/migration -p test_spring_web_inventory.py.
- Spring tests: cd spring-backend && ./gradlew --offline test --tests 'com.moneyverse.api.domain.web.*'; build: ./gradlew --offline bootJar. Gradle test runs on JDK21 rather than Gradle daemon-selected JDK25 because Byte Buddy for Spring Boot 3.3 is incompatible with that JVM.
- No existing finance/authorization code, production DB, Nginx, Test backend or member sessions changed in this branch. Maintain original Next routes until replacement is **tested at the exact canonical URL** and old/new contract parity is proven.
- **Counts now:** 0/178 canonical pages fully migrated, 0/124 Next BFF handlers retired. Two noncanonical Spring preview routes are NOT canonical parity and do not count. Formal Test signed-in E2E, financial writes and zero-downtime production cutover NOT CERTIFIED; **RELEASE HOLD**.
