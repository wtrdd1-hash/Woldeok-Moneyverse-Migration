# v2026.10.15.685 — SEO submission truth and fail-closed audit
**Goal:** Align the existing SEO admin action with G675-05: display actual transport results rather than fictional indexing/availability.
**Evidence before work:** origin/main `69bc8c14df236f57898b1b44ddc596be5144c30a`; v530 planning authority, v675 G675-05 P0; AGENTS.md; SEO service/controller/Next BFF and tests. Other treasury v683 and planning v684 worktrees are out of scope.
**Risk:** Production handles real member balances. This slice changes no migrations, monetary APIs, policy switches, or deployment configuration.
## Design
- Retain existing admin/session/CSRF protection on `SeoController.submitUrls` (already present; do not rewrite).
- The SEO backend must reject malformed, credentialed, foreign-origin or oversized URL submissions *before any outbound request*. Preserve relative canonical paths and the default monitored URL set.
- Report IndexNow success only for real 200/202 endpoint responses; 202 means accepted pending verification, not indexed. Report all failure as failure. Use an actually served public key path at `/.well-known/indexnow.key`.
- The SEO daily digest read/dispatch path must use the same session/CSRF boundaries as manual crawl audits, and may never invent analytics, Discord delivery or success when backend is unreachable.
- The Next.js SEO crawl-audit proxy must propagate failures and return 503 on connection errors rather than fictional 18/18. The admin UI should not report a successful crawl in its catch branch.
- UI distinguishes accepted submission/partial failure/indexing not guaranteed.
## Implementation and verification
1. Add regression tests in `backend/src/seo/seo.service.test.ts` for all-fail, partial accepted, foreign origin, malformed URL and published keyLocation. RED test evidence.
2. Fix `SeoService.submitUrls` and `SeoController.getIndexNowKeyInfo` minimally. GREEN tests and backend typecheck.
3. Add Next.js route tests `frontend/src/app/api/seo/crawl-audit/route.test.ts` for fail-closed GET/POST. RED then fix `route.ts`.
4. Add RED tests then protect the daily digest backend GET/POST and change the Next BFF to authenticated `api`/`mutate`. Correct `frontend/src/app/admin/seo/seo-client-view.tsx` success/catch copy; run relevant tests, frontend typecheck/build.
5. Fetch `origin/main` again, compare overlap and rebase as needed; commit internal/GitHub changelogs and before/mid/end worklogs, push PR. Exact-SHA isolated Test/DB/auth E2E and release readiness remain gates.
## References
- Integrated plan `docs/planning/INTEGRATED_PLANNING_MASTER.md` and full review `docs/planning/INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md`
- https://www.indexnow.org/en_gb/documentation
- https://www.indexnow.org/faq
- https://developers.google.com/search/docs/essentials/technical
