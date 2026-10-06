# Google Search Console Sitemap/API Integration Worklog — v2026.10.07.541

- Date: 2026-10-07
- Branch: `feat/gsc-search-console-api-v2026.10.07.541`
- Baseline: `origin/main=d49ab2dca79012dc4029e9497eeab53c46094c9e`
- Trigger: the administrator SEO surface already stores a Google Search Console service-account credential, but its separate "Indexing API" card claims direct Google URL submission for ordinary finance/calculator pages while the route actually calls retired sitemap ping endpoints.
- User intent: after a Search Console account is registered, provide a real click-driven Google API workflow from the SEO administrator screen.
- Scope: use the existing service-account credential to submit the production sitemap through the Search Console Sitemaps API and expose real submission/status evidence; retain Search Analytics and add URL Inspection status where useful; remove false Google direct-indexing success semantics for ordinary pages.
- Concurrency boundary: isolated Git worktree from the latest fetched `origin/main`; do not reset or overwrite concurrent workers.
- Authority reviewed before implementation: `AGENTS.md`, `PROJECT_MEMORY.md`, documentation policy/catalog/index/current runtime baseline, Integrated Planning Master, Search Discovery Operations Spec, administrator SEO specification, and the existing GSC frontend/backend implementation.
- External API evidence checked: Search Console Sitemaps API supports sitemap submission with `webmasters` scope; URL Inspection API is status inspection only; Google Indexing API remains limited to `JobPosting` and `BroadcastEvent` pages and is not valid for Moneyverse finance/calculator URLs.
- Repository-wide documentation preflight will be completed before source edits, with the integrated planning master treated as the first planning authority.

## Root-cause record before implementation

1. The existing GSC client requests only `webmasters.readonly`, so it can read Search Analytics but cannot call the Sitemaps submit method.
2. `/api/admin/seo/indexing-submit` does not use the stored GSC credential and does not call Google Indexing API; it calls legacy Google/Bing sitemap ping URLs, treats fulfilled fetch promises as success regardless of HTTP status, and labels the response as Google Indexing API success.
3. The separate `/api/seo/submit` BFF contains a success fallback when the backend is unavailable, so operator-visible success can be fabricated.
4. The supported Google path for this site is: Search Console Sitemaps API for discovery/refresh plus URL Inspection API for indexed-state verification; there is no general-purpose Search Console API endpoint equivalent to the manual "Request indexing" action.

## Execution sequence

1. Complete all-document inventory/checksum scan and focused authority/source review.
2. Install/verify the isolated worktree and run a clean baseline.
3. Add failing tests for writable Search Console OAuth scope, real sitemap submission/status, truthful BFF behavior, and administrator UI semantics.
4. Implement the smallest backend/client/BFF/UI changes.
5. Re-fetch `origin/main` mid-work and reconcile any overlapping changes.
6. Run targeted tests, repository typecheck/tests/lint/build and diff checks.
7. Push the branch, stage the exact candidate on isolated Test, verify backend health and Search Console API behavior, then follow the zero-downtime Production promotion gates.
8. Record mid-work/final evidence and publish internal/GitHub update notes.

## RED / baseline checkpoint — 2026-10-07

- Full tracked Markdown preflight completed before source edits: 1,856 files / 175,148 lines, broad SEO/Search/Google relevance count 646, aggregate corpus SHA-256 `40eff48e4f4f528ef337dc35bba04e0799cb5085f3bf57df66ffc8db96d97e23`.
- Isolated dependency install completed with the pinned pnpm lockfile.
- Clean baseline `pnpm test` completed with exit 0; frontend reported 190 test files / 1,065 tests passing. Existing jsdom canvas warnings and async act warnings were observed but did not fail the baseline.
- Root cause evidence confirmed against current source and Google first-party API documentation: ordinary Moneyverse URLs are not eligible for the Google Indexing API; the supported write path is Search Console Sitemaps API with `webmasters` scope, while URL Inspection remains read-only status inspection.
- TDD RED verified before implementation: backend GSC sitemap helper is missing; controller mutation guard test fails for the missing sitemap method and unguarded generic SEO submit mutation; frontend one-click sitemap control is absent; the legacy SEO submission BFF fabricates HTTP 200 success when its backend call throws. A dedicated SeoService test also fails because `submitGscSitemap` does not exist.
- Concurrent branch `origin/auto/hourly-c-seo-indexing-truth-v2026.10.06.539` was inspected read-only. It changes only `indexing-api-card.tsx`; this v541 implementation avoids editing that file so concurrent work is not overwritten.

## GREEN / security-gate checkpoint — 2026-10-07

- Targeted RED→GREEN cycle is complete: backend SEO tests 19/19 PASS; frontend SEO/BFF tests 8/8 PASS.
- Repository typecheck exits 0.
- Test-runtime safety was measured from the current host: Test uses `APP_BASE_URL=https://test.easy-scraping.com` and `SEO_INDEXING_ENABLED=false`; Production uses `APP_BASE_URL=https://easy-scraping.com` and `SEO_INDEXING_ENABLED=true`. The new Search Console sitemap mutation therefore fails closed on Test and is allowed only on the Production indexing runtime.
- The real implementation uses the existing encrypted GSC service-account credential, keeps Search Analytics on the read-only OAuth scope, requests the broader `webmasters` scope only for the explicit sitemap mutation, submits `/sitemap.xml` through the Search Console Sitemaps API, then reads the submitted sitemap resource back for last-submitted/downloaded, pending, warning/error and submitted-URL status.
- The administrator BFF no longer fabricates a successful SEO submission when the backend is unavailable. The generic URL-change action now flows through the authenticated mutation helper and the backend administrator-session + CSRF guard chain.
- The legacy rendered “Google Indexing API” batch card is removed from the active SEO screen without editing its source file, preserving the concurrent v539 work boundary. The remaining generic action is labeled as IndexNow URL-change notification rather than Google sitemap/indexing success.
- Full verification reached tests, lint and build successfully, then the production dependency audit failed closed on newly published `sharp <0.35.5` / CVE-2026-96889. The existing root override policy now pins `sharp=0.35.5`, the lockfile/node_modules were refreshed, and a fresh production audit reports **No known vulnerabilities found**. Because the dependency graph changed, the complete exact-tree verification gate must be rerun before candidate commit.

## Final local source verification checkpoint — 2026-10-07

- Mandatory final refetch still reports `origin/main=d49ab2dca79012dc4029e9497eeab53c46094c9e`; no upstream drift occurred during the implementation cycle.
- Fresh full source gate `gsc541-finalverify2` completed exit 0: repository typecheck, full tests, lint, production build, production dependency audit and `git diff --check` all completed successfully.
- Backend full suite: 120 test files PASS and 53 DB-backed files skipped by the local environment; 1,081 tests PASS / 391 skipped. Skipped DB groups are not claimed as passing and remain a runtime/Test acceptance concern.
- Frontend full suite: 191 test files / 1,067 tests PASS. Existing jsdom canvas/navigation/act warnings remain non-failing baseline warning debt.
- Lint reports 0 errors with existing warning debt. Production build completed. Production dependency audit reports no known vulnerabilities after the `sharp 0.35.5` override.
- This checkpoint verified the runtime-source/build tree. The worklog/update-note append itself is documentation-only; a final diff check is run before the candidate commit.
