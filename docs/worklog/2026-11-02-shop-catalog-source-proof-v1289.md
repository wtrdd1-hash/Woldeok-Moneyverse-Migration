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
