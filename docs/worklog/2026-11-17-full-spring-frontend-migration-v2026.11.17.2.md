# v2026.11.17.2 — Whole frontend-to-Spring migration
## Before work — 2026-11-17 KST
- Owner directive: **replace the entire Next.js frontend with a Spring Boot served web frontend**, in addition to backend migration. Earlier v2026.11.13.1 planning says keep Next; this superseding directive changes the target but does not authorize a blind in-place cutover.
- Baseline read: origin/main 8b3e3aca3a8f8504535000c6a02a992acaf3c1a7; docs/planning/INTEGRATED_PLANNING_MASTER.md, PROJECT_PLAN, AGENTS.md, docs/RELEASING.md and actual source/runtime. Next app has 178 page.tsx and 124 route.ts handlers. Existing Spring MVC web templates absent.
- Coordination: use isolated branch feature/full-spring-web-foundation-v2026.11.17.2 and isolated worktree; other Gemini/admin/security/SEO worktrees untouched. Re-fetch latest main mid-work and reconcile changes.
- P0 blocker: pre-existing admin finance and security failure findings (QA PR #3207), Spring SecurityConfig permitAll / CSRF disabled, fake ledger evidence. Do not route Production users or financial/admin writes through a new web cutover before resolution.
- Working scope this execution: actual tested Spring MVC public page rendering foundation, English-primary/Korean-secondary locale, safe read-only routes, deterministic inventory of all existing Next pages/BFF handlers with explicit NOT_MIGRATED status, architecture and gate documents. Track precise implemented vs unimplemented work. No artificial redirect shells or false completion.
- Tests: TDD RED -> GREEN, isolated Gradle JVM tests, route coverage inventory test, read-only HTTP smoke of private candidate port if feasible, no side effects. No Test/Production promotion without exact-SHA and auth/ledger gates.
## In progress
- Pending.
## Finished
- Pending. Initial status: no runtime change.

### Midpoint 1 — source-based implementation
- Refreshed origin/main. Created true Thymeleaf Spring MVC render paths /spring-web and /spring-web/status (non-conflicting preview only) with HTML escaped dynamic data, explicit English/Korean locale, responsive and keyboard accessible CSS.
- SpringStatusReader delegates to existing read-only DB function public.content_public_status(), which owns freshness and public visibility; no fake source or fabricated success. Source failure triggers private/noindex HTTP 503; observed statuses derived from canonical DB. Controller is conditional on moneyverse.web.preview-enabled=true (OFF in normal Production config; ON in isolated test profile).
- RED compileTestJava failed for missing new controller/reader as expected, then Gradle Thymeleaf dependencies resolved online; JDK25 is incompatible with current Byte Buddy, so candidate Gradle test JVM is explicitly JDK21.
- GREEN: isolated Spring Gradle tests 6/6 passed. Database/financial commands unchanged, no Production deployment.
- Next: deterministic route/BFF inventory and plan supersession; test full bootJar/optional isolated localhost real HTTP; record SKIPs and release HOLD.

### Midpoint 2 — full-source and HTTP verification
- Corrected initial route inventory mismatch: origin/main 8b3e has 178 pages, not 177 from a different checked-out worktree; 124 Next BFF handlers; source-derived 302 entries. Inventory validation 4/4 tests passed. Canonical migrated paths remain 0; 2 Spring preview candidate paths not parity.
- Integrated the superseding owner directive into INTEGRATED_PLANNING_MASTER and PROJECT_PLAN without erasing the old baseline draft. Detailed English/Korean G0–G6 migration requirements and route inventory in docs/migration.
- Complete Gradle clean test bootJar run: built jar but **1 of 107 tests failed**, specifically Phase7IntegrationTest GET /api/engagement/dopamine/status because unchanged EngagementController and DopamineController expose ambiguous identical mapping. Full run is **FAIL** and integration blocked. Finance/admin security source drift remains P0.
- Added actual embedded Spring HTTP tests (random Test port, H2), RTL/HTML/privacy/static CSS. Debugged preview flag off: Spring ResourceHttpRequestHandler incorrectly served a CSS directory as HTTP 200 under /spring-web even without controller. Moved stylesheet to static/assets and adjusted links. Negative preview OFF test now 404.
- Focused Spring MVC + reader + embedded HTTP + disabled controller: **10/10 PASS** on JDK21. No official public Test or Production route switched.
