# v2026.10.15.685 — Integrated planning versus source review

**Classification:** partial full-repository inventory and evidenced SEO correction candidate; **not** full-feature acceptance.
**Canonical:** v530 planning authority and AUTHORITY_DRIFT; v675 G675-05 truthful SEO; v523/542/543 money conservation and exact-SHA Test/Production gates are unchanged.

## Repository-wide discovery
The latest fetched web `origin/main` at START/MID was `69bc8c14df236f57898b1b44ddc596be5144c30a`, 63 commits newer than the host's old local `main`. Versioned source inventory: 1,083 frontend source files, 508 backend source files, 284 database package files and 2,161 documentation files (tracked-file counts). The Android repository is separate; its runtime flows are **not certified**. This source inventory is **not** a line-by-line audit of every file.

| Domain | Verified evidence | Gaps, severity and release status |
| --- | --- | --- |
| SEO URL submission | `SeoController.submitUrls` had full admin, session and CSRF guards on current main; service unconditionally returned `success: true` | SEO-685-01 P0: actual 200/202 receipt tracking and foreign-origin/batch rejection implemented in candidate |
| SEO audit and digest | Manual GET/POST had no admin guard; Next proxies bypassed session and fabricated 18/18 and Discord delivery metrics if backend offline | SEO-685-02 P0: admin/session/CSRF authorization, authenticated BFF and fail-closed error states implemented in candidate |
| SEO indexing claims | `getSeoMetrics` names crawler visits `stockCoverage.indexed`/`guideCoverage.indexed`; `/api/seo/status` supplies fallback mock-like unindexed counts on backend outages | SEO-685-03 P1: API semantics + provenance and crawl-vs-index UX remain open |
| Frontend test infrastructure | The miniPC runtime shells export `NODE_ENV=production`; this produced React.act failures in Vitest | TEST-685-01: test execution must set `NODE_ENV=test` explicitly. Production-mode test failure is not evidence of user-facing runtime failure |
| Economy, treasury, SWF, grants | Planning authority v523/542/543 contains P0 conservation/DB privilege gates; separate agents concurrently working in v683 | ECO-685-01 P0: do **not** mutate finances/DB/switches or claim closure without independent ledger tests |
| Identity, UI, stocks, newsroom, wallet and Android | Docs v675 and v605 contain historical acceptance gaps and feature candidates, not current green E2E proof | SYS-685-01 P0: authenticated full routes, role/CSRF failures, backend+frontend exact-SHA Test and release-identity evidence required |

## Test contract
- RED-GREEN SEO unit coverage tests transport receipt handling, same-origin limitations, admin guards and error propagation.
- Workspace typecheck and build, plus broad tests, are separately recorded in [worklog](../worklog/2026-10-15-seo-integrity-v685.md). Skipped database tests remain skipped, not passes.
- Running Test/Production service health, by itself, does not prove a build of the current candidate or an authenticated end-user flow.
- Later checks must use the final commit SHA; rebuild/retest if main changes.

## Official references
- [IndexNow documentation](https://www.indexnow.org/documentation)
- [IndexNow FAQ](https://www.indexnow.org/faq)
- [Google Search crawling and indexing](https://developers.google.com/search/docs/fundamentals/how-search-works)
- [OWASP access-control verification](https://owasp.org/www-project-application-security-verification-standard/)
