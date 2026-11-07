# C v1289 — Member Shop Catalogue Source Integrity

- Start: 2026-11-02 08:15 KST; base `a8541927c3a351d980454c66e95a3356c47e0722` from fresh `origin/main`; isolated worktree and branch only. Shared checkout has an unrelated dirty `implementation_plan.md` and is not edited.
- Read: `AGENTS.md`, `README.md`, `README/README.ko.md`, canonical `docs/planning/PROJECT_PLAN.md` and `.ko.md`; latest PR list and QA v1457. Existing C #2443 (SOE), B #2445 (hot-time admin CSRF), A #2440 (club CSRF), QA #2398 and recent C #2437 are separate. No current open PR for member shop catalogue response validation.
- Source gap: `frontend/src/app/shop/catalog/page.tsx` trusts typed `apiOrNull` JSON without runtime validation; `.filter()` on malformed `catalogItems` and `.map()` on malformed `holdings` can throw, and invalid WLD/stock values may be displayed with buy/settle controls. `q[]` array search parameter causes `.trim()` runtime error. Real source is authenticated NestJS `/api/v1/shop/catalog` and `/api/v1/shop/holdings` backed by `shop_catalog_list` / `shop_my_items_v2` SECURITY DEFINER functions. No new financial write, schema or API is needed.
- Scope: fail-closed verified catalogue and owner holdings, robust bounded search input, error vs verified-empty, accessible retry and privacy metadata; preserve server-authoritative purchases.
- [x] Start audit and isolated branch.
- [ ] RED source parser and search input tests.
- [ ] GREEN validation and page wiring.
- [ ] Full exact-HEAD gates, PostgreSQL, app-api, CI, Test.
- [ ] Mid and final main/plan recheck; PR and bilingual worklog; release decision.
- Production/Test: HOLD until all required gates PASS.

## Midpoint — 2026-11-02 08:20 KST
- Re-fetched origin/main `a8541927c3a351d980454c66e95a3356c47e0722`; English plan SHA256 `0e18217e147699dbb04f2f85fa94308922a57889d5b070b3fe081ceff8b78c34`, Korean plan `2a384f4c842eac8ecf3813fcbcc6627fd08c98c3ccfabe1a17730d9f97f8cd12`, unchanged.
- RED behavior: 5 failed/1 passed; malformed catalogue/holdings, unsafe WLD and repeated query values were not rejected.
- GREEN: 10/10 focused parser+server-rendered page integration PASS. Invalid or unverified sources now hide financial action controls, show accessible retry and distinct error/verified-empty; `q[]` and overlong input no longer crash.
- Contract: existing authenticated NestJS shop reads, SQL SECURITY DEFINER read models and server-authoritative purchase/settlement actions; no new DB schema or financial writes.
- [x] RED source parser and search input tests.
- [x] GREEN validation and page wiring.
- [ ] Full exact-HEAD gates, PostgreSQL, app-api, CI, Test.

## HTTP finding / second RED-GREEN — 2026-11-02 08:30 KST
- Isolated Next.js build HTTP `GET /shop/catalog?q[]=owned` returned 200 and a private Cache-Control, with robots META `noindex, nofollow` but **actual X-Robots-Tag `index, follow, ...`** and Referrer-Policy `strict-origin-when-cross-origin`. This is a concrete crawler/privacy header conflict on a member route, independent of the earlier JSON issue.
- RED Next.js route-header policy test failed (no private route header). GREEN 11/11 focused parser, SSR and route-header tests after adding `/shop/catalog` and localized `/ko|en|ja|zh|vi/shop/catalog` override in `frontend/next.config.ts`; real HTTP retest pending fresh build.
- Previous exact code SHA `b0f98e053fb899f77adc9675b59d0f6f16266d57` gate evidence: Lint PASS (0 errors/1,027 warnings); Typecheck PASS; Build PASS; Frontend 2,932 PASS; Backend 2,978 PASS/2 FAIL/518 SKIP (pre-existing profile HTTP 401 vs expected 200); app-api 184 endpoint contract PASS; security 11 PASS; database package 62 PASS/5 SKIP; isolated PostgreSQL 17.11 322/322 migration files applied, shop DB 26 PASS, app role has no direct catalogue/inventory SELECT or purchase INSERT, but both authorized read functions EXECUTE; production high-severity audit PASS; full audit FAIL 9 advisories; full-route QA FAIL missing ledger; authenticated official Test E2E BLOCKED. No shared DB writes.
- Initial isolated PG attempts failed from missing container-mounted SQL and migrator role; corrected isolated setup, final fresh PG PASS and disposable container removed. No shared database affected.
- Final SHA requires fresh gates and HTTP retest. Release HOLD regardless of success because mandatory existing failures remain.
