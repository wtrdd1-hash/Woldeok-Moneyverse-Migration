# Spring Frontend Transition QA — Admin/Chat v2026.11.18.17

Date: 2026-11-18 KST
Status: SOURCE CANDIDATE / SECURITY & STATIC-SERVING RELEASE HOLD
Branch: feat/spring-frontend-admin-chat-v20261118-17
Base: a43b70d477fbb17d6c42d4e36a46d4e7ca3fc7c2 (repair PR #3267 / spring routing PR #3264)
GitHub main when started: 0590fac4e8a82bc986ba1b8c64f014d18daca9e9

## Proven checks

| Test / Evidence | Result | Boundaries |
|---|---|---|
| TDD route selection/admin dock | RED before implementation: 2 suites, missing dock / role branch | Confirmed failures before editing production frontend source |
| TDD admin design / 56px bubble | RED: 3 cases (missing admin theme/status and member aria-expanded/geometry) | Fixed in this candidate |
| Targeted Vitest | 4 test files, **20 PASS, 0 FAIL** | Real React component rendering and route/admin help behavior in jsdom |
| Contract build | `pnpm --filter @moneyverse/contract build` **PASS** | Local worktree |
| Frontend typecheck | `pnpm --filter @moneyverse/frontend typecheck` **PASS** | Local worktree |
| Full frontend Next build | `BUILD_ID=mv17-admin-chat-ui MONEYVERSE_NEXT_BUILD_CPUS=1 ... pnpm --filter @moneyverse/frontend build` **PASS**, Next compiled successfully, 603 static generation entries | Next output is `standalone`, not a Spring static export |
| Spring bootJar | `cd spring-backend && ./gradlew bootJar --offline --no-daemon` **PASS** | Packages existing classpath static pages, not updated Next SSR HTML |
| Spring security unit gate | `./gradlew test --offline --tests com.moneyverse.api.config.AdminApiBoundaryFilterTest` **PASS**, 3/3, 0 failures | Not authenticated real backend HTTP |
| Entire frontend suite | `timeout 105s pnpm --filter @moneyverse/frontend test` **INCOMPLETE / FAIL**: exit 124 timeout; observed `adsense-ad.test.tsx` (2 failed), `search-indexing.test.ts` (1 failed) among executed tests | No full suite pass claim; failures not proven caused by this patch |
| Real Playwright/browser screenshots | NOT RUN | No full visual regression/keyboard screen-reader audit |
| Exact-SHA Spring-serving updated admin UI | **BLOCKED** | Admin and support remain Next dynamic (`ƒ /admin`, `ƒ /support`); no new exported static HTML; Spring jar contains old `static/admin.html` and old CSS hash |
| Live Spring authenticated API and production promotion | NOT RUN | P0 header identity / fabricated support success, release hold |

## Main integration blocker: Next dynamic ↔ Spring static
`frontend/next.config.ts` uses `output: 'standalone'`. The successful Next build classifies `/admin` and `/support` as server-rendered dynamic routes. Spring `SpaWebMvcConfig` serves static files from `/srv/moneyverse-data/frontend-static/` and `classpath:/static/`; the branch-produced Spring jar still carries the earlier `admin.html` with prior `/_next/static/css/828951deb2af2cbe.css` etc. The new UI is **not** included in that static snapshot. Production promotion must be blocked until either (a) a genuinely supported Next SSR gateway strategy is approved (conflicts with owner request to retire Node runtime), or (b) the admin/support routes are ported to Spring-supported static/hydrated pages with secure API and SSR semantics and built from exact SHA. Do not silently substitute old files or claim a successful Spring frontend migration.

## Security
Current Spring SupportController/ChatController still accept client-provided actor headers and fixed UUID fallback, and SupportService can fabricate success after failed ticket persistence. AdminSupportDock is deliberately **read-only**. No new privileged support API calls, admin member chat reads, or WLD/DB operations were added.

## Release conclusion
**Do not merge/release to Production.** Source-level frontend migration increment tested and packaged separately, but full frontend regression, Spring static handoff, real authenticated backend QA and rollback validation are not cleared. Worktree is isolated from live services.

Spring embedded HTTP test (H2/random port): EngagementWireSecurityTest 1 PASS, 0 FAIL. Actual request/response verifies anonymous forged identity header denied on engagement routes. NOT a support/chat authorization or new UI Spring-static verification.
