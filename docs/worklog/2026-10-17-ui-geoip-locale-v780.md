# v2026.10.17.780 — UI rendering and country-locale regression repair

**English canonical** | [한국어](2026-10-17-ui-geoip-locale-v780.ko.md)
**Start:** 2026-10-17 10:35 KST (approximately)
**Branch:** `fix/ui-geoip-locale-v2026.10.17.780`
**Isolated workspace:** `/srv/moneyverse-tasks/ui-geoip-locale-v2026.10.17.780/repo`
**Baseline:** `origin/main=4a7c1398c8611a514650d33db48bf5bbf6ac4594`
**Status:** INVESTIGATING; no release acceptance claimed.

## START — before source edits
- Inspected live service status (all systemd services reported active; this is not acceptance).
- Desktop Commander devices offline; authorized `$pc` remote Debian execution functional.
- Read project AGENTS, documentation policy, current integrated/project planning authority, v712/v713 locale releases, v718 UI findings, v753 release-blocker record.
- Existing `main` in working checkout was 156 commits behind. Fetched latest `origin/main` and created a separate clean worktree; no other agent branch, release, DB or feature switch changed.
- Plan: establish reproducible tests for first-render GeoIP and manual language precedence, review responsive shell and CSS clipping, fix narrowly, run targeted/full gates, re-fetch main, add internal/GitHub updates. Isolated exact-source Test is required for any production promotion.
- Current product authority remains v530 with unresolved finance/ledger and five-pass authenticated UI gates. Any unsatisfied release gate must be reported honestly.

## MID-WORK — reproducible diagnostics
- Tested Production frontend loopback with trusted TLS-forwarded request headers. Fresh first-visit GeoIP headers KR/JP/CN/US correctly rendered `<html lang=ko/ja/zh/en>` from the current Production binary.
- Confirmed actual contradiction: visiting `/en`, `/ja`, `/zh/stocks` set `wdmv_locale` preference cookie even without manual selection; this persists foreign-language selection and defeats later location-based auto mode.
- Found global CSS `main, .moneyverse-main { max-width: 100% !important; }` overriding intended `max-w-[1440px]` desktop content limit. Shared header showed full-width desktop menu at 1024px while the mobile navigation fallback disappeared; header has `overflow-hidden` and therefore may clip routes.
- TDD RED: four targeted regressions failed (two URL cookie persistence; nav overflow fallback; layout desktop cap).
- TDD GREEN: five focused suites **36/36 PASS**. Source fixes are isolated to Next proxy, shared header, and final content-width guard. No backend, database, migration, bot or production service mutations.
- Dependency lock matches checked-out main exactly; reused preinstalled dependencies via workspace-local untracked symlinks (must not commit those links). Full frontend test/typecheck/build background job started using `mv-task`.
- Mid-work `origin/main` refreshed and remained `4a7c1398`. Production release gates still open pending candidate CI/Test/auth coverage.

## MID-WORK — second root cause and path escape
- Found a second route-precedence conflict: explicit /ja/... locale paths or ?lang=ja outrank manual cookie even after the visitor changes language or resets to automatic mode. The current client handler only refreshed that old URL.
- Added five stateful React/Next-router regressions on prefixed /ja/stocks, a physical /ja/blog slug and a language query. Four failed RED against existing provider, one baseline passed.
- Corrected locale navigation: manual selection transforms a /ja route into the selected locale route; auto reset removes the language prefix and explicit language query, preserving unrelated query parameters and falling back to an existing unprefixed calculator URL for the localized-only compound interest route.
- Targeted locale provider + language switcher GREEN: 8/8. Full suite and production Webpack alternative build running in isolated workspace. Initial Turbopack attempt was **infrastructure-failed** due to deliberately symlinked temporary dependencies outside the worktree root, not due to application compilation.

## MID-WORK — actual isolated HTTP SSR caught a missed bug
- First **Webpack production build PASSED**, all 590 static pages generated. Latest source pre-SSR suite 1,264/1,264 PASSED and `tsc --noEmit` PASSED. Lint on touched files 0 errors, 2 pre-existing unused-import warnings in the site header.
- Started an isolated loopback-only `127.0.0.1:3314` shadow Next server; official Test and Production pointers remained untouched. Real Test backend `127.0.0.1:3100/health` returned HTTP 200.
- Production-build HTTP matrix exposed a gap not caught by unit tests: country US + request `/ja/stocks` rendered `html lang=en`, while `/ja/blog` rendered `ja`. Next's internal rewrite to `/stocks` re-applies country locale and drops the path prefix locale.
- A two-hop rewrite regression reproduced the failure (2 RED): a private internal rewrite marker was missing and conflicting `?lang=ko` beat `/ja/stocks` in the second proxy pass.
- Fix: preserve normalized path's original locale as `__mv_path_locale=ja` on the internal rewrite destination and recognize it ahead of language query and IP on that internal pass; never set an implicit manual-preference cookie from the internal marker and never trust locale as an authorization signal.
- Targeted 4 suites **28/28 GREEN**. The initial shadow process was terminated before rebuilt-source verification (server port cleanup must be checked). New full suite and full Webpack build re-running on the final patch.

## MID-WORK — overlapping UI PR reconciliation
- Concurrent still-open PR #912 changes the same `site-header.tsx` hamburger button to a 44px square below 400px. Preserved the other agent's branch and adopted its accessibility intent directly (`size-11`), combined with our wider breakpoint (`2xl:hidden`) without copying any unrelated changes. A merge order/rebase review is needed to avoid conflicts if #912 lands first.
- Focused header and locale suites **29/29 PASS** after the 44px alignment. Touched-file ESLint **0 errors**, 2 pre-existing unused-import warnings. Full frontend test/typecheck and final optimized Webpack build rerun after this last code change.

## FINAL — source and isolated-runtime verification
- **Final base check (pre-integration):** `origin/main=4a7c1398c8611a514650d33db48bf5bbf6ac4594`; unchanged from START and MID; other agent worktrees untouched.
- **Final source:** 238/238 frontend Vitest files and **1,266/1,266** tests PASS; `tsc --noEmit` exit 0; changed-file ESLint 0 errors, 2 existing warnings; `next build --webpack` exit 0, 590/590 static routes generated. Temp dependency symlinks triggered a separate Turbopack root-boundary panic; a real independent dependency install is required for the default Turbopack CI lane.
- **Isolated shadow HTTP acceptance:** final webpack-built Next served on loopback-only `127.0.0.1:3314`, read-only Test API origin `:3100`. Twelve scenarios each returned HTTP 200 with expected `<html lang>`, `x-moneyverse-locale`, and *zero Set-Cookie*: base URL KR/JP/CN/US; US requesting /ja, /ja/stocks, /ko/stocks, /zh/stocks, /en/stocks, /ja/blog, /ja/guide/glossary, /stocks. /ja/stocks?lang=ko returned Japanese as required by explicit URL precedence. Shadow server terminated after QA; official Test and Production release pointers were not changed.
- **Release assessment:** production promotion NOT VERIFIED/NOT PERFORMED. No full 166-route × 5 authenticated/admin browser geometry, persisted member session continuity, exact candidate SHA promoted to official Test, full CI approval, or mandatory finance/ledger DB privilege/readiness evidence in this scope. The v530 UI hold and finance P0 remain **BLOCKED**; no silent overrides.
- **Delivery target:** GitHub isolated PR and CI, not direct main or runtime promotion. An existing PR #912 overlaps the shared header trigger line; coordinate merge order and rebase after the concurrent author merges. Do not delete or overwrite the other branch.
